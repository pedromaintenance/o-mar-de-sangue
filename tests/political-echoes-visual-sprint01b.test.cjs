/* Sprint 01b: real Phaser political consequences in Chromium.
 * Covers three branching threads on desktop and mobile landscape.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const exe=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
  '/usr/bin/chromium'].find(fs.existsSync);
 if(!exe)throw Error('Chromium required for real visual QA');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:exe,
  args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  for(const [label,width,height,mobile] of [
   ['desktop',1600,900,false],['compact',1280,720,false],
   ['android-landscape',844,390,true]]){
   const page=await browser.newPage({viewport:{width,height},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,
    userAgent:mobile?'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36':undefined});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
     !!game.scene.getScene('Game').player,{timeout:25000});
   for(const [source,choiceIndex,echoIndex] of [
    ['refugees',1,0],['convoy',1,0],['ritual',2,1]]){
    const result=await page.evaluate(({source,choiceIndex})=>{
     const s=game.scene.getScene('Game');
     const origin=s.islands.find(x=>x.politicalEventId===source);
     if(!origin)throw Error('Original encounter absent: '+source);
     s.touchReset();s.islandDocked=true;s.islandSelected=origin;
     s.islandChoiceIndex=choiceIndex;s.islandOutcome='';s.islandError='';
     const choice=SEA_POLITICAL_EVENTS.events[source].choices[choiceIndex];
     const accepted=SEA_ISLANDS.apply(s,choice);
     if(!accepted)throw Error('Original decision blocked: '+source);
     const site=s.islands.find(x=>x.politicalEcho?.source===source);
     if(!site)throw Error('Political follow-up absent: '+source);
     const visible=s.chartDiscovered.has(site.id);
     SEA_ISLANDS.close(s);
     s.islandDocked=true;s.islandSelected=site;
     s.islandChoiceIndex=0;s.islandOutcome='';s.islandError='';
     SEA_ISLANDS.render(s);
     const labels=s.islandOverlay.list.filter(x=>x.type==='Text').map(x=>x.text);
     return {visible,originId:origin.id,siteId:site.id,
       title:SEA_POLITICAL_EVENTS.encounter(s,site).title,
       options:s.islandOptions.length,labels,
       mapLabel:'ECO POLÍTICO'};
    },{source,choiceIndex});
    assert(result.visible,'the clue must be revealed to the player');
    assert.notEqual(result.siteId,result.originId);
    assert.equal(result.options,3,source+': 2 decisions + return');
    assert(result.labels.includes(result.title));
    assert(result.labels.some(s=>s.includes('QUAL SERÁ A SUA DECISÃO?')));
    await page.screenshot({path:path.join('port-artifacts',
      'sprint01b-'+label+'-'+source+'-echo.png'),fullPage:true});
    const after=await page.evaluate(({echoIndex})=>{
     const s=game.scene.getScene('Game');
     const prior=s.politicalEvents.length;
     s.islandChoiceIndex=echoIndex;SEA_ISLANDS.render(s);
     const choice=SEA_POLITICAL_EVENTS.encounter(s,s.islandSelected).choices[echoIndex];
     const applied=SEA_ISLANDS.apply(s,choice);
     const repeat=SEA_ISLANDS.apply(s,choice);
     const result={applied,repeat,records:s.politicalEvents.length,
       prior,resolved:s.islandSelected.politicalEcho.resolved,
       outcome:s.islandOutcome,options:s.islandOptions.length};
     SEA_ISLANDS.close(s);
     return result;
    },{echoIndex});
    assert(after.applied&&!after.repeat&&after.resolved);
    assert.equal(after.records,after.prior+1);
    assert.equal(after.options,1);
    assert(after.outcome.length>15);
   }
   const diary=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    s.toggleCaptainMenu();
    const labels=s.pauseElements.list.filter(x=>x.type==='Text').map(x=>x.text);
    return {entries:s.politicalEvents.length,labels};
   });
   assert.equal(diary.entries,6,'three decisions and their three consequences');
   assert(diary.labels.some(s=>s.includes('CRÔNICA POLÍTICA · 6 DECISÕES')));
   assert(diary.labels.some(s=>s.includes('CONSEQUÊNCIA:')));
   await page.screenshot({path:path.join('port-artifacts',
     'sprint01b-'+label+'-six-decisions.png'),fullPage:true});
   await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     s.toggleCaptainMenu();
     s.finish(false,true);
   });
   await page.locator('.port-chronicle li').first().waitFor({timeout:15000});
   assert.equal(await page.locator('.port-chronicle li').count(),6,
     'All six choices must survive the return to port as a voyage result');
   assert(await page.locator('.port-chronicle').textContent().then(t=>
     t.includes('CONSEQUÊNCIA')&&t.includes('REFUGIADOS:')),
     'Port needs the first act and the later consequences');
   await page.screenshot({path:path.join('port-artifacts',
     'sprint01b-'+label+'-port-chronicle.png'),fullPage:true});
   if(errors.length)throw Error(label+' Phaser errors: '+errors.join(' | '));
   await page.close();
   console.log('PASS political follow-up Phaser '+label);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
