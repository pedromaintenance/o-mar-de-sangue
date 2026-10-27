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
   const mobileUserAgent='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';
   const page=await browser.newPage({
     viewport:{width,height},deviceScaleFactor:1,isMobile,
     hasTouch:isMobile,userAgent:isMobile?mobileUserAgent:undefined
   });
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.locator('#sea-port-ui').waitFor({state:'detached',timeout:20000});
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
     !!game.scene.getScene('Game').player,{timeout:20000});
   const mode=await page.evaluate(()=>SEA_DESKTOP);
   assert.equal(mode,true,label+': 26/10 unified landscape canvas must be 1280x720 on all devices');
   // 3.8a.4 — the PNG used by the actual monster was cleaned, not
   // replaced by the lower-resolution legacy Coral Horror placeholder.
   const coral=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     const enemy=s.spawnEnemy('coral',480);
     if(!enemy)throw Error('Could not spawn Coral Horror for visual test');
     enemy.x=s.player.x+240;enemy.y=s.player.y+10;
     enemy.ship.setPosition(enemy.x,enemy.y);
     const img=s.textures.get('coral-animated').getSourceImage();
     return {texture:enemy.ship.texture.key,width:img.width,height:img.height,
       frameWidth:enemy.ship.frame.width,frameHeight:enemy.ship.frame.height,
       radius:enemy.radius,displayHeight:enemy.ship.displayHeight,id:enemy.id};
   });
   assert.equal(coral.texture,'coral-animated',label+': load the new Coral submerso sheet');
   assert.equal(coral.width,2048);
   assert.equal(coral.frameWidth,512);
   assert.equal(coral.frameHeight,644);
   assert.equal(coral.height,644,label+': the new four-frame sheet must load');
   assert.equal(coral.radius,76,label+': unchanged monster collision geometry');
   assert(Math.abs(coral.displayHeight-76*2.25)<2,
     label+': sprite stays scaled to its original collision radius');
   await page.screenshot({path:path.join('port-artifacts',
     label+'-coral-horror-clean-3-8a4.png'),fullPage:true});
   await page.evaluate(id=>{
     const s=game.scene.getScene('Game');
     const enemy=s.enemies.find(e=>e.id===id);
     if(enemy){
       enemy.dead=true;enemy.ship?.destroy();enemy.wake?.destroy();
       enemy.bar?.destroy();enemy.label?.destroy();
     }
   },coral.id);
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
   // 3.8b: touch target and keyboard/gamepad burst in the real Phaser scene.
   const dash=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     const hit=s.impulseButtonHitbox;
     s.scene.pause();
     s.elapsed=0;s.lastImpulseAt=-1000;s.impulseRemaining=0;
     s.keys.R.isDown=false;s.impulseKeyHeld=false;
     s.profile.levels.impulso=0;
     const start=s.handleCaptainPointer(hit.x,hit.y);
     const fired=s.updateImpulse(.016,{just:{}});
     const velocity=Math.hypot(s.playerVelocity.x,s.playerVelocity.y);
     const cap=s.shipStats.maxSpeed*SEA_IMPULSE.speedFactor(s.impulseRemaining);
     s.updateHUD();
     const labelAtBurst=s.impulseButtonText.text;
     s.elapsed=9.8;
     const tooSoon=s.updateImpulse(.05,{just:{2:true}});
     s.elapsed=10;
     const padFired=s.updateImpulse(.05,{just:{2:true}});
     s.impulseRemaining=0;
     s.scene.resume();
     return {hit,start,fired,velocity,cap,labelAtBurst,tooSoon,padFired,
       cooldown:SEA_IMPULSE.cooldown(0)};
   });
   assert(dash.hit&&dash.hit.x===1104&&
     dash.hit.y===630&&dash.start&&dash.fired&&
     dash.velocity>0&&dash.velocity<=dash.cap+1&&
     dash.labelAtBurst.includes('ARRANCADA')&&!dash.tooSoon&&
     dash.padFired&&dash.cooldown===10,
     label+': one impulse per tap, no cooldown bypass '+JSON.stringify(dash));
   await page.screenshot({path:path.join('port-artifacts',
     label+'-naval-impulse-3-8b.png'),fullPage:true});
   // Reset the test's temporary impulse state before the cannon regression.
   await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     s.impulseRemaining=0;s.lastImpulseAt=-1000;s.elapsed=0;
     s.playerVelocity.x=0;s.playerVelocity.y=0;
   });
   // 3.8a: hold a cannon input in a running Phaser scene, then observe
   // the charging meter and first volley. No instant-fire on touchstart.
   const fireStart=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     for(const e of s.enemies)e.dead=true;
     s.scene.pause();
     s.cannonPointers.set('qa-port','port');
     const result={shot:s.lastPortShot,at:s.time.now,
       ms:SEA_GUNNERY.chargeMs(s.profile.levels.cadencia)};
     // The CI browser may render 4 FPS in software: a wall-clock sleep
     // does NOT imply 600ms of Phaser updates. Drive 12 real-sized frames.
     for(let i=0;i<12;i++){s.time.now+=50;s.updateCannonCharge(.05,{});}
     s.updateHUD();
     return result;
   });
   assert.equal(fireStart.ms,2000,label+': level zero should start at 2 seconds');
   const half=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     const left=s.chargeSparkSprites?.port,right=s.chargeSparkSprites?.starboard;
     return {charge:s.cannonCharge.port,portShot:s.lastPortShot,
       otherCharge:s.cannonCharge.starboard,bracing:s.cannonBracing,
       speedCap:SEA_GUNNERY.brace(s.cannonBracing).speed,
       spark:{left:left?.visible,frame:left?.frame?.name||left?.frame?.index,
         right:right?.visible,count:s.playerVisual.list.filter(o=>
           o.texture?.key==='fx-cannon-charge').length,
         blend:left?.blendMode,expectedBlend:Phaser.BlendModes.ADD,
         scale:left?.scaleX,alpha:left?.alpha,
         sourceWidth:s.textures.get('fx-cannon-charge').getSourceImage().width}};
   });
   assert(half.charge>200&&half.charge<1900&&
     half.portShot===fireStart.shot&&half.otherCharge===0&&
     half.bracing===1&&half.speedCap===.60&&
     half.spark?.left===true&&half.spark?.right===false&&
     half.spark.count===2&&Number(half.spark.frame)>=0&&
     half.spark.blend===half.spark.expectedBlend&&
     half.spark.scale>.75&&half.spark.alpha>.85&&
     half.spark.sourceWidth===480,
     label+': the first shot needs a held charge '+JSON.stringify(half));
   await page.screenshot({path:path.join('port-artifacts',
     'gunnery-3-8a-'+label+'-windup.png'),fullPage:true});
   const volley=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     for(let i=0;i<32;i++){s.time.now+=50;s.updateCannonCharge(.05,{});}
     const firstShot=s.lastPortShot;
     const kick=s.recoilVisual, kickVelocity=s.playerVelocity.x;
     s.animateWorldVisuals(.05);
     const hullLean=s.playerVisual.x;
     // A 10-second continuous hold must NOT produce another salvo, even
     // when the ship has completed its cooldown.
     for(let i=0;i<200;i++){s.time.now+=50;s.updateCannonCharge(.05,{});}
     const heldShot=s.lastPortShot,heldCharge=s.cannonCharge.port,
       heldLocked=s.cannonNeedsRelease.port;
     s.cannonPointers.delete('qa-port');s.updateCannonCharge(.01,{});
     const emberGone=!s.chargeSparkSprites.port.visible;
     // The second side stays hidden throughout a port-only volley.
     const starboardHidden=!s.chargeSparkSprites.starboard.visible;
     s.cannonPointers.set('qa-port-new','port');
     for(let i=0;i<40;i++){s.time.now+=50;s.updateCannonCharge(.05,{});}
     const shotAfterRepress=s.lastPortShot;
     s.cannonPointers.delete('qa-port-new');s.updateCannonCharge(.01,{});
     s.scene.resume();
     return {shot:firstShot,heldShot,heldCharge,heldLocked,
       shotAfterRepress,starboardShot:s.lastStarboardShot,
       kick,kickVelocity,hullLean,emberGone,starboardHidden,
       charge:s.cannonCharge.port,v:{x:s.playerVelocity.x,y:s.playerVelocity.y}};
   });
   assert(volley.shot>fireStart.shot&&volley.heldShot===volley.shot&&
     volley.heldCharge===0&&volley.heldLocked===true&&
     volley.shotAfterRepress>volley.shot&&
     volley.starboardShot===-1000&&volley.charge===0&&
     volley.emberGone===true&&volley.starboardHidden===true,
     label+': one salvo per hold and release-to-rearm, independent port broadside '+
       JSON.stringify(volley));
   assert(Math.hypot(volley.v.x,volley.v.y)>0&&
     Math.abs(volley.kickVelocity)>40&&volley.kick>8&&volley.hullLean>7,
     label+': recoil should be physically and visually noticeable '+JSON.stringify(volley));
   assert(before.quest.length>0&&before.badge.includes('MALDIÇÃO'));
   assert.deepEqual(before.pause,{x:454,y:78,w:120,h:40});
   assert.equal(before.x,1154);assert.equal(before.y,239);
   assert.deepEqual(before.touch?.joystick,{x:140,y:576,radius:94});
   assert.deepEqual(before.touch?.port,{x:1051,y:548,radius:48});
   assert.deepEqual(before.touch?.starboard,{x:1158,y:548,radius:48});
   // 3.6k: validate deterministic sea cache inside a real running Phaser
   // scene and prove that same-tick draws make no redundant hash calls.
   const pixelCacheTest=await page.evaluate(()=>{
     const scene=game.scene.getScene('Game'),pixel=SEA_PIXEL;
     const original=pixel.hash;
     let calls=0;
     pixel.hash=function(...args){calls++;return original.apply(this,args);};
     const saved=localStorage.getItem('carcaca.mar-de-sangue.v4');
     try{
       scene.seaPixelFrameCache=null;
       pixel.seaFrame(scene,10.10);
       const initial=calls,cache=scene.seaPixelFrameCache;
       calls=0;
       pixel.seaFrame(scene,10.11);
       const stable=calls;
       calls=0;
       pixel.seaFrame(scene,10.90);
       const changed=calls;
       return {initial,stable,changed,points:cache.points.length,
         accents:cache.accents.length,
         sameCache:scene.seaPixelFrameCache===cache,
         unchangedSave:saved===localStorage.getItem('carcaca.mar-de-sangue.v4')};
     }finally{
       pixel.hash=original;
       pixel.seaFrame(scene,scene.seaPixelT);
     }
   });
   const pointCount=190; // SEA_DESKTOP remains true in unified landscape mode
   assert.equal(pixelCacheTest.initial,3*pointCount+22);
   assert.equal(pixelCacheTest.stable,0);
   assert.equal(pixelCacheTest.changed,pointCount);
   assert.equal(pixelCacheTest.points,pointCount);
   assert.equal(pixelCacheTest.accents,11);
   assert(pixelCacheTest.sameCache&&pixelCacheTest.unchangedSave);
   // 3.6g diagnostics: actual Game scene, keyboard F3 and touch-safe location.
   const profileBeforePerf=await page.evaluate(()=>
     localStorage.getItem('carcaca.mar-de-sangue.v4'));
   assert.equal(await page.evaluate(()=>SEA_PERFORMANCE.enabled),false);
   await page.keyboard.press('F3');
   await page.waitForFunction(()=>SEA_PERFORMANCE.enabled,{timeout:10000});
   const telemetry=await page.evaluate(()=>{
     const p=SEA_PERFORMANCE,s=game.scene.getScene('Game');
     for(let n=0;n<75;n++)p.sample(16.7);
     const box=p.label?.getBounds?.(),center=p.label;
     return {enabled:p.enabled,text:p.label?.text||'',visible:p.label?.visible,
       report:p.latest,position:{x:center?.x,y:center?.y},
       box:{x:box?.x,y:box?.y,width:box?.width,height:box?.height},
       depth:center?.depth,sceneIsGame:p.scene===s,
       pause:{...s.pauseButtonHitbox},
       save:localStorage.getItem('carcaca.mar-de-sangue.v4'),
       preference:localStorage.getItem('carcaca.mar.performance.visible.v1')};
   });
   assert(telemetry.enabled&&telemetry.visible&&telemetry.sceneIsGame);
   assert(telemetry.report&&telemetry.report.fps>0&&telemetry.report.fps<240);
   assert(telemetry.text.includes('MÉDIA')&&telemetry.text.includes('PICO'));
   assert.equal(telemetry.report.effectBudget?.limit,48,
     label+': FX telemetry must use the real scene budget');
   assert(telemetry.text.includes('FX '),
     label+': enabled telemetry must display the FX budget');
   assert.equal(telemetry.depth,145);
   assert.equal(telemetry.position.x,640);
   assert.equal(telemetry.position.y,683);
   assert(telemetry.box.x>=0&&telemetry.box.x+telemetry.box.width<=1280,
     label+': telemetry outside landscape canvas width');
   assert(telemetry.box.y+telemetry.box.height<=720,
     label+': telemetry outside landscape canvas height');
   assert.equal(telemetry.save,profileBeforePerf);
   assert.equal(telemetry.preference,'1');
   assert.deepEqual(telemetry.pause,{x:454,y:78,w:120,h:40});
   await page.screenshot({path:path.join('port-artifacts',
     'mare-negra-3-6g-'+label+'-fps.png'),fullPage:true});
   await page.keyboard.press('F3');
   await page.waitForFunction(()=>!SEA_PERFORMANCE.enabled,{timeout:10000});
   assert.equal(await page.evaluate(()=>SEA_PERFORMANCE.label?.visible),false);
   assert.equal(await page.evaluate(()=>
     localStorage.getItem('carcaca.mar-de-sangue.v4')),profileBeforePerf);
   await page.screenshot({path:path.join('port-artifacts','mare-negra-3-2-'+label+'-hud.png'),fullPage:true});
   // 3.6j: count *actual Phaser calls* in a live scene. The
   // screenshot stays the same; no touch targets/physics are changed.
   const weatherCache=await page.evaluate(()=>{
     const scene=game.scene.getScene('Game'),w=SEA_WEATHER;
     const keep={event:scene.seaEvent,curse:scene.curse,
       frame:scene.seaWeatherFrame};
     const stats={mist:0,overlay:0,label:0,bar:0,sky:0,pool:0};
     const undo=[];
     function spy(object,method,key){
       const original=object[method];
       object[method]=function(...args){
         stats[key]++;
         return original.apply(this,args);
       };
       undo.push(()=>{object[method]=original;});
     }
     spy(scene.seaMist,'setAlpha','mist');
     spy(scene.seaOverlay,'setFillStyle','overlay');
     spy(scene.seaWeatherLabel,'setText','label');
     spy(scene.seaCurseBar,'clear','bar');
     spy(scene.seaSky,'clear','sky');
     spy(scene.seaPoolArt,'clear','pool');
     try{
       scene.seaEvent='calm';scene.curse=12;
       scene.seaRenderedEvent=null;scene.seaRenderedLabel=null;
       scene.seaRenderedCurseBar=null;scene.seaSkyHasContent=false;
       scene.seaPoolArtActive=false;
       scene.seaWeatherFrame=.13;w.render(scene,.016);
       const afterFirst={...stats};
       for(let i=0;i<80;i++){
         scene.seaWeatherFrame=.13;w.render(scene,.016);
       }
       const afterStable={...stats};
       scene.seaEvent='storm';scene.seaWeatherFrame=.13;
       w.render(scene,.016);
       const afterStorm={...stats};
       scene.seaEvent='calm';scene.seaWeatherFrame=.13;
       w.render(scene,.016);
       return {afterFirst,afterStable,afterStorm,afterCalm:{...stats}};
     }finally{
       for(const restore of undo)restore();
       scene.seaEvent=keep.event;scene.curse=keep.curse;
       scene.seaWeatherFrame=.13;
       scene.seaRenderedEvent=null;scene.seaRenderedLabel=null;
       scene.seaRenderedCurseBar=null;scene.seaSkyHasContent=true;
       w.render(scene,.016);
       scene.seaWeatherFrame=keep.frame;
     }
   });
   assert.deepEqual(weatherCache.afterStable,weatherCache.afterFirst,
      label+': calm weather must not redraw unchanged graphics');
   assert.equal(weatherCache.afterStorm.overlay,weatherCache.afterFirst.overlay+1,
      label+': a weather transition must invalidate the overlay');
   assert.equal(weatherCache.afterStorm.sky,weatherCache.afterFirst.sky+1,
      label+': storm rain must still be drawn');
   assert.equal(weatherCache.afterCalm.sky,weatherCache.afterStorm.sky+1,
      label+': returning to calm must remove rain');
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
   // 3.6h: complete the real voyage and verify the browser downloads a
   // bounded, read-only FPS report without mutating SeaProfile.
   await page.evaluate(()=>{
     const scene=game.scene.getScene('Game');
     SEA_PERFORMANCE.setEnabled(true);
     for(let i=0;i<90;i++)SEA_PERFORMANCE.sample(16.7);
     scene.scene.start('SeaPort',{page:'menu'});
   });
   await page.locator('#sea-port-ui [data-action="export-fps"]').waitFor({timeout:20000});
   assert.equal(await page.locator('[data-action="export-fps"]').isDisabled(),false,
     label+': report must become exportable only after collecting samples');
   const saveBeforeReport=await page.evaluate(()=>
     localStorage.getItem('carcaca.mar-de-sangue.v4'));
   const [reportDownload]=await Promise.all([
      page.waitForEvent('download',{timeout:12000}),
      page.locator('[data-action="export-fps"]').click()
   ]);
   assert(/^mar-de-sangue-fps-\d{4}-\d{2}-\d{2}\.json$/.test(
      reportDownload.suggestedFilename()));
   const metrics=JSON.parse(fs.readFileSync(await reportDownload.path(),'utf8'));
   assert.equal(metrics.format,'mar-de-sangue-performance-report');
   assert.equal(metrics.schema,1);
   assert.equal(metrics.source,'viagem-concluida');
   assert(metrics.samples.length>0&&metrics.samples.length<=180);
   assert(metrics.summary.meanFps>0);
   assert(metrics.summary.worstFrameMs>0);
   assert.equal(metrics.summary.effectBudget?.limit,48);
   assert(metrics.summary.effectBudget.peakActive>=0);
   assert(metrics.summary.effectBudget.atLimitFrames>=0);
   assert(!('profile' in metrics)&&!('player' in metrics),
     'FPS report must not contain personal save data');
   assert.equal(await page.evaluate(()=>
     localStorage.getItem('carcaca.mar-de-sangue.v4')),saveBeforeReport);
   await page.screenshot({path:path.join('port-artifacts',
     'mare-negra-3-6h-'+label+'-fps-export.png'),fullPage:true});
   console.log('PASS Maré Negra HUD '+label,before.hud);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
