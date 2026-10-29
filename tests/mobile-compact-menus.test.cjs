/* Real-browser mobile layout regression for all HTML Porto menus.
 * Uses the same bundled game and Chrome as existing port visual QA.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const binary=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
  '/usr/bin/chromium'].find(f=>fs.existsSync(f));
 if(!binary)throw Error('Chrome unavailable; mobile visual QA cannot pass');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:binary,
  args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try {
  const configs=[
   {name:'portrait-390',width:390,height:844,mobile:true},
   {name:'landscape-844',width:844,height:390,mobile:true},
   {name:'desktop-1280',width:1280,height:720,mobile:false}
  ];
  let desktop=null;
  for(const config of configs) {
   const page=await browser.newPage({
    viewport:{width:config.width,height:config.height},
    isMobile:config.mobile,hasTouch:config.mobile,deviceScaleFactor:1
   });
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui .port-hero').waitFor({timeout:40000});
   const compact=await page.evaluate(()=>getComputedStyle(
      document.querySelector('.port-choice__copy strong')).fontSize);
   const heroHeight=await page.locator('.port-hero').evaluate(el=>el.getBoundingClientRect().height);
   const choiceHeight=await page.locator('[data-action="mission"]').evaluate(el=>el.getBoundingClientRect().height);
   if(!config.mobile){
    desktop={font:parseFloat(compact),hero:heroHeight};
    assert(heroHeight>=200,'Desktop hero must not be compact');
   } else {
    assert(parseFloat(compact)<=13.5,config.name+': choices are too large: '+compact);
    assert(heroHeight<=165,config.name+': hero still dominates screen: '+heroHeight);
    assert(choiceHeight>=44,config.name+': finger target too small');
    assert(choiceHeight<=90,config.name+': choice card still oversized: '+choiceHeight);
   }
   // Main menu, workshop, notebook, all three factions, contracts and reset.
   for(const [menu,selector] of [
      ['menu','.port-hero'],['yard','.port-upgrades'],
      ['help','.port-help-grid'],['council','.port-council__grid'],
      ['contracts','.port-contracts'],['reset','.port-warning']
   ]){
    await page.evaluate(target=>{
      const ui=SEA_PORT_UI;
      if(target==='yard')ui.scene.yardGroup='armas';
      ui.scene.page=target;
      ui.render();
    },menu);
    await page.locator(selector).waitFor({timeout:10000});
    const measure=await page.evaluate(()=>{
      const root=document.querySelector('#sea-port-ui');
      const choices=[...root.querySelectorAll('.port-choice:not(:disabled),.port-mini:not(:disabled),.port-faction-card__join:not(:disabled),.port-upgrade__foot button:not(:disabled)')];
      const under=choices.filter(b=>b.getBoundingClientRect().height<43.5)
        .map(b=>({text:b.textContent?.trim().slice(0,55),height:b.getBoundingClientRect().height}));
      const top=root.querySelector('.port-page h1')||root.querySelector('.port-hero h1');
      return {scroll:root.scrollWidth,client:root.clientWidth,
        title:top?parseFloat(getComputedStyle(top).fontSize):null,under,
        cards:[...root.querySelectorAll('.port-faction-card__ship')].map(x=>x.getBoundingClientRect().height)};
    });
    assert(measure.scroll<=measure.client+2,
      config.name+'/'+menu+': horizontal overflow '+JSON.stringify(measure));
    if(config.mobile){
      assert(measure.under.length===0,
        config.name+'/'+menu+': undersized tap targets '+JSON.stringify(measure.under));
      assert(measure.title<=39,
        config.name+'/'+menu+': heading oversized '+measure.title);
      if(menu==='council')assert(measure.cards.every(x=>x<=112),
        'Council ship previews should not occupy 170-190px each');
    }
    if(menu==='menu'||menu==='yard'||menu==='council'||menu==='contracts')
      await page.screenshot({path:path.join('port-artifacts',
       'mobile-compact-'+config.name+'-'+menu+'.png'),fullPage:true});
   }
   if(config.mobile){
    await page.evaluate(()=>{SEA_PORT_UI.scene.page='menu';SEA_PORT_UI.render()});
    await page.locator('[data-action="readability"]').click();
    const readable=await page.locator('.port-choice__copy strong').first()
      .evaluate(x=>parseFloat(getComputedStyle(x).fontSize));
    assert(readable>=12.5&&readable<=14,
      'Expanded reading should remain usable without 19px+ menu text: '+readable);
   }
   assert.deepEqual(errors,[],config.name+': page runtime errors');
   await page.close();
  }
  assert(desktop.font>13.5,'desktop typography should stay larger than mobile');
  console.log('PASS mobile compact: portrait, landscape, desktop, all Porto pages, tap targets, readable mode');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
