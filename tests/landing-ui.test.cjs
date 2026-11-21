const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const css = fs.readFileSync(path.join(__dirname,'../css/landing.css'),'utf8');

test('home clearly presents exactly two distinct primary games with real links', () => {
  assert.match(html, /id="view-landing"/);
  assert.match(html, /id="start-btn"/);
  assert.match(html, /href="charades\.html"/);
  assert.match(html, /SIMILAR<br>PHOTO/);
  assert.match(html, /CHARADES<br>PARTY/);
  assert.match(html, /CHOOSE YOUR GAME/);
  assert.match(html, /MODE 01/);
  assert.match(html, /MODE 02/);
  assert.match(html, /写真を見て、伝えて、4枚から当てる/);
  assert.match(html, /ジェスチャーで伝えて、みんなで当てる/);
  assert.equal((html.match(/class="landing-mode-card/g) || []).length, 1,
    'photo button may carry both the shared and mode classes');
  assert.match(html, /class="landing-mode-card charades-mode"/);
});

test('Photo card retains existing game and tutorial hooks and avoids external images', () => {
  for (const id of ['start-btn','load-status','tutorial-btn','bgmBtn','settingsBtn']) {
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  for (const file of ['ball_1.webp','ball_2.webp','ball_3.webp','ball_4.webp']) {
    assert.match(html,new RegExp('assets/images/'+file));
    assert.ok(fs.existsSync(path.join(__dirname,'../assets/images',file)));
  }
  const game = fs.readFileSync(path.join(__dirname,'../js/game.js'),'utf8');
  assert.match(game,/elements\.btns\.start\.addEventListener\('click', startMemoryPhase\)/);
  assert.match(game,/loadStatus\.textContent =/);
  assert.match(html,/id="tutorial-btn"/);
  assert.match(html,/rel="stylesheet" href="css\/landing\.css"/);
});

test('landing has smooth gradient aurora, seven CSS shooting stars and restrained motion', () => {
  assert.match(css,/\.orb-violet/);
  assert.match(css,/\.orb-cyan/);
  assert.match(css,/\.orb-rose/);
  assert.match(css,/@keyframes auroraDriftA/);
  assert.match(css,/@keyframes cosmicWaveOne/);
  assert.match(css,/@keyframes shootingStar/);
  assert.match(css,/\.shooting-star/);
  assert.match(css,/filter:blur/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  for(const name of ['star-one','star-two','star-three','star-four','star-five','star-six','star-seven']) {
    assert.match(html,new RegExp('class="shooting-star '+name+'"'));
  }
});

test('phone and tablet cards remain large, distinct and keyboard accessible', () => {
  assert.match(css,/@media\(max-width:800px\)/);
  assert.match(css,/grid-template-columns:1fr/);
  assert.match(css,/@media\(orientation:landscape\) and \(max-height:580px\)/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/#view-landing button:focus-visible/);
  assert.match(css,/overscroll-behavior:contain!important/);
  assert.match(css,/touch-action:manipulation/);
  assert.match(html,/aria-label="Play Similar Photo/);
  assert.match(html,/aria-label="Play Charades/);
  assert.match(html,/href="privacy\.html"/);
});

test('landing atmosphere and navigation do not animate over fullscreen gameplay', () => {
  assert.match(css,/body:has\(#view-landing:not\(\.hidden\)\)/);
  assert.match(css,/#view-landing\.landing-screen/);
  const immersive = fs.readFileSync(path.join(__dirname,'../css/immersive.css'),'utf8');
  assert.match(immersive,/#play\.play-panel:not\(\[hidden\]\)/);
  assert.match(immersive,/#view-memory:not\(\.hidden\)/);
  assert.match(immersive,/#view-choice #choice-grid/);
});
