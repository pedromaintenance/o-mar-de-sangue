/* 3.2: in-game HUD QA in Chromium across desktop and narrow screens.
 * Launch a local HTTP server on :8765 and run with playwright-core.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!executablePath)throw Error('Chromium is required for HUD visual QA');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath,
   args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  for(const [label,width,height,isMobile] of [
   ['wide-1600',1600,900,false],
   ['desktop-1280',1280,720,false],
   ['mobile-390',390,844,true]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.locator('#sea-port-ui').waitFor({state:'detached',timeout:20000});
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
     !!game.scene.getScene('Game').player,{timeout:20000});
   const before=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    s.updateHUD();
    return {
      hud:s.hud.text,quest:s.quest.text,
      badge:s.hudConditions.text,
      x:s.hudConditions.x,y:s.hudConditions.y,
      pause:{...s.pauseButtonHitbox},
      touch:s.touchLayout?JSON.parse(JSON.stringify(s.touchLayout)):null,
      bar:s.statusBars.visible
    };
   });
   assert(before.hud.includes('CASCO')&&before.hud.includes('OURO')&&before.hud.includes('NÓS'));
   assert(before.quest.length>0&&before.badge.includes('MALDIÇÃO'));
   assert.deepEqual(before.pause,{x:isMobile?412:454,y:78,w:120,h:40});
   assert.equal(before.x,isMobile?338:1154);assert.equal(before.y,239);
   if(isMobile){
    assert.deepEqual(before.touch?.joystick,{x:106,y:702,radius:82});
    assert.deepEqual(before.touch?.port,{x:342,y:702,radius:48});
    assert.deepEqual(before.touch?.starboard,{x:432,y:702,radius:48});
   }
   await page.screenshot({path:path.join('port-artifacts','mare-negra-3-2-'+label+'-hud.png'),fullPage:true});
   const alert=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const save={shipHP:s.shipHP,curse:s.curse,seaEvent:s.seaEvent};
    s.shipHP=s.maxShipHP*.18;s.curse=87;s.seaEvent='storm';
    s.updateHUD();
    const state={hudColor:s.hud.style.color,
      badgeColor:s.hudConditions.style.color,
      badge:s.hudConditions.text,quest:s.quest.text};
    s.__hudQaOriginal=save;
    return state;
   });
   assert.equal(alert.hudColor,'#f2a5a0');
   assert.equal(alert.badgeColor,'#f0a3a3');
   assert(alert.badge.includes('87%'));
   assert(alert.quest.length>0);
   await page.screenshot({path:path.join('port-artifacts','mare-negra-3-2-'+label+'-alert.png'),fullPage:true});
   const pause=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const {x,y}=s.pauseButtonHitbox;
    const handled=s.handleCaptainPointer(x,y);
    const result={handled,paused:s.pausedByCaptain,options:s.pausePadOptions?.length};
    s.toggleCaptainMenu();
    const old=s.__hudQaOriginal;
    Object.assign(s,old);s.updateHUD();
    return {...result,closed:!s.pausedByCaptain};
   });
   assert(pause.handled&&pause.paused&&pause.closed);
   assert.equal(pause.options,3);
   if(errors.length)throw Error(label+' runtime errors: '+errors.join(' | '));
   console.log('PASS Maré Negra HUD '+label,before.hud);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
