const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname,'..',f),'utf8');
test('cinematic opening and exact badge placements use local assets',()=>{
 const html=read('index.html'), css=read('css/landing.css'), js=read('js/party-opening.js');
 assert.match(html,/class="landing-brandmark"[^>]*><img src="assets\/images\/similar-photo-badge\.avif"/);
 assert.match(html,/class="charades-art-symbol"><img src="assets\/images\/charade-badge\.avif"/);
 assert.match(html,/<script src="js\/party-opening\.js"><\/script>/);
 for(const file of ['similar-photo-badge.avif','charade-badge.avif']){
  const bytes=fs.readFileSync(path.join(__dirname,'../assets/images',file));
  assert.equal(bytes.subarray(4,12).toString(),'ftypavif');
  assert.ok(bytes.length>1000);
 }
 assert.match(css,/@keyframes party-photo-enter/);assert.match(css,/@keyframes party-charade-enter/);assert.match(css,/@keyframes party-fusion-glow/);
 assert.match(js,/Play together\./);assert.match(js,/Think differently\./);assert.match(js,/setTimeout\(finish, 6000\)/);assert.match(js,/prefers-reduced-motion/);assert.match(js,/overlay\.remove\(\)/);
});
