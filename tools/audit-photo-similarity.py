#!/usr/bin/env python3
"""Visual-image audit for the original SimilarPhoto library.

Run in CI after checking out the source repository as ./original.
Groups are candidate four-choice sets, not independently human-reviewed photos.
No filenames are used in scoring; file numbers are only used for deterministic output order.
"""
from __future__ import annotations
import argparse
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
import re

import numpy as np
from PIL import Image, ImageDraw, ImageOps
from scipy.fft import dctn
from scipy.ndimage import gaussian_filter
from sklearn.feature_extraction.text import TfidfVectorizer

SERIES = ["000","100","200","300","400","500","600","700","800","900","1000"]
EXPECTED_COUNT = 457

def load_catalog(path: Path):
    s=path.read_text(encoding="utf-8")
    m=re.search(r"const data=(\[.*?\]);root\.SIMILAR_PHOTO_LIBRARY",s,flags=re.S)
    if not m:
        raise RuntimeError("Cannot parse original image manifest")
    rows=json.loads(m.group(1))
    if len(rows)!=EXPECTED_COUNT or len({r["sourcePath"] for r in rows})!=EXPECTED_COUNT:
        raise RuntimeError("Expected 457 distinct source files")
    return rows

def extract_features(path: Path):
    with Image.open(path) as opened:
        rgb=ImageOps.exif_transpose(opened).convert("RGB")
        # Direct pixel comparison: color/layout, independent of the original dimensions.
        small=np.asarray(rgb.resize((14,14),Image.Resampling.LANCZOS),dtype=np.float32)/255.
        # DCT-based pHash is sensitive to matching visual composition.
        gray=np.asarray(rgb.convert("L").resize((32,32),Image.Resampling.LANCZOS),dtype=np.float32)/255.
        coeff=dctn(gray,type=2,norm="ortho")[:8,:8]
        bits=(coeff[1:,:].reshape(-1)>np.median(coeff[1:,:])).astype(np.uint8)
        # Local edge orientation histogram captures position of objects/lines.
        smooth=gaussian_filter(gray,0.7)
        gy,gx=np.gradient(smooth)
        strength=np.hypot(gx,gy)
        angle=(np.arctan2(gy,gx)+np.pi)/(2*np.pi)
        features=[]
        for y in range(0,32,8):
            for x in range(0,32,8):
                a=angle[y:y+8,x:x+8].reshape(-1)
                v=strength[y:y+8,x:x+8].reshape(-1)
                bins=np.bincount(np.minimum((a*8).astype(int),7),weights=v,minlength=8)
                features.extend(bins.tolist())
        edges=np.array(features,dtype=np.float32)
        edges/=max(float(np.linalg.norm(edges)),1e-10)
    return small, bits, edges

def distance_matrix(items, source:Path):
    features=[extract_features(source/r["sourcePath"]) for r in items]
    rgb=np.stack([f[0].reshape(-1) for f in features])
    phash=np.stack([f[1] for f in features])
    hog=np.stack([f[2] for f in features])
    # Pairwise means are in [0,1].
    colors=np.abs(rgb[:,None,:]-rgb[None,:,:]).mean(axis=-1)
    hashes=np.not_equal(phash[:,None,:],phash[None,:,:]).mean(axis=-1)
    structure=1-np.clip(hog@hog.T,0,1)
    # All texts come from the source metadata, not guessed from images.
    labels=[]
    for r in items:
        tails=" ".join(e["en"] for e in r.get("examples",[]) if e.get("en"))
        labels.append(f'{r["title"]}. {r["key_phrase"]}. {tails}')
    vec=TfidfVectorizer(stop_words="english",ngram_range=(1,2),min_df=1,sublinear_tf=True)
    text=vec.fit_transform(labels)
    semantic=1-(text@text.T).toarray()
    # Images drive 80% of the decision. English descriptive text is supporting evidence.
    dist=.24*hashes+.33*colors+.23*structure+.20*semantic
    dist=np.clip(dist,0,1)
    np.fill_diagonal(dist,0)
    return dist,{"colors":colors,"hashes":hashes,"structure":structure,"semantic":semantic}

def pair_cost(g,dist):
    if len(g)<2:return 0.0
    return sum(float(dist[i,j]) for k,i in enumerate(g) for j in g[k+1:])

def initial_clusters(dist):
    n=len(dist)
    groups_needed=n//4
    if groups_needed<1: raise RuntimeError("Too few photos in series")
    remaining=set(range(n))
    groups=[]
    # Find strong visual pairs, then extend each to a four-picture group.
    while len(groups)<groups_needed and len(remaining)>=4:
        rem=sorted(remaining)
        closest=min(((float(dist[i,j]),i,j) for k,i in enumerate(rem) for j in rem[k+1:]),key=lambda t:t)
        group=[closest[1],closest[2]]
        remaining.difference_update(group)
        while len(group)<4:
            chosen=min(remaining,key=lambda x:(sum(float(dist[x,y]) for y in group)/len(group),x))
            group.append(chosen)
            remaining.remove(chosen)
        groups.append(group)
    # Only 0..3 leftovers. Keep each within a group no larger than seven.
    for item in sorted(remaining):
        target=min((g for g in groups if len(g)<7),key=lambda g:(np.mean([dist[item,j] for j in g]),min(g)))
        target.append(item)
    assert sum(map(len,groups))==n
    return groups

