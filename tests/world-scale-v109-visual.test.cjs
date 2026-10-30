'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright-core');
(async()=>{
 const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!bin)throw Error('Chromium not installed');
 const browser=await chromium.launch({headless:true,executablePath:bin,args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  for(const mobile of [false,true]){
   const page=await browser.newPage({viewport:{width:mobile?390:1440,height:mobile?844:900},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,
    userAgent:mobile?'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36':undefined});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:60000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.waitForFunction(()=>typeof game!=='undefined'&&game.scene.isActive('Game')&&!!game.scene.getScene('Game').seaHudCamera,null,{timeout:60000});
   await page.waitForTimeout(120);
   const d=await page.evaluate(()=>{
     const s=game.scene.getScene('Game'),c=s.cameras.main,h=s.seaHudCamera;
     const e=s.spawnEnemy('almirante',640);
     return {w:s.W,h:s.H,zoom:c.zoom,visibleW:c.width/c.zoom,visibleH:c.height/c.zoom,
       hudZoom:h.zoom,uiMasked:!!(s.hud.cameraFilter&c.id),worldMasked:!!(s.player.cameraFilter&h.id),
       bossHP:e?.maxhp,expected:Math.round(390*(1+Math.max(0,s.currentDifficulty-1)*.12)*5),
       tiles:s.seaV3Tiles?.length||0};
   });
   assert.equal(d.w,8800);assert.equal(d.h,6800);
   assert(Math.abs(d.zoom-5/6)<1e-8,'world zoom');
   assert(Math.abs(d.visibleW-1536)<1e-6);
   assert(Math.abs(d.visibleH-864)<1e-6);
   assert.equal(d.hudZoom,1);assert(d.uiMasked&&d.worldMasked,'camera masks');
   assert.equal(d.bossHP,d.expected,'boss hp must be five times base');
   assert(d.tiles>=9,'ocean tile pool');
   assert.deepEqual(errors,[],(mobile?'mobile':'desktop')+' browser errors');
   await page.close();
   console.log('PASS V109 '+(mobile?'mobile':'desktop')+': '+JSON.stringify(d));
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
