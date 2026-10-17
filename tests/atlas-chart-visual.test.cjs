/* 3.4 Atlas: browser QA on actual Phaser Game, Chrome and Android layout.
 * start local http server on 127.0.0.1:8765
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const binary=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>fs.existsSync(p));
 if(!binary)throw Error('Chrome/Chromium required for atlas QA');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:binary,
  args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try {
  for(const [label,width,height,mobile] of [
   ['wide-1600',1600,900,false],
   ['desktop-1280',1280,720,false],
   ['android-390',390,844,true]
  ]){
   const agent='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';
   const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,
    deviceScaleFactor:1,userAgent:mobile?agent:undefined});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.locator('#sea-port-ui').waitFor({state:'detached',timeout:20000});
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
    !!game.scene.getScene('Game').player,{timeout:20000});
   const before=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    SEA_ATLAS.discover(s);
    return {open:s.atlasOpen,count:s.chartDiscovered.size,
      total:s.islands.length,hit:{...s.chartHitbox},
      radar:{x:s.radar.x,y:s.radar.y},
      velocity:{...s.playerVelocity},gold:s.gold,profile:localStorage.getItem('carcaca.mar-de-sangue.v4')};
   });
   assert.equal(before.open,false);
   assert(before.count<before.total,'Fog of discovery should initially conceal some islands');
   assert.deepEqual(before.hit,{x:mobile?390:1198,y:187,w:80,h:80});
   // Real pointer routing at the existing radar, not a new joystick overlay.
   const opened=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const hit=s.chartHitbox;
    const consumed=s.handleCaptainPointer(hit.x,hit.y);
    return {consumed,open:s.atlasOpen,visible:s.atlasElements?.visible,
      count:s.chartDiscovered.size,
      text:s.atlasElements?.list?.filter(o=>o.type==='Text').map(o=>o.text)||[]};
   });
   assert(opened.consumed&&opened.open);
   assert(opened.text.some(t=>t.includes('CARTA DOS NÁUFRAGOS')));
   assert(opened.text.some(t=>t.includes('CONHECIDAS')));
   assert(opened.text.some(t=>t.includes('TOQUE: MARCAR')&&
     t.includes('ESC / B: FECHAR')),label+': missing chart controls guide');
   const chartGuide=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     const o=s.atlasElements.list.find(v=>v.type==='Text'&&v.text.includes('TOQUE: MARCAR'));
     const b=o?.getBounds?.(),close=s.atlasCloseHitbox;
     return {bottom:b?.bottom??0,closeTop:close.y-close.h/2,
       save:localStorage.getItem('carcaca.mar-de-sangue.v4')};
   });
   assert(chartGuide.bottom>0&&chartGuide.bottom<chartGuide.closeTop,
     label+': Atlas guidance must not cover close button');
   assert.equal(chartGuide.save,before.profile);
   await page.screenshot({path:path.join('port-artifacts','mare-negra-3-4-'+label+'-atlas.png'),fullPage:true});
   const frozen=await page.evaluate(()=>{
    const s=game.scene.getScene('Game'),p={x:s.player.x,y:s.player.y};
    const old=SEA_GAMEPAD.poll;
    SEA_GAMEPAD.poll=()=>({connected:true,just:{0:true},x:1,y:1});
    try{s.update(s.time.now,16);}finally{SEA_GAMEPAD.poll=old;}
    return {same:s.player.x===p.x&&s.player.y===p.y,open:s.atlasOpen,paused:s.pausedByCaptain};
   });
   assert(frozen.same&&frozen.open&&!frozen.paused,
    'Game must not navigate, shoot or pause through the atlas');
   // B exits Atlas without triggering the captain menu or the island screen.
   const exited=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const old=SEA_GAMEPAD.poll;
    SEA_GAMEPAD.poll=()=>({connected:true,just:{1:true}});
    try{s.update(s.time.now,16);}finally{SEA_GAMEPAD.poll=old;}
    return {open:s.atlasOpen,paused:s.pausedByCaptain,overlay:!!s.atlasElements};
   });
   assert.deepEqual(exited,{open:false,paused:false,overlay:false});
   const soundBefore=await page.evaluate(()=>SEA_AUDIO.enabled);
   await page.keyboard.press('m');
   await page.waitForFunction(()=>game.scene.getScene('Game').atlasOpen);
   const soundAfterAtlas=await page.evaluate(()=>SEA_AUDIO.enabled);
   assert.equal(soundAfterAtlas,soundBefore,'M opening Atlas must NOT toggle the music');
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!game.scene.getScene('Game').atlasOpen);
   await page.keyboard.press('n');
   const muted=await page.evaluate(()=>SEA_AUDIO.enabled);
   assert.equal(muted,!soundBefore,'N must toggle audio without opening Atlas');
   assert.equal(await page.evaluate(()=>game.scene.getScene('Game').atlasOpen),false);
   await page.keyboard.press('n');
   assert.equal(await page.evaluate(()=>SEA_AUDIO.enabled),soundBefore,'Restore audio state');
   // Discovered state is voyage local. Move the avatar solely within this
   // isolated test page, near parley, to test new chart symbol.
   const discovered=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const parley=s.islands.find(i=>i.kind==='parley');
    if(!parley)throw Error('3.3 parley missing from game world');
    s.player.setPosition(parley.x,parley.y);
    SEA_ATLAS.discover(s);
    SEA_ATLAS.toggle(s);
    const visible=s.chartDiscovered.has(parley.id);
    const save=localStorage.getItem('carcaca.mar-de-sangue.v4');
    return {visible,open:s.atlasOpen,save,kind:parley.kind};
   });
   assert(discovered.visible&&discovered.open);
   assert.equal(discovered.save,before.profile,'Atlas cannot write to save');
   await page.screenshot({path:path.join('port-artifacts','mare-negra-3-4-'+label+'-parley.png'),fullPage:true});
   // 3.4b: route only to a truly discovered marker; retained in HUD.
   const route=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const parley=s.islands.find(i=>i.kind==='parley');
    const marker=s.atlasPoints.find(p=>p.id===parley.id);
    if(!marker)throw Error('Discovered parley marker missing');
    const consumed=s.handleCaptainPointer(marker.x,marker.y);
    const nav=SEA_ATLAS.navigation(s);
    return {consumed,open:s.atlasOpen,selected:s.chartWaypointId,
      id:parley.id,distance:nav?.distance,bearing:nav?.bearing,
      save:localStorage.getItem('carcaca.mar-de-sangue.v4')};
   });
   assert(route.consumed&&route.open&&route.selected===route.id);
   assert.equal(route.distance,0,'Voyage waypoint must use world position');
   assert.equal(route.save,before.profile,'Selecting a marker cannot write a save');
   await page.screenshot({path:path.join('port-artifacts','mare-negra-3-4b-'+label+'-waypoint.png'),fullPage:true});
   // All touches on the overlay should be consumed and close it.
   const tap=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const was=s.atlasOpen,clicked=s.handleCaptainPointer(106,702);
    return {was,clicked,open:s.atlasOpen};
   });
   assert(tap.was&&tap.clicked&&!tap.open);
   const navHUD=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     s.updateHUD();
     return {waypoint:s.chartWaypointId,nav:SEA_ATLAS.navigation(s),
       hud:s.hudConditions.text,
       profile:localStorage.getItem('carcaca.mar-de-sangue.v4')};
   });
   assert.equal(navHUD.waypoint,route.id,'Waypoint must survive closing the map');
   assert(navHUD.hud.includes('DESTINO'),'HUD should keep bearing while sailing');
   assert.equal(navHUD.profile,before.profile,'HUD should not modify stored progress');
   assert(!errors.length,label+' JS runtime errors '+errors.join(' | '));
   console.log('PASS 3.4 Atlas '+label,{hidden:before.total-before.count,after:discovered.kind});
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
