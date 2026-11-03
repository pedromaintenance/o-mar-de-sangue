'use strict';
/* V111: integração Phaser real do navio final da Corte, desktop e mobile. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright-core');
(async()=>{
 const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!bin)throw Error('Chromium não instalado');
 const browser=await chromium.launch({headless:true,executablePath:bin,
  args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  for(const mobile of [false,true]){
   const page=await browser.newPage({
    viewport:{width:mobile?390:1440,height:mobile?844:900},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,
    userAgent:mobile?'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36':undefined
   });
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:60000});
   await page.evaluate(()=>{
    const p=SeaProfile.defaults();
    for(const k of Object.keys(p.levels))p.levels[k]=20;
    p.faction.allegiance='corte';
    SeaProfile.store(p);
   });
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:60000});
   const preview=await page.locator('.port-hero__ship').getAttribute('src');
   assert(preview?.includes('navio_corte_feerica_nivel_20_preview.png'),'Port preview');
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.waitForFunction(()=>typeof game!=='undefined'&&game.scene.isActive('Game')&&
    game.scene.getScene('Game').playerShipAnimated,null,{timeout:60000});
   const state=await page.evaluate(()=>{
    const s=game.scene.getScene('Game'),tex=s.textures.get('player-ship-court-final');
    const im=tex.getSourceImage(),canvas=document.createElement('canvas');
    canvas.width=im.width;canvas.height=im.height;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    context.drawImage(im,0,0);
    return {
     stage:SEA_PLAYER_SHIP.stage(s.profile.levels),
     faction:s.profile.faction.allegiance,
     texture:s.playerSprite.texture.key,
     size:[im.width,im.height],cornerAlpha:context.getImageData(0,0,1,1).data[3],
     scale:s.playerSprite.scaleX,expectedScale:s.hullRadius*2.25/682,
     configHeight:s.playerShipAnimation?.frameHeight,
     frameCount:s.playerShipAnimation?.frameCount,fps:s.playerShipAnimation?.fps
    };
   });
   assert.equal(state.stage,20);
   assert.equal(state.faction,'corte');
   assert.equal(state.texture,'player-ship-court-final');
   assert.deepEqual(state.size,[2048,682]);
   assert.equal(state.cornerAlpha,0,'transparent background');
   assert.equal(state.configHeight,682);
   assert.equal(state.frameCount,4);
   assert.equal(state.fps,4);
   assert(Math.abs(state.scale-state.expectedScale)<1e-7,'scale by single frame');
   await page.waitForFunction(()=>game.scene.getScene('Game').playerShipFrame>0,null,{timeout:10000});
   const state2=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    return {frame:s.playerShipFrame,visualFrame:s.playerSprite.frame.name,radius:s.hullRadius};
   });
   assert(state2.frame>=1&&state2.frame<=3);
   assert.equal(Number(state2.visualFrame),state2.frame);
   assert.equal(state2.radius,68);
   assert.deepEqual(errors,[],'browser errors');
   await page.close();
   console.log('PASS V111 '+(mobile?'mobile':'desktop')+': '+JSON.stringify({preview,...state,...state2}));
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
