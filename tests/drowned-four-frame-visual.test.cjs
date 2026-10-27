/* Drowned four-frame real Phaser acceptance, no changes to heading logic. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
 if(!bin)throw Error('Chromium required');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:bin,
  args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try {
  for(const [label,width,height,mobile] of [
   ['desktop',1280,720,false],['mobile-landscape',844,390,true]
  ]){
   const page=await browser.newPage({viewport:{width,height},isMobile:mobile,
    hasTouch:mobile,deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
   await page.locator('#sea-port-ui [data-action="mission"]').click();
   await page.waitForFunction(()=>game.scene.isActive('Game')&&
    !!game.scene.getScene('Game').player,{timeout:30000});
   const status=await page.evaluate(()=>{
    const s=game.scene.getScene('Game');s.scene.pause();
    const e=s.spawnEnemy('afogados',400);
    if(!e)throw Error('Cannot spawn Drowned');
    for(const foe of s.enemies)if(foe!==e)foe.dead=true;
    e.x=s.player.x+100;e.y=s.player.y-200;e.heading=0;
    s.elapsed=1.0;s.paintEnemies();s.animateWorldVisuals(.016);
    const texture=s.textures.get('v15-drowned');
    const out={key:e.ship.texture.key,
      source:{w:texture.getSourceImage().width,h:texture.getSourceImage().height},
      frameSize:{w:e.ship.frame.width,h:e.ship.frame.height},
      frameTotal:texture.frameTotal,frames:[e.ship.frame.name],
      alpha:e.ship.alpha,heading:e.heading,rotation:e.ship.rotation,
      displayHeight:e.ship.displayHeight};
    for(const t of [1.15,1.3,1.45,1.6,1.75,1.9,2.05]){
     s.elapsed=t;s.animateWorldVisuals(.016);out.frames.push(e.ship.frame.name);
    }
    e.heading=Math.PI/2;s.paintEnemies();
    out.headingAfter=e.heading;out.rotationAfter=e.ship.rotation;
    return out;
   });
   assert.equal(status.key,'v15-drowned');
   assert.deepEqual(status.source,{w:2048,h:682});
   assert.deepEqual(status.frameSize,{w:512,h:682});
   assert(status.frameTotal>=5);
   assert(new Set(status.frames.map(String)).size>=3,'Animation must show three frames');
   assert(status.alpha<1&&status.alpha>.65,'Existing drowned translucence retained');
   assert.equal(status.headingAfter,Math.PI/2,'Enemy AI heading unchanged');
   assert(Math.abs(status.rotationAfter-Math.PI/2)<.01,
    'No new rotation override for Drowned');
   assert(status.displayHeight>65&&status.displayHeight<550,
    'Source frame height must yield playable sprite scale');
   await page.screenshot({path:path.join('port-artifacts','drowned-'+label+'.png'),fullPage:true});
   assert.equal(errors.length,0,errors.join(' | '));
   console.log('PASS drowned four frame '+label+' '+JSON.stringify(status));
   await page.close();
  }
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
