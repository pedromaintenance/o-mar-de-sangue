/* Oceano V3 — abertura real em Chromium, com e sem toque. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
(async()=>{
  const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
  if(!executablePath)throw Error('Chromium não encontrado');
  fs.mkdirSync('port-artifacts',{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath,
    args:['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
  try{
    for(const mobile of [false,true]){
      const label=mobile?'mobile':'desktop';
      const page=await browser.newPage({viewport:{width:mobile?390:1440,height:mobile?844:900},
        isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,
        userAgent:mobile?'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36':undefined});
      const errors=[];page.on('pageerror',e=>errors.push(String(e)));
      await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
      await page.locator('#sea-port-ui [data-action="mission"]').waitFor({timeout:60000});
      await page.locator('#sea-port-ui [data-action="mission"]').click();
      await page.waitForFunction(()=>typeof game!=='undefined'&&
        game.scene.isActive('Game')&&game.scene.getScene('Game').seaV3Active,
        null,{timeout:60000});
      const state=await page.evaluate(()=>{
        const s=game.scene.getScene('Game'),ocean=SEA_OCEAN_V3;
        const tiles=s.seaV3Tiles;
        const textures=[1,2,3,4].map(i=>{
          const image=s.textures.get(ocean.key(i)).getSourceImage();
          return [image.width,image.height];
        });
        const initial=tiles.map(t=>t.sprite.texture.key);
        const cam=s.cameras.main,oldX=cam.scrollX;
        cam.scrollX=oldX+1024;
        ocean.update(s,.81);
        const moved=tiles.every(t=>t.sprite.x===t.col*1024&&t.sprite.y===t.row*1024);
        cam.scrollX=oldX;
        ocean.update(s,.81);
        const synced=[];
        for(let n=0;n<8;n++){
          ocean.update(s,n*.160+.01);
          synced.push(tiles.every(t=>t.frame===(ocean.animated?n:0)));
        }
        return {touch:SEA_TOUCH,animated:ocean.animated,active:s.seaV3Active,
          tileCount:tiles.length,textures,initial,moved,synced,player:!!s.player};
      });
      assert.equal(state.touch,mobile,label+' touch detection');
      assert(state.active&&state.player&&state.tileCount>=9,label+' ocean/player');
      assert(state.initial.every(x=>x.startsWith('sea-v3-')),label+' missing chunks');
      assert(state.moved&&state.synced.every(Boolean),label+' tile reposition/frame sync');
      if(mobile)assert(!state.animated,'Touch device must use low-memory fallback');
      const dims=state.animated?[4096,2048]:[1024,1024];
      for(const size of state.textures)assert.deepEqual(size,dims,label+' image dimensions');
      assert.equal(errors.length,0,label+' browser errors: '+errors.join(';'));
      await page.screenshot({path:path.join('port-artifacts','sea-ocean-v3-'+label+'.png'),fullPage:true});
      await page.close();
      console.log('PASS ocean browser '+label+': '+JSON.stringify({animated:state.animated,tileCount:state.tileCount,textureSize:dims}));
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});