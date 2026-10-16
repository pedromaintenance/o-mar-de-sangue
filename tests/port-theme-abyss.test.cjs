/* The Maré Negra skin is the official default presentation, not a parallel game UI.
 * Run with a local server on port 8765 and playwright-core installed.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
  '/usr/bin/chromium'].find(f=>fs.existsSync(f));
 if(!executablePath)throw Error('Chromium/Chrome required for visual QA');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath,
  args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  for(const [name,width,height,isMobile] of [
   ['wide-1600',1600,900,false],['desktop-1280',1280,720,false],
   ['phone-390',390,844,true]]){
   const page=await browser.newPage({viewport:{width,height},isMobile,deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/?theme=classic',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui .port-hero').waitFor({timeout:40000});
   const original=await page.locator('.port-ui').evaluate(el=>getComputedStyle(el).backgroundColor);
   const oldButtons=await page.locator('#port-main button[data-action]').count();
   assert(!await page.locator('html').evaluate(el=>el.classList.contains('theme-mare-negra')),
    'Only ?theme=classic should render the old skin');
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui .port-hero').waitFor({timeout:40000});
   assert(await page.locator('html').evaluate(el=>el.classList.contains('theme-mare-negra')),
    'The normal game URL must activate Maré Negra by default');
   const dark=await page.locator('.port-ui').evaluate(el=>getComputedStyle(el).backgroundColor);
   assert.notEqual(dark,original,'Default Maré Negra skin not visually independent from classic');
   assert.equal(await page.locator('#port-main button[data-action]').count(),oldButtons,
    'Default skin must not replace or remove the original actions');
   // The old preview URL remains a valid alias for the new default.
   await page.goto('http://127.0.0.1:8765/?theme=abyss',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui .port-hero').waitFor({timeout:40000});
   assert(await page.locator('html').evaluate(el=>el.classList.contains('theme-mare-negra')),
    'The old preview URL must continue to activate Maré Negra');
   const geometry=await page.evaluate(()=>{
    const el=document.querySelector('#sea-port-ui');
    return {scroll:el.scrollWidth,client:el.clientWidth};
   });
   assert(geometry.scroll<=geometry.client+2,'Horizontal overflow '+name+' '+JSON.stringify(geometry));
   await page.screenshot({path:path.join('port-artifacts','mare-negra-'+name+'-menu.png'),fullPage:true});
   const focused=()=>page.evaluate(()=>document.activeElement?.dataset?.action);
   assert.equal(await focused(),'mission');
   if(isMobile){
    await page.keyboard.press('ArrowDown');assert.equal(await focused(),'sandbox');
   }else{
    await page.keyboard.press('ArrowRight');assert.equal(await focused(),'sandbox');
    await page.keyboard.press('ArrowDown');assert.equal(await focused(),'help');
   }
   await page.locator('[data-action="yard:armas"]').click();
   await page.locator('.port-upgrades').waitFor();
   assert.equal(await page.locator('.port-tabs button[data-nav="pointer"]').count(),4,
    'Yard tabs must remain pointer-only in all skins');
   assert.equal(await page.locator('.port-tabs .is-controller-focused').count(),0);
   await page.screenshot({path:path.join('port-artifacts','mare-negra-'+name+'-yard.png'),fullPage:true});
   await page.keyboard.press('e');
   await page.waitForFunction(()=>document.querySelector('.port-tabs .is-active')?.dataset.action==='yard:apoio');
   assert.equal(await page.locator('.port-tabs .is-controller-focused').count(),0);
   await page.keyboard.press('q');
   await page.waitForFunction(()=>document.querySelector('.port-tabs .is-active')?.dataset.action==='yard:armas');
   // Return via the real Gamepad B action, not by clicking a fake link.
   await page.evaluate(()=>{
    const old=SEA_GAMEPAD.poll;
    SEA_GAMEPAD.poll=()=>({connected:true,just:{1:true}});
    try{SEA_PORT_UI.update(500);}finally{SEA_GAMEPAD.poll=old;}
   });
   await page.locator('.port-hero').waitFor();
   // The displayed visual skin must NOT leak to the combat scene.
   await page.locator('[data-action="mission"]').click();
   await page.locator('#sea-port-ui').waitFor({state:'detached',timeout:15000});
   const combatVisible=await page.locator('#game-container').evaluate(el=>
    getComputedStyle(el).visibility!=='hidden');
   assert(combatVisible,'Combat canvas stays hidden after port leaves');
   if(errors.length)throw Error(name+' JS page errors: '+errors.join(' | '));
   console.log('PASS dark skin '+name,{original,dark,oldButtons});
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
