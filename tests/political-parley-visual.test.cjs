/* Browser QA for Porto 3.3: an actual in-game political encounter.
 * Run after serving this repo on localhost:8765 with Chromium installed.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>fs.existsSync(p));
 if(!executablePath)throw Error('Chromium required');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath,
  args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  for(const [label,width,height,isMobile] of [
   ['wide',1600,900,false],['desktop',1280,720,false],['android',390,844,true]]){
   const mobileAgent='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';
   const page=await browser.newPage({
    viewport:{width,height},deviceScaleFactor:1,isMobile,hasTouch:isMobile,
    userAgent:isMobile?mobileAgent:undefined
   });
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.locator('#sea-port-ui').waitFor({state:'detached',timeout:20000});
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
      !!game.scene.getScene('Game').player,{timeout:20000});
   const neutral=await page.evaluate(()=>{
     const sc=game.scene.getScene('Game');
     sc.toggleCaptainMenu();
     const labels=sc.pauseElements.list.filter(o=>o.type==='Text').map(o=>o.text);
     const options=sc.pausePadOptions.length;
     sc.toggleCaptainMenu();
     return {labels,options};
   });
   assert.equal(neutral.options,3,'Unchanged pause actions before parley');
   assert(neutral.labels.some(t=>t.includes('REGISTRO POLÍTICO · NENHUM ACORDO')));
   assert(!neutral.labels.some(t=>t.includes('NOMES ENTREGUES')),
     'Journal must not spoil the undiscovered parley');
   const before=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const candidates=s.islands.filter(i=>i.kind==='parley');
    if(candidates.length!==1)throw Error('Expected exactly one parley island');
    const spot=candidates[0];
    s.touchReset();s.islandDocked=true;
    s.islandSelected=spot;s.islandChoiceIndex=0;s.islandOutcome='';s.islandError='';
    SEA_ISLANDS.render(s);
    const text=s.islandOverlay.list.filter(v=>v.type==='Text').map(v=>v.text);
    return {id:spot.id,text,options:s.islandOptions.length,
      factions:s.politicalLedger,
      originalSave:localStorage.getItem('carcaca.mar-de-sangue.v4')};
   });
   assert.equal(before.options,4,'3 faction choices + return');
   assert(before.text.some(s=>s.includes('TRÊS BANDEIRAS')));
   assert(before.text.some(s=>s.includes('Portomonte')));
   assert(before.text.some(s=>s.includes('VENDER OS NOMES')));
   assert(before.text.some(s=>s.includes('ABRIGAR OS SOBREVIVENTES')));
   assert(before.text.some(s=>s.includes('PÓLVORA DE DAEGON')));
   assert(before.text.some(s=>s.includes('[SOBREVIVENTES]')),
     'Political choice must disclose beneficiary before it is selected');
   assert(before.text.some(s=>s.includes('[CORTE FEÉRICA]')));
   assert(before.text.some(s=>s.includes('[CULTO DE DAEGON]')));
   await page.screenshot({path:path.join('port-artifacts',
    'mare-negra-3-3-'+label+'-choice.png'),fullPage:true});
   const after=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    s.islandChoiceIndex=1;
    SEA_ISLANDS.render(s);
    const before={gold:s.gold,curse:s.curse};
    const h=s.islandOptions[1].hit;
    SEA_ISLANDS.pointer(s,h.x,h.y);
    return {deltaGold:s.gold-before.gold,
      deltaCurse:s.curse-before.curse,ledger:{...s.politicalLedger},
      outcome:s.islandOutcome,options:s.islandOptions.length,
      visited:s.islandVisits.has(s.islandSelected.id),
      save:localStorage.getItem('carcaca.mar-de-sangue.v4')};
   });
   assert.equal(after.deltaGold,60);
   assert(after.deltaCurse>=0&&after.deltaCurse<=15);
   assert.equal(after.ledger.corte,1);
   assert.equal(after.ledger.culto,0);assert.equal(after.ledger.sobreviventes,0);
   assert.equal(after.options,1);
   assert(after.outcome.includes('agente feérico'));
   assert(after.visited);
   assert.equal(after.save,before.originalSave,'Voyage decision must not mutate persistent saves');
   await page.screenshot({path:path.join('port-artifacts',
    'mare-negra-3-3-'+label+'-result.png'),fullPage:true});
   const result=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');
    const before=s.gold;
    const old=SEA_GAMEPAD.poll;
    SEA_GAMEPAD.poll=()=>({connected:true,just:{1:true}});
    try{s.update(s.time.now,16);}finally{SEA_GAMEPAD.poll=old;}
    return {closed:!s.islandDocked,overlayCleared:!s.islandOverlay,
      goldSame:before===s.gold,
      visited:s.islandVisits.size,choice:s.politicalChoice};
   });
   assert(result.closed&&result.overlayCleared&&result.goldSame);
   assert.equal(result.choice,'tribute');
   const journal=await page.evaluate(()=>{
     const sc=game.scene.getScene('Game');
     const saved=localStorage.getItem('carcaca.mar-de-sangue.v4');
     sc.toggleCaptainMenu();
     const labels=sc.pauseElements.list.filter(o=>o.type==='Text').map(o=>o.text);
     const options=sc.pausePadOptions.length;
     return {labels,options,save:saved,
       choice:sc.politicalChoice,paused:sc.pausedByCaptain};
   });
   assert(journal.paused&&journal.options===3,
     'Captain journal must keep three original actions');
   assert(journal.labels.some(t=>t.includes('NOMES ENTREGUES · CORTE FEÉRICA')));
   assert(journal.labels.some(t=>t.includes('Termos: ouro +60 · maldição +15')));
   assert.equal(journal.choice,'tribute','Diary cannot erase the political decision');
   assert.equal(journal.save,before.originalSave,'Diary must not alter save');
   await page.screenshot({path:path.join('port-artifacts',
      'mare-negra-3-3b0-'+label+'-political-journal.png'),fullPage:true});
   await page.evaluate(()=>game.scene.getScene('Game').toggleCaptainMenu());
   if(errors.length)throw Error(label+' JS errors: '+errors.join(' | '));
   console.log('PASS political choice '+label,result);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
