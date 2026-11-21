const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('data/content.json'));
function harness(payload=data, options={}){
 const nodes=new Map();let start;let timers=new Map();let id=0;let clock=0;const events=new Map();
 function el(key=''){if(nodes.has(key))return nodes.get(key);const classes=new Set(key.startsWith('view-')&&key!=='view-landing'?['hidden']:[]);const e={id:key,style:{},disabled:false,textContent:'',children:[],classList:{add(...v){v.forEach(x=>classes.add(x))},remove(...v){v.forEach(x=>classes.delete(x))},contains(v){return classes.has(v)}},addEventListener(){},setAttribute(){},appendChild(e){this.children.push(e)},querySelector(){return el('icon')},querySelectorAll(){return this.children},pause(){},play(){return Promise.resolve()}};nodes.set(key,e);return e;}
 const document={hidden:false,getElementById:el,createElement:()=>el('new'+id++),querySelectorAll:()=>[],body:el('body'),addEventListener:(n,f)=>{if(n==='DOMContentLoaded')start=f;else events.set(n,f)}};
 const ctx={document,console:{error(){}},fetch:async()=>({ok:true,json:async()=>payload}),performance:{now:()=>clock},Image:class{set src(v){this.onload()}},setInterval:f=>{timers.set(++id,f);return id},clearInterval:i=>timers.delete(i),setTimeout:f=>{timers.set(++id,f);return id},clearTimeout:i=>timers.delete(i),alert(){},window:{matchMedia:()=>({matches:false}),...(options.window||{})}};
 const src=fs.readFileSync('js/game.js','utf8').replace(/\n\}\);\s*$/, '\n globalThis.api={state,startMemoryPhase,startExplainPhase,startChoicePhase,checkAnswer,showResultPhase,backToLanding,prepareQuizData,openSettings,closeSettings,setMemoryTime,setHintMode,speak,stopSpeech,askForOneMoreClue,setPeerFeedback};\n});');
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

test('peer feedback is optional, editable and tracked by speaker without automatic speech claims', async () => {
 const h=harness(); await h.flush();await h.api.startMemoryPhase();
 assert.equal(h.api.setPeerFeedback('subject',true),false,'cannot pre-score speech');
 h.api.startExplainPhase();h.api.startChoicePhase();h.api.state.phase='feedback';h.api.showResultPhase();
 assert.equal(h.api.state.peerReviews.size,0,'no rating if listener skips feedback');
 assert.equal(h.api.setPeerFeedback('invalid',true),false);
 assert.equal(h.api.setPeerFeedback('subject',true),true);
 assert.equal(h.api.setPeerFeedback('detail',true),true);
 assert.equal(h.api.state.peerReviews.get(1).speaker,'A');
 assert.equal(h.api.state.peerReviews.get(1).count,2);
 assert.match(h.nodes.get('feedback-progress').textContent,/2\/3/);
 assert.match(h.nodes.get('feedback-session').textContent,/Player A: 2\/3/);
 h.api.setPeerFeedback('detail',false);
 assert.equal(h.api.state.peerReviews.get(1).count,1);
 await h.api.startMemoryPhase();
 assert.equal(h.api.state.peerReviews.get(1).count,1);
 assert.equal(h.api.state.reviewSelection.subject,false);
 assert.match(h.nodes.get('feedback-progress').textContent,/0\/3/);
 h.api.startExplainPhase();h.api.startChoicePhase();h.api.state.phase='feedback';h.api.showResultPhase();
 h.api.setPeerFeedback('subject',true);
 h.api.setPeerFeedback('location',true);
 h.api.setPeerFeedback('detail',true);
 assert.equal(h.api.state.peerReviews.get(2).speaker,'B');
 assert.equal(h.api.state.peerReviews.get(2).count,3);
 assert.match(h.nodes.get('feedback-session').textContent,/Player A: 1\/3/);
 assert.match(h.nodes.get('feedback-session').textContent,/Player B: 3\/3/);
 h.api.setPeerFeedback('subject',false);
 h.api.setPeerFeedback('location',false);
 h.api.setPeerFeedback('detail',false);
 assert.equal(h.api.state.peerReviews.size,1,'clearing all choices removes the round rating');
 h.api.backToLanding();
 assert.equal(h.timers.size,0);
});
test('all speaking mission controls exist with accessible labels and mobile layout', () => {
 const html=fs.readFileSync('index.html','utf8');
 const css=fs.readFileSync('css/style.css','utf8');
 for(const id of ['memory-mission','explain-mission','clue-request-btn','clue-request-note','feedback-progress','feedback-session']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 for(const criterion of ['subject','location','detail']){
  assert.match(html,new RegExp('data-criterion="'+criterion+'"'));
 }
 assert.match(html,/自動音声採点ではありません/);
 assert.match(css,/\.peer-feedback-items/);
 assert.match(css,/\.mission-cue/);
 assert.match(css,/min-height:\s*44px/);
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
