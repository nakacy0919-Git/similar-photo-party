const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const catalog = require('../js/charades-data.js');
const validate = require('../js/charades-expansion.js');
const core = require('../js/charades-core.js');

const languages = catalog.languages.map(([code]) => code);
const badSeparators = /\s(?:\+|＋|—|–)\s/u;

test('64 categories only contain curated, standalone prompts in all 8 languages', () => {
  assert.equal(catalog.decks.length, 64);
  assert.deepEqual(languages, ['en','ja','es','pt','fr','de','ko','zh']);
  assert.equal(validate(catalog.decks), catalog.decks);
  let total = 0;
  for (const deck of catalog.decks) {
    assert.equal(deck.words.length, 12, deck.id + ' curated starter prompts');
    total += deck.words.length;
    for (const lang of languages) {
      const labels = deck.words.map(word => word[lang]);
      assert.ok(labels.every(label => typeof label === 'string' && label.trim()), deck.id + '/' + lang);
      assert.ok(labels.every(label => !badSeparators.test(label)), deck.id + '/' + lang);
      assert.equal(new Set(labels.map(label=>label.toLocaleLowerCase())).size,labels.length,deck.id+'/'+lang);
    }
  }
  assert.equal(total, 768, 'do not claim 12,800 synthetic cards');
});

test('the animal deck never mixes butterflies with unrelated actions or other animals', () => {
  const animals = catalog.decks.find(deck => deck.id === 'animals');
  assert.equal(animals.words.length,12);
  assert.ok(animals.words.some(item => item.en === 'butterfly' && item.ja === '蝶'));
  assert.ok(animals.words.some(item => item.en === 'lion' && item.ja === 'ライオン'));
  assert.ok(animals.words.every(item => !/catch a bus|\+|—/.test(item.en)));
  for (const lang of languages) {
    assert.equal(core.availableWords(catalog,'animals',lang).length,12);
  }
});

test('curated action decks retain complete, coherent single-idea situations', () => {
  const actions = catalog.decks.find(deck=>deck.id==='cooking_actions');
  assert.equal(actions.words.length,12);
  assert.equal(actions.words[0].en,'chop vegetables');
  assert.equal(actions.words[0].ja,'野菜を刻む');
  assert.ok(actions.words.every(item=>!badSeparators.test(item.en) && !badSeparators.test(item.ja)));
});

test('validator explicitly rejects generated two-concept cards in any language', () => {
  const source=catalog.decks[0];
  const clone=()=>({id:'qa',words:source.words.map(item=>({...item}))});
  for (const bad of [
    {lang:'en',text:'butterfly — rushing to catch a bus'},
    {lang:'en',text:'cat + dog'},
    {lang:'ja',text:'蝶 — バスに間に合おうと急ぐ'},
    {lang:'ja',text:'猫 + 犬'}
  ]) {
    const testDeck=clone();
    testDeck.words[3][bad.lang]=bad.text;
    assert.throws(()=>validate([testDeck]),/Two-concept Charades prompt rejected/);
  }
});

test('validator prevents duplicate cards and incomplete translations', () => {
  const clone=()=>({id:'qa',words:catalog.decks[0].words.map(item=>({...item}))});
  const duplicate=clone();
  duplicate.words[1].en=duplicate.words[0].en;
  assert.throws(()=>validate([duplicate]),/Repeated Charades prompt/);
  const absent=clone();
  delete absent.words[3].es;
  assert.throws(()=>validate([absent]),/Missing Charades translation/);
  assert.throws(()=>validate([{id:'bad',words:[]}]),/Expected at least 12 curated/);
  assert.throws(()=>validate(null),/Expected Charades decks/);
});

test('UI counts accurately reflect the available curated prompts', () => {
  const page = fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const charades = fs.readFileSync(path.join(__dirname,'../charades.html'),'utf8');
  const data = fs.readFileSync(path.join(__dirname,'../js/charades-data.js'),'utf8');
  const game = fs.readFileSync(path.join(__dirname,'../js/charades.js'),'utf8');
  assert.match(page, /64 categories · 768 curated prompts · 8 languages/);
  assert.doesNotMatch(page, /12,800 prompts/);
  assert.ok(charades.indexOf('js/charades-expansion.js') < charades.indexOf('js/charades-data.js'));
  assert.match(data, /validateStandaloneDecks\(decks\)/);
  assert.match(game, /deck\.words|item\.words\.length/);
  assert.equal(core.availableWords(catalog,'animals','en').length,12);
  assert.equal(core.availableWords(catalog,'animals','ja').length,12);
});