def improve_clusters(groups,dist,rounds=7):
    # Exchange images between clusters when doing so improves within-group visual similarity.
    groups=[list(g) for g in groups]
    where={i:k for k,g in enumerate(groups) for i in g}
    n=len(where)
    for _ in range(rounds):
        changed=False
        for i in range(n):
            g1=where[i]
            current=groups[g1]
            # Limit candidates to near neighbors of each photo to keep the audit fast.
            for j in np.argsort(dist[i])[1:30]:
                j=int(j)
                g2=where[j]
                if g1==g2:continue
                first,second=groups[g1],groups[g2]
                old=sum(float(dist[i,k]) for k in first if k!=i)+sum(float(dist[j,k]) for k in second if k!=j)
                new=sum(float(dist[j,k]) for k in first if k!=i)+sum(float(dist[i,k]) for k in second if k!=j)
                if new+0.001<old:
                    first[first.index(i)]=j
                    second[second.index(j)]=i
                    where[i],where[j]=g2,g1
                    changed=True
                    break
        if not changed:break
    return groups

def quality(groups,dist):
    costs=[]
    for g in groups:
        pairs=[float(dist[i,j]) for k,i in enumerate(g) for j in g[k+1:]]
        costs.extend(pairs)
    return float(np.mean(costs)) if costs else 1.

def original_index_groups(n):
    g=[list(range(i*4,(i+1)*4)) for i in range(n//4)]
    for i in range((n//4)*4,n):
        g[-1].append(i)
    return g

def preview_contact_sheet(series,items,groups,dist,outdir,columns=4):
    width=230;height=178
    rows=math.ceil(len(groups)/columns)
    sheet=Image.new("RGB",(width*columns,height*rows),"#eef0f6")
    draw=ImageDraw.Draw(sheet)
    for k,group in enumerate(groups):
        x=(k%columns)*width;y=(k//columns)*height
        draw.rectangle((x+2,y+2,x+width-3,y+height-3),fill="#ffffff",outline="#c7cad4")
        tiles=[(x+6,y+23),(x+118,y+23),(x+6,y+95),(x+118,y+95)]
        for h,item in enumerate(group[:4]):
            with Image.open(outdir.parent/"original"/items[item]["sourcePath"]) as im:
                im=ImageOps.contain(im.convert("RGB"),(108,66))
                px,py=tiles[h]
                sheet.paste(im,(px+(108-im.width)//2,py+(66-im.height)//2))
            draw.text((tiles[h][0]+4,tiles[h][1]+50),Path(items[item]["sourcePath"]).stem,fill="#202020",stroke_width=1,stroke_fill="white")
        score=pair_cost(group,dist)/max(1,len(group)*(len(group)-1)/2)
        draw.text((x+8,y+6),f'{series} G{k+1:02d} | {score:.3f}',fill="#19253c")
    sheet.save(outdir/f"contact-{series}.jpg",quality=83)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--source",default="original")
    p.add_argument("--out",default="photo_similarity_review")
    args=p.parse_args()
    root=Path(args.source)
    output=Path(args.out)
    output.mkdir(exist_ok=True)
    items=load_catalog(Path("js/similarphoto-library.js"))
    grouped=defaultdict(list)
    for row in items:
        if not (root/row["sourcePath"]).is_file():
            raise RuntimeError("Missing image: "+row["sourcePath"])
        grouped[row["sourceSeries"]].append(row)
    if sorted(grouped)!=sorted(SERIES):
        raise RuntimeError("Series count mismatch")
    report={}
    group_manifest={}
    for series in SERIES:
        source_rows=sorted(grouped[series],key=lambda r:int(Path(r["sourcePath"]).stem))
        dist,components=distance_matrix(source_rows,root)
        original=original_index_groups(len(source_rows))
        found=improve_clusters(initial_clusters(dist),dist)
        # Keep candidates inside their source series; otherwise category filters could yield incomplete sets.
        found=sorted([sorted(g,key=lambda i:int(Path(source_rows[i]["sourcePath"]).stem)) for g in found],key=lambda g:g[0])
        assert len(found)==len(original)
        assert set(i for g in found for i in g)==set(range(len(source_rows)))
        assert all(4<=len(g)<=7 for g in found)
        old=quality(original,dist)
        new=quality(found,dist)
        if new>old+1e-6:
            # Never regress vs the existing numeric-neighbor heuristic.
            found=original
            new=old
        group_manifest[series]=[[Path(source_rows[i]["sourcePath"]).stem for i in g] for g in found]
        low=[]
        for idx,g in enumerate(found):
            pair_dist=pair_cost(g,dist)/max(1,len(g)*(len(g)-1)/2)
            low.append((round(pair_dist,3),idx+1,[Path(source_rows[i]["sourcePath"]).stem for i in g]))
        report[series]={
            "images":len(source_rows),"sets":len(found),"old_pair_distance":round(old,4),
            "new_pair_distance":round(new,4),
            "improvement_percent":round((old-new)/old*100,1) if old else 0,
            "weakest_sets":sorted(low,reverse=True)[:3]
        }
        # Compressed log protocol for importing the result into GitHub via connected tools.
        line=";".join(",".join(group) for group in group_manifest[series])
        print(f"VISUAL_CLUSTER_{series}={line}",flush=True)
        print(f"VISUAL_QUALITY_{series}="+json.dumps(report[series],ensure_ascii=False),flush=True)
        print(f"VISUAL_GROUP_SCORES_{series}="+",".join(f"{pair_cost(g,dist)/max(1,len(g)*(len(g)-1)/2):.3f}" for g in found),flush=True)
        preview_contact_sheet(series,source_rows,found,dist,output)
    (output/"visual-clusters.json").write_text(json.dumps(group_manifest,ensure_ascii=False,indent=2),encoding="utf-8")
    (output/"quality-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print("VISUAL_SUMMARY="+json.dumps({
       "images":sum(v["images"] for v in report.values()),
       "sets":sum(v["sets"] for v in report.values()),
       "mean_improvement_percent":round(np.mean([v["improvement_percent"] for v in report.values()]),1)
    }),flush=True)

if __name__=="__main__":
    main()
