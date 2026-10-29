/* Island smoke atlas and visual trigger. No changes to island balance or collision. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const vm=require('node:vm');
const path='assets/islands/island_destruction_smoke.png';
const b=fs.readFileSync(path);
const m=JSON.parse(fs.readFileSync('assets/islands/island_destruction_smoke.manifest.json','utf8'));
assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20),b[24],b[25]],[2288,682,8,6],'RGBA8 + 2288×682');
assert.equal(crypto.createHash('sha256').update(b).digest('hex'),
 '4312c1099d88def9bc6a9ff765de17df9de7bf2f8b9fe7014472cf477cda8fbe','exact user asset bytes');
assert.deepEqual(m.frames.map(f=>f.x),[0,592,1184,1776]);
assert.equal(m.frameWidth,512);
assert.equal(m.spacing,80);
assert.equal(m.frameCount,4);
const game=fs.readFileSync('Game.js','utf8');
const islands=fs.readFileSync('SeaIslands.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
new vm.Script(game);new vm.Script(islands);
assert(game.includes("this.load.spritesheet('island-destruction-smoke', 'assets/islands/island_destruction_smoke.png'"));
assert(/frameWidth:512,\s*frameHeight:682,\s*spacing:80,\s*endFrame:3/.test(game));
assert(sw.includes('"./assets/islands/island_destruction_smoke.png"'));
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=97);
assert(islands.includes('if(choice.destroysIsland===true)this.showDestructionSmoke(s,s.islandSelected);'));
const c={};vm.runInNewContext(islands+';this.islands=SEA_ISLANDS;',c);
const fx=c.islands;
let created=0,played=0;
const gameScene={
 textures:{exists:key=>key==='island-destruction-smoke'},
 anims:{
  exists:()=>created>0,
  generateFrameNumbers:(key,range)=>{assert.equal(key,'island-destruction-smoke');assert.deepEqual([range.start,range.end],[0,3]);return [0,1,2,3];},
  create:cfg=>{assert.equal(cfg.frameRate,3);assert.equal(cfg.repeat,-1);assert.equal(cfg.yoyo,true);created++;}
 },
 add:{sprite(x,y,key,frame){
  assert.deepEqual([x,y,key,frame],[100,200,'island-destruction-smoke',0]);
  return {active:true,setScale(v){this.scale=v;return this;},setDepth(v){this.depth=v;return this;},play(v){this.animation=v;played++;return this;}}
 }}
};
const island={x:100,y:200,radius:80};
const img=fx.showDestructionSmoke(gameScene,island);
assert.equal(img.scale,80*2.8/682);
assert.equal(img.depth,3);
assert.equal(img.animation,'island-destruction-smoke-loop');
assert.strictEqual(fx.showDestructionSmoke(gameScene,island),img,'do not duplicate smoke on island');
assert.equal(created,1);assert.equal(played,1);
assert.equal(fx.showDestructionSmoke({textures:{exists:()=>false}},island),null,'requires loaded asset only when no active smoke');
// Default island choices must remain unmodified; the special trigger activates only for future destruction options.
assert(!Object.values(fx.choices).some(choices=>choices.some(choice=>choice.destroysIsland===true)));
console.log('PASS island smoke: exact 4-frame atlas, 80px spacing, non-rotating animation, future destruction trigger, PWA');
