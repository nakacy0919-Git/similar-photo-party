const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../js/charades-data.js');
const core = require('../js/charades-core.js');

test('64 decks contain 12,800 coherent scenes in eight complete languages', () => {
  assert.equal(catalog.languages.length, 8);
  assert.equal(catalog.decks.length, 64);
  assert.equal(catalog.decks.reduce((sum, deck) => sum + deck.words.length, 0), 12800);
  assert.equal(core.validateCatalog(catalog), true);
  for (const deck of catalog.decks) {
    assert.equal(deck.words.length, 200, deck.id);
    for (const [lang] of catalog.languages) {
      const normalized = deck.words.map(item => item[lang].trim().toLocaleLowerCase());
      assert.equal(new Set(normalized).size, normalized.length, deck.id + ' duplicate in ' + lang);
    }
    for (const item of deck.words) {
      for (const [language] of catalog.languages) {
        assert.ok(item[language].trim().length > 0, deck.id + ':' + language);
      }
    }
  }
});

test('category filters return only the requested deck and the selected language', () => {
  for (const [lang] of catalog.languages) {
    assert.equal(core.availableWords(catalog, 'animals', lang).length, 200);
    assert.ok(core.availableWords(catalog, 'animals', lang).every(item => item.deckId === 'animals'));
    const unique = new Set(catalog.decks.flatMap(deck =>
      deck.words.map(word => word[lang].trim().toLocaleLowerCase())));
    assert.equal(core.availableWords(catalog, 'all', lang).length, unique.size,
      'All categories must not repeat a phrase already shown in another deck');
  }
  assert.equal(core.availableWords(catalog, 'not-a-deck', 'en').length, 0);
  assert.equal(core.availableWords(catalog, 'animals', 'missing').length, 0);
});

test('shuffle does not change source data', () => {
  const source = [1, 2, 3, 4];
  const shuffled = core.shuffle(source, () => 0);
  assert.deepEqual(source, [1, 2, 3, 4]);
  assert.deepEqual([...shuffled].sort(), source);
});

test('photo guess automatically gives fewer points after additional attempts', () => {
  assert.equal(core.pointsForPhotoAttempt(1), 100);
  assert.equal(core.pointsForPhotoAttempt(2), 60);
  assert.equal(core.pointsForPhotoAttempt(3), 30);
  assert.equal(core.pointsForPhotoAttempt(4), 10);
  assert.equal(core.pointsForPhotoAttempt(0), 0);
  assert.equal(core.pointsForPhotoAttempt(-1), 0);
});

test('charades page has local scripts, CSP and accessible answer controls', () => {
  const html = fs.readFileSync(path.join(__dirname, '../charades.html'), 'utf8');
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /js\/charades-expansion\.js/);
  assert.match(html, /js\/charades-data\.js/);
  assert.match(html, /js\/charades-core\.js/);
  assert.match(html, /js\/charades\.js/);
  for (const id of ['decks', 'language', 'start', 'prompt', 'pass', 'correct', 'score', 'nextRound']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.doesNotMatch(html, /<script(?![^>]*src=)[^>]*>/);
});

test('all 64 categories have translated selection labels and search control', () => {
  const source = fs.readFileSync(path.join(__dirname, '../js/charades.js'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '../charades.html'), 'utf8');
  for (const deck of catalog.decks) {
    assert.ok(source.includes(deck.id + ':['), deck.id + ' localized label missing');
  }
  assert.match(html, /id="deckSearch"/);
  assert.match(source, /SEARCH_PLACEHOLDERS/);
});

test('original photo game still has automatic photo phases and scoring', () => {
  const source = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
  assert.match(source, /runTimer\(state\.memoryTime, elements\.timers\.memory, startChoicePhase\)/);
  assert.doesNotMatch(source, /runTimer\(state\.explainTime, elements\.timers\.explain, startChoicePhase/);
  assert.match(source, /state\.score \+= state\.lastPoints/);
  assert.match(source, /pointsForPhotoAttempt\(state\.attempts\)/);
});
