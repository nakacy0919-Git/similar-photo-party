const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const api=require('../js/photo-i18n.js');
const chars=require('../js/charades-data.js');

test('Similar Photo offers all eight Charades languages in exactly the same order',()=>{
 const codes=['en','ja','es','pt','fr','de','ko','zh'];
 assert.deepEqual(api.codes,codes);
 assert.deepEqual(new Set(chars.languages.map(([code])=>code)),new Set(codes));
 const html=fs.readFileSync('index.html','utf8');
 for(const code of codes){
   assert.match(html,new RegExp('<option value="'+code+'"'));
 }
 assert.match(html,/id="photo-language"/);
 assert.match(html,/id="tut-lang-select"/);
 assert.match(html,/src="js\/photo-i18n\.js"/);
 assert.ok(html.indexOf('src="js/photo-i18n.js"')<html.indexOf('src="js/game.js"'));
});

test('all eight locales have complete and non-empty photo UI and three localized tutorial steps',()=>{
 const keys=Object.keys(api.languages.en).sort();
 for(const code of api.codes){
  const lang=api.languages[code];
  assert.deepEqual(Object.keys(lang).sort(),keys,code+' missing localized field');
  for(const key of keys){
   if(key==='tutSteps')continue;
   assert.equal(typeof lang[key],'string',code+'/'+key);
   assert.ok(lang[key].trim().length>0,code+'/'+key);
  }
  assert.equal(lang.tutSteps.length,3,code);
  lang.tutSteps.forEach((step,i)=>{
   assert.equal(step.length,3,code+'/'+i);
   assert.ok(step.every(x=>typeof x==='string'&&x.trim().length>0),code+'/'+i);
   assert.ok(step[2].trim().length>8,code+'/'+i+' needs meaningful instructions');
  });
  assert.ok(api.text(code,'helper').includes('20'),code+' has the new explanation limit');
  assert.ok(api.text(code,'tutSteps')!=='tutSteps',code+' tutorial pack exists');
 }
});

test('new language switch uses textContent and matches all selectors on iPad, without unsafe markup',()=>{
 const js=fs.readFileSync('js/game.js','utf8');
 const html=fs.readFileSync('index.html','utf8');
 const css=fs.readFileSync('css/photo-flow.css','utf8');
 assert.match(js,/function setPhotoLanguage\(code\)/);
 assert.match(js,/PHOTO_I18N\.codes\.includes\(code\)/);
 assert.match(js,/document\.querySelectorAll\('\[data-photo-i18n\]'\)/);
 assert.match(js,/node\.textContent = photoText\(key\)/);
 assert.match(js,/elements\.btns\.tutorialLanguage\.value = state\.tutLang/);
 assert.match(html,/data-photo-i18n="which"/);
 assert.match(html,/data-photo-i18n="helper"/);
 assert.match(css,/\.photo-setup-intro h1\{/);
 assert.match(css,/line-height:1\.17!important/);
 assert.doesNotMatch(html,/\bonchange\s*=/i);
});

test('session has four requested time choices, a visible early handoff and no READY toolbar',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const js=fs.readFileSync('js/game.js','utf8');
 const css=fs.readFileSync('css/photo-flow.css','utf8');
 for(const n of [90,120,150,180]){
  assert.match(html,new RegExp('data-photo-duration="'+n+'"'));
  assert.match(html,new RegExp('data-time="'+n+'"'));
 }
 assert.doesNotMatch(html,/data-photo-duration="60"/);
 assert.match(html,/id="memory-skip-btn" class="photo-im-ready"/);
 assert.doesNotMatch(html,/hidden id="memory-skip-btn"/);
 assert.doesNotMatch(html,/id="photo-ready-back"/);
 assert.match(js,/const PHOTO_EXPLAIN_SECONDS = 20/);
 assert.match(js,/SESSION_TIME_OPTIONS = \[90, 120, 150, 180\]/);
 assert.match(js,/elements\.btns\.memorySkip\.addEventListener\('click', startChoicePhase\)/);
 assert.match(js,/const active = \['memory','choice','photoNext','result'\]/);
 assert.match(css,/#view-memory #memory-skip-btn\{/);
});

test('BGM mute is available in setup and play, separate from response sound effects',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const js=fs.readFileSync('js/game.js','utf8');
 assert.match(html,/id="photo-bgm-btn"/);
 assert.match(html,/id="photo-bgm-play"/);
 assert.match(html,/id="bgmBtn"/);
 assert.match(js,/function toggleBgm\(\)/);
 assert.match(js,/function syncPhotoMusicButtons\(\)/);
 assert.match(js,/photo-bgm-enabled/);
 assert.match(js,/elements\.audio\.bgm\.pause\(\)/);
 assert.match(js,/elements\.btns\.photoBgmSetup\.addEventListener\('click', toggleBgm\)/);
 assert.match(js,/elements\.btns\.photoBgmPlay\.addEventListener\('click', toggleBgm\)/);
 assert.match(js,/function playEffect\(audio\)/);
});
