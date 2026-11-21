const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('data/content.json'));
const PHOTO_CATEGORIES=require('../js/photo-categories.js');
function harness(payload=data, options={}){
 const nodes=new Map();let start;let timers=new Map();let id=0;let clock=0;const events=new Map();
 function el(key=''){if(nodes.has(key))return nodes.get(key);const classes=new Set(key.startsWith('view-')&&key!=='view-landing'?['hidden']:[]);const listeners=new Map();const attrs=new Map();const e={id:key,style:{},disabled:false,hidden:false,textContent:'',children:[],classList:{add(...v){v.forEach(x=>classes.add(x))},remove(...v){v.forEach(x=>classes.delete(x))},contains(v){return classes.has(v)}},addEventListener(name,fn){listeners.set(name,fn)},click(){listeners.get('click')?.({target:this})},setAttribute(k,v){attrs.set(k,v)},getAttribute(k){return attrs.get(k)},appendChild(e){this.children.push(e)},querySelector(){return el('icon')},querySelectorAll(){return this.children},pause(){},play(){return Promise.resolve()}};Object.defineProperty(e,'innerHTML',{set(value){if(value==='')this.children=[]},get(){return''}});nodes.set(key,e);return e;}
 const document={hidden:false,getElementById:el,createElement:()=>el('new'+id++),querySelectorAll:()=>[],body:el('body'),addEventListener:(n,f)=>{if(n==='DOMContentLoaded')start=f;else events.set(n,f)}};
 const ctx={document,console:{error(){}},fetch:async()=>({ok:true,json:async()=>payload}),performance:{now:()=>clock},Image:class{set src(v){this.onload()}},setInterval:f=>{timers.set(++id,f);return id},clearInterval:i=>timers.delete(i),setTimeout:f=>{timers.set(++id,f);return id},clearTimeout:i=>timers.delete(i),alert(){},window:{matchMedia:()=>({matches:false}),PHOTO_CATEGORIES,...(options.window||{})}};
 const src=fs.readFileSync('js/game.js','utf8').replace(/\n\}\);\s*$/, '\n globalThis.api={state,startMemoryPhase,startExplainPhase,startChoicePhase,checkAnswer,showResultPhase,backToLanding,prepareQuizData,openSettings,closeSettings,setMemoryTime,setHintMode,speak,stopSpeech,askForOneMoreClue,openPhotoSetup,preparePhotoReady,selectPhotoGenre,setPhotoPaused,finishPhotoGame};\n});');
 vm.createContext(ctx);vm.runInContext(src,ctx);start();return {ctx,nodes,timers,events,api:ctx.api,advance:ms=>{clock+=ms;},flush:()=>new Promise(r=>setImmediate(r))};
}
test('all 168 records have unique IDs, images and complete groups',()=>{assert.equal(data.length,168);assert.equal(new Set(data.map(x=>x.id)).size,168);const groups={};for(const x of data){assert.ok(fs.existsSync('assets/images/'+x.filename));groups[x.group]=(groups[x.group]||0)+1;}assert.equal(Object.keys(groups).length,42);assert.ok(Object.values(groups).every(n=>n===4));});
test('each cycle uses all questions once; options stay in the same group',async()=>{const h=harness();await h.flush();let seen=new Set();for(let i=0;i<data.length;i++){assert.ok(h.api.prepareQuizData());let {correctItem,currentSet}=h.api.state;assert.ok(!seen.has(correctItem.id));seen.add(correctItem.id);assert.equal(currentSet.length,4);assert.ok(currentSet.every(x=>x.group===correctItem.group));assert.ok(currentSet.includes(correctItem));}});
test('round flow, repeated clicks, attempts, role switch, home cancels callbacks',async()=>{const h=harness();await h.flush();await h.api.startMemoryPhase();assert.equal(h.api.state.phase,'memory');h.api.startExplainPhase();h.api.startChoicePhase();const correct=h.api.state.correctItem;const wrong=h.api.state.currentSet.find(x=>x!==correct);const btn={disabled:false,classList:{add(){}}};h.api.checkAnswer(wrong,btn);h.api.checkAnswer(wrong,btn);assert.equal(h.api.state.attempts,1);h.api.checkAnswer(correct,{disabled:false});h.api.checkAnswer(correct,{disabled:false});assert.equal(h.api.state.attempts,2);h.api.showResultPhase();assert.match(h.nodes.get('result-feedback').textContent,/2回目/);await h.api.startMemoryPhase();assert.match(h.nodes.get('round-status').textContent,/Player B/);h.api.backToLanding();assert.equal(h.timers.size,0);h.api.showResultPhase();assert.equal(h.api.state.phase,'landing');});
test('invalid paths, duplicate IDs and failed schemas disable play',async()=>{for(const bad of [[{...data[0],filename:'../secret.png'}],[data[0],data[0]],{}]){const h=harness(bad);await h.flush();assert.equal(h.nodes.get('start-btn').disabled,true);assert.match(h.nodes.get('load-status').textContent,/読み込めません/);}});

