const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('data/content.json'));
const PHOTO_CATEGORIES=require('../js/photo-categories.js');
const PHOTO_I18N=require('../js/photo-i18n.js');
function harness(payload=data, options={}){
 const nodes=new Map();let start;let timers=new Map();let id=0;let clock=0;const events=new Map();
 function el(key=''){if(nodes.has(key))return nodes.get(key);const classes=new Set(key.startsWith('view-')&&key!=='view-landing'?['hidden']:[]);const listeners=new Map();const attrs=new Map();const e={id:key,style:{},disabled:false,hidden:false,textContent:'',children:[],classList:{add(...v){v.forEach(x=>classes.add(x))},remove(...v){v.forEach(x=>classes.delete(x))},contains(v){return classes.has(v)},toggle(v,force){const on=force===undefined?!classes.has(v):!!force;if(on)classes.add(v);else classes.delete(v);return on}},addEventListener(name,fn){listeners.set(name,fn)},click(){listeners.get('click')?.({target:this})},setAttribute(k,v){attrs.set(k,v)},getAttribute(k){return attrs.get(k)},appendChild(e){this.children.push(e)},querySelector(selector){return el(key+'-'+selector)},querySelectorAll(){return this.children},pause(){},play(){return Promise.resolve()}};Object.defineProperty(e,'innerHTML',{set(value){if(value==='')this.children=[]},get(){return''}});nodes.set(key,e);return e;}
 const document={hidden:false,documentElement:{lang:'en'},getElementById:el,createElement:()=>el('new'+id++),querySelectorAll:()=>[],body:el('body'),addEventListener:(n,f)=>{if(n==='DOMContentLoaded')start=f;else events.set(n,f)}};
 const ctx={document,console:{error(){}},fetch:async()=>({ok:true,json:async()=>payload}),performance:{now:()=>clock},Image:class{set src(v){this.onload()}},setInterval:f=>{timers.set(++id,f);return id},clearInterval:i=>timers.delete(i),setTimeout:f=>{timers.set(++id,f);return id},clearTimeout:i=>timers.delete(i),alert(){},window:{matchMedia:()=>({matches:false}),PHOTO_CATEGORIES,PHOTO_I18N,...(options.window||{})}};
 const src=fs.readFileSync('js/game.js','utf8').replace(/\n\}\);\s*$/, '\n globalThis.api={state,startMemoryPhase,startExplainPhase,startChoicePhase,checkAnswer,showResultPhase,showPhotoNext,backToLanding,prepareQuizData,openSettings,closeSettings,setSessionDuration,setMemoryTime,setPhotoLanguage,toggleBgm,setHintMode,speak,stopSpeech,askForOneMoreClue,openPhotoSetup,preparePhotoReady,selectPhotoGenre,setPhotoPaused,finishPhotoGame};\n});');
 vm.createContext(ctx);vm.runInContext(src,ctx);start();return {ctx,nodes,timers,events,api:ctx.api,advance:ms=>{clock+=ms;},flush:()=>new Promise(r=>setImmediate(r))};
}
test('all 168 records have unique IDs, images and complete groups',()=>{assert.equal(data.length,168);assert.equal(new Set(data.map(x=>x.id)).size,168);const groups={};for(const x of data){assert.ok(fs.existsSync('assets/images/'+x.filename));groups[x.group]=(groups[x.group]||0)+1;}assert.equal(Object.keys(groups).length,42);assert.ok(Object.values(groups).every(n=>n===4));});
test('each cycle uses all questions once; options stay in the same group',async()=>{const h=harness();await h.flush();let seen=new Set();for(let i=0;i<data.length;i++){assert.ok(h.api.prepareQuizData());let {correctItem,currentSet}=h.api.state;assert.ok(!seen.has(correctItem.id));seen.add(correctItem.id);assert.equal(currentSet.length,4);assert.ok(currentSet.every(x=>x.group===correctItem.group));assert.ok(currentSet.includes(correctItem));}});
test('single wrong answer locks the question and central NEXT hides the following photo',async()=>{
 const h=harness();await h.flush();await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 h.api.startChoicePhase();
 const correct=h.api.state.correctItem;
 const wrong=h.api.state.currentSet.find(x=>x.id!==correct.id);
 const btn={disabled:false,classList:{add(){}}};
 h.api.checkAnswer(wrong,btn);
 assert.equal(h.api.state.answeredCount,1);
 assert.equal(h.api.state.correctCount,0);
 assert.equal(h.api.state.phase,'feedback');
 h.api.checkAnswer(correct,{disabled:false,classList:{add(){}}});
 assert.equal(h.api.state.answeredCount,1,'no second guess allowed after wrong');
 h.api.showPhotoNext();
 assert.equal(h.api.state.phase,'photoNext');
 assert.equal(h.nodes.get('view-memory').classList.contains('hidden'),true);
 assert.equal(h.nodes.get('view-choice').classList.contains('hidden'),true);
 assert.equal(h.nodes.get('photo-next-start').hidden,false);
 assert.equal(h.api.state.round,1,'next photo must not be prepared before NEXT');
 assert.equal(h.api.state.sessionStarted,true);
 h.nodes.get('photo-next-start').click();await h.flush();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.api.state.round,2);
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
 assert.equal(h.api.state.phase,'landing');
});
test('invalid paths, duplicate IDs and failed schemas disable play',async()=>{for(const bad of [[{...data[0],filename:'../secret.png'}],[data[0],data[0]],{}]){const h=harness(bad);await h.flush();assert.equal(h.nodes.get('start-btn').disabled,true);assert.match(h.nodes.get('load-status').textContent,/読み込めません/);}});

