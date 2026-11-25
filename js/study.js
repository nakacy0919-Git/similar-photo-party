(() => {
'use strict';
const $=id=>document.getElementById(id);
const root='https://raw.githubusercontent.com/nakacy0919-Git/SimilarPhoto/53625ffce31f14200a3b4eced23e5fd2c3099211/';
const cdn='https://cdn.jsdelivr.net/gh/nakacy0919-Git/SimilarPhoto@53625ffce31f14200a3b4eced23e5fd2c3099211/';
const sourcePattern=/^images\/(?:000|100|200|300|400|500|600|700|800|900|1000)\/\d{3,4}\.webp$/;
let items=[],pool=[],index=0,regions={},activeRegion=-1;
const text=(id,value)=>{$(id).textContent=value;};
function photo(img,item){
  img.onerror=null;
  if(item.sourcePath && sourcePattern.test(item.sourcePath)){
    img.onerror=()=>{img.onerror=null;img.src=cdn+item.sourcePath;};
    img.src=root+item.sourcePath;
  }else if(!item.sourcePath && /^[\w-]+\.(webp|png|jpe?g)$/.test(item.filename))img.src='assets/images/'+item.filename;
  else img.removeAttribute('src');
  img.alt=item.title;
}
function stop(){if('speechSynthesis' in window)window.speechSynthesis.cancel();}
function speak(value){
  if(!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)){text('study-status','この端末は音声読み上げに対応していません。');return;}
  stop();const u=new SpeechSynthesisUtterance(value);u.lang='en-US';u.rate=0.88;
  u.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))text('study-status','音声を再生できませんでした。');};window.speechSynthesis.speak(u);
}
function make(tag,cls,value){const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=value;return node;}
function addPhrase(parent,en,ja,title){
  if(typeof en!=='string'||!en.trim())return;
  const card=make('article','phrase');
  if(title)card.append(make('small','phrase-title',title));
  const english=make('p','english',en);english.lang='en';card.append(english);
  const translation=make('p','translation',typeof ja==='string'?ja:'');translation.hidden=!$('study-translation').checked;
  if(ja)card.append(translation);
  const button=make('button','listen','▶ Listen');button.type='button';button.setAttribute('aria-label','Listen to '+en);
  button.addEventListener('click',()=>speak(en));card.append(button);parent.append(card);
}
function render(){
  stop();const item=pool[index];$('study-detail').hidden=!item;
  $('study-prev').disabled=index<=0;$('study-next').disabled=index>=pool.length-1;
  text('study-counter',pool.length?(index+1)+' / '+pool.length:'0 / 0');
  if(!item)return;
  text('study-title',item.title);text('study-status','');
  photo($('study-image'),item);const phrases=$('study-phrases');phrases.replaceChildren();
  const select=$('study-photo-select');select.value=item.id;
  const spots=$('study-hotspots');spots.replaceChildren();activeRegion=-1;
  const raw=Array.isArray(regions[item.id])?regions[item.id]:(Array.isArray(item.hotspots)?item.hotspots:[]);
  const valid=raw.map(h=>Number.isFinite(h.left)?h:{...h,left:Math.max(0,h.x-3),top:Math.max(0,h.y-3),width:Math.min(6,100-Math.max(0,h.x-3)),height:Math.min(6,100-Math.max(0,h.y-3))}).filter(h=>['left','top','width','height'].every(k=>Number.isFinite(h[k]))&&h.left>=0&&h.top>=0&&h.width>0&&h.height>0&&h.left+h.width<=100.001&&h.top+h.height<=100.001&&typeof h.en==='string'&&h.en.trim());
  const corrected=valid.length&&(item.needsReview||item.id==='sp_100_103');
  if(corrected)text('study-title',valid[0].title||item.title);
  function selectRegion(i){
    activeRegion=i;const h=valid[i];
    [...spots.children].forEach((el,j)=>{el.classList.toggle('selected',j===i);el.setAttribute('aria-pressed',String(j===i));});
    [...phrases.children].forEach((el,j)=>el.classList.toggle('selected',j===i));
    const p=$('study-point');p.replaceChildren();addPhrase(p,h.en,h.ja,h.title||'PHOTO DETAIL');p.hidden=false;
    $('study-point').scrollIntoView({block:'nearest',behavior:'auto'});
  }
  if(valid.length){
    for(const [i,h] of valid.entries()){
      const marker=make('button','hotspot');marker.type='button';
      marker.style.left=h.left+'%';marker.style.top=h.top+'%';marker.style.width=h.width+'%';marker.style.height=h.height+'%';
      marker.setAttribute('aria-label',(i+1)+'. '+(h.title||h.en));marker.setAttribute('aria-pressed','false');marker.append(make('span','hotspot-number',String(i+1)));
      marker.addEventListener('click',()=>selectRegion(i));spots.append(marker);
      addPhrase(phrases,h.en,h.ja,(i+1)+' · '+(h.title||'PHOTO DETAIL'));
      const card=phrases.lastElementChild;
      const locate=make('button','locate','◎ Show on photo');locate.type='button';locate.addEventListener('click',()=>selectRegion(i));card.append(locate);
    }
    // Preserve any model sentences for which no region has yet been registered.
    if(!corrected){
      const seen=new Set(valid.map(h=>h.en));
      if(!seen.has(item.key_phrase))addPhrase(phrases,item.key_phrase,item.translation,'MODEL DESCRIPTION · 未登録地点');
      for(const e of Array.isArray(item.examples)?item.examples:[])if(!seen.has(e.en))addPhrase(phrases,e.en,e.ja,e.title);
    }
  }else{
    addPhrase(phrases,item.key_phrase,item.translation,'MODEL DESCRIPTION');
    for(const e of Array.isArray(item.examples)?item.examples:[])addPhrase(phrases,e.en,e.ja,e.title);
  }
  $('study-point').hidden=true;$('study-point').replaceChildren();
  text('study-note',valid.length?valid.length+' 地点 · 枠をタップすると英文と日本語訳を表示します。':'地点未登録 · 写真全体とモデル英文で学習できます。');
  text('study-region-status',valid.length?'✓ '+valid.length+' regions':'地点データ未登録');
  requestAnimationFrame(fitImageOverlay);
}
function fitImageOverlay(){
  const img=$('study-image'), stage=img.parentElement.parentElement, overlay=$('study-hotspots');
  if(!img.naturalWidth||!img.naturalHeight)return;
  const b=img.getBoundingClientRect(),a=stage.getBoundingClientRect();
  const scale=Math.min(b.width/img.naturalWidth,b.height/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  overlay.style.left=(b.left-a.left+(b.width-w)/2)+'px';overlay.style.top=(b.top-a.top+(b.height-h)/2)+'px';overlay.style.width=w+'px';overlay.style.height=h+'px';
}
$('study-image').addEventListener('load',fitImageOverlay);
window.addEventListener('resize',fitImageOverlay);
if('ResizeObserver' in window)new ResizeObserver(fitImageOverlay).observe($('study-image'));
function filter(){
  const category=$('study-category').value;
  pool=category==='all'?items:category==='unmapped'?items.filter(i=>!regions[i.id]?.length&&!i.hotspots?.length):window.PHOTO_CATEGORIES.pool(items,category);index=0;
  const select=$('study-photo-select');select.replaceChildren();
  pool.forEach((item,i)=>{const option=make('option','',(i+1)+'. '+item.title);option.value=item.id;select.append(option);});
  render();
}
$('study-category').addEventListener('change',filter);
$('study-photo-select').addEventListener('change',e=>{const i=pool.findIndex(x=>x.id===e.target.value);if(i>=0){index=i;render();}});
$('study-prev').addEventListener('click',()=>{if(index>0){index--;render();}});
$('study-next').addEventListener('click',()=>{if(index<pool.length-1){index++;render();}});
$('study-translation').addEventListener('change',()=>document.querySelectorAll('.translation').forEach(p=>p.hidden=!$('study-translation').checked));
$('study-zoom').addEventListener('click',()=>{const item=pool[index];if(!item)return;photo($('study-zoom-image'),item);$('study-dialog').showModal();});
$('study-close').addEventListener('click',()=>$('study-dialog').close());
window.addEventListener('pagehide',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
(async()=>{
  try{
    const response=await fetch('data/content.json');if(!response.ok)throw Error('HTTP '+response.status);
    const local=await response.json();if(!Array.isArray(local))throw Error('Invalid data');
    try{const rr=await fetch('data/study-hotspots.json?v=20261125-modes2');if(!rr.ok)throw Error('HTTP '+rr.status);const rd=await rr.json();regions=rd.photos||{};}catch(e){console.error('Hotspot data:',e);text('study-status','地点データを読み込めませんでした。');}
    const imported=Array.isArray(window.SIMILAR_PHOTO_LIBRARY)?window.SIMILAR_PHOTO_LIBRARY:[];
    const visual=window.SIMILARPHOTO_VISUAL_GROUPS||{};
    items=[...local,...imported.map(item=>visual[item.sourcePath]?{...item,group:visual[item.sourcePath].group,visualDistance:visual[item.sourcePath].distance,needsVisualReview:visual[item.sourcePath].needsReview===true}:item)];
    const categories=window.PHOTO_CATEGORIES.options(items);
    if(!categories.length)throw Error('No categories');
    for(const c of categories){const option=make('option','',c.emoji+' '+c.en+' / '+c.ja);option.value=c.id;$('study-category').append(option);}
    const missing=items.filter(i=>!regions[i.id]?.length&&!i.hotspots?.length).length;
    if(missing){const opt=make('option','','地点未登録 / '+missing+' photos');opt.value='unmapped';$('study-category').append(opt);}
    $('study-category').disabled=false;$('study-photo-select').disabled=false;
    text('study-load',items.length+' photos · '+(items.length-missing)+' 地点登録済み · '+missing+' 地点未登録');filter();
  }catch(error){text('study-load','教材の読み込みに失敗しました。再読み込みしてください。');console.error(error);}
})();
})();