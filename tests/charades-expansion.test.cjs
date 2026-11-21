const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../js/charades-data.js');
const check = require('../js/charades-expansion.js');
const scenarios = require('../js/charades-curated-scenes.js');
const core = require('../js/charades-core.js');

const langs = catalog.languages.map(([code]) => code);
const forbidden = /\s(?:\+|＋|—|–)\s/u;

test('all 64 categories have 200 meaningful, complete 8-language prompts', () => {
  assert.equal(catalog.decks.length, 64);
  assert.deepEqual(langs, ['en','ja','es','pt','fr','de','ko','zh']);
  assert.equal(check(catalog.decks), catalog.decks);
  let total=0;
  for(const deck of catalog.decks) {
    assert.equal(deck.words.length,200,deck.id);
    total+=deck.words.length;
    for(const lang of langs) {
      const entries=deck.words.map(item=>item[lang]);
      assert.ok(entries.every(x=>typeof x==='string' && x.trim() && x===x.trim()),deck.id+'/'+lang);
      assert.equal(new Set(entries.map(x=>x.toLocaleLowerCase())).size,200,deck.id+'/'+lang+' duplicates');
      assert.ok(entries.every(x=>!forbidden.test(x)),deck.id+'/'+lang+' combined keyword');
    }
  }
  assert.equal(total,12800);
});

test('independent related-category prompts precede scene variants where appropriate', () => {
  const animals=catalog.decks.find(x=>x.id==='animals').words;
  for(const term of ['cat','lion','butterfly','giraffe','parrot','dragonfly','octopus']) {
    assert.ok(animals.some(p=>p.en===term), 'broader Animals includes '+term);
  }
  const food=catalog.decks.find(x=>x.id==='food').words;
  for(const term of ['pizza','cake','apple','sushi','ramen','bubble tea']) {
    assert.ok(food.some(p=>p.en===term),'broader Food includes '+term);
  }
  const sports=catalog.decks.find(x=>x.id==='sports').words;
  assert.ok(sports.some(x=>x.en==='soccer'));
  assert.ok(sports.some(x=>x.en==='Someone is practicing soccer very seriously'));
  assert.ok(!sports.some(x=>x.en==='chess' || x.en==='drawing'),
    'Narrow sports categories must not borrow board games or art prompts');
});

test('animal subjects cannot be mixed with irrelevant human actions', () => {
  const animals=catalog.decks.find(x=>x.id==='animals').words;
  assert.ok(animals.some(item=>item.en==='butterfly'));
  assert.ok(animals.some(item=>item.en==='The butterfly is sleeping'));
  assert.ok(animals.some(item=>item.en==='The butterfly is searching for food'));
  for(const word of animals) {
    assert.doesNotMatch(word.en,/butterfly.*(?:bus|suitcase|driving|robot|office)/i);
    assert.doesNotMatch(word.en,/\s\+\s|\s—\s/);
    assert.doesNotMatch(word.ja,/\s\+\s|\s—\s/);
  }
});

test('scenario prompts stay natural within different thematic groups', () => {
  const animal=catalog.decks.find(x=>x.id==='wildlife').words;
  assert.ok(animal.some(x=>x.en==='The giraffe is searching for food'));
  const food=catalog.decks.find(x=>x.id==='food').words;
  assert.ok(food.some(x=>x.en==='Someone is tasting pizza'));
  const actions=catalog.decks.find(x=>x.id==='cooking_actions').words;
  assert.ok(actions.some(x=>x.en==='Slowly chop vegetables'));
  const emotions=catalog.decks.find(x=>x.id==='emotions').words;
  assert.ok(emotions.some(x=>x.en==='Someone suddenly feels happy'));
  const places=catalog.decks.find(x=>x.id==='places').words;
  assert.ok(places.some(x=>x.en==='Someone is looking for hospital'));
  const travel=catalog.decks.find(x=>x.id==='travel').words;
  assert.ok(travel.some(x=>x.en==='Someone is getting ready for passport'));
  for(const deck of catalog.decks) {
    assert.ok(deck.words.some(x=>x.en.includes(' ')),deck.id+' needs real scene variation');
  }
});

test('each authored scenario family contains 16 truly multilingual templates', () => {
  const families=Object.entries(scenarios.families);
  assert.equal(families.length,14);
  let mapped=[];
  for(const [group,rows] of Object.entries(scenarios.assignments)){
    assert.equal(rows.length>0,true,group);
    mapped.push(...rows);
    assert.equal(scenarios.families[group].length,16,group);
    for(const scene of scenarios.families[group]) {
      assert.equal(Object.keys(scene).length,8,group);
      for(const lang of langs)assert.ok(scene[lang].includes('%s'),group+'/'+lang);
    }
  }
  assert.equal(mapped.length,64);
  assert.equal(new Set(mapped).size,64);
});

test('semantic validator catches fabricated phrases in every language', () => {
  const clone=()=>({id:'qa',words:catalog.decks[0].words.map(item=>({...item}))});
  for(const {lang,label} of [
    {lang:'en',label:'butterfly — rushing to catch a bus'},
    {lang:'en',label:'cat + dog'},
    {lang:'ja',label:'蝶 — バスに間に合おうと急ぐ'},
    {lang:'es',label:'mariposa + autobús'},
    {lang:'de',label:'Schmetterling — Bus fahren'}
  ]){
    const candidate=clone();candidate.words[3][lang]=label;
    assert.throws(()=>check([candidate]),/Two-concept Charades prompt rejected/);
  }
});

test('catalog and landing display accurately show 12,800 tasks and maintain 8 languages', () => {
  const html=fs.readFileSync(path.join(__dirname,'../charades.html'),'utf8');
  const page=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const data=fs.readFileSync(path.join(__dirname,'../js/charades-data.js'),'utf8');
  assert.ok(html.indexOf('js/charades-curated-scenes.js')<html.indexOf('js/charades-data.js'));
  assert.match(page,/64 categories · 12,800 scene prompts · 8 languages/);
  assert.match(data,/sceneCatalog\.expand\(decks\)/);
  assert.equal(core.availableWords(catalog,'animals','en').length,200);
  assert.equal(core.availableWords(catalog,'animals','ja').length,200);
});

test('source catalog expansion rejects repeated, missing or incomplete content', () => {
  const original=12;
  const source=Object.fromEntries(langs.map(lang=>[lang,'example']));
  const bad=[{id:'bad',words:Array.from({length:original},()=>({...source}))}];
  assert.throws(()=>scenarios.expand(bad),/Expected 64 Charades decks/);
  assert.throws(()=>check([{id:'broken',words:[]}]),/Expected at least 12/);
});