test('memory time and guided/free support are configurable without affecting scoring', async () => {
 const h=harness(); await h.flush();
 assert.equal(h.api.state.memoryTime,30);
 assert.equal(h.api.state.hintMode,'guided');
 assert.equal(h.api.setMemoryTime(40),true);
 assert.equal(h.api.setMemoryTime(999),false);
 assert.equal(h.api.state.memoryTime,40);
 await h.api.startMemoryPhase();
 assert.equal(h.nodes.get('memory-timer').textContent,40);
 h.api.startExplainPhase();
 assert.equal(h.nodes.get('explain-hint').classList.contains('hidden'),false);
 assert.equal(h.api.setHintMode('free'),true);
 assert.equal(h.nodes.get('explain-hint').classList.contains('hidden'),true);
 assert.equal(h.api.setHintMode('invalid'),false);
 assert.equal(h.api.state.hintMode,'free');
 h.api.setHintMode('guided');
 assert.equal(h.nodes.get('explain-hint').classList.contains('hidden'),false);
 assert.equal(h.api.state.firstCorrect,0);
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
});

test('role cues are clearly assigned to both players and rotate every round', async () => {
 const h=harness(); await h.flush();
 await h.api.startMemoryPhase();
 assert.match(h.nodes.get('role-memory').textContent, /Player A: 写真を見ながら説明/);
 assert.match(h.nodes.get('role-memory').textContent, /Player B: 画面を見ない/);
 assert.match(h.nodes.get('role-explain').textContent, /Player A: 英語で説明/);
 assert.match(h.nodes.get('role-choice').textContent, /Player B: 写真を選ぶ/);
 h.api.startExplainPhase();h.api.startChoicePhase();
 h.api.state.phase='feedback';h.api.showResultPhase();
 assert.match(h.nodes.get('next-role').textContent, /Player B speaks/);
 await h.api.startMemoryPhase();
 assert.match(h.nodes.get('role-memory').textContent, /Player B: 写真を見ながら説明/);
 assert.match(h.nodes.get('role-choice').textContent, /Player A: 写真を選ぶ/);
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
test('photo explanation is a single configurable 20–50-second stage, then automatic four-choice', async () => {
 const h=harness(); await h.flush();
 assert.equal(h.api.setMemoryTime(20),true);
 assert.equal(h.api.setMemoryTime(50),true);
 assert.equal(h.api.setMemoryTime(25),false);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.nodes.get('memory-timer').textContent,50);
 assert.equal(h.api.askForOneMoreClue(),false);
 const oldTimer=h.api.state.timerInterval;
 const tick=h.timers.get(oldTimer);
 assert.equal(typeof tick,'function');
 h.advance(49900);tick();
 assert.equal(h.api.state.phase,'memory');
 h.advance(100);tick();
 assert.equal(h.api.state.phase,'choice');
 assert.equal(h.api.state.activeCountdown,null);
 assert.equal(h.nodes.get('handoff-announcement').hidden,false);
 assert.equal(h.nodes.get('choice-grid').children.length,4);
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
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
 assert.equal(h.api.setMemoryTime(20),true);
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

test('photo mode correct-answer feedback is visual, audible and shows correct count rather than pts',async()=>{
 const h=harness();await h.flush();await h.api.startMemoryPhase();h.api.startChoicePhase();
 const correct=h.api.state.correctItem;
 h.api.checkAnswer(correct,{disabled:false,classList:{add(){}}});
 assert.equal(h.nodes.get('choice-success-overlay').hidden,false);
 assert.equal(h.api.state.correctCount,1);
 h.api.showResultPhase();
 assert.equal(h.nodes.get('choice-success-overlay').hidden,true);
 assert.match(h.nodes.get('result-feedback').textContent,/合計1問/);
 assert.doesNotMatch(h.nodes.get('result-feedback').textContent,/pts|points/i);
 await h.api.startMemoryPhase();h.api.startChoicePhase();
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showResultPhase();
 assert.equal(h.api.state.correctCount,2);
 assert.match(h.nodes.get('result-feedback').textContent,/合計2問/);
 h.api.backToLanding();
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

test('photo settings simplify to one 20/30/40/50 second round timer and hide landing during play',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const js=fs.readFileSync('js/game.js','utf8');
 const css=fs.readFileSync('css/landing.css','utf8');
 for (const seconds of [20,30,40,50]) assert.match(html,new RegExp('data-time="'+seconds+'"'));
 assert.doesNotMatch(html,/data-memory-time=/);
 assert.match(html,/id="handoffAlert"/);
 assert.match(js,/runTimer\(state\.memoryTime, elements\.timers\.memory, startChoicePhase\)/);
 assert.doesNotMatch(js,/runTimer\(state\.explainTime, elements\.timers\.explain, startChoicePhase/);
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
 assert.equal(h.nodes.get('photo-genre-count').textContent,'168枚の写真');
 assert.equal(h.api.selectPhotoGenre('sports'),true);
 assert.ok(h.api.state.activePool.length>=4);
 assert.ok(h.api.state.activePool.every(item=>new Set(['ball','parkkid','tennisstrike','watchgame','203','211']).has(item.group)));
 h.nodes.get('photo-setup-next').click();
 assert.equal(h.api.state.phase,'photoReady');
 assert.equal(h.nodes.get('view-memory').classList.contains('hidden'),true);
 assert.match(h.nodes.get('photo-ready-round').textContent,/ROUND 1/);
 assert.match(h.nodes.get('photo-ready-summary').textContent,/スポーツ/);
 assert.equal(h.timers.size,0);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.api.state.activePool.length,24);
 assert.ok(h.api.state.currentSet.every(item=>h.api.state.activePool.includes(item)));
 h.api.backToLanding();
});

test('Next Player uses a round-specific central READY screen before the next photo',async()=>{
 const h=harness();await h.flush();h.api.openPhotoSetup();h.api.preparePhotoReady();
 await h.api.startMemoryPhase();h.api.startChoicePhase();
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showResultPhase();
 assert.equal(h.api.state.correctCount,1);
 assert.equal(h.nodes.get('photo-result-count').textContent,'1');
 h.nodes.get('next-btn').click();
 assert.equal(h.api.state.phase,'photoReady');
 assert.match(h.nodes.get('photo-ready-roles').textContent,/Player B が説明/);
 assert.equal(h.nodes.get('view-memory').classList.contains('hidden'),true);
 assert.equal(h.timers.size,0);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.phase,'memory');
 assert.equal(h.api.state.round,2);
 assert.equal(h.api.state.correctCount,1);
 h.api.finishPhotoGame();
 assert.equal(h.api.state.phase,'photoSummary');
 assert.equal(h.nodes.get('photo-summary-correct').textContent,'1');
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

test('end-game summary retains correct count and offers retry or genre change',async()=>{
 const h=harness();await h.flush();
 h.api.openPhotoSetup();h.api.selectPhotoGenre('food');h.api.preparePhotoReady();
 await h.api.startMemoryPhase();h.api.startChoicePhase();
 h.api.checkAnswer(h.api.state.correctItem,{disabled:false,classList:{add(){}}});
 h.api.showResultPhase();h.api.finishPhotoGame();
 assert.equal(h.api.state.phase,'photoSummary');
 assert.equal(h.nodes.get('photo-summary-correct').textContent,'1');
 assert.equal(h.nodes.get('photo-summary-rounds').textContent,'1 ラウンド');
 h.nodes.get('photo-summary-replay').click();
 assert.equal(h.api.state.phase,'photoReady');
 assert.equal(h.api.state.correctCount,0);
 assert.match(h.nodes.get('photo-ready-summary').textContent,/料理・食べ物/);
 h.nodes.get('photo-ready-back').click();
 assert.equal(h.api.state.phase,'photoSetup');
 h.nodes.get('photo-setup-home').click();
 assert.equal(h.api.state.phase,'landing');
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
