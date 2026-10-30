'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('Game.js','utf8');
const ocean=fs.readFileSync('SeaOceanV3.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
new vm.Script(src);new vm.Script(ocean);
const a=src.indexOf('const SEA_VIEW ='),b=src.indexOf('\nconst SEA_GAMEPAD =');
assert(a>=0&&b>a);
const context={Phaser:{Scenes:{Events:{PRE_RENDER:'prerender',SHUTDOWN:'shutdown'}}}};
vm.runInNewContext(src.slice(a,b)+';this.cfg=SEA_WORLD_SCALE;this.cams=SEA_CAMERA_LAYERS;',context);
assert.equal(context.cfg.linear,2);
assert.equal(context.cfg.linear**2,4,'map area must grow 300%');
assert.equal(context.cfg.vision,1.2);
assert.equal(context.cfg.bossHP,5,'HP must grow 400%');
assert(src.includes('this.W = 4400 * SEA_WORLD_SCALE.linear;'));
assert(src.includes('this.H = 3400 * SEA_WORLD_SCALE.linear;'));
assert(src.includes('this.cameras.main.setZoom(1 / SEA_WORLD_SCALE.vision);'));
for(const n of [5,7,35,52,16])
 assert(src.includes(n+' * SEA_WORLD_SCALE.linear'),'map density expansion missing '+n);
assert(src.includes('(elite ? SEA_WORLD_SCALE.bossHP : 1)'));
assert.equal((src.match(/const elite = \[/g)||[]).length,1);
const ui={scrollFactorX:0,scrollFactorY:0},world={scrollFactorX:1,scrollFactorY:1},list=[ui,world],events={};
const main={id:1,ignore(o){o.worldIgnored=true;}};
const scene={cameras:{main,add(x,y,w,h,m,name){
  assert.equal(w,1280);assert.equal(h,720);assert.equal(m,false);assert.equal(name,'sea-hud-fixed');
  return {id:2,zoom:1,ignore(o){o.hudIgnored=true;}};
}},children:{list},events:{on(k,f){events[k]=f;},once(k,f){events[k]=f;},off(k,f){assert.equal(events[k],f);}}};
context.cams.attach(scene);
assert(ui.worldIgnored&&!ui.hudIgnored,'screen UI must be fixed');
assert(world.hudIgnored&&!world.worldIgnored,'world goes to zoom camera');
const dialog={scrollFactorX:0,scrollFactorY:0};list.push(dialog);events.prerender();
assert(dialog.worldIgnored,'new overlays remain unzoomed');events.shutdown();
for(const name of ['almirante','cultista','nauabissal','kraken','dagon','dagon_senhor']){
 const line=src.split('\n').find(x=>x.includes(name+': {'));
 assert(line,'missing boss '+name);
 const hp=Number(line.match(/hp: ([0-9]+)/)?.[1]);assert(hp>0);
 assert.equal(hp*context.cfg.bossHP,hp*5);
}
assert(ocean.includes('SEA_VIEW.width / zoom')&&ocean.includes('SEA_VIEW.height / zoom'));
assert(sw.includes('omar-mar-de-sangue-v109-'));
console.log('PASS V109: map +300% area, vision +20% each axis, boss HP +400%, camera UI, PWA');
