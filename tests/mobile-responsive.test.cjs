const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const catalog = require('../js/charades-data.js');
const core = require('../js/charades-core.js');

function createHarness() {
  const nodes = new Map();
  const windowEvents = new Map();
  const documentEvents = new Map();
  const intervals = new Map();
  let clock = 1000;
  let sequence = 0;
  function element(id = '') {
    if (nodes.has(id)) return nodes.get(id);
    const events = new Map();
    const el = {
      id, tagName: 'BUTTON', hidden: false, disabled: false, value: '',
      textContent: '', dataset: {}, style: {}, scrollTop: 0, children: [],
      attributes: {}, events,
      classList: { add() {}, remove() {} },
      addEventListener(type, cb) { events.set(type, cb); },
      setAttribute(k, v) { this.attributes[k] = v; },
      append(...kids) { this.children.push(...kids); },
      replaceChildren(...kids) { this.children = kids; },
      click() { this.events.get('click')?.(); }
    };
    nodes.set(id, el);
    return el;
  }
  const radio = (value) => ({ value, events: new Map(), addEventListener(type, fn) { this.events.set(type, fn); } });
  const pairs = [radio('pair'), radio('teams')];
  const styles = [radio('acting'), radio('forehead')];
  const controls = {
    'input[name="players"]:checked': pairs[0],
    'input[name="style"]:checked': styles[0]
  };
  element('language').value = 'ja';
  element('duration').value = '60';
  element('deckSearch').value = '';
  element('teamA').value = 'TEAM A';
  element('teamB').value = 'TEAM B';
  const document = {
    hidden: false, documentElement: { lang: 'ja' }, activeElement: { tagName: 'BODY' },
    getElementById: element,
    createElement: () => element('new-' + (++sequence)),
    createTextNode: (value) => ({ textContent: value }),
    addEventListener(type, fn) { documentEvents.set(type, fn); },
    querySelector(selector) { return controls[selector]; },
    querySelectorAll(selector) {
      if (selector === 'input[name="players"]') return pairs;
      if (selector === '[data-i18n]') return [];
      return [];
    }
  };
  const win = {
    CHARADES_DATA: catalog, CHARADES_CORE: core,
    alert() {},
    addEventListener(type, fn) { windowEvents.set(type, fn); },
    setInterval(fn) { const id = ++sequence; intervals.set(id, fn); return id; },
    clearInterval(id) { intervals.delete(id); }
  };
  const context = { window: win, document, clearInterval: win.clearInterval, performance: { now: () => clock },
    DeviceOrientationEvent: undefined, navigator: undefined, Promise };
  const src = fs.readFileSync('js/charades.js', 'utf8');
  vm.runInNewContext(src, context);
  return {
    get: element, document, controls, pairs, styles, intervals, documentEvents, windowEvents,
    now(ms) { clock += ms; }, tick() { for (const fn of Array.from(intervals.values())) fn(); }
  };
}

test('mobile handoff: a new round does not reveal prompts or start the timer before ready', () => {
  const game = createHarness();
  assert.equal(game.get('setup').hidden, false);
  game.get('mobileStart').click();
  assert.equal(game.get('setup').hidden, true);
  assert.equal(game.get('ready').hidden, false);
  assert.equal(game.get('play').hidden, true);
  assert.equal(game.intervals.size, 0);
  assert.match(game.get('readyInstruction').textContent, /演技する人だけ/);
  game.now(20000);
  game.get('beginRound').click();
  assert.equal(game.get('ready').hidden, true);
  assert.equal(game.get('play').hidden, false);
  assert.equal(game.get('timeLeft').textContent, '60');
  assert.ok(game.get('prompt').textContent.length > 0);
  assert.equal(game.intervals.size, 1);
});

test('pause keeps the answer secret and countdown frozen until resumed', () => {
  const game = createHarness();
  game.get('start').click();
  game.get('beginRound').click();
  game.now(5600); game.tick();
  assert.equal(game.get('timeLeft').textContent, '55');
  game.get('pauseResume').click();
  assert.equal(game.get('pauseShield').hidden, false);
  assert.equal(game.get('prompt').hidden, true);
  assert.equal(game.get('correct').disabled, true);
  const score = game.get('score').textContent;
  game.get('correct').click(); // disabled controls are also guarded in game logic
  assert.equal(game.get('score').textContent, score);
  game.now(30000); game.tick();
  assert.equal(game.get('timeLeft').textContent, '55');
  game.get('pauseResume').click();
  assert.equal(game.get('pauseShield').hidden, true);
  assert.equal(game.get('prompt').hidden, false);
  game.now(1000); game.tick();
  assert.equal(game.get('timeLeft').textContent, '54');
  game.get('correct').click();
  assert.equal(Number(game.get('score').textContent), 1);
});

test('backgrounding pauses automatically and does not burn classroom time', () => {
  const game = createHarness();
  game.get('start').click();
  game.get('beginRound').click();
  game.now(5000); game.tick();
  game.document.hidden = true;
  game.documentEvents.get('visibilitychange')();
  game.now(50000); game.tick();
  assert.equal(game.get('timeLeft').textContent, '55');
  assert.equal(game.get('prompt').hidden, true);
  game.document.hidden = false;
  game.documentEvents.get('visibilitychange')();
  assert.equal(game.get('prompt').hidden, true, 'must not leak the prompt when app resumes');
  game.get('pauseResume').click();
  assert.equal(game.get('prompt').hidden, false);
});

