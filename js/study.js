(() => {
'use strict';
const $=id=>document.getElementById(id);
const root='https://raw.githubusercontent.com/nakacy0919-Git/SimilarPhoto/53625ffce31f14200a3b4eced23e5fd2c3099211/';
const cdn='https://cdn.jsdelivr.net/gh/nakacy0919-Git/SimilarPhoto@53625ffce31f14200a3b4eced23e5fd2c3099211/';
const sourcePattern=/^images\/(?:000|100|200|300|400|500|600|700|800|900|1000)\/\d{3,4}\.webp$/;
let items=[],pool=[],index=0;
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
  addPhrase(phrases,item.key_phrase,item.translation,'MODEL DESCRIPTION');
  for(const example of Array.isArray(item.examples)?item.examples:[])addPhrase(phrases,example.en,example.ja,example.title);
  const select=$('study-photo-select');select.value=item.id;
  const spots=$('study-hotspots');spots.replaceChildren();
  const valid=(Array.isArray(item.hotspots)?item.hotspots:[]).filter(h=>h&&Number.isFinite(h.x)&&Number.isFinite(h.y)&&h.x>=0&&h.x<=100&&h.y>=0&&h.y<=100&&typeof h.en==='string'&&h.en.trim());
  for(const [i,h] of valid.entries()){
    const marker=make('button','hotspot',String(i+1));marker.type='button';marker.style.left=h.x+'%';marker.style.top=h.y+'%';marker.setAttribute('aria-label',h.title||h.en);
    marker.addEventListener('click',()=>{const p=$('study-point');p.replaceChildren();addPhrase(p,h.en,h.ja,h.title||'PHOTO DETAIL');p.hidden=false;p.scrollIntoView({block:'nearest'});});spots.append(marker);
  }
  $('study-point').hidden=true;$('study-point').replaceChildren();
  text('study-note',valid.length?'番号をタップすると地点ごとの英語を確認できます。':'写真をタップして拡大できます。地点データ未登録の写真は、下の英文で学習します。');
}
function filter(){
  const category=$('study-category').value;
  pool=window.PHOTO_CATEGORIES.pool(items,category);index=0;
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
    const imported=Array.isArray(window.SIMILAR_PHOTO_LIBRARY)?window.SIMILAR_PHOTO_LIBRARY:[];
    const visual=window.SIMILARPHOTO_VISUAL_GROUPS||{};
    items=[...local,...imported.map(item=>visual[item.sourcePath]?{...item,group:visual[item.sourcePath].group,visualDistance:visual[item.sourcePath].distance,needsVisualReview:visual[item.sourcePath].needsReview===true}:item)];
    const categories=window.PHOTO_CATEGORIES.options(items);
    if(!categories.length)throw Error('No categories');
    for(const c of categories){const option=make('option','',c.emoji+' '+c.en+' / '+c.ja);option.value=c.id;$('study-category').append(option);}
    $('study-category').disabled=false;$('study-photo-select').disabled=false;
    text('study-load',items.length+' photos · 英文・日本語訳・音声');filter();
  }catch(error){text('study-load','教材の読み込みに失敗しました。再読み込みしてください。');console.error(error);}
})();
})();