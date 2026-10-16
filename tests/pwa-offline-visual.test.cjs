/* 3.6a browser regression: install PWA, cut network and play from precache.
 * Requires local HTTP server on 127.0.0.1:8765 and Chrome/Chromium.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const exe=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium']
   .find(p=>fs.existsSync(p));
 if(!exe)throw Error('Chromium obrigatório para QA offline');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:exe,
   args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
   for(const [label,width,height,mobile] of [
     ['desktop',1280,720,false],['android',390,844,true]]){
     const context=await browser.newContext({viewport:{width,height},isMobile:mobile,
       hasTouch:mobile,serviceWorkers:'allow'});
     const page=await context.newPage();const errors=[];
     page.on('pageerror',e=>errors.push(e.message));
     await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
     await page.locator('#sea-port-ui .port-hero').waitFor({timeout:45000});
     // A broken precache previously left this promise pending forever.
     // Fail explicitly instead of locking the visual CI runner indefinitely.
     await page.evaluate(()=>Promise.race([
       navigator.serviceWorker.ready,
       new Promise((_,reject)=>setTimeout(
         ()=>reject(new Error('Service worker não ativou em 30s; verificar precache')),30000))
     ]));
     await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:60000});
     const online=await page.evaluate(()=>{
        const profile=SeaProfile.load();
        profile.gold=743;profile.mission=3;profile.bestWave=8;
        SeaProfile.store(profile);
        return {profile:localStorage.getItem('carcaca.mar-de-sangue.v4'),
          cache:Promise.resolve()};
     });
     const initial=await page.evaluate(()=>localStorage.getItem('carcaca.mar-de-sangue.v4'));
     assert(initial?.includes('"gold":743'),'Save must exist before disconnecting');
     const cached=await page.evaluate(async()=>{
       const keys=await caches.keys();
       const name=keys.find(k=>k.includes('v42-offline-20261016'));
       if(!name)return null;
       const cache=await caches.open(name);
       return {name,html:!!(await cache.match('./index.html')),
         script:!!(await cache.match('./PwaStatus.js')),
         engine:!!(await cache.match('./Game.js'))};
     });
     assert(cached?.html&&cached?.script&&cached?.engine,
       'Full app should be available before offline navigation');
     await context.setOffline(true);
     await page.reload({waitUntil:'domcontentloaded',timeout:45000});
     await page.locator('#sea-port-ui .port-hero').waitFor({timeout:45000});
     const offline=await page.evaluate(()=>({
       online:navigator.onLine,
       text:document.getElementById('pwa-offline').textContent,
       label:document.getElementById('pwa-offline').hidden,
       banner:document.getElementById('pwa-status').hidden,
       profile:localStorage.getItem('carcaca.mar-de-sangue.v4'),
       gold:SeaProfile.load().gold
     }));
     assert.equal(offline.online,false,label+': navigator should be offline');
     assert(!offline.banner&&!offline.label&&offline.text.includes('OFFLINE'),
       label+': offline ribbon must be visible');
     assert.equal(offline.profile,initial,'Offline reload must preserve the entire save');
     assert.equal(offline.gold,743);
     await page.screenshot({path:path.join('port-artifacts',
       'mare-negra-3-6a-'+label+'-offline.png'),fullPage:true});
     await page.locator('[data-action="mission"]').click();
     await page.waitForFunction(()=>game.scene.isActive('Game') &&
       !!game.scene.getScene('Game').player,{timeout:30000});
     assert.equal(await page.evaluate(()=>SeaProfile.load().gold),743,
       'Offline voyage must keep saved gold');
     await context.setOffline(false);
     await page.waitForFunction(()=>navigator.onLine===true,{timeout:10000});
     const restored=await page.evaluate(()=>({
       banner:document.getElementById('pwa-status').hidden,
       save:localStorage.getItem('carcaca.mar-de-sangue.v4')
     }));
     assert.equal(restored.save,initial);
     assert.equal(restored.banner,true,'Online recovery clears the offline notice');
     // Simulate a *subsequent* worker takeover on a controlled page.
     await page.evaluate(()=>navigator.serviceWorker.dispatchEvent(
       new Event('controllerchange')));
     assert(await page.locator('#pwa-update').isVisible(),
       'Manual reload must be offered after new worker takeover');
     assert.equal(await page.evaluate(()=>game.scene.isActive('Game')),true,
       'Worker takeover must not forcibly reload an active voyage');
     if(errors.length)throw Error(label+' JS errors: '+errors.join(' | '));
     console.log('PASS PWA 3.6a offline '+label,cached.name);
     await context.close();
   }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
