'use strict';
/* V110: navegador real, facção Culto no estágio visual 20. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright-core');
(async()=>{
 const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!bin)throw Error('Chromium não instalado');
 const browser=await chromium.launch({headless:true,executablePath:bin,
  args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try {
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
    p.faction.allegiance='culto';
    SeaProfile.store(p);
   });
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:60000});
   const preview=await page.locator('.port-hero__ship').getAttribute('src');
   assert(preview?.includes('navio_culto_dagon_nivel_20_preview.png'),
      'Porto deve mostrar a arte final do Culto');
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.waitForFunction(()=>typeof game!=='undefined'&&
     game.scene.isActive('Game')&&game.scene.getScene('Game').playerShipAnimated,
     null,{timeout:60000});
   const state=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const tex=s.textures.get('player-ship-dagon-final');
    const im=tex.getSourceImage();
    const canvas=document.createElement('canvas');
    canvas.width=im.width;canvas.height=im.height;
    canvas.getContext('2d',{willReadFrequently:true}).drawImage(im,0,0);
    const cornerAlpha=canvas.getContext('2d').getImageData(0,0,1,1).data[3];
    return {
      stage:SEA_PLAYER_SHIP.stage(s.profile.levels),
      faction:s.profile.faction.allegiance,
      texture:s.playerSprite.texture.key,
      imageSize:[im.width,im.height],
      initialScale:s.playerSprite.scaleX,
      expectedScale:(s.hullRadius*2.25)/512,
      cornerAlpha,
      initialFrame:s.playerShipFrame,
      configHeight:s.playerShipAnimation?.frameHeight,
      frameCount:s.playerShipAnimation?.frameCount,
      fps:s.playerShipAnimation?.fps
    };
   });
   assert.equal(state.stage,20);
   assert.equal(state.faction,'culto');
   assert.equal(state.texture,'player-ship-dagon-final');
   assert.deepEqual(state.imageSize,[2048,512]);
   assert.equal(state.configHeight,512);
   assert.equal(state.frameCount,4);
   assert.equal(state.fps,4);
   assert.equal(state.cornerAlpha,0,'fundo externo não pode cobrir o oceano');
   assert(Math.abs(state.initialScale-state.expectedScale)<1e-7,'escala do frame');
   await page.waitForFunction(()=>game.scene.getScene('Game').playerShipFrame>0,
      null,{timeout:10000});
   const elapsed=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     return {frame:s.playerShipFrame,visualFrame:s.playerSprite.frame.name,
       radius:s.hullRadius,shipHP:s.shipHP};
   });
   assert(elapsed.frame>=1&&elapsed.frame<=3);
   assert.equal(Number(elapsed.visualFrame),elapsed.frame);
   assert.equal(elapsed.radius,68);
   assert.deepEqual(errors,[],'Erros de execução no browser');
   await page.close();
   console.log('PASS cult level 20 '+(mobile?'mobile':'desktop')+': '+JSON.stringify({preview,...state,...elapsed}));
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
