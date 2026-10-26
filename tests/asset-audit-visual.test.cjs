/* Browser coverage of the asset audit gallery. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright-core');
(async()=>{
 const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!bin)throw Error('Chromium required');
 const browser=await chromium.launch({headless:true,executablePath:bin,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.goto('http://127.0.0.1:8765/asset-audit.html');
  await page.waitForFunction(()=>document.querySelector('#source-status')?.textContent.includes('Inventário'),{timeout:20000});
  assert(await page.locator('.asset').count()>=40);
  await page.locator('#search').fill('player_ship.png');
  assert.equal(await page.locator('.asset').count(),1);
  await page.locator('.asset .preview').click();
  assert(await page.locator('#detail').isVisible());
  await page.locator('#detail-close').click();
  console.log('PASS audit browser: gallery, filter, and media detail');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
