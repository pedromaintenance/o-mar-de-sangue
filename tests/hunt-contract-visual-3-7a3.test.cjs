/* 3.7a.3 — real Phaser/Port/Island/Atlas hunt walkthrough, 3 viewport sizes. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const exe=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!exe)throw Error('Chromium is required');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:exe,
   args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  for(const [tag,width,height,isMobile] of [
   ['hunt-wide',1600,900,false],['hunt-desktop',1280,720,false],['hunt-mobile',390,844,true]]){
   const page=await browser.newPage({viewport:{width,height},isMobile,hasTouch:isMobile,
     deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('[data-action="contracts"]').waitFor({timeout:40000});
   await page.locator('[data-action="contracts"]').click();
   await page.locator('#port-contract-title').waitFor();
   assert((await page.locator('#port-main').innerText()).includes('A CAÇADA DOS CONDENADOS'));
   assert.equal(await page.locator('[data-action="contract:hunt"]').count(),1);
   const board=await page.evaluate(()=>({
     width:document.querySelector('#sea-port-ui').clientWidth,
     scroll:document.querySelector('#sea-port-ui').scrollWidth}));
   assert(board.scroll<=board.width+2,tag+': contracts board horizontal overflow');
   await page.screenshot({path:path.join('port-artifacts',tag+'-contract-board.png'),fullPage:true});
   await page.locator('[data-action="contract:hunt"]').click();
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
     game.scene.getScene('Game').contract?.id==='hunt',{timeout:25000});
   const before=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     return {phase:s.contract.phase,known:[...s.chartDiscovered],
       clue:s.contract.clueId,marked:s.chartWaypointId,
       prey:SEA_CONTRACTS.hunted(s),mode:s.mode,version:SeaProfile.load().version};
   });
   assert.equal(before.phase,'clue');assert.equal(before.mode,'sandbox');
   assert.equal(before.version,4);assert.deepEqual(before.known,[before.clue]);
   assert.equal(before.marked,before.clue);assert.equal(before.prey,null);
   const after=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     // Clear normal mobs, to reproduce a safe dock after combat.
     for(const e of s.enemies)e.dead=true;
     const clue=s.islands.find(i=>i.id===s.contract.clueId);
     s.player.setPosition(clue.x+clue.radius+s.hullRadius+45,clue.y);
     s.playerVelocity.x=s.playerVelocity.y=0;
     s.islandVisits.add(clue.id); // contract clue cannot be blocked by earlier visit.
     const docked=SEA_ISLANDS.tryDock(s);
     const available=s.islandOptions.length;
     SEA_ISLANDS.select(s);
     const target=SEA_CONTRACTS.hunted(s);
     return {docked,available,phase:s.contract.phase,prey:!!target,
       bounty:s.contract.bounty,deadline:s.contract.escapeAt,
       objective:s.objectiveText(),known:[...s.chartDiscovered],
       marked:s.chartWaypointId,preyId:s.contract.targetEnemyId,
       present:s.enemies.filter(e=>e.huntTarget).length};
   });
   assert(after.docked&&after.available>=2);
   assert.equal(after.phase,'chase');assert(after.prey);
   assert.equal(after.present,1);assert.equal(after.bounty,240);
   assert(after.known.includes(before.clue),'clue remains charted');
   // Navigation naturally discovers nearby islands; the contract cannot
   // disclose any remote island beyond the ship radar's ordinary reach.
   const fair=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     return [...s.chartDiscovered].every(id=>{
       const island=s.islands.find(i=>i.id===id);
       return id===s.contract.clueId ||
         Math.hypot(island.x-s.player.x,island.y-s.player.y)<=s.shipStats.radar+island.radius;
     });
   });
   assert(fair,'contract must not expose distant islands');
   assert.equal(after.marked,null);
   assert(after.objective.includes('PARA FUGA'));
   const chart=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     SEA_ISLANDS.close(s);
     const opened=SEA_ATLAS.toggle(s);
     const prey=SEA_CONTRACTS.hunted(s);
     const chartText=s.atlasElements?.list?.filter(x=>typeof x.text==='string')
       .map(x=>x.text).join('\n')||'';
     return {opened,marked:chartText.includes('PRESA MARCADA'),
       prey:!!prey,known:[...s.chartDiscovered],atlas:s.atlasOpen};
   });
   assert(chart.opened&&chart.atlas&&chart.marked&&chart.prey);
   assert(chart.known.includes(before.clue),'the clue is still on the map');
   await page.screenshot({path:path.join('port-artifacts',tag+'-moving-prey-chart.png'),fullPage:true});
   const done=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     SEA_ATLAS.close(s);
     const e=SEA_CONTRACTS.hunted(s);
     s.sinkEnemy(e,false);
     return {mode:s.mode,stage:s.stage,finished:s.contract.completed,
       bounty:s.contract.bounty,version:SeaProfile.load().version};
   });
   assert(done.finished&&done.bounty===240&&done.version===4);
   await page.locator('#sea-port-ui .port-page--result').waitFor({timeout:20000});
   const outcome=await page.locator('#sea-port-ui .port-page--result').innerText();
   assert(outcome.includes('CAÇADA CONCLUÍDA')&&outcome.includes('ALVO ABATIDO')&&
     outcome.includes('240'),tag+': explicit hunt-specific results');
   assert.equal(errors.length,0,tag+': '+JSON.stringify(errors));
   console.log('PASS 3.7a.3: '+tag+' contract, clue, marker and victory');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
