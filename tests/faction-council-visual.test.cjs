/* V100: real browser Council, local oath, preserved upgrades, next-voyage atlas. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const exe=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!exe)throw Error('Chrome required');
 const browser=await chromium.launch({headless:true,executablePath:exe,
   args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 fs.mkdirSync('port-artifacts',{recursive:true});
 try{
  for(const [label,width,height,mobile] of [['desktop',1280,720,false],['mobile',390,844,true]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
   const errors=[];page.on('pageerror',x=>errors.push(String(x)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="council"]').waitFor({timeout:40000});
   await page.locator('[data-action="council"]').click();
   assert.equal(await page.locator('.port-faction-card').count(),3,'three factions available');
   assert.equal(await page.locator('.port-faction-card__atlas').count(),3,'all atlases previewed');
   assert.equal(await page.locator('[data-action^="faction:"]:not(:disabled)').count(),0,
     'no free allegiance without reputation and trial');
   await page.screenshot({path:path.join('port-artifacts','factions-'+label+'-locked.png')});
   const baseline=await page.evaluate(()=>{
     const p=SeaProfile.load();p.alignment.culto=40;p.faction.proofs.culto=true;
     const previous=JSON.stringify(p.levels);SeaProfile.store(p);
     SEA_PORT_UI.render();return previous;
   });
   await page.locator('[data-action="faction:culto"]:not(:disabled)').click();
   const joined=await page.evaluate(()=>{
      const p=SeaProfile.load();return {allegiance:p.faction.allegiance,
        stage:SEA_PLAYER_SHIP.stage(p.levels),
        levels:JSON.stringify(p.levels)};
   });
   assert.equal(joined.allegiance,'culto');
   assert.equal(joined.levels,baseline,'joining must preserve upgrade levels');
   await page.screenshot({path:path.join('port-artifacts','factions-'+label+'-dagon.png')});
   await page.locator('[data-action="menu"]').click();
   await page.locator('[data-action="mission"]').click();
   await page.waitForFunction(()=>game.scene.isActive('Game')&&!!game.scene.getScene('Game').player,
      {timeout:25000});
   const atSea=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     return {texture:s.playerSprite.texture.key,
       frame:s.playerSprite.frame.name,allegiance:s.profile.faction.allegiance,
       stage:SEA_PLAYER_SHIP.stage(s.profile.levels)};
   });
   assert.equal(atSea.texture,'player-ship-dagon');
   assert.equal(atSea.allegiance,'culto');
   assert.equal(Number(atSea.frame),atSea.stage-1);
   if(errors.length)throw Error(label+': '+errors.join(' | '));
   console.log('PASS Council '+label+': three skins, no free oath, actual Dagon boat at sea');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