test('whole-game duration is selectable, but every photo has exactly twenty explanation seconds',async()=>{
 const h=harness();await h.flush();
 assert.equal(h.api.state.sessionDuration,90);
 assert.equal(h.api.state.memoryTime,20);
 assert.equal(h.api.state.hintMode,'guided');
 assert.equal(h.api.setSessionDuration(90),true);
 assert.equal(h.api.setMemoryTime(120),true,'legacy API selects whole session length');
 assert.equal(h.api.setSessionDuration(50),false);
 assert.equal(h.api.state.sessionDuration,120);
 await h.api.startMemoryPhase();
 assert.equal(h.nodes.get('memory-timer').textContent,20);
 assert.equal(h.api.setSessionDuration(60),false,'duration cannot change mid-game');
 assert.equal(h.nodes.get('explain-hint').classList.contains('hidden'),false);
 assert.equal(h.api.setHintMode('free'),true);
 assert.equal(h.nodes.get('explain-hint').classList.contains('hidden'),true);
 assert.equal(h.api.setHintMode('invalid'),false);
 h.api.setHintMode('guided');
 assert.equal(h.nodes.get('explain-hint').classList.contains('hidden'),false);
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
});
test('role cues rotate from A to B, and an opaque NEXT screen separates the photos',async()=>{
 const h=harness();await h.flush();await h.api.startMemoryPhase();
 assert.match(h.nodes.get('role-memory').textContent,/Player A.*Describe the photo/);
 assert.match(h.nodes.get('role-choice').textContent,/Player B: 写真を選ぶ/);
 h.api.startChoicePhase();
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showPhotoNext();
 assert.match(h.nodes.get('photo-next-roles').textContent,/Player B/);
 assert.equal(h.nodes.get('view-memory').classList.contains('hidden'),true);
 h.nodes.get('photo-next-start').click();await h.flush();
 assert.match(h.nodes.get('role-memory').textContent,/Player B.*Describe the photo/);
 assert.match(h.nodes.get('role-choice').textContent,/Player A: 写真を選ぶ/);
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
});
test('speech fallback is non-blocking when browser speech synthesis is unavailable', async () => {
 const h=harness(); await h.flush();await h.api.startMemoryPhase();
 h.api.startExplainPhase();h.api.startChoicePhase();h.api.state.phase='feedback';
 h.api.showResultPhase();
 assert.equal(h.api.state.phase,'result');
 assert.equal(h.api.state.isSpeaking,false);
 assert.match(h.nodes.get('audio-status').textContent,/利用できません/);
 assert.equal(h.api.speak('Test sentence.'),false);
});
test('stale voice callbacks cannot restart audio or modify new rounds', async () => {
 let utterances=[];let cancellations=0;
 class Utterance {constructor(text){this.text=text;}}
 const synth={speak(u){utterances.push(u)},cancel(){cancellations++;}};
 const h=harness(data,{window:{speechSynthesis:synth,SpeechSynthesisUtterance:Utterance}});
 await h.flush();await h.api.startMemoryPhase();
 h.api.startExplainPhase();h.api.startChoicePhase();h.api.state.phase='feedback';
 h.api.showResultPhase();
 assert.equal(h.api.state.isSpeaking,true);
 assert.equal(utterances.length,1);
 const old=utterances[0];
 assert.equal(h.api.speak('Repeat English sentence.'),true);
 assert.equal(utterances.length,2);
 old.onend();
 assert.equal(h.api.state.isSpeaking,true,'old speech completion must not affect replacement');
 h.ctx.document.hidden=true;
 h.events.get('visibilitychange')();
 assert.equal(h.api.state.isSpeaking,false);
 assert.match(h.nodes.get('audio-status').textContent,/一時停止/);
 utterances[1].onend();
 assert.match(h.nodes.get('audio-status').textContent,/一時停止/);
 h.api.backToLanding();
 assert.equal(h.api.state.phase,'landing');
 assert.ok(cancellations>=3);
});
test('mobile layout has scrollable gameplay and avoids shrunken landscape canvas', () => {
 const css=fs.readFileSync('css/style.css','utf8');
 const html=fs.readFileSync('index.html','utf8');
 assert.match(css,/100dvh/);
 assert.match(css,/overscroll-behavior:\s*contain/);
 assert.match(css,/#choice-grid\s*>\s*button\s*\{/);
 assert.doesNotMatch(html,/transform:\s*scale\(0\.75\)/);
 for (const id of ['role-memory','role-explain','role-choice','role-result','next-role','audio-status']) {
  assert.match(html,new RegExp('id="'+id+'"'));
 }
});

test('silent mobile speech stalls are recovered and do not leak timers', async () => {
 const synth={speak(){},cancel(){}};
 const h=harness(data,{window:{speechSynthesis:synth,SpeechSynthesisUtterance:class {}}});
 await h.flush();await h.api.startMemoryPhase();
 h.api.startExplainPhase();h.api.startChoicePhase();h.api.state.phase='feedback';
 h.api.showResultPhase();
 assert.equal(h.api.state.isSpeaking,true);
 const watchdog=h.api.state.speechTimeout;
 assert.ok(h.timers.has(watchdog),'watchdog must be scheduled for stalled speech');
 h.timers.get(watchdog)();
 assert.equal(h.api.state.isSpeaking,false);
 assert.equal(h.api.state.speechTimeout,null);
 assert.match(h.nodes.get('audio-status').textContent,/再試行/);
 h.api.backToLanding();
 assert.equal(h.timers.size,0,'all speech and round timers must be cleared');
});

test('speaking missions rotate across rounds and Guided/Free change only the scaffolds', async () => {
 const h=harness(); await h.flush();
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.missionIndex,0);
 assert.match(h.nodes.get('memory-mission').textContent,/Name it/);
 assert.doesNotMatch(h.nodes.get('memory-mission').textContent,/\.webp/);
 assert.doesNotMatch(h.nodes.get('memory-mission').textContent,/\b(?:kitchen|door)_[1-4]\b/);
 h.api.startExplainPhase();
 assert.match(h.nodes.get('explain-mission').textContent,/I can see/);
 h.api.setHintMode('free');
 assert.match(h.nodes.get('explain-mission').textContent,/Name it/);
 assert.doesNotMatch(h.nodes.get('explain-mission').textContent,/I can see/);
 h.api.startChoicePhase();h.api.state.phase='feedback';h.api.showResultPhase();
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.missionIndex,1);
 assert.match(h.nodes.get('memory-mission').textContent,/Place it/);
 h.api.startExplainPhase();h.api.startChoicePhase();h.api.state.phase='feedback';h.api.showResultPhase();
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.missionIndex,2);
 assert.match(h.nodes.get('memory-mission').textContent,/Make it unique/);
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
});
test('twenty-second photo explanation switches directly to four choices; session clock remains active',async()=>{
 const h=harness();await h.flush();assert.equal(h.api.setSessionDuration(90),true);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.nodes.get('memory-timer').textContent,20);
 assert.equal(h.api.askForOneMoreClue(),false);
 const photoTimer=h.api.state.timerInterval;
 const wholeGameTimer=h.api.state.sessionTimerInterval;
 const tick=h.timers.get(photoTimer);
 assert.equal(typeof tick,'function');assert.ok(h.timers.has(wholeGameTimer));
 h.advance(19900);tick();assert.equal(h.api.state.phase,'memory');
 h.advance(100);tick();assert.equal(h.api.state.phase,'choice');
 assert.equal(h.api.state.activeCountdown,null);
 assert.equal(h.nodes.get('choice-grid').children.length,4);
 assert.equal(h.api.state.sessionStarted,true);
 h.timers.get(wholeGameTimer)();
 assert.equal(h.nodes.get('photo-total-time').textContent,'70');
 h.api.backToLanding();assert.equal(h.timers.size,0);
});
test('peer-feedback panel and automatic peer tracking are removed from results', () => {
 const html=fs.readFileSync('index.html','utf8');
 const source=fs.readFileSync('js/game.js','utf8');
 assert.doesNotMatch(html,/Partner Feedback|id="feedback-progress"|class="peer-feedback"/);
 assert.doesNotMatch(source,/peerReviews|reviewSelection|setPeerFeedback/);
});
test('speaking missions remain available without the removed feedback area', () => {
 const html=fs.readFileSync('index.html','utf8');
 const css=fs.readFileSync('css/style.css','utf8');
 for(const id of ['memory-mission','explain-mission','clue-request-btn','clue-request-note']) {
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(css,/\.mission-cue/);
 assert.doesNotMatch(html,/data-criterion=/);
});
test('hostile-looking lesson text is displayed literally without HTML interpretation', async () => {
 const probe='<img src=x onerror=alert(1)><script>alert(2)</script>';
 const content=data.map((item,index)=>index===0?{...item,title:probe,key_phrase:probe,translation:probe}:item);
 const h=harness(content);await h.flush();
 assert.equal(h.nodes.get('start-btn').disabled,false);
 await h.api.startMemoryPhase();
 h.api.state.correctItem=content[0];
 h.api.startExplainPhase();h.api.startChoicePhase();
 h.api.state.phase='feedback';h.api.showResultPhase();
 assert.equal(h.nodes.get('result-title').textContent,probe);
 assert.equal(h.nodes.get('result-phrase').textContent,probe);
 assert.equal(h.nodes.get('result-trans').textContent,probe);
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
});
test('app disallows unsafe image paths and does not interpolate remote text into HTML', async () => {
 for (const name of ['https://host.test/x.webp','javascript:alert(1)','data:image/svg+xml,abc','a/../b.webp','a.svg']) {
  const payload=data.map((x,i)=>i===0?{...x,filename:name}:x);
  const h=harness(payload);await h.flush();
  assert.equal(h.nodes.get('start-btn').disabled,true,name);
 }
 const app=fs.readFileSync('js/game.js','utf8');
 const html=fs.readFileSync('index.html','utf8');
 assert.doesNotMatch(html,/\bonclick\s*=/i,'inline JS handlers should be absent');
 assert.doesNotMatch(app,/innerHTML\s*=\s*`/,'template literals must not reach HTML parser');
 assert.match(app,/function setTutorialButton/);
 assert.match(app,/textLabel\.textContent\s*=\s*label/);
 assert.match(html,/id="translation-toggle-btn"/);
});

test('photo mode plays a handoff chime and switches straight from visible photo to choices', async () => {
 let plays=0;
 class FakeAudioContext {
   constructor(){this.state='running';this.currentTime=1;this.destination={};}
   createOscillator(){return{frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){plays++},stop(){}};}
   createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
 }
 const h=harness(data,{window:{AudioContext:FakeAudioContext}});
 await h.flush();
 assert.equal(h.api.setSessionDuration(90),true);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 const tick=h.timers.get(h.api.state.timerInterval);
 h.advance(20000);tick();
 assert.equal(h.api.state.phase,'choice');
 assert.equal(plays,1,'a short sound marks the handoff');
 assert.equal(h.nodes.get('handoff-announcement').hidden,false);
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
});

test('Photo counts each first-try success once and never grants points for repeated taps',async()=>{
 const h=harness();await h.flush();await h.api.startMemoryPhase();h.api.startChoicePhase();
 const correct=h.api.state.correctItem;
 const btn={disabled:false,classList:{add(){}}};
 h.api.checkAnswer(correct,btn);
 assert.equal(h.nodes.get('choice-success-overlay').hidden,false);
 assert.equal(h.api.state.answeredCount,1);
 assert.equal(h.api.state.correctCount,1);
 assert.equal(h.nodes.get('photo-total-correct').textContent,'1');
 h.api.checkAnswer(correct,{disabled:false,classList:{add(){}}});
 assert.equal(h.api.state.correctCount,1);
 h.api.showPhotoNext();
 assert.equal(h.api.state.phase,'photoNext');
 assert.match(h.nodes.get('photo-next-feedback').textContent,/Correct/);
 h.nodes.get('photo-next-start').click();await h.flush();
 h.api.startChoicePhase();
 const wrong=h.api.state.currentSet.find(x=>x.id!==h.api.state.correctItem.id);
 h.api.checkAnswer(wrong,{disabled:false,classList:{add(){}}});
 assert.equal(h.api.state.correctCount,1);
 assert.equal(h.api.state.answeredCount,2);
 h.api.showPhotoNext();
 assert.match(h.nodes.get('photo-next-feedback').textContent,/Not quite/);
 h.api.finishPhotoGame();
 assert.equal(h.nodes.get('photo-summary-correct').textContent,'1');
 assert.equal(h.nodes.get('photo-summary-rounds').textContent,'2 questions attempted / 90s');
});
test('photo handoff supports optional vibration-only setting without Web Audio',async()=>{
 let vibrations=0;
 const h=harness(data,{window:{navigator:{vibrate(pattern){assert.ok(pattern.length>0);vibrations++;return true;}}}});
 await h.flush();
 h.api.state.handoffAlert='vibrate';
 await h.api.startMemoryPhase();h.api.startChoicePhase();
 assert.equal(h.api.state.phase,'choice');
 assert.equal(vibrations,1);
 h.api.backToLanding();
});

test('Photo setup and settings offer 90/120/150/180-second sessions; each image is up to 20 seconds',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const js=fs.readFileSync('js/game.js','utf8');
 const css=fs.readFileSync('css/landing.css','utf8');
 for(const sec of [90,120,150,180]){
   assert.match(html,new RegExp('data-time="'+sec+'"'));
   assert.match(html,new RegExp('data-photo-duration="'+sec+'"'));
 }
 assert.doesNotMatch(html,/data-memory-time=/);
 assert.match(html,/id="photo-total-time"/);
 assert.match(html,/id="photo-total-correct"/);
 assert.match(html,/id="view-photo-next"/);
 assert.match(html,/id="photo-next-start"/);
 assert.match(js,/runTimer\(PHOTO_EXPLAIN_SECONDS, elements\.timers\.memory, startChoicePhase\)/);
 assert.match(js,/function startSessionClock\(\)/);
 assert.match(js,/function showPhotoNext\(\)/);
 assert.match(css,/#view-landing\.landing-screen\.hidden\s*\{\s*display:none!important/);
});
test('Similar Photo starts with a genre choice rather than immediately exposing a photo', async () => {
 const h=harness(); await h.flush();
 assert.equal(h.api.state.phase,'landing');
 h.nodes.get('start-btn').click();
 assert.equal(h.api.state.phase,'photoSetup');
 assert.equal(h.nodes.get('view-photo-setup').classList.contains('hidden'),false);
 assert.equal(h.nodes.get('view-memory').classList.contains('hidden'),true);
 assert.equal(h.nodes.get('photo-category-list').children.length>=7,true);
 assert.equal(h.nodes.get('photo-genre-count').textContent,'168 photos');
 assert.equal(h.api.selectPhotoGenre('sports'),true);
 assert.ok(h.api.state.activePool.length>=4);
 assert.ok(h.api.state.activePool.every(item=>new Set(['ball','parkkid','tennisstrike','watchgame','203','211']).has(item.group)));
 h.nodes.get('photo-setup-next').click();
 assert.equal(h.api.state.phase,'photoReady');
 assert.equal(h.nodes.get('view-memory').classList.contains('hidden'),true);
 assert.match(h.nodes.get('photo-ready-round').textContent,/ROUND 1/);
 assert.match(h.nodes.get('photo-ready-summary').textContent,/Sports/);
 assert.equal(h.timers.size,0);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.api.state.activePool.length,24);
 assert.ok(h.api.state.currentSet.every(item=>h.api.state.activePool.includes(item)));
 h.api.backToLanding();
});

test('only first question uses READY; each subsequent photo waits behind a big central NEXT while clock counts down',async()=>{
 const h=harness();await h.flush();h.api.openPhotoSetup();h.api.preparePhotoReady();
 assert.equal(h.api.state.phase,'photoReady');
 assert.equal(h.timers.size,0);
 await h.api.startMemoryPhase();h.api.startChoicePhase();
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showPhotoNext();
 assert.equal(h.api.state.phase,'photoNext');
 assert.equal(h.api.state.round,1);
 const whole=h.api.state.sessionTimerInterval;
 assert.ok(h.timers.has(whole),'whole-session clock keeps ticking on NEXT');
 h.advance(5000);h.timers.get(whole)();
 assert.equal(h.nodes.get('photo-total-time').textContent,'85');
 assert.equal(h.nodes.get('view-memory').classList.contains('hidden'),true);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.api.state.round,2);
 assert.equal(h.api.state.correctCount,1);
 assert.equal(h.api.state.sessionTimerInterval,whole,'NEXT does not restart 60-second timer');
 h.api.finishPhotoGame();assert.equal(h.api.state.phase,'photoSummary');
});
test('pause freezes photo countdown and hides image while the game is paused',async()=>{
 const h=harness();await h.flush();h.api.openPhotoSetup();h.api.preparePhotoReady();
 await h.api.startMemoryPhase();
 const tick=h.timers.get(h.api.state.timerInterval);
 h.advance(3000);tick();
 const remaining=h.api.state.activeCountdown.remainingMs;
 h.nodes.get('photo-pause').click();
 assert.equal(h.api.state.paused,true);
 assert.equal(h.nodes.get('photo-pause-overlay').hidden,false);
 h.advance(25000);tick();
 assert.equal(h.api.state.activeCountdown.remainingMs,remaining);
 h.nodes.get('photo-resume').click();
 assert.equal(h.api.state.paused,false);
 assert.equal(h.nodes.get('photo-pause-overlay').hidden,true);
 h.advance(1000);tick();
 assert.equal(h.api.state.activeCountdown.remainingMs,remaining-1000);
 h.api.finishPhotoGame();
 assert.equal(h.timers.size,0);
});

test('final result shows number correct out of attempts and restarting resets the entire game',async()=>{
 const h=harness();await h.flush();
 h.api.openPhotoSetup();h.api.selectPhotoGenre('food');h.api.setSessionDuration(120);h.api.preparePhotoReady();
 await h.api.startMemoryPhase();h.api.startChoicePhase();
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showPhotoNext();h.api.finishPhotoGame();
 assert.equal(h.api.state.phase,'photoSummary');
 assert.equal(h.nodes.get('photo-summary-correct').textContent,'1');
 assert.equal(h.nodes.get('photo-summary-rounds').textContent,'1 questions attempted / 120s');
 assert.equal(h.api.state.sessionStarted,false);
 h.nodes.get('photo-summary-replay').click();
 assert.equal(h.api.state.phase,'photoReady');
 assert.equal(h.api.state.correctCount,0);
 assert.equal(h.api.state.sessionRemainingMs,120000);
 assert.match(h.nodes.get('photo-ready-summary').textContent,/Food/);
 h.api.openPhotoSetup();
 assert.equal(h.api.state.phase,'photoSetup');
 h.nodes.get('photo-setup-home').click();
 assert.equal(h.api.state.phase,'landing');
 assert.equal(h.timers.size,0);
});
test('photo categories cover every existing group while supporting future groups',()=>{
 const genres=PHOTO_CATEGORIES.options(data);
 assert.equal(PHOTO_CATEGORIES.pool(data,'all').length,168);
 assert.ok(genres.length>=8);
 assert.equal(PHOTO_CATEGORIES.pool(data,'sports').length,24);
 assert.equal(PHOTO_CATEGORIES.pool(data,'school').length,32);
 assert.equal(PHOTO_CATEGORIES.pool(data,'not-a-category').length,0);
 const future=[...data,...data.slice(0,4).map((item,i)=>({...item,group:'fresh-photos',id:'new_'+i,filename:'fresh_'+i+'.webp'}))];
 const novel=PHOTO_CATEGORIES.options(future).find(item=>item.id==='new');
 assert.ok(novel);
 assert.equal(PHOTO_CATEGORIES.pool(future,'new').length,4);
 const groups=new Set(data.map(item=>item.group));
 const mapped=new Set(genres.flatMap(item=>item.groups));
 for(const group of groups) assert.ok(mapped.has(group),group);
});

test('Photo Back cancels running timers and returns directly to category setup',async()=>{
 const h=harness();await h.flush();h.api.openPhotoSetup();h.api.preparePhotoReady();
 await h.api.startMemoryPhase();
 const oldTick=h.timers.get(h.api.state.timerInterval);
 assert.ok(oldTick);
 h.nodes.get('photo-back').click();
 assert.equal(h.api.state.phase,'photoSetup');
 assert.equal(h.timers.size,0);
 oldTick();
 assert.equal(h.api.state.phase,'photoSetup');
 assert.equal(h.nodes.get('photo-pause-overlay').hidden,true);
 h.api.preparePhotoReady();await h.api.startMemoryPhase();h.api.startChoicePhase();
 h.nodes.get('photo-back').click();
 assert.equal(h.api.state.phase,'photoSetup');
 assert.equal(h.timers.size,0);
});


test('photo result has no oversized green count and gives image/English panel available height',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const immersive=fs.readFileSync('css/immersive.css','utf8');
 const photo=fs.readFileSync('css/photo-flow.css','utf8');
 const source=fs.readFileSync('js/game.js','utf8');
 assert.match(html,/id="photo-result-main"/);
 assert.doesNotMatch(html,/class="photo-result-count"|id="photo-result-count"/);
 assert.match(immersive,/#view-result #photo-result-main\s*\{/);
 assert.doesNotMatch(immersive,/#view-result>div:nth-of-type\(2\)/);
 assert.doesNotMatch(photo,/#view-result \.photo-result-count/);
 assert.doesNotMatch(source,/getElementById\('photo-result-count'\)/);
 assert.match(source,/合計\$\{state\.correctCount\}問/);
});

test('imported SimilarPhoto plays genre → READY → timed picture → four choices → protected NEXT',async()=>{
 const imported=require('../js/similarphoto-library.js');
 const h=harness(data,{window:{SIMILAR_PHOTO_LIBRARY:imported}});await h.flush();
 assert.equal(h.api.state.quizData.length,625);
 h.api.openPhotoSetup();
 assert.equal(h.api.selectPhotoGenre('source-1000'),true);
 h.api.preparePhotoReady();
 assert.equal(h.api.state.phase,'photoReady');
 assert.match(h.nodes.get('photo-ready-summary').textContent,/接続詞・論理/);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.api.state.activePool.length,25);
 assert.equal(h.api.state.currentSet.length,4);
 assert.ok(h.api.state.currentSet.every(x=>x.group===h.api.state.correctItem.group));
 assert.match(h.nodes.get('memory-img').src,/^https:\/\/raw\.githubusercontent\.com\/nakacy0919-Git\/SimilarPhoto\//);
 h.api.startChoicePhase();
 assert.equal(h.api.state.phase,'choice');
 const images=h.nodes.get('choice-grid').children.map(btn=>btn.children[0].src);
 assert.equal(images.length,4);
 assert.ok(images.every(x=>x.startsWith('https://raw.githubusercontent.com/')));
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showPhotoNext();
 assert.equal(h.api.state.phase,'photoNext');
 assert.equal(h.api.state.correctCount,1);
 assert.equal(h.nodes.get('view-memory').classList.contains('hidden'),true);
 h.api.backToLanding();assert.equal(h.timers.size,0);
});
test('photo game applies visual clusters to its 457 imported photos and launches a reviewed candidate group',async()=>{
 const imported=require('../js/similarphoto-library.js');
 const visual=require('../js/similarphoto-visual-groups.js');
 const h=harness(data,{window:{SIMILAR_PHOTO_LIBRARY:imported,SIMILARPHOTO_VISUAL_GROUPS:visual}});
 await h.flush();
 assert.equal(h.api.state.quizData.length,625);
 const photo=h.api.state.quizData.find(item=>item.sourcePath==='images/000/042.webp');
 assert.ok(photo);
 assert.equal(photo.group,visual[photo.sourcePath].group);
 assert.equal(photo.needsVisualReview,visual[photo.sourcePath].needsReview);
 h.api.openPhotoSetup();
 assert.equal(h.api.selectPhotoGenre('source-similar'),true);
 assert.equal(h.api.state.activePool.length,136);
 h.api.preparePhotoReady();
 assert.equal(h.api.state.phase,'photoReady');
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.api.state.currentSet.length,4);
 assert.ok(h.api.state.currentSet.every(item=>item.group===h.api.state.correctItem.group));
 assert.ok(h.api.state.currentSet.every(item=>!item.needsVisualReview));
 h.api.startChoicePhase();
 assert.equal(h.api.state.phase,'choice');
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
});


test('whole-game countdown ends automatically at zero and presents correct-answer summary',async()=>{
 const h=harness();await h.flush();h.api.openPhotoSetup();h.api.preparePhotoReady();
 assert.equal(h.api.state.sessionStarted,false);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.sessionRemainingMs,90000);
 const oldPhotoTick=h.timers.get(h.api.state.timerInterval);
 const whole=h.api.state.sessionTimerInterval,wholeTick=h.timers.get(whole);
 h.advance(90000);wholeTick();
 assert.equal(h.api.state.phase,'photoSummary');
 assert.equal(h.nodes.get('photo-summary-correct').textContent,'0');
 assert.equal(h.nodes.get('photo-summary-rounds').textContent,'0 questions attempted / 90s');
 assert.equal(h.nodes.get('photo-session-hud').hidden,true);
 assert.equal(h.api.state.sessionTimerInterval,null);
 assert.equal(h.timers.size,0);
 oldPhotoTick();
 assert.equal(h.api.state.phase,'photoSummary','stale photo countdown cannot reveal a new photo');
});

test('session time keeps counting behind NEXT but pause truly freezes both clocks',async()=>{
 const h=harness();await h.flush();h.api.openPhotoSetup();h.api.preparePhotoReady();
 await h.api.startMemoryPhase();h.api.startChoicePhase();
 const wrong=h.api.state.currentSet.find(item=>item.id!==h.api.state.correctItem.id);
 h.api.checkAnswer(wrong,{disabled:false,classList:{add(){}}});
 h.api.showPhotoNext();
 assert.equal(h.api.state.phase,'photoNext');
 const whole=h.api.state.sessionTimerInterval,tick=h.timers.get(whole);
 h.advance(7000);tick();
 assert.equal(h.api.state.sessionRemainingMs,83000,'NEXT must not stop the 90-second game');
 h.nodes.get('photo-pause').click();
 assert.equal(h.api.state.paused,true);
 assert.equal(h.nodes.get('photo-pause-overlay').hidden,false);
 h.advance(16000);tick();
 assert.equal(h.api.state.sessionRemainingMs,83000,'pause must protect the total clock');
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'photoNext','cannot accidentally reveal the next photo while paused');
 h.nodes.get('photo-resume').click();
 h.advance(2000);tick();
 assert.equal(h.api.state.sessionRemainingMs,81000);
 h.api.backToLanding();assert.equal(h.timers.size,0);
});

test('hidden browser tab pauses the whole Photo session and NEXT cannot leak the next image',async()=>{
 const h=harness();await h.flush();await h.api.startMemoryPhase();h.api.startChoicePhase();
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showPhotoNext();
 const previous=h.api.state.correctItem.id,previousRound=h.api.state.round;
 h.ctx.document.hidden=true;h.events.get('visibilitychange')();
 assert.equal(h.api.state.paused,true);
 const tick=h.timers.get(h.api.state.sessionTimerInterval);
 h.advance(100000);tick();
 assert.equal(h.api.state.sessionRemainingMs,90000);
 h.nodes.get('photo-next-start').click();await h.flush();
 assert.equal(h.api.state.phase,'photoNext');
 assert.equal(h.api.state.round,previousRound);
 assert.equal(h.api.state.correctItem.id,previous);
 h.ctx.document.hidden=false;h.events.get('visibilitychange')();
 h.nodes.get('photo-resume').click();
 h.nodes.get('photo-next-start').click();await h.flush();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.api.state.round,previousRound+1);
 h.api.backToLanding();
});

test('zero-time session ends on four-choice screen even when no answer was chosen',async()=>{
 const h=harness();await h.flush();await h.api.startMemoryPhase();h.api.startChoicePhase();
 const tick=h.timers.get(h.api.state.sessionTimerInterval);
 h.advance(90000);tick();
 assert.equal(h.api.state.phase,'photoSummary');
 assert.equal(h.api.state.answeredCount,0);
 assert.equal(h.api.state.correctCount,0);
 assert.equal(h.timers.size,0);
});

test('rapid Photo interface hides upcoming images and shows central NEXT plus persistent HUD',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const photoCSS=fs.readFileSync('css/photo-flow.css','utf8');
 const immersive=fs.readFileSync('css/immersive.css','utf8');
 assert.match(html,/id="view-photo-next"/);
 assert.match(html,/id="photo-next-start"/);
 assert.match(html,/id="photo-session-hud"/);
 assert.match(html,/id="photo-total-time"/);
 assert.match(html,/id="photo-total-correct"/);
 assert.match(html,/id="memory-skip-btn" class="photo-im-ready"/);
 assert.match(photoCSS,/#view-photo-next\.hidden\{display:none!important\}/);
 assert.match(photoCSS,/\.photo-hud-time\{left:/);
 assert.match(photoCSS,/\.photo-hud-score\{right:/);
 assert.match(photoCSS,/\.photo-next-orb/);
 assert.match(photoCSS,/#view-memory #memory-skip-btn\{/);
});


test('all photo instructions switch among eight languages and update category and READY prompts',async()=>{
 const h=harness();await h.flush();
 assert.equal(h.api.state.tutLang,'en');
 assert.equal(h.nodes.get('photo-language').value,'en');
 assert.equal(h.api.setPhotoLanguage('es'),true);
 h.api.openPhotoSetup();
 h.api.preparePhotoReady();
 assert.match(h.nodes.get('photo-ready-summary').textContent,/90 s/);
 assert.equal(h.api.setPhotoLanguage('ko'),true);
 assert.match(h.nodes.get('photo-ready-summary').textContent,/90초/);
 assert.equal(h.api.setPhotoLanguage('zh'),true);
 assert.match(h.nodes.get('photo-ready-summary').textContent,/90秒/);
 assert.equal(h.api.setPhotoLanguage('ja'),true);
 assert.match(h.nodes.get('photo-ready-summary').textContent,/90秒/);
 assert.equal(h.api.setPhotoLanguage('xx'),false,'unknown languages must be rejected');
 h.api.backToLanding();assert.equal(h.timers.size,0);
});

test('BGM can be muted from photo setup or during a game and remains off until explicitly enabled',async()=>{
 const store=new Map();
 const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 const h=harness(data,{window:{localStorage:storage}});await h.flush();
 assert.equal(h.api.state.isBgmEnabled,true);
 h.nodes.get('photo-bgm-btn').click();
 assert.equal(h.api.state.isBgmEnabled,false);
 assert.equal(store.get('photo-bgm-enabled'),'false');
 assert.equal(h.nodes.get('photo-bgm-btn').getAttribute('aria-pressed'),'false');
 assert.equal(h.nodes.get('photo-bgm-play').getAttribute('aria-pressed'),'false');
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.isBgmEnabled,false);
 h.nodes.get('photo-bgm-play').click();
 assert.equal(h.api.state.isBgmEnabled,true);
 assert.equal(store.get('photo-bgm-enabled'),'true');
 h.api.backToLanding();
});

test('I am Ready immediately advances to four choices, while waiting retains twenty-second auto-handoff',async()=>{
 const h=harness();await h.flush();
 h.api.openPhotoSetup();h.api.preparePhotoReady();
 assert.equal(h.nodes.get('photo-game-tools').hidden,true);
 await h.api.startMemoryPhase();
 assert.equal(h.nodes.get('memory-timer').textContent,20);
 assert.equal(h.nodes.get('memory-skip-btn').disabled,false);
 h.advance(3000);h.nodes.get('memory-skip-btn').click();
 assert.equal(h.api.state.phase,'choice');
 assert.equal(h.nodes.get('choice-grid').children.length,4);
 assert.equal(h.api.state.sessionStarted,true);
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showPhotoNext();
 h.nodes.get('photo-next-start').click();await h.flush();
 const photoTick=h.timers.get(h.api.state.timerInterval);
 h.advance(20000);photoTick();
 assert.equal(h.api.state.phase,'choice');
 h.api.backToLanding();assert.equal(h.timers.size,0);
});
