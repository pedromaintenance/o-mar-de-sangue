/* V112 — integração real no Chromium: menu inicial cabe no retrato. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright-core');
(async()=>{
 const binary=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!binary)throw Error('Chrome required for viewport QA');
 const browser=await chromium.launch({headless:true,executablePath:binary,
  args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try {
  for(const v of [
   {name:'portrait-390',w:390,h:844,mobile:true,fit:true},
   {name:'portrait-360',w:360,h:740,mobile:true,fit:true},
   {name:'portrait-320',w:320,h:640,mobile:true,fit:true},
   {name:'landscape-844',w:844,h:390,mobile:true,fit:true},
   {name:'desktop-1280',w:1280,h:720,mobile:false,fit:false}
  ]){
   const page=await browser.newPage({viewport:{width:v.w,height:v.h},isMobile:v.mobile,
     hasTouch:v.mobile,deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui .port-hero').waitFor({timeout:60000});
   const state=await page.evaluate(()=>{
    const root=document.querySelector('#sea-port-ui');
    const tools=root.querySelector('.port-tools__toggle'),panel=root.querySelector('.port-tools__panel');
    return {
      viewportHeight:root.clientHeight,documentHeight:root.scrollHeight,
      overflowX:root.scrollWidth-root.clientWidth,
      hidden:panel.hidden,expanded:tools.getAttribute('aria-expanded'),
      cards:[...root.querySelectorAll('.port-actions .port-choice')].map(el=>{
       const r=el.getBoundingClientRect();return {h:r.height,w:r.width,top:r.top};
      }),
      font:parseFloat(getComputedStyle(root.querySelector('.port-choice__copy strong')).fontSize)
    };
   });
   assert(state.overflowX<=2,v.name+' horizontal overflow '+JSON.stringify(state));
   assert.equal(state.cards.length,6);
   // V113: Contratos e Conselho fecham juntos a ultima linha no desktop;
   // retrato mobile preserva os dois atalhos em largura inteira.
   if(!v.mobile){
    assert(Math.abs(state.cards[4].top-state.cards[5].top)<2,
      'desktop: contratos e conselho precisam compartilhar a terceira linha');
    assert(Math.abs(state.cards[4].w-state.cards[5].w)<2,
      'desktop: contratos e conselho precisam ter largura equivalente');
   }else if(v.h>v.w){
    assert(state.cards[5].top>state.cards[4].top,
      'mobile retrato: contratos e conselho devem ficar em linhas distintas');
   }
   if(v.mobile){
    assert(state.hidden,'secondary settings start collapsed');
    assert(state.cards.every(x=>x.h>=43.5),'undersized action target');
    assert(Math.abs(state.cards[0].top-state.cards[1].top)<2,'two-column mobile actions');
    if(v.fit)assert(state.documentHeight<=state.viewportHeight+4,
      v.name+' scrolling remains: '+JSON.stringify(state));
    await page.locator('[data-action="tools-toggle"]').click();
    assert.equal(await page.locator('[data-action="tools-toggle"]').getAttribute('aria-expanded'),'true');
    await page.locator('[data-action="volume:up"]').click();
    assert.equal(await page.locator('[data-action="tools-toggle"]').getAttribute('aria-expanded'),'true');
    await page.locator('[data-action="tools-toggle"]').click();
    assert.equal(await page.locator('[data-action="tools-toggle"]').getAttribute('aria-expanded'),'false');
   }else{
    assert(!state.hidden,'desktop sound controls must remain expanded');
    assert(state.font>13,'desktop font too small');
   }
   await page.evaluate(()=>{SEA_PORT_UI.scene.page='yard';SEA_PORT_UI.scene.yardGroup='armas';SEA_PORT_UI.render()});
   await page.locator('.port-upgrades').waitFor();
   const yard=await page.evaluate(()=>{
     const el=document.querySelector('#sea-port-ui');
     return {overflowX:el.scrollWidth-el.clientWidth,
       buttons:[...el.querySelectorAll('.port-upgrade__foot button')].map(b=>b.getBoundingClientRect().height)};
   });
   assert(yard.overflowX<=2,'yard horizontal overflow');
   if(v.mobile)assert(yard.buttons.every(h=>h>=43.5),'yard buttons under 44px');
   await page.evaluate(()=>{SEA_PORT_UI.scene.page='council';SEA_PORT_UI.render()});
   await page.locator('.port-council__grid').waitFor();
   const council=await page.evaluate(()=>{
     const el=document.querySelector('#sea-port-ui');
     return {overflowX:el.scrollWidth-el.clientWidth,
       ships:[...el.querySelectorAll('.port-faction-card__ship')].map(x=>x.getBoundingClientRect().height)};
   });
   assert(council.overflowX<=2,'council horizontal overflow');
   if(v.mobile)assert(council.ships.every(h=>h<=100),'council previews must shrink');
   assert.deepEqual(errors,[],v.name+' JS errors');
   console.log('PASS V112 '+v.name+': '+JSON.stringify({state,yard,council}));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
