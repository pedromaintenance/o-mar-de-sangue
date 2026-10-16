/* Browser QA: combat pause + island choices with Maré Negra overlays.
 * Run after launching a server at :8765, with playwright-core + Chrome.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const binary=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium']
   .find(p=>fs.existsSync(p));
 if(!binary)throw Error('Chromium required: visual QA cannot be skipped');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:binary,
  args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  for(const [label,width,height,isMobile] of [
    ['desktop',1280,720,false],['mobile',390,844,true]]){
   const page=await browser.newPage({
    viewport:{width,height},isMobile,deviceScaleFactor:1
   });
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.locator('#sea-port-ui').waitFor({state:'detached',timeout:20000});
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
     !!game.scene.getScene('Game').player,{timeout:20000});
   const pause=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    s.toggleCaptainMenu();
    return {paused:s.pausedByCaptain,options:s.pausePadOptions?.length,
      focused:s.pausePadIndex,depth:s.pauseElements?.depth};
   });
   assert.equal(pause.paused,true);
   assert.equal(pause.options,3);
   assert.equal(pause.focused,0);
   await page.screenshot({path:path.join('port-artifacts',
     'mare-negra-3-1-'+label+'-pause.png'),fullPage:true});
   const focus=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    s.setPausePadFocus(2);
    const selected=s.pausePadIndex;
    s.toggleCaptainMenu();
    return {selected,closed:!s.pausedByCaptain,removed:s.pauseElements===null};
   });
   assert.equal(focus.selected,2);
   assert.equal(focus.closed,true);
   assert.equal(focus.removed,true);
   const island=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    s.islandSelected={kind:'reef',id:'qa-reef'};
    s.islandChoiceIndex=0;s.islandOutcome='';s.islandError='';
    SEA_ISLANDS.render(s);
    return {count:s.islandOptions.length,depth:s.islandOverlay.depth};
   });
   assert.equal(island.count,4);
   await page.screenshot({path:path.join('port-artifacts',
     'mare-negra-3-1-'+label+'-island.png'),fullPage:true});
   const outcome=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    s.islandOutcome='As águas exigiram seu preço.';
    SEA_ISLANDS.render(s);
    return s.islandOptions.length;
   });
   assert.equal(outcome,1);
   await page.screenshot({path:path.join('port-artifacts',
     'mare-negra-3-1-'+label+'-island-result.png'),fullPage:true});
   if(errors.length)throw Error(label+': '+errors.join(' | '));
   console.log('PASS Maré Negra pause/island visual '+label,pause,island);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
