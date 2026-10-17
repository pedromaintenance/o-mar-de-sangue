/* Visual QA of the real Phaser game with the rebuilt HTML port.
 * Runs in GitHub Actions (Google Chrome + playwright-core).
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
  const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
    '/usr/bin/chromium'].find(f=>fs.existsSync(f));
  if(!bin)throw Error('Browser não encontrado; não declarar QA visual aprovado.');
  fs.mkdirSync('port-artifacts',{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:bin,
    args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  try{
    for(const [label,width,height,isMobile] of [
      ['desktop-1600',1600,900,false],['desktop-1280',1280,720,false],
      ['mobile-390',390,844,true]
    ]){
      const page=await browser.newPage({viewport:{width,height},isMobile,
        deviceScaleFactor:1});
      const errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
      await page.locator('#sea-port-ui .port-hero').waitFor({timeout:40000});
      await page.screenshot({path:path.join('port-artifacts',label+'-menu.png'),fullPage:true});
      // Real keyboard arrows must follow the layout, not DOM order.
      const focused=()=>page.evaluate(()=>document.activeElement?.dataset?.action);
      assert.equal(await focused(),'mission',label+': initial focus');
      if(isMobile){
        await page.keyboard.press('ArrowDown');
        assert.equal(await focused(),'sandbox',label+': vertical mobile focus');
        await page.keyboard.press('ArrowUp');
        assert.equal(await focused(),'mission',label+': vertical mobile return');
      }else{
        for(const [key,expected] of [
          ['ArrowRight','sandbox'],['ArrowDown','help'],
          ['ArrowLeft','yard:armas'],['ArrowUp','mission']]){
          await page.keyboard.press(key);
          assert.equal(await focused(),expected,label+': spatial '+key);
        }
      }
      const ui=page.locator('#sea-port-ui');
      assert.equal(await ui.locator('[data-action="mission"]').count(),1);
      assert.equal(await ui.locator('[data-action="sandbox"]').count(),1);
      const measure=await page.evaluate(()=>{
        const a=document.getElementById('sea-port-ui');
        const hero=a.querySelector('.port-hero').getBoundingClientRect();
        const actions=a.querySelector('.port-actions').getBoundingClientRect();
        return {scrollWidth:a.scrollWidth,clientWidth:a.clientWidth,
          heroWidth:hero.width,actionWidth:actions.width};
      });
      assert(measure.scrollWidth<=measure.clientWidth+2,
        label+': menu tem overflow horizontal '+JSON.stringify(measure));
      assert(measure.heroWidth>width*(isMobile?.75:.32),
        label+': largura de herói insuficiente '+JSON.stringify(measure));
      // 3.6b: browser file download and profile immutability.
      const stateBeforeBackup=await page.evaluate(()=>({
        save:localStorage.getItem('carcaca.mar-de-sangue.v4'),
        profile:SeaProfile.load()
      }));
      const [captainDownload]=await Promise.all([
        page.waitForEvent('download',{timeout:12000}),
        page.locator('[data-action="export-backup"]').click()
      ]);
      assert(/^mar-de-sangue-save-v4-\d{4}-\d{2}-\d{2}\.json$/.test(
        captainDownload.suggestedFilename()),label+': filename must be portable');
      const captainData=JSON.parse(fs.readFileSync(await captainDownload.path(),'utf8'));
      assert.equal(captainData.schema,4,label+': backup schema');
      assert.equal(captainData.format,'mar-de-sangue-captain-backup');
      assert.equal(captainData.profile.version,4);
      assert.deepEqual(captainData.profile,stateBeforeBackup.profile,
        label+': exported profile must match game profile');
      assert.equal(await page.evaluate(()=>localStorage.getItem('carcaca.mar-de-sangue.v4')),
        stateBeforeBackup.save,label+': exporting cannot change the save');
      await page.screenshot({path:path.join('port-artifacts',
        label+'-captain-backup-3-6b.png'),fullPage:true});
      // 3.6c: a real exported file can be previewed, cancelled, applied
      // only with two confirmations, and then undone without losing v4.
      const importedData={...captainData,profile:{
        ...captainData.profile,gold:captainData.profile.gold+91,
        mission:captainData.profile.mission+2
      }};
      const file={name:'captain-v4.json',mimeType:'application/json',
        buffer:Buffer.from(JSON.stringify(importedData))};
      await page.locator('#sea-port-backup').setInputFiles(file);
      await page.locator('.port-restore').waitFor({timeout:10000});
      assert(await page.locator('.port-restore__row').count()>=6);
      assert.equal(await page.evaluate(()=>localStorage.getItem('carcaca.mar-de-sangue.v4')),
        stateBeforeBackup.save,'Preview cannot write save');
      await page.screenshot({path:path.join('port-artifacts',
        label+'-save-restore-preview-3-6c.png'),fullPage:true});
      // 3.6d: the comparison is a proper accessible table, and safe
      // Cancel is the initial keyboard/controller focus.
      const comparison=page.getByRole('table',{name:'Comparação de progresso'});
      assert.equal(await comparison.count(),1);
      assert.equal(await comparison.getByRole('columnheader').count(),3);
      assert.equal(await comparison.getByRole('rowheader').count(),6);
      assert.equal(await comparison.getByRole('cell').count(),12);
      assert.equal(await focused(),'restore-cancel','Unsafe action must never have first focus');
      await page.keyboard.press('Escape');
      await page.locator('.port-hero').waitFor({timeout:10000});
      assert.equal(await page.evaluate(()=>localStorage.getItem('carcaca.mar-de-sangue.v4')),
        stateBeforeBackup.save,'Escape must cancel without writing');
      await page.locator('#sea-port-backup').setInputFiles(file);
      await page.locator('.port-restore').waitFor({timeout:10000});
      await page.evaluate(()=>{
        const previous=SEA_GAMEPAD.poll;
        SEA_GAMEPAD.poll=()=>({connected:true,just:{1:true}});
        try{SEA_PORT_UI.update(99999)}
        finally{SEA_GAMEPAD.poll=previous}
      });
      await page.locator('.port-hero').waitFor({timeout:10000});
      assert.equal(await page.evaluate(()=>localStorage.getItem('carcaca.mar-de-sangue.v4')),
        stateBeforeBackup.save,'Xbox B must cancel without writing');
      await page.locator('#sea-port-backup').setInputFiles(file);
      await page.locator('.port-restore').waitFor({timeout:10000});
      await page.locator('[data-action="restore-cancel"]').click();
      await page.locator('.port-hero').waitFor({timeout:10000});
      assert.equal(await page.evaluate(()=>localStorage.getItem('carcaca.mar-de-sangue.v4')),
        stateBeforeBackup.save,'Cancel must keep progress');
      await page.locator('#sea-port-backup').setInputFiles({
        name:'corrupt.json',mimeType:'application/json',buffer:Buffer.from('{broken')
      });
      await page.locator('.port-toast:not([hidden])').waitFor({timeout:10000});
      assert.equal(await page.evaluate(()=>localStorage.getItem('carcaca.mar-de-sangue.v4')),
        stateBeforeBackup.save,'Corrupted JSON must never change progress');
      await page.locator('#sea-port-backup').setInputFiles(file);
      await page.locator('[data-action="restore-arm"]').click();
      assert.equal(await focused(),'restore-cancel',
        'Final confirmation must still focus Cancel, never the destructive button');
      assert.equal(await page.getByRole('alert').count(),1);
      assert.equal(await page.locator('[data-action="restore-confirm"]').count(),1,
        'Final destructive action only appears after initial confirmation');
      await page.locator('[data-action="restore-confirm"]').click();
      await page.locator('.port-hero').waitFor({timeout:10000});
      const afterRestore=await page.evaluate(()=>({
        profile:SeaProfile.load(),rollback:SEA_SAVE_TRANSFER.lastRollback(),
        stored:localStorage.getItem('carcaca.mar-de-sangue.v4')
      }));
      assert.equal(afterRestore.profile.gold,importedData.profile.gold);
      assert.equal(afterRestore.rollback.profile.gold,stateBeforeBackup.profile.gold);
      assert.equal(await page.locator('[data-action="restore-rollback"]').count(),1);
      await page.locator('[data-action="restore-rollback"]').click();
      await page.locator('.port-restore').waitFor({timeout:10000});
      await page.locator('[data-action="restore-arm"]').click();
      await page.locator('[data-action="restore-confirm"]').click();
      await page.locator('.port-hero').waitFor({timeout:10000});
      assert.equal(await page.evaluate(()=>SeaProfile.load().gold),
        stateBeforeBackup.profile.gold,'Rollback must recover previous profile');
      assert.deepEqual(await page.evaluate(()=>SeaProfile.load()),stateBeforeBackup.profile);
      await page.locator('[data-action="yard:armas"]').click();
      await page.locator('.port-upgrades').waitFor({timeout:10000});
      await page.screenshot({path:path.join('port-artifacts',label+'-yard.png'),fullPage:true});
      assert.equal(await page.locator('.port-upgrade').count(),4);
      // The category tab is visible but is NOT a selectable gamepad/keyboard button.
      assert.equal(await page.locator('.port-tabs button[tabindex="-1"]').count(),4);
      assert.equal(await focused(),'buy:canhoes',label+': first affordable upgrade has initial focus');
      assert.equal(await page.locator('.port-tabs .is-controller-focused').count(),0);
      await page.keyboard.press('ArrowDown');
      assert.equal(await focused(),'buy:alcance',label+': ↓ reaches next affordable upgrade, not Return');
      await page.keyboard.press('ArrowDown');
      assert.equal(await focused(),'menu',label+': ↓ from last buy reaches Return');
      await page.keyboard.press('ArrowUp');
      assert.equal(await focused(),'buy:alcance',label+': ↑ from Return reaches upgrade');
      // Q/E mirror the shoulder buttons without putting focus on a tab.
      await page.keyboard.press('e');
      await page.waitForFunction(()=>document.querySelector('.port-tabs button.is-active')?.dataset.action==='yard:apoio');
      assert.notEqual((await focused()||'').slice(0,5),'yard:',label+': E did not select tab');
      assert.equal(await page.locator('.port-tabs .is-controller-focused').count(),0);
      await page.keyboard.press('q');
      await page.waitForFunction(()=>document.querySelector('.port-tabs button.is-active')?.dataset.action==='yard:armas');
      await page.keyboard.press('PageDown'); // RB equivalent: armas -> apoio
      await page.waitForFunction(()=>document.querySelector('.port-tabs button.is-active')?.dataset.action==='yard:apoio');
      assert.equal(await page.locator('.port-tabs button.is-active').getAttribute('data-action'),'yard:apoio');
      await page.keyboard.press('PageUp'); // LB equivalent: apoio -> armas
      await page.waitForFunction(()=>document.querySelector('.port-tabs button.is-active')?.dataset.action==='yard:armas');
      assert.equal(await page.locator('.port-tabs button.is-active').getAttribute('data-action'),'yard:armas');
      // Actual gamepad B is processed through the same Gamepad API code.
      await page.evaluate(()=>{
        const original=SEA_GAMEPAD.poll;
        SEA_GAMEPAD.poll=()=>({connected:true,just:{1:true}});
        try{SEA_PORT_UI.update(99999);}
        finally{SEA_GAMEPAD.poll=original;}
      });
      await page.locator('.port-hero').waitFor({timeout:10000});
      // 3.5b — exercise both footer mixers with real mouse/touch hitboxes.
      const audioBefore=await page.evaluate(()=>({
        music:SEA_MUSIC.volume,fx:SEA_AUDIO.effectsVolume,
        enabled:SEA_AUDIO.enabled,
        profile:localStorage.getItem('carcaca.mar-de-sangue.v4')
      }));
      assert.equal(audioBefore.music,.25);
      assert.equal(audioBefore.fx,1,'Legacy baseline should be 100% SFX');
      await page.locator('[data-action="fx-volume:down"]').click();
      await page.locator('[data-action="volume:up"]').click();
      const audioAfter=await page.evaluate(()=>({
        music:SEA_MUSIC.volume,fx:SEA_AUDIO.effectsVolume,
        sfxSaved:localStorage.getItem('carcaca.mar.sfx.volume'),
        musicSaved:localStorage.getItem('carcaca.mar.music.volume'),
        profile:localStorage.getItem('carcaca.mar-de-sangue.v4')
      }));
      assert(Math.abs(audioAfter.music-.3)<.0001);
      assert(Math.abs(audioAfter.fx-.9)<.0001);
      assert.equal(audioAfter.sfxSaved,'0.9');
      assert.equal(audioAfter.musicSaved,'0.3');
      assert.equal(audioAfter.profile,audioBefore.profile,
        'Mixer actions must leave gameplay progress untouched');
      assert.equal(await page.locator('.port-sound__group').count(),2);
      await page.locator('[data-action="mute"]').click();
      assert.equal(await page.evaluate(()=>SEA_AUDIO.enabled),false);
      assert.equal(await page.evaluate(()=>SEA_AUDIO.effectsVolume),.9,
        'Master mute cannot discard SFX gain');
      await page.locator('[data-action="mute"]').click();
      assert.equal(await page.evaluate(()=>SEA_AUDIO.enabled),true);
      await page.screenshot({path:path.join('port-artifacts',label+'-audio-mixer-3-5b.png'),fullPage:true});
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('#sea-port-ui .port-hero').waitFor({timeout:40000});
      const afterReload=await page.evaluate(()=>({music:SEA_MUSIC.volume,fx:SEA_AUDIO.effectsVolume}));
      assert(Math.abs(afterReload.music-.3)<.0001&&Math.abs(afterReload.fx-.9)<.0001,
        'Independent audio preferences must survive page reload');
      // 3.6e: readable typography is a reversible PORT-only preference.
      const readingBefore=await page.evaluate(()=>({
        size:parseFloat(getComputedStyle(document.querySelector('.port-choice__copy small')).fontSize),
        save:localStorage.getItem('carcaca.mar-de-sangue.v4'),
        audio:localStorage.getItem('carcaca.mar.sfx.volume')
      }));
      assert.equal(await page.locator('[data-action="readability"]').getAttribute('aria-pressed'),'false');
      await page.locator('[data-action="readability"]').click();
      assert.equal(await page.locator('[data-action="readability"]').getAttribute('aria-pressed'),'true');
      const readable=await page.evaluate(()=>({
        enabled:document.getElementById('sea-port-ui').classList.contains('port-ui--readable'),
        size:parseFloat(getComputedStyle(document.querySelector('.port-choice__copy small')).fontSize),
        key:localStorage.getItem('carcaca.mar.port.readable.v1'),
        save:localStorage.getItem('carcaca.mar-de-sangue.v4'),
        audio:localStorage.getItem('carcaca.mar.sfx.volume'),
        overflow:document.getElementById('sea-port-ui').scrollWidth-document.getElementById('sea-port-ui').clientWidth
      }));
      assert.equal(readable.enabled,true,label+': readable class');
      assert(readable.size>=readingBefore.size+2,label+': text must visibly enlarge');
      assert.equal(readable.key,'1');
      assert.equal(readable.save,readingBefore.save);
      assert.equal(readable.audio,readingBefore.audio);
      assert(readable.overflow<=2,label+': readable home horizontal overflow');
      await page.screenshot({path:path.join('port-artifacts',
        label+'-readable-port-3-6e.png'),fullPage:true});
      await page.locator('[data-action="help"]').click();
      await page.locator('.port-help-grid').waitFor();
      assert(await page.locator('.port-help-grid').innerText().then(t=>t.includes('LEITURA AMPLIADA')));
      await page.locator('[data-action="menu"]').first().click();
      await page.locator('#sea-port-backup').setInputFiles(file);
      await page.locator('.port-restore').waitFor();
      const restoreWidth=await page.evaluate(()=>({
        full:document.getElementById('sea-port-ui').scrollWidth,
        client:document.getElementById('sea-port-ui').clientWidth
      }));
      assert(restoreWidth.full<=restoreWidth.client+2,
        label+': readable restore horizontal overflow '+JSON.stringify(restoreWidth));
      await page.screenshot({path:path.join('port-artifacts',
        label+'-readable-restore-3-6e.png'),fullPage:true});
      await page.locator('[data-action="restore-cancel"]').click();
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('#sea-port-ui .port-hero').waitFor({timeout:40000});
      assert.equal(await page.locator('[data-action="readability"]').getAttribute('aria-pressed'),'true',
        label+': persisted reading preference must survive reload');
      await page.locator('[data-action="readability"]').click();
      assert.equal(await page.locator('[data-action="readability"]').getAttribute('aria-pressed'),'false');
      assert.equal(await page.evaluate(()=>localStorage.getItem('carcaca.mar.port.readable.v1')),'0');
      assert.equal(await page.evaluate(()=>localStorage.getItem('carcaca.mar-de-sangue.v4')),readingBefore.save);
      // 3.6g: opt-in diagnostics from mobile-friendly port controls.
      const priorPerfSave=await page.evaluate(()=>
        localStorage.getItem('carcaca.mar-de-sangue.v4'));
      assert.equal(await page.locator('[data-action="performance"]').getAttribute('aria-pressed'),'false');
      await page.locator('[data-action="performance"]').click();
      assert.equal(await page.locator('[data-action="performance"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.evaluate(()=>
        localStorage.getItem('carcaca.mar.performance.visible.v1')),'1');
      assert.equal(await page.evaluate(()=>
        localStorage.getItem('carcaca.mar-de-sangue.v4')),priorPerfSave);
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('#sea-port-ui .port-hero').waitFor({timeout:40000});
      assert.equal(await page.locator('[data-action="performance"]').getAttribute('aria-pressed'),'true',
        label+': FPS preference must survive reload');
      await page.locator('[data-action="performance"]').click();
      assert.equal(await page.locator('[data-action="performance"]').getAttribute('aria-pressed'),'false');
      assert.equal(await page.evaluate(()=>
        localStorage.getItem('carcaca.mar-de-sangue.v4')),priorPerfSave);
      if(errors.length)throw Error(label+' browser errors: '+errors.join(' | '));
      console.log('PASS visual '+label,measure);
      await page.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
