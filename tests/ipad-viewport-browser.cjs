/* Headless iPad/iPhone viewport smoke check.
 * Run from a local static server:
 *    npm install --no-save playwright@1.56.1
 *    npx playwright install chromium
 *    node tests/ipad-viewport-browser.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const BASE=process.env.TEST_BASE_URL||'http://127.0.0.1:8787';
const SIZES=[
  {width:1180,height:820,name:'iPad Air landscape'},
  {width:1024,height:768,name:'iPad landscape'},
  {width:820,height:1180,name:'iPad Air portrait'},
  {width:768,height:1024,name:'iPad portrait'}
];
if(process.env.INCLUDE_PHONE==='1'){
  SIZES.push({width:844,height:390,name:'iPhone landscape'});
  SIZES.push({width:390,height:844,name:'iPhone portrait'});
}
const screenshots=path.resolve('artifacts/ipad-layout');
fs.mkdirSync(screenshots,{recursive:true});

async function inside(page,selectors,screen,label){
  const measurements=await page.evaluate((selectors)=>{
    const width=document.documentElement.clientWidth;
    const height=window.innerHeight;
    return {
      viewport:{width,height},
      pageScroll:document.documentElement.scrollWidth,
      rectangles:selectors.map(selector=>{
        const element=document.querySelector(selector);
        if(!element) return {selector,error:'not found'};
        const rect=element.getBoundingClientRect(),css=getComputedStyle(element);
        return {selector,left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
          display:css.display,visibility:css.visibility,width:rect.width,height:rect.height};
      })
    };
  },selectors);
  assert.ok(measurements.pageScroll<=measurements.viewport.width+3,
    label+' horizontal document overflow '+JSON.stringify(measurements));
  for(const r of measurements.rectangles){
    assert.ok(!r.error,label+' missing '+r.selector);
    assert.ok(r.width>0&&r.height>0&&r.display!=='none',label+' invisible '+r.selector);
    assert.ok(r.left>=-4&&r.right<=measurements.viewport.width+4,
      label+' horizontal clipping '+JSON.stringify(r));
    assert.ok(r.top>=-4&&r.bottom<=measurements.viewport.height+4,
      label+' vertical clipping '+JSON.stringify(r));
  }
  console.log('PASS',screen.name,label,measurements.viewport.width+'x'+measurements.viewport.height);
}
async function screenshot(page,name){
  await page.screenshot({path:path.join(screenshots,name+'.png'),animations:'disabled'});
}
async function runPhoto(browser,screen){
  const context=await browser.newContext({viewport:screen,deviceScaleFactor:1,hasTouch:true});
  const page=await context.newPage();
  await page.addInitScript(()=>{
    // Don't let headless Chromium leave the requested viewport on a click;
    // Safari iPad often does not allow document-element fullscreen either.
    Element.prototype.requestFullscreen=()=>Promise.reject(new Error('fullscreen simulated unavailable'));
  });
  try{
    await page.goto(BASE+'/index.html',{waitUntil:'domcontentloaded',timeout:35000});
    await page.waitForFunction(()=>!document.getElementById('start-btn').disabled,{timeout:20000});
    await inside(page,['#view-landing','.landing-mode-grid','#start-btn'],screen,'Photo home');
    if(screen.width>=700){
      await page.locator('#tutorial-btn').click();
      await page.waitForSelector('#view-tutorial:not(.hidden)');
      await page.locator('#tut-lang-select').selectOption('es');
      assert.equal(await page.locator('#tut-header').textContent(),'CÓMO JUGAR');
      await page.locator('#tut-lang-select').selectOption('en');
      await inside(page,['#view-tutorial','#tut-next-btn','#tut-close-btn'],screen,'Photo instructions');
      await page.locator('#tut-close-btn').click();
      await page.waitForSelector('#view-tutorial',{state:'hidden'});
      await page.locator('#settingsBtn').click();
      await page.waitForSelector('#view-settings.flex');
      await inside(page,['#view-settings','#view-settings>div','#closeSettingsBtn'],screen,'Photo settings');
      await page.locator('#closeSettingsBtn').click();
    }
    await page.locator('#start-btn').click();
    await page.waitForSelector('#view-photo-setup:not(.hidden)');
    if(screen.width<700||screen.height<=540){
      // Small phones scroll the setup screen intentionally; all controls still
      // have to be reachable without sideways scrolling.
      await inside(page,['#view-photo-setup'],screen,'Photo category setup');
      await page.locator('#photo-setup-next').scrollIntoViewIfNeeded();
      await inside(page,['#photo-setup-next'],screen,'Photo setup START reachable');
    } else {
      await inside(page,['#view-photo-setup','.photo-setup-shell','.photo-genre-panel','.photo-options-panel','#photo-setup-next'],screen,'Photo category setup');
    }
    // Both selectors expose the same eight Charades languages.
    assert.equal(await page.locator('#photo-language option').count(),8);
    await page.locator('#photo-language').selectOption('ja');
    assert.equal(await page.locator('#photo-setup-heading').textContent(),'どの写真で遊ぶ？');
    await page.locator('#photo-language').selectOption('en');
    assert.equal(await page.locator('#photo-setup-heading').textContent(),'Choose your photos');
    // BGM must be controllable from the genre screen and remain off into play.
    await page.locator('#photo-bgm-btn').click();
    assert.equal(await page.locator('#photo-bgm-btn').getAttribute('aria-pressed'),'false');
    const all=page.locator('#photo-category-list .photo-genre-card');
    assert.ok((await all.count())>=8,screen.name+' categories missing');
    await page.locator('#photo-setup-next').click();
    await page.waitForSelector('#view-photo-ready:not(.hidden)');
    await inside(page,['#view-photo-ready','.photo-ready-inner','#photo-ready-heading','#photo-ready-start'],screen,'Photo READY');
    assert.equal(await page.locator('#photo-game-tools').isVisible(),false,'No pause/back toolbar on READY');
    if(screen.name.includes('landscape')&&screen.width>=800&&screen.height>540){
      const positions=await page.evaluate(()=>({
        start:document.getElementById('photo-ready-start').getBoundingClientRect().left,
        title:document.getElementById('photo-ready-heading').getBoundingClientRect().right
      }));
      assert.ok(positions.start>positions.title,screen.name+' READY must have START to the right of the title');
    }
    await screenshot(page,'photo-ready-'+screen.width+'x'+screen.height);
    await page.locator('#photo-ready-start').click();
    assert.equal(await page.locator('#photo-bgm-play').getAttribute('aria-pressed'),'false');
    await page.waitForSelector('#view-memory:not(.hidden)',{timeout:20000});
    await inside(page,['#view-memory','#memory-img','#photo-total-time','#photo-total-correct','#memory-skip-btn','#photo-back','#photo-pause','#photo-end'],screen,'Photo speaking');
    // Students can hand off early, before the automatic 20-second explanation ends.
    await page.locator('#memory-skip-btn').click();
    await page.waitForSelector('#view-choice:not(.hidden)',{timeout:15000});
    await page.waitForFunction(()=>document.querySelectorAll('#choice-grid>button').length===4,{timeout:15000});
    await inside(page,['#view-choice','#choice-grid','#choice-grid>button','#photo-back','#photo-end'],screen,'Photo four choices');
    await screenshot(page,'photo-choice-'+screen.width+'x'+screen.height);
    const correctIndex=await page.evaluate(()=>{
      const target=new URL(document.getElementById('memory-img').src,location.href).href;
      return [...document.querySelectorAll('#choice-grid>button img')].findIndex(img=>img.src===target);
    });
    assert.ok(correctIndex>=0,'Correct candidate not in four options');
    await page.locator('#choice-grid>button').nth(correctIndex).click({force:true});
    await page.waitForSelector('#view-photo-next:not(.hidden)',{timeout:15000});
    await inside(page,['#view-photo-next','.photo-next-inner','#photo-next-start','#photo-total-time','#photo-total-correct'],screen,'Photo protected NEXT');
    const secure=await page.evaluate(()=>({
      hidden:document.getElementById('view-memory').classList.contains('hidden'),
      score:document.getElementById('photo-total-correct').textContent,
      time:parseInt(document.getElementById('photo-total-time').textContent,10)
    }));
    assert.equal(secure.hidden,true,'next image must be hidden until NEXT is tapped');
    assert.equal(secure.score,'1','correct answers accumulate across the session');
    assert.ok(secure.time<=90&&secure.time>0,'overall countdown persists after first photo');
    await screenshot(page,'photo-next-'+screen.width+'x'+screen.height);
    await page.locator('#photo-next-start').click();
    await page.waitForSelector('#view-memory:not(.hidden)',{timeout:15000});
    await inside(page,['#view-memory','#photo-total-time','#photo-total-correct'],screen,'Photo next round');
  }finally{await context.close();}
}
async function runCharades(browser,screen){
  const context=await browser.newContext({viewport:screen,deviceScaleFactor:1,hasTouch:true});
  const page=await context.newPage();
  await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('fullscreen simulated unavailable'));});
  try{
    await page.goto(BASE+'/charades.html',{waitUntil:'domcontentloaded',timeout:40000});
    await page.waitForSelector('#setup:not([hidden])');
    // Long lists may scroll *inside* the settings panel. The viewport and
    // category list must remain bounded; later controls need to be reachable.
    if(screen.width>=700) {
      await inside(page,['#setup'],screen,'Charades settings surface');
      await inside(page,['#decks'],screen,'Charades category list');
    } else {
      const scrollWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
      assert.ok(scrollWidth<=screen.width+3,screen.name+' Charades settings horizontal overflow');
    }
    await screenshot(page,'charades-settings-'+screen.width+'x'+screen.height);
    const button=page.locator(screen.width<=760?'#mobileStart':'#start');
    await button.click({force:true});
    await page.waitForSelector('#ready:not([hidden])');
    await inside(page,['#ready','#beginRound','#readyInstruction'],screen,'Charades READY');
    await screenshot(page,'charades-ready-'+screen.width+'x'+screen.height);
    await page.locator('#beginRound').click();
    await page.waitForSelector('#play:not([hidden])');
    await inside(page,['#play','#prompt','#pass','#correct','#playLanguage'],screen,'Charades acting');
    await screenshot(page,'charades-play-'+screen.width+'x'+screen.height);
    await page.locator('#endRound').click({force:true});
    await page.waitForSelector('#result:not([hidden])');
    await inside(page,['#result','#nextRound','#newGame'],screen,'Charades results');
  }finally{await context.close();}
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    for(const screen of SIZES){
      await runPhoto(browser,screen);
      await runCharades(browser,screen);
    }
  }finally{await browser.close();}
  console.log('All '+(SIZES.length*2)+' device/game combinations and their views are within the viewport.');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
