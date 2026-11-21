const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const catalog = require('../js/charades-data.js');
const expansion = require('../js/charades-expansion.js');
const core = require('../js/charades-core.js');

const codes = catalog.languages.map(([code]) => code);

test('every one of 64 original categories has exactly 200 localized cards', () => {
  assert.equal(catalog.decks.length, 64);
  assert.deepEqual(codes, ['en','ja','es','pt','fr','de','ko','zh']);
  for (const deck of catalog.decks) {
    assert.equal(deck.words.length, 200, deck.id + ' count');
    for (const language of codes) {
      const cards = deck.words.map(card => card[language]);
      assert.ok(cards.every(word => typeof word === 'string' && word.trim() === word && word.length > 0));
      assert.equal(new Set(cards.map(word => word.toLocaleLowerCase())).size, 200, deck.id + '/' + language + ' duplicate');
    }
  }
  assert.equal(catalog.decks.reduce((sum, deck) => sum + deck.words.length, 0), 12800);
});

test('200 cards have 12 starter concepts, 66 distinct pairs, 120 scenarios and two triple challenges', () => {
  for (const deck of catalog.decks) {
    const starter = deck.words.slice(0,12);
    const pairs = deck.words.slice(12,78);
    const scenes = deck.words.slice(78,198);
    const triples = deck.words.slice(198,200);
    assert.equal(starter.length, 12);
    assert.equal(pairs.length, 66);
    assert.equal(scenes.length, 120);
    assert.equal(triples.length, 2);
    assert.ok(starter.every(word => !word.en.includes(' + ') && !word.en.includes(' — ')), deck.id);
    assert.ok(pairs.every(word => word.en.split(' + ').length === 2), deck.id);
    assert.ok(scenes.every(word => word.en.includes(' — ')), deck.id);
    assert.ok(triples.every(word => word.en.split(' + ').length === 3), deck.id);
    for (const word of scenes) assert.ok(word.ja.includes(' — '), deck.id + ' scene in Japanese');
  }
});

test('new scenes are genuinely playable combinations in English and Japanese', () => {
  const cat = catalog.decks.find(deck => deck.id === 'animals').words;
  assert.equal(cat[0].en, 'cat');
  assert.equal(cat[0].ja, '猫');
  assert.equal(cat[12].en, 'cat + dog');
  assert.equal(cat[12].ja, '猫 + 犬');
  assert.equal(cat[78].en, 'cat — moving in slow motion');
  assert.equal(cat[78].ja, '猫 — スローモーションで動く');
  assert.equal(cat[198].en, 'cat + dog + rabbit');
  const actions = catalog.decks.find(deck => deck.id === 'cooking_actions').words;
  assert.equal(actions[78].en, 'chop vegetables — in slow motion');
  assert.equal(actions[78].ja, '野菜を刻む — スローモーションで');
});

test('one-card-to-one-card translations stay aligned in all eight languages', () => {
  for (const deck of catalog.decks) {
    for (let i = 0; i < deck.words.length; i++) {
      const card = deck.words[i];
      assert.equal(Object.keys(card).length, 8, deck.id + ' card ' + i);
      for (const code of codes) assert.ok(card[code] && card[code].trim().length);
    }
  }
});

test('the expansion helper refuses incorrect seed lists instead of padding', () => {
  assert.throws(() => expansion([{id:'bad',words:[]}]), /Expected 12 original/);
  assert.throws(() => expansion(null), /Expected charades decks/);
});

test('the game loads the expansion before the base data and displays total in both UIs', () => {
  const html = fs.readFileSync(path.join(__dirname,'../charades.html'),'utf8');
  const page = fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const data = fs.readFileSync(path.join(__dirname,'../js/charades-data.js'),'utf8');
  const game = fs.readFileSync(path.join(__dirname,'../js/charades.js'),'utf8');
  assert.ok(html.indexOf('js/charades-expansion.js') < html.indexOf('js/charades-data.js'));
  assert.match(page, /12,800 prompts/);
  assert.match(data, /expandDecks\(decks\)/);
  assert.match(game, /const byDeck = new Map/);
  assert.ok(core.availableWords(catalog,'animals','en').length === 200);
  assert.ok(core.availableWords(catalog,'animals','ja').length === 200);
});
