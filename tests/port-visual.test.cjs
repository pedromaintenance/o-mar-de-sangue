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
      await page.locator('[data-action="yard:armas"]').click();
      await page.locator('.port-upgrades').waitFor({timeout:10000});
      await page.screenshot({path:path.join('port-artifacts',label+'-yard.png'),fullPage:true});
      assert.equal(await page.locator('.port-upgrade').count(),4);
      await page.keyboard.press('PageDown'); // RB equivalent: armas -> apoio
      await page.waitForFunction(()=>document.querySelector('.port-tabs button.is-active')?.dataset.action==='yard:apoio');
      assert.equal(await page.locator('.port-tabs button.is-active').getAttribute('data-action'),'yard:apoio');
      await page.keyboard.press('PageUp'); // LB equivalent: apoio -> armas
      await page.waitForFunction(()=>document.querySelector('.port-tabs button.is-active')?.dataset.action==='yard:armas');
      assert.equal(await page.locator('.port-tabs button.is-active').getAttribute('data-action'),'yard:armas');
      await page.locator('[data-action="menu"]').first().click();
      await page.locator('.port-hero').waitFor({timeout:10000});
      if(errors.length)throw Error(label+' browser errors: '+errors.join(' | '));
      console.log('PASS visual '+label,measure);
      await page.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
