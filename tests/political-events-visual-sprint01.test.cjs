/* Sprint 01: Phaser browser smoke of political encounters and journal.
 * Uses actual assets, three responsive viewports, existing input surfaces.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
   '/usr/bin/chromium'].find(p=>fs.existsSync(p));
 if(!executablePath)throw Error('Chromium required');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath,
   args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  for(const [label,width,height,isMobile] of [
    ['wide',1600,900,false],['desktop',1280,720,false],
    ['android',390,844,true]]){
   const page=await browser.newPage({
     viewport:{width,height},deviceScaleFactor:1,isMobile,hasTouch:isMobile,
     userAgent:isMobile?
       'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36':
       undefined
   });
   const errors=[];page.on('pageerror',err=>errors.push(String(err)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
     !!game.scene.getScene('Game').player,{timeout:25000});
   const start=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     return {sites:s.islands.filter(x=>x.politicalEventId).map(x=>({
       event:x.politicalEventId,kind:x.kind,id:x.id})),
       save:localStorage.getItem('carcaca.mar-de-sangue.v4')};
   });
   assert.equal(start.sites.length,3,label+': three unique event sites');
   assert.deepEqual(start.sites.map(x=>x.event).sort(),['convoy','refugees','ritual']);
   for(const eventId of ['refugees','convoy','ritual']){
     const before=await page.evaluate(id=>{
       const s=game.scene.getScene('Game');
       const site=s.islands.find(x=>x.politicalEventId===id);
       if(!site)throw Error('Missing political event '+id);
       s.touchReset();s.islandDocked=true;s.islandSelected=site;
       s.islandChoiceIndex=0;s.islandOutcome='';s.islandError='';
       SEA_ISLANDS.render(s);
       return {options:s.islandOptions.length,
         labels:s.islandOverlay.list.filter(x=>x.type==='Text').map(x=>x.text)};
     },eventId);
     assert.equal(before.options,4,label+' '+eventId+': 3 options and safe return');
     assert(before.labels.some(x=>x.includes('QUAL SERÁ A SUA DECISÃO?')));
     assert(before.labels.some(x=>x.startsWith('[')),
       label+' '+eventId+': disclose political beneficiary');
     await page.screenshot({path:path.join('port-artifacts',
       'sprint01-'+label+'-'+eventId+'-choices.png'),fullPage:true});
     const after=await page.evaluate(()=>{
       const s=game.scene.getScene('Game');
       SEA_ISLANDS.select(s);
       const snapshot={records:s.politicalEvents.length,
         visited:s.islandVisits.has(s.islandSelected.id),
         outcome:s.islandOutcome,
         options:s.islandOptions.length};
       SEA_ISLANDS.close(s);
       return snapshot;
     });
     assert(after.visited&&after.outcome.length>10);
     assert.equal(after.options,1);
     assert.equal(after.records,['refugees','convoy','ritual'].indexOf(eventId)+1);
   }
   const end=await page.evaluate(()=>{
     const s=game.scene.getScene('Game');
     s.toggleCaptainMenu();
     return {labels:s.pauseElements.list.filter(x=>x.type==='Text').map(x=>x.text),
       records:s.politicalEvents.length,
       save:localStorage.getItem('carcaca.mar-de-sangue.v4')};
   });
   assert.equal(end.records,3);
   assert(end.labels.some(x=>x.includes('CRÔNICA POLÍTICA · 3 DECISÕES')));
   assert(end.labels.some(x=>x.includes('REFUGIADOS:')));
   assert(end.labels.some(x=>x.includes('CONTRABANDO:')));
   assert(end.labels.some(x=>x.includes('RITUAL KUO-TOA:')));
   assert.equal(end.save,start.save,'Voyage decisions do not write profile');
   await page.screenshot({path:path.join('port-artifacts',
     'sprint01-'+label+'-diario.png'),fullPage:true});
   if(errors.length)throw Error(label+': '+errors.join(' | '));
   console.log('PASS Sprint 01 visual '+label+': 3 encounters, choices, log and save isolation');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
