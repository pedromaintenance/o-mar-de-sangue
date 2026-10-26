/* Browser acceptance for original-resolution eel and corrected ram bow.
 * Launch http.server on :8765; test real Phaser sprites, frame animation,
 * direction alignment and collision-heading independence.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
 const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
   '/usr/bin/chromium'].find(fs.existsSync);
 if(!bin)throw Error('Chromium required');
 fs.mkdirSync('port-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:bin,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 try{
   for(const [name,width,height,mobile] of [
     ['desktop',1280,720,false],['android-landscape',844,390,true]]){
     const page=await browser.newPage({viewport:{width,height},
       isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,
       userAgent:mobile?'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36':undefined});
     const errors=[];page.on('pageerror',e=>errors.push(String(e)));
     await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
     await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:40000});
     await page.locator('#sea-port-ui [data-action="mission"]').click();
     await page.waitForFunction(()=>game.scene.isActive('Game')&&!!game.scene.getScene('Game').player,{timeout:30000});
     const result=await page.evaluate(()=>{
       const s=game.scene.getScene('Game');
       s.scene.pause();
       const eel=s.spawnEnemy('enguia',480),ram=s.spawnEnemy('ariete',480);
       if(!eel||!ram)throw Error('Could not spawn both enemies');
       for(const e of s.enemies)if(e!==eel&&e!==ram)e.dead=true;
       const base=s.player;
       eel.x=base.x-160;eel.y=base.y-60;ram.x=base.x+160;ram.y=base.y-60;
       eel.heading=0;ram.heading=0;
       s.elapsed=1;s.paintEnemies();s.animateWorldVisuals(.016);
       const before={
         eelTexture:eel.ship.texture.key,ramTexture:ram.ship.texture.key,
         eelSource:{width:s.textures.get('eel-swim').getSourceImage().width,
           height:s.textures.get('eel-swim').getSourceImage().height},
         frameCount:s.textures.get('eel-swim').frameTotal,
         frameSize:{w:eel.ship.frame.width,h:eel.ship.frame.height},
         first:eel.ship.frame.name,
         eelRotation:eel.ship.rotation,ramRotation:ram.ship.rotation,
         eelHeading:eel.heading,ramHeading:ram.heading,
         eelHeight:eel.ship.displayHeight,ramHeight:ram.ship.displayHeight,
         eelFrames:[eel.ship.frame.name]
       };
       for(const t of [1.2,1.4,1.6,1.8,2.0,2.2]){
         s.elapsed=t;s.animateWorldVisuals(.016);
         before.eelFrames.push(eel.ship.frame.name);
       }
       eel.heading=Math.PI/2;ram.heading=Math.PI/2;
       s.paintEnemies();
       before.eelQuarter=eel.ship.rotation;
       before.ramQuarter=ram.ship.rotation;
       before.eelHeadingAfter=eel.heading;before.ramHeadingAfter=ram.heading;
       eel.heading=0;ram.heading=0;s.paintEnemies();
       return before;
     });
     assert.equal(result.eelTexture,'eel-swim');
     assert.equal(result.ramTexture,'v15-ram');
     assert.deepEqual(result.eelSource,{width:2048,height:565});
     assert(result.frameCount>=5,'Phaser frame count includes base+4 animation frames');
     assert.deepEqual(result.frameSize,{w:512,h:565});
     // Phaser wraps rotations into [-PI, PI]; compare cyclic angles.
     const angularError=(actual,target)=>Math.abs(Math.atan2(
       Math.sin(actual-target),Math.cos(actual-target)));
     console.log('Asset rotations:',JSON.stringify(result));
     assert(angularError(result.eelRotation,Math.PI)<.001);
     assert(angularError(result.ramRotation,Math.PI)<.001);
     assert(angularError(result.eelQuarter,1.5*Math.PI)<.001);
     assert(angularError(result.ramQuarter,1.5*Math.PI)<.001);
     assert.equal(result.eelHeadingAfter,Math.PI/2);
     assert.equal(result.ramHeadingAfter,Math.PI/2);
     assert(new Set(result.eelFrames.map(String)).size>=3,
       'Eel must show at least three different frames in the continuous loop');
     assert(result.eelHeight>90&&result.eelHeight<200,'size based on gameplay radius');
     await page.screenshot({path:path.join('port-artifacts',
       'eel-ram-orientation-'+name+'.png'),fullPage:true});
     assert.equal(errors.length,0,errors.join(' | '));
     console.log('PASS animated eel and ram orientation '+name,JSON.stringify(result));
     await page.close();
   }
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