test('result screen and next team use a new ready screen without keeping old timer', () => {
  const game = createHarness();
  game.controls['input[name="players"]:checked'] = game.pairs[1];
  game.get('start').click();
  assert.equal(game.get('readyTeam').textContent, 'TEAM A');
  game.get('beginRound').click();
  game.get('correct').click();
  game.get('endRound').click();
  assert.equal(game.get('result').hidden, false);
  assert.equal(game.intervals.size, 0);
  assert.equal(game.get('roundScore').textContent, '1');
  game.get('nextRound').click();
  assert.equal(game.get('ready').hidden, false);
  assert.equal(game.get('readyTeam').textContent, 'TEAM B');
  assert.equal(game.intervals.size, 0);
});

test('mobile and tablet CSS includes safe areas, landscape layouts and touch targets', () => {
  const photoCss = fs.readFileSync('css/style.css', 'utf8');
  const charadeCss = fs.readFileSync('css/charades.css', 'utf8');
  const photoHtml = fs.readFileSync('index.html', 'utf8');
  const charadeHtml = fs.readFileSync('charades.html', 'utf8');
  for (const css of [photoCss, charadeCss]) {
    assert.match(css, /safe-area-inset-bottom/);
    assert.match(css, /100dvh/);
    assert.match(css, /orientation:\s*landscape/);
    assert.match(css, /touch-action:\s*manipulation/);
  }
  assert.match(photoHtml, /viewport-fit=cover/);
  assert.match(charadeHtml, /viewport-fit=cover/);
  for (const id of ['mobileStart', 'ready', 'beginRound', 'pauseShield', 'pauseResume']) {
    assert.match(charadeHtml, new RegExp('id="' + id + '"'));
  }
  assert.match(photoCss, /\.choice-index/);
});


test('Charades defaults to English and can switch prompts to Japanese during play', () => {
  const html = fs.readFileSync('charades.html', 'utf8');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<option value="en" selected>English<\/option>/);
  const game = createHarness();
  game.get('language').value = 'en';
  game.get('start').click();
  assert.match(game.get('readyInstruction').textContent, /actor/);
  game.get('beginRound').click();
  const promptEn = game.get('prompt').textContent;
  const category = catalog.decks.find(deck => deck.id === 'animals');
  assert.ok(game.get('playLanguage').textContent.includes('日本語'));
  const beforeTime = game.get('timeLeft').textContent;
  game.get('playLanguage').click();
  const promptJa = game.get('prompt').textContent;
  assert.notEqual(promptEn, promptJa, 'selected prompt must be translated, not only the button');
  assert.equal(game.get('playLanguage').textContent, 'English');
  assert.equal(game.get('timeLeft').textContent, beforeTime, 'language must not reset timer');
  game.get('playLanguage').click();
  assert.equal(game.get('prompt').textContent, promptEn, 'switching back preserves current prompt identity');
  game.get('correct').click();
  assert.equal(Number(game.get('score').textContent), 1);
  assert.ok(category.words.length >= 12);
});

test('Charades and Similar Photo use fixed full visual-viewport game surfaces and visible bottom corners', () => {
  const css = fs.readFileSync('css/immersive.css', 'utf8');
  const charadeHtml = fs.readFileSync('charades.html', 'utf8');
  const photoHtml = fs.readFileSync('index.html', 'utf8');
  assert.match(css, /#play\.play-panel:not\(\[hidden\]\)/);
  assert.match(css, /position:fixed!important/);
  assert.match(css, /height:100dvh!important/);
  assert.match(css, /#play \.answer-controls/);
  assert.match(css, /inset:auto 0 0 0!important/);
  assert.match(css, /#play \.pass-btn/);
  assert.match(css, /#play \.correct-btn/);
  assert.match(css, /@media \(orientation:landscape\)/);
  assert.match(css, /#view-memory #memory-img/);
  assert.match(css, /#view-choice #choice-grid/);
  assert.match(css, /grid-template-rows:repeat\(2,minmax\(0,1fr\)\)!important/);
  assert.match(css, /object-fit:contain!important/);
  assert.match(css, /overflow:hidden!important/);
  assert.match(charadeHtml, /css\/immersive\.css/);
  assert.match(photoHtml, /css\/immersive\.css/);
  assert.doesNotMatch(photoHtml, /\\n\s+<button id="tutorial-btn"/, 'home screen must not render literal backslash n');
});

test('Immersive play supports native fullscreen where available without requiring it on Safari', () => {
  const charades = fs.readFileSync('js/charades.js', 'utf8');
  const photo = fs.readFileSync('js/game.js', 'utf8');
  assert.match(charades, /document\.documentElement\?\.requestFullscreen/);
  assert.match(photo, /document\.documentElement\?\.requestFullscreen/);
  assert.match(charades, /if \(!document\.fullscreenElement/);
  assert.match(photo, /if \(!document\.fullscreenElement/);
});

test('both games support standalone landscape/portrait home-screen launch', () => {
  const manifest = JSON.parse(fs.readFileSync('site.webmanifest', 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'any');
  assert.match(manifest.start_url, /index\.html/);
  assert.ok(manifest.shortcuts.some(item => item.url.includes('charades.html')));
  for (const html of [fs.readFileSync('index.html','utf8'),fs.readFileSync('charades.html','utf8')]) {
    assert.match(html, /rel="manifest" href="site\.webmanifest"/);
    assert.match(html, /apple-mobile-web-app-capable/);
    assert.match(html, /viewport-fit=cover/);
  }
});
