/* End-to-end faction-only commissions in actual Phaser scenes. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright-core');
(async()=>{
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!executablePath)throw Error('Chromium/Chrome required');
 const browser=await chromium.launch({executablePath,headless:true,
   args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 fs.mkdirSync('port-artifacts',{recursive:true});
 try{
  for(const [name,width,height,mobile,id,commission,base] of [
    ['survivors-desktop',1280,720,false,'sobreviventes','faction-rescue','rescue'],
    ['court-desktop',1280,720,false,'corte','faction-hunt','hunt'],
    ['dagon-mobile',390,844,true,'culto','faction-smuggle','smuggle']
  ]){
    const page=await browser.newPage({viewport:{width,height},isMobile:mobile,
      hasTouch:mobile,deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
    await page.locator('#sea-port-ui [data-action="contracts"]').waitFor({timeout:40000});
    await page.evaluate(faction=>{
      const p=SeaProfile.load();
      p.faction=SEA_FACTIONS.initial();
      p.faction.allegiance=faction;
      p.alignment[faction]=80;
      SeaProfile.store(p);
      SEA_PORT_UI.render();
    },id);
    await page.locator('[data-action="contracts"]').first().click();
    await page.locator('[data-action="contract:'+commission+'"]').waitFor({timeout:15000});
    assert.equal(await page.locator('[data-action^="contract:faction-"]').count(),1,
      'one exclusive contract shown for the sworn faction');
    await page.screenshot({path:'port-artifacts/commission-'+name+'.png'});
    await page.locator('[data-action="contract:'+commission+'"]').click();
    await page.waitForFunction(()=>game.scene.isActive('Game')&&
      !!game.scene.getScene('Game').contract,{timeout:30000});
    const state=await page.evaluate(()=>{
      const s=game.scene.getScene('Game');
      return {id:s.contract.id,commission:s.contract.commission,
        bounty:s.contract.bounty,mode:s.mode,
        sprite:s.playerSprite.texture.key,
        baseDamage:SeaProfile.stats(s.profile).cannonDamage,
        damage:s.shipStats.cannonDamage};
    });
    assert.equal(state.id,base);
    assert.equal(state.commission,id);
    assert.equal(state.mode,'sandbox');
    assert(state.bounty>0);
    if(id==='culto')assert(Math.abs(state.damage/state.baseDamage-1.07)<.001,
      'Dagon gives exactly 7% additive-to-base damage once');
    if(errors.length)throw Error(name+': '+errors.join(' | '));
    console.log('PASS '+name+': actual faction contract '+base+', bounty '+state.bounty);
    await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
