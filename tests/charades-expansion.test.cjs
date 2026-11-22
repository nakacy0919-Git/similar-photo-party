const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../js/charades-data.js');
const check = require('../js/charades-expansion.js');
const cards = require('../js/charades-curated-scenes.js');
const core = require('../js/charades-core.js');
const langs = catalog.languages.map(([lang]) => lang);
const separator = /\\s(?:&|→)\\s/u;

test('64 categories keep 200 cards each, and separate concise Standard and Challenge prompts', () => {
  assert.equal(catalog.decks.length, 64);
  assert.deepEqual(langs, ['en','ja','es','pt','fr','de','ko','zh']);
  assert.equal(check(catalog.decks), catalog.decks);
  assert.equal(core.validateCatalog(catalog), true);
  let total = 0;
  for (const deck of catalog.decks) {
    assert.equal(deck.words.length, 200, deck.id);
    total += deck.words.length;
    const standard = deck.words.filter(card => card.level === 'standard');
    const challenge = deck.words.filter(card => card.level === 'challenge');
    assert.ok(standard.length >= 12 && standard.length < 200, deck.id);
    assert.equal(standard.length + challenge.length, 200, deck.id);
    for (const word of standard) {
      for (const lang of langs) {
        assert.ok(word[lang] && !separator.test(word[lang]), deck.id+'/'+lang+' single concept');
        assert.doesNotMatch(word[lang], /\\s(?:\\+|—|–)\\s/u);
        assert.doesNotMatch(word.en, /^(?:Someone|The [^ ]+ is)\\b/i);
      }
    }
    for (const word of challenge) {
      assert.ok(['both','sequence'].includes(word.kind));
      for (const lang of langs) {
        const split = word[lang].split(separator);
        assert.equal(split.length, 2, deck.id+'/'+lang+' two parts');
        assert.ok(split.every(text => text.trim().length), deck.id+'/'+lang);
        assert.doesNotMatch(word.en, /^(?:Someone|The [^ ]+ is)\\b/i);
      }
    }
    for (const lang of langs) {
      const unique = new Set(deck.words.map(word => word[lang].toLocaleLowerCase()));
      assert.equal(unique.size, 200, deck.id+'/'+lang+' duplicate');
    }
  }
  assert.equal(total, 12800);
});

test('Standard contains the original simple terms; Challenge contains purposeful same-category combinations', () => {
  const animals = catalog.decks.find(d => d.id === 'animals').words;
  for (const word of ['cat','dog','butterfly','giraffe','parrot','dragonfly','octopus']) {
    assert.ok(animals.some(card => card.level === 'standard' && card.en === word), word);
  }
  assert.ok(animals.some(card => card.level === 'challenge' && card.en === 'cat & dog'));
  assert.ok(animals.some(card => card.level === 'challenge' && card.en.includes(' → ')));
  const sports = catalog.decks.find(d => d.id === 'sports').words;
  assert.ok(sports.some(card => card.level === 'standard' && card.en === 'soccer'));
  assert.ok(!sports.some(card => card.en === 'chess' || card.en === 'drawing'));
  assert.ok(sports.filter(card => card.level === 'challenge').every(card => !/chess|drawing/i.test(card.en)));
});

test('each level can be selected independently without leaking cards from the other level', () => {
  for (const deck of catalog.decks) {
    for (const lang of langs) {
      const standard = core.availableWords(catalog, deck.id, lang, 'standard');
      const challenge = core.availableWords(catalog, deck.id, lang, 'challenge');
      assert.ok(standard.length >= 12 && challenge.length >= 1);
      assert.equal(standard.length+challenge.length, 200);
      assert.ok(standard.every(card => card.level === 'standard'));
      assert.ok(challenge.every(card => card.level === 'challenge'));
      assert.equal(core.availableWords(catalog, deck.id, lang).length, 200);
    }
  }
  assert.equal(core.availableWords(catalog,'animals','en','unknown').length, 0);
  assert.equal(core.availableWords(catalog,'not-a-deck','en','standard').length, 0);
});

test('each translated level remains unique in All Categories mode', () => {
  for (const lang of langs) {
    for (const level of ['standard','challenge']) {
      const all = core.availableWords(catalog, 'all', lang, level);
      const unique = new Set(all.map(card => card.text.toLocaleLowerCase()));
      assert.equal(unique.size, all.length, lang+'/'+level);
      assert.ok(all.every(card => card.level === level));
    }
  }
});

test('reject accidentally concatenated junk, challenge sentences, or pairs marked Standard', () => {
  const copy = () => [{id:'qa', words:catalog.decks[0].words.map(card => ({...card}))}];
  for (const [level,kind,label] of [
    ['standard',undefined,'cat & dog'],
    ['standard',undefined,'butterfly — rushing to catch a bus'],
    ['challenge','both','Someone is rushing to catch a bus'],
    ['challenge','both','cat & dog & bird']
  ]) {
    const deck = copy(); Object.assign(deck[0].words[0],{level,kind,en:label});
    assert.throws(() => check(deck));
  }
});

test('category mappings are complete and the sentence-template generator is gone', () => {
  const mapped = Object.values(cards.assignments).flat();
  assert.equal(mapped.length, 64);
  assert.equal(new Set(mapped).size, 64);
  assert.equal(cards.families, undefined);
  const script = fs.readFileSync(path.join(__dirname,'../js/charades-curated-scenes.js'),'utf8');
  assert.doesNotMatch(script, /Someone is (?:looking|trying|making)/);
  const html = fs.readFileSync(path.join(__dirname,'../charades.html'),'utf8');
  const app = fs.readFileSync(path.join(__dirname,'../js/charades.js'),'utf8');
  assert.match(html,/id="difficulty"/);
  assert.match(html,/value="standard" selected/);
  assert.match(html,/value="challenge"/);
  assert.match(app,/state\\.level/);
  assert.match(app,/CORE\\.availableWords\\(DATA, state\\.deck, state\\.language, state\\.level\\)/);
});
