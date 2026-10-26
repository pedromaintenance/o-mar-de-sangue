/* Browser coverage of the asset audit gallery. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!bin)throw Error('Chromium required');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:bin,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  for(const [label,width,height,mobile] of [
    ['desktop',1600,900,false],['mobile',390,844,true]]){
   const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile});
  await page.goto('http://127.0.0.1:8765/asset-audit.html');
  await page.waitForFunction(()=>document.querySelector('#source-status')?.textContent.includes('Inventário'),{timeout:20000});
  assert(await page.locator('.asset').count()>=40);
  await page.locator('#search').fill('player_ship.png');
  assert.equal(await page.locator('.asset').count(),1);
  await page.locator('.asset .preview').click();
  assert(await page.locator('#detail').isVisible());
  await page.locator('#detail-close').click();
  await page.screenshot({path:path.join('port-artifacts','audit-'+label+'.png'),fullPage:true});
  console.log('PASS audit browser '+label+': gallery, filter, and media detail');
  await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
