const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const imported=require('../js/similarphoto-library.js');
const categories=require('../js/photo-categories.js');
const existing=JSON.parse(fs.readFileSync('data/content.json','utf8'));
const seriesCounts={'000':51,'100':28,'200':64,'300':99,'400':40,'500':28,'600':14,'700':56,'800':38,'900':14,'1000':25};
const expectedGroups=111;
const pathPattern=/^images\/(?:000|100|200|300|400|500|600|700|800|900|1000)\/\d{3,4}\.webp$/;

test('original SimilarPhoto imports all 457 distinct source images without overwriting 168 existing photos',()=>{
 assert.equal(existing.length,168);
 assert.equal(imported.length,457);
 assert.equal(existing.length+imported.length,625);
 assert.equal(new Set(imported.map(x=>x.id)).size,457);
 assert.equal(new Set(imported.map(x=>x.sourcePath)).size,457);
 assert.equal(new Set([...existing,...imported].map(x=>x.filename)).size,625);
 assert.equal(new Set([...existing,...imported].map(x=>x.id)).size,625);
 for(const [series,count] of Object.entries(seriesCounts)){
   assert.equal(imported.filter(x=>x.sourceSeries===series).length,count,series);
 }
});

test('all 457 images belong to a real four-choice group of four to seven related-series photos',()=>{
 const groups=new Map();
 for(const x of imported){
   assert.match(x.sourcePath,pathPattern);
   assert.match(x.filename,/^imported_\d{3,4}_\d{3,4}\.webp$/);
   assert.equal(x.sourcePath.split('/')[1],x.sourceSeries);
   assert.ok(x.group.startsWith('sp_'+x.sourceSeries+'_'));
   if(!groups.has(x.group))groups.set(x.group,[]);
   groups.get(x.group).push(x);
 }
 assert.equal(groups.size,expectedGroups);
 for(const [group,items] of groups){
   assert.ok(items.length>=4 && items.length<=7,group);
   assert.equal(new Set(items.map(x=>x.sourceSeries)).size,1,group);
   assert.equal(new Set(items.map(x=>x.sourcePath)).size,items.length,group);
   // Every photo can be answered against at least three alternatives.
   for(const item of items)assert.equal(items.filter(other=>other.id!==item.id).length>=3,true);
 }
});

test('source English and Japanese sentences are kept, with exactly two source omissions marked for review',()=>{
 const missing=imported.filter(x=>x.needsReview);
 assert.deepEqual(missing.map(x=>x.sourcePath).sort(),
 ['images/100/101.webp','images/400/407.webp']);
 for(const x of imported){
   assert.equal(typeof x.title,'string');
   assert.equal(typeof x.key_phrase,'string');
   assert.equal(typeof x.translation,'string');
   assert.ok(x.key_phrase.trim() && x.translation.trim());
   if(!x.needsReview) {
      assert.ok(x.key_phrase.length>=8);
      assert.ok(x.translation.length>=5);
   }
 }
 const first=imported.find(x=>x.sourcePath==='images/000/001.webp');
 assert.equal(first.key_phrase,'Two penguins are standing side by side in the central cubby.');
 assert.match(first.translation,/ペンギン/);
 const one=imported.find(x=>x.sourcePath==='images/200/201.webp');
 assert.match(one.key_phrase,/very happy to see his dog/);
 assert.ok(imported.reduce((n,x)=>n+1+(x.examples?.length||0),0)>1300);
});

test('11 original teaching categories and source-only/all choices coexist with existing picture genres',()=>{
 const together=[...existing,...imported];
 const choices=categories.options(together);
 assert.equal(choices.filter(x=>/^source-\d+$/.test(x.id)).length,11);
 assert.ok(choices.some(x=>x.id==='source-all'));
 assert.ok(choices.some(x=>x.id==='sports'));
 assert.equal(categories.pool(together,'all').length,625);
 assert.equal(categories.pool(together,'source-all').length,457);
 assert.equal(categories.pool(together,'source-000').length,51);
 assert.equal(categories.pool(together,'source-300').length,99);
 assert.equal(categories.pool(together,'source-600').length,14);
 assert.equal(categories.pool(together,'source-1000').length,25);
 assert.equal(categories.pool(together,'sports').length,24);
 assert.equal(choices.some(x=>x.id==='new'),false,
  'imported groups must not leak into uncategorized new photos');
});

test('image URLs use a pinned public source revision, no executable remote scripts, and a separate CDN fallback',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const src=fs.readFileSync('js/game.js','utf8');
 const manifest=fs.readFileSync('js/similarphoto-library.js','utf8');
 assert.match(html,/src="js\/similarphoto-library\.js"/);
 assert.ok(html.indexOf('js/similarphoto-library.js')<html.indexOf('js/game.js'));
 assert.match(html,/img-src 'self' data: https:\/\/raw\.githubusercontent\.com https:\/\/cdn\.jsdelivr\.net;/);
 assert.match(src,/SOURCE_IMAGE_ROOT = 'https:\/\/raw\.githubusercontent\.com\/nakacy0919-Git\/SimilarPhoto\/53625ffce31f14200a3b4eced23e5fd2c3099211\//);
 assert.match(src,/SOURCE_CDN_ROOT = 'https:\/\/cdn\.jsdelivr\.net\/gh\/nakacy0919-Git\/SimilarPhoto@53625ffce31f14200a3b4eced23e5fd2c3099211\//);
 assert.match(src,/SOURCE_PATH_PATTERN\.test\(item\.sourcePath\)/);
 assert.match(src,/setPhotoImage\(elements\.imgs\.memory, state\.correctItem\)/);
 assert.match(src,/setPhotoImage\(elements\.imgs\.result, state\.correctItem\)/);
 assert.doesNotMatch(html,/<script[^>]+src="https:\/\/raw\.githubusercontent/);
 assert.doesNotMatch(manifest,/\beval\s*\(/);
});

test('original source files are not referenced with an unpinned branch',()=>{
 const src=fs.readFileSync('js/game.js','utf8');
 assert.doesNotMatch(src,/SimilarPhoto\/(?:main|master)\/images/);
 assert.doesNotMatch(src,/SimilarPhoto@(?:main|master)\/images/);
});
