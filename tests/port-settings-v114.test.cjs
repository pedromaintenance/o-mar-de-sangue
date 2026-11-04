/* V114 — Settings consolidates Port controls without losing gameplay or save behavior. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright-core');
(async()=>{
 const binary=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!binary)throw Error('Chrome required for V114 Settings QA');
 const browser=await chromium.launch({headless:true,executablePath:binary,
  args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  for(const v of [
    {name:'desktop-1280',width:1280,height:720,mobile:false},
    {name:'phone-390',width:390,height:844,mobile:true},
    {name:'phone-320',width:320,height:640,mobile:true},
    {name:'landscape-844',width:844,height:390,mobile:true}
  ]){
   const page=await browser.newPage({viewport:{width:v.width,height:v.height},isMobile:v.mobile,
     hasTouch:v.mobile,deviceScaleFactor:1,acceptDownloads:true});
   const errors=[];page.on('pageerror',x=>errors.push(String(x)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('.port-hero').waitFor({timeout:45000});
   const before=await page.evaluate(()=>JSON.stringify(SeaProfile.load()));
   const controls=['volume:down','volume:up','fx-volume:down','fx-volume:up','mute','import',
     'readability','performance','export-fps','compare-fps','export-backup','restore-file','reset'];
   const home=await page.evaluate(()=>{
     const ui=document.querySelector('#sea-port-ui');
     return {overflow:ui.scrollWidth-ui.clientWidth,buttons:[...ui.querySelectorAll('.port-top button')].map(x=>x.dataset.action),
       footer:[...ui.querySelectorAll('.port-footer button')].map(x=>x.dataset.action),
       total:ui.scrollHeight,viewport:ui.clientHeight};
   });
   assert(home.overflow<=2,v.name+' homepage horizontal overflow');
   assert(home.buttons.includes('settings'),'settings in main header');
   assert.deepEqual(home.footer,[],'footer should not contain action buttons');
   for(const action of controls)assert.equal(await page.locator('button[data-action="'+action+'"]').count(),0,
     v.name+': '+action+' leaked into home menu');
   if(v.mobile&&v.height>v.width)assert(home.total<=home.viewport+4,'home must fit portrait viewport');
   await page.locator('button[data-action="settings"]').click();
   await page.locator('.port-settings').waitFor({timeout:15000});
   assert.equal(await page.locator('.port-settings__card').count(),4);
   for(const action of controls)assert.equal(await page.locator('button[data-action="'+action+'"]').count(),1,
     v.name+': missing '+action);
   assert.equal(await page.locator('button[data-action="settings"]').count(),0);
   const geometry=await page.evaluate(()=>{
     const root=document.querySelector('#sea-port-ui');
     const all=[...root.querySelectorAll('.port-settings button:not(:disabled),.port-mini:not(:disabled)')];
     const undersized=all.filter(x=>x.getBoundingClientRect().height<43.5).map(x=>({
       a:x.dataset.action,h:x.getBoundingClientRect().height}));
     return {overflow:root.scrollWidth-root.clientWidth,undersized};
   });
   assert(geometry.overflow<=2,v.name+' settings horizontal overflow');
   if(v.mobile)assert.deepEqual(geometry.undersized,[],v.name+' undersized controls');
   const level=await page.evaluate(()=>({music:SEA_MUSIC.volume,fx:SEA_AUDIO.effectsVolume}));
   await page.locator('[data-action="volume:up"]').click();
   await page.locator('[data-action="fx-volume:down"]').click();
   const after=await page.evaluate(()=>({music:SEA_MUSIC.volume,fx:SEA_AUDIO.effectsVolume}));
   assert(after.music>level.music);
   assert(after.fx<level.fx);
   assert.equal(await page.locator('.port-settings').count(),1,'volume actions should not leave Settings');
   await page.locator('[data-action="readability"]').click();
   assert.equal(await page.locator('[data-action="readability"]').getAttribute('aria-pressed'),'true');
   await page.locator('[data-action="readability"]').click();
   assert.equal(await page.locator('[data-action="readability"]').getAttribute('aria-pressed'),'false');
   await page.locator('[data-action="performance"]').click();
   assert.equal(await page.locator('[data-action="performance"]').getAttribute('aria-pressed'),'true');
   await page.locator('[data-action="performance"]').click();
   assert.equal(await page.locator('[data-action="performance"]').getAttribute('aria-pressed'),'false');
   const [download]=await Promise.all([
     page.waitForEvent('download',{timeout:15000}),
     page.locator('[data-action="export-backup"]').click()
   ]);
   assert(download.suggestedFilename().startsWith('mar-de-sangue-save-v4-'));
   assert.equal(await page.evaluate(()=>JSON.stringify(SeaProfile.load())),before,'save remains unchanged');
   await page.locator('[data-action="reset"]').click();
   await page.locator('.port-warning [data-action="reset-confirm"]').waitFor({timeout:12000});
   assert.equal(await page.evaluate(()=>JSON.stringify(SeaProfile.load())),before,'reset cannot run before confirmation');
   await page.keyboard.press('Escape');
   await page.locator('.port-hero').waitFor({timeout:15000});
   await page.locator('[data-action="settings"]').click();
   await page.locator('.port-settings').waitFor();
   await page.evaluate(()=>{const previous=SEA_GAMEPAD.poll;SEA_GAMEPAD.poll=()=>({connected:true,just:{1:true}});
     try{SEA_PORT_UI.update(99999)}finally{SEA_GAMEPAD.poll=previous}});
   await page.locator('.port-hero').waitFor({timeout:15000});
   assert.equal(await page.evaluate(()=>JSON.stringify(SeaProfile.load())),before,'controller return preserves save');
   assert.deepEqual(errors,[],v.name+' JavaScript errors');
   console.log('PASS V114 '+v.name+': controls consolidated, focus, audio, save and reset safety');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
