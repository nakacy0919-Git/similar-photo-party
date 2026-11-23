const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const PHOTO_CATEGORIES=require('../js/photo-categories.js');
const imported=require('../js/similarphoto-library.js');
const visual=require('../js/similarphoto-visual-groups.js');
const original=JSON.parse(fs.readFileSync('data/content.json','utf8'));

function prepared(){
 return imported.map(item=>{
  const group=visual[item.sourcePath];
  assert.ok(group,item.sourcePath);
  return {...item,group:group.group,visualDistance:group.distance,
   needsVisualReview:group.needsReview};
 });
}

test('image recognition groups all 457 photos by actual computed image properties',()=>{
 assert.equal(imported.length,457);
 assert.equal(Object.keys(visual).length,457);
 const groups=new Map();
 for(const row of imported){
  const mapping=visual[row.sourcePath];
  assert.ok(mapping && /^sp_\d{3,4}_v\d{2}$/.test(mapping.group),row.sourcePath);
  assert.equal(mapping.group.split('_')[1],row.sourceSeries);
  assert.ok(mapping.distance>=0&&mapping.distance<=1);
  assert.ok(mapping.maximumDistance>=mapping.distance);
  if(!groups.has(mapping.group))groups.set(mapping.group,[]);
  groups.get(mapping.group).push(row.sourcePath);
 }
 assert.equal(groups.size,111);
 assert.ok([...groups.values()].every(m=>m.length===4||m.length===5));
 assert.equal([...groups.values()].reduce((n,x)=>n+x.length,0),457);
});

test('quality flag differentiates 33 more similar groups from 78 review-required clusters',()=>{
 const byGroup=new Map();
 for(const [path,record] of Object.entries(visual)){
  if(!byGroup.has(record.group))byGroup.set(record.group,record);
  assert.equal(record.needsReview,
   record.distance>0.27 || record.maximumDistance>0.36);
 }
 const likely=[...byGroup.values()].filter(x=>!x.needsReview);
 assert.equal(likely.length,33);
 assert.equal(byGroup.size-likely.length,78);
});

test('original 168 photos survive, and users can choose all 457 or only 136 visual candidates',()=>{
 const together=[...original,...prepared()];
 assert.equal(together.length,625);
 const options=PHOTO_CATEGORIES.options(together);
 assert.ok(options.some(x=>x.id==='source-similar'));
 assert.ok(options.some(x=>x.id==='source-all'));
 assert.ok(options.some(x=>x.id==='source-000'));
 assert.ok(options.some(x=>x.id==='source-1000'));
 assert.equal(PHOTO_CATEGORIES.pool(together,'source-all').length,457);
 assert.equal(PHOTO_CATEGORIES.pool(together,'source-similar').length,136);
 assert.equal(PHOTO_CATEGORIES.pool(together,'all').length,625);
 const subset=PHOTO_CATEGORIES.pool(together,'source-similar');
 assert.ok(subset.every(x=>!x.needsVisualReview && x.sourceSeries));
 const chosenGroups=new Set(subset.map(x=>x.group));
 assert.equal(chosenGroups.size,33);
 assert.ok([...chosenGroups].every(g=>subset.filter(x=>x.group===g).length>=4));
});

test('visual set groups differ from basic sequential-by-number grouping',()=>{
 const base=imported.find(x=>x.sourcePath==='images/000/042.webp');
 assert.ok(base);
 assert.notEqual(visual[base.sourcePath].group,base.group);
 const originalMembers=new Map();
 const newMembers=new Map();
 for(const item of imported){
   if(!originalMembers.has(item.group))originalMembers.set(item.group,[]);
   originalMembers.get(item.group).push(item.sourcePath);
   const visualGroup=visual[item.sourcePath].group;
   if(!newMembers.has(visualGroup))newMembers.set(visualGroup,[]);
   newMembers.get(visualGroup).push(item.sourcePath);
 }
 const changedMemberships=imported.filter(item=>{
   const old=originalMembers.get(item.group).slice().sort().join(',');
   const current=newMembers.get(visual[item.sourcePath].group).slice().sort().join(',');
   return old!==current;
 });
 assert.ok(changedMemberships.length>=400,
   'more than 400 photos should have genuinely different distractor groups, not just new IDs');
});

test('HTML loads only local image analysis metadata scripts ahead of gameplay',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const game=fs.readFileSync('js/game.js','utf8');
 const path='js/similarphoto-visual-groups.js';
 assert.match(html,new RegExp('src="'+path.replaceAll('.','\\.')+'"'));
 assert.ok(html.indexOf(path)>html.indexOf('js/similarphoto-library.js'));
 assert.ok(html.indexOf(path)<html.indexOf('js/game.js'));
 assert.match(game,/SIMILARPHOTO_VISUAL_GROUPS/);
 assert.match(game,/Incomplete visual photo grouping/);
 assert.ok(!html.includes('<script src="https://raw.githubusercontent.com'));
});
