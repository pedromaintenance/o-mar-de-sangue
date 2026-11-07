/* V115 — responsive contract dossiers and real selection in Phaser. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright-core');
(async()=>{
 const binary=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!binary)throw Error('Chromium required');
 const browser=await chromium.launch({executablePath:binary,headless:true,
   args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try {
  for(const v of [
    {label:'desktop',width:1280,height:720,mobile:false},
    {label:'mobile',width:390,height:844,mobile:true},
    {label:'compact',width:320,height:640,mobile:true}
  ]){
   const page=await browser.newPage({viewport:{width:v.width,height:v.height},
     hasTouch:v.mobile,isMobile:v.mobile,deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('[data-action="contracts"]').waitFor({timeout:60000});
   await page.locator('[data-action="contracts"]').click();
   await page.locator('#port-contract-title').waitFor();
   const p=await page.evaluate(()=>{
     const root=document.querySelector('#sea-port-ui');
     const cards=[...root.querySelectorAll('.port-contract-card')];
     return {cards:cards.length,overflow:root.scrollWidth-root.clientWidth,
       columns:getComputedStyle(root.querySelector('.port-contracts__grid')).gridTemplateColumns.split(' ').length,
       buttons:cards.map(c=>{
         const b=c.querySelector('[data-action]');
         const r=b.getBoundingClientRect();
         return {action:b.dataset.action,height:r.height,width:r.width};
       }),
       stories:cards.map(c=>c.querySelector('.port-contract-card__ledger')?.textContent||''),
       choiceCount:root.querySelectorAll('[data-action^="contract:"]').length
     };
   });
   assert.equal(p.cards,4);
   assert(p.overflow<=2,'horizontal overflow '+v.label+': '+JSON.stringify(p));
   assert.equal(p.choiceCount,3,'three ordinary voyages plus optional commission');
   assert.equal(p.columns,v.mobile?1:2);
   assert(p.buttons.every(b=>b.height>=43.5),'touch targets too small');
   assert(p.stories.some(x=>x.includes('QUEM GANHA')));
   await page.screenshot({path:'/tmp/contracts-v115-'+v.label+'.png',fullPage:true});
   if(v.label!=='compact'){
     await page.locator('[data-action="contract:rescue"]').click();
     await page.waitForFunction(()=>typeof game!=='undefined'&&game.scene.isActive('Game')&&
       game.scene.getScene('Game').contract?.id==='rescue',null,{timeout:30000});
     const state=await page.evaluate(()=>{
       const s=game.scene.getScene('Game');
       return {id:s.contract.id,phase:s.contract.phase,
         next:s.chartWaypointId,choices:SEA_CONTRACTS.options(s,SEA_CONTRACTS.target(s))
           .map(o=>o.contractAction),save:SeaProfile.load().version};
     });
     assert.equal(state.id,'rescue');assert.equal(state.phase,'pickup');
     assert.equal(state.choices.length,2);assert.equal(state.save,4);
   }
   assert.deepEqual(errors,[],v.label+' script errors');
   console.log('PASS V115 '+v.label+': '+JSON.stringify(p));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
