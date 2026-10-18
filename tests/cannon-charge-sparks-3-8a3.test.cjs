/* 3.8a.3 — five-frame fuse atlas and non-emitting broadside presentation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const atlasPath='assets/fx/cannon_charge_sparks.png';
const png=fs.readFileSync(atlasPath);
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16),480,'five 96px cells');
assert.equal(png.readUInt32BE(20),96);
assert(png.length>1000&&png.length<16000,'sparse optimized VFX atlas');
const src=fs.readFileSync('SeaCannonChargeFx.js','utf8');
const ctx={SEA_GUNNERY:{chargeMs:()=>2000},Phaser:{BlendModes:{ADD:1}}};
vm.createContext(ctx);
vm.runInContext(src+';this.fx=SEA_CHARGE_FX;',ctx);
const fx=ctx.fx;
const objects=[];
const makeSprite=()=>({
  frame:0,visible:true,scale:1,alpha:1,
  setScale(n){this.scale=n;return this},
  setBlendMode(n){this.blendMode=n;return this},
  setAlpha(n){this.alpha=n;return this},
  setVisible(n){this.visible=n;return this},
  setFrame(n){this.frame=n;return this}
});
const scene={
  textures:{exists:(key)=>key==='fx-cannon-charge'},
  add:{image(x,y,key,frame){assert.equal(key,'fx-cannon-charge');
    const obj=makeSprite();obj.x=x;obj.y=y;obj.frame=frame;
    objects.push(obj);return obj;}},
  playerVisual:{children:[],add(s){this.children.push(s)}},
  profile:{levels:{cadencia:0}},
  cannonCharge:{port:0,starboard:0},
  cannonNeedsRelease:{port:false,starboard:false},
  effectsActive:12,effectsLimit:48,
  ended:false,sinking:false,islandDocked:false,atlasOpen:false,pausedByCaptain:false
};
assert.equal(fx.init(scene),true);
assert.equal(objects.length,2,'only two persistent sprites in scene');
assert.equal(scene.playerVisual.children.length,2,'sprites track ship rotation');
assert(objects[0].x<0&&objects[1].x>0,'correct physical broadside');
assert(objects.every(s=>s.visible===false));
assert(objects.every(s=>s.blendMode===ctx.Phaser.BlendModes.ADD),
 'spark sprites must use additive blending, not darken the red sea');
assert(objects.every(s=>s.scale>.75&&s.alpha>=.85),
 'spark cores must be visible at the actual ship scale');
fx.sync(scene);assert(objects.every(s=>s.visible===false));
scene.cannonCharge.port=100;fx.sync(scene);
assert(objects[0].visible&&!objects[1].visible);
assert.equal(objects[0].frame,0);
const firstAlpha=objects[0].alpha;
scene.cannonCharge.port=900;fx.sync(scene);
assert.equal(objects[0].frame,2,'middle-charge frame');
assert(objects[0].alpha>firstAlpha,'gradual but restrained glow');
scene.cannonCharge.starboard=1750;fx.sync(scene);
assert.equal(objects[1].frame,4);
assert(objects[0].visible&&objects[1].visible,'different charge on each broadside');
assert.equal(objects.length,2,'no new particle sprites in each frame');
assert.equal(scene.effectsActive,12,'does not consume existing 48 FX slots');
scene.cannonCharge.port=0;fx.sync(scene);
assert(!objects[0].visible&&objects[1].visible,'cancel only current broadside');
scene.cannonNeedsRelease.starboard=true;fx.sync(scene);
assert(!objects[1].visible,'single-shot latch hides ember immediately');
scene.cannonNeedsRelease.starboard=false;scene.cannonCharge.starboard=1700;
for(const state of ['pausedByCaptain','atlasOpen','islandDocked','sinking','ended']){
  scene[state]=true;fx.sync(scene);
  assert(!objects[1].visible,'must disappear during '+state);
  scene[state]=false;
}
scene.cannonCharge.starboard=0;scene.cannonCharge.port=0;
fx.sync(scene);assert(objects.every(s=>s.visible===false));
scene.cannonCharge.port=200;scene.cannonCharge.starboard=500;
fx.sync(scene);fx.clear(scene);
assert(objects.every(s=>s.visible===false),'reset clears instantly');
const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('Game.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
assert(html.indexOf('SeaCannonChargeFx.js')<html.indexOf('Game.js'));
assert(game.includes("this.load.spritesheet('fx-cannon-charge'"));
assert(game.includes('SEA_CHARGE_FX.init(this)'));
assert(game.includes('SEA_CHARGE_FX.clear(this)'));
assert(game.includes('SEA_CHARGE_FX.sync(this)'));
assert(sw.includes('./SeaCannonChargeFx.js'));
assert(sw.includes('./assets/fx/cannon_charge_sparks.png'));
const cacheVersion=Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1]);
assert(cacheVersion>=59,'PWA cache must be at least v59 and still include sparks');
console.log('PASS 3.8a.3: generated PNG, five spark stages, independent sides, cancellation and no new FX load');
