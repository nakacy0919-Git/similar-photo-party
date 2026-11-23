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
  {width:768,height:1024,name:'iPad portrait'},
  {width:844,height:390,name:'iPhone landscape'},
  {width:390,height:844,name:'iPhone portrait'}
];
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
      await inside(page,['#view-tutorial','#tut-next-btn','#tut-close-btn'],screen,'Photo instructions');
      await page.locator('#tut-close-btn').click();
      await page.waitForSelector('#view-tutorial.hidden');
      await page.locator('#settingsBtn').click();
      await page.waitForSelector('#view-settings.flex');
      await inside(page,['#view-settings','#view-settings>div','#closeSettingsBtn'],screen,'Photo settings');
      await page.locator('#closeSettingsBtn').click();
    }
    await page.locator('#start-btn').click();
    await page.waitForSelector('#view-photo-setup:not(.hidden)');
    await inside(page,['#view-photo-setup','.photo-setup-shell','.photo-genre-panel','.photo-options-panel','#photo-setup-next'],screen,'Photo category setup');
    const all=page.locator('#photo-category-list .photo-genre-card');
    assert.ok((await all.count())>=8,screen.name+' categories missing');
    await page.locator('#photo-setup-next').click();
    await page.waitForSelector('#view-photo-ready:not(.hidden)');
    await inside(page,['#view-photo-ready','.photo-ready-inner','#photo-ready-heading','#photo-ready-start','#photo-ready-back'],screen,'Photo READY');
    if(screen.name.includes('landscape')&&screen.width>=800&&screen.height>540){
      const positions=await page.evaluate(()=>({
        start:document.getElementById('photo-ready-start').getBoundingClientRect().left,
        title:document.getElementById('photo-ready-heading').getBoundingClientRect().right
      }));
      assert.ok(positions.start>positions.title,screen.name+' READY must have START to the right of the title');
    }
    await screenshot(page,'photo-ready-'+screen.width+'x'+screen.height);
    await page.locator('#photo-ready-start').click();
    await page.waitForSelector('#view-memory:not(.hidden)',{timeout:20000});
    await inside(page,['#view-memory','#memory-img','#memory-skip-btn','#photo-back','#photo-pause','#photo-end'],screen,'Photo speaking');
    await page.locator('#memory-skip-btn').click();
    await page.waitForSelector('#view-choice:not(.hidden)',{timeout:10000});
    await page.waitForFunction(()=>document.querySelectorAll('#choice-grid>button').length===4,{timeout:15000});
    await inside(page,['#view-choice','#choice-grid','#choice-grid>button','#photo-back','#photo-end'],screen,'Photo four choices');
    await screenshot(page,'photo-choice-'+screen.width+'x'+screen.height);
    const correctIndex=await page.evaluate(()=>{
      const target=new URL(document.getElementById('memory-img').src,location.href).href;
      return [...document.querySelectorAll('#choice-grid>button img')].findIndex(img=>img.src===target);
    });
    assert.ok(correctIndex>=0,'Correct candidate not in four options');
    await page.locator('#choice-grid>button').nth(correctIndex).click({force:true});
    await page.waitForSelector('#view-result:not(.hidden)',{timeout:15000});
    await inside(page,['#view-result','#photo-result-main','#result-layout-img','#result-layout-text','#next-btn'],screen,'Photo results');
    await screenshot(page,'photo-result-'+screen.width+'x'+screen.height);
    await page.locator('#next-btn').click();
    await page.waitForSelector('#view-photo-ready:not(.hidden)');
    await inside(page,['#view-photo-ready','#photo-ready-start'],screen,'Photo next player');
  }finally{await context.close();}
}
async function runCharades(browser,screen){
  const context=await browser.newContext({viewport:screen,deviceScaleFactor:1,hasTouch:true});
  const page=await context.newPage();
  await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('fullscreen simulated unavailable'));});
  try{
    await page.goto(BASE+'/charades.html',{waitUntil:'domcontentloaded',timeout:40000});
    await page.waitForSelector('#setup:not([hidden])');
    await inside(page,['#setup','.setup-grid','#decks','.options-panel'],screen,'Charades settings');
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
  console.log('All 12 device/game combinations and their views are within the viewport.');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
