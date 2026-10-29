'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync('Game.js','utf8');
const effects=fs.readFileSync('SeaEffects.js','utf8');
const islands=fs.readFileSync('SeaIslands.js','utf8');
const gallery=fs.readFileSync('asset-audit.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

for(const [path,source] of [['Game.js',game],['SeaEffects.js',effects],['SeaIslands.js',islands],['asset-audit.html',gallery.match(/<script>([\s\S]*?)<\/script>/)?.[1]||'']]){
 assert(source.length>0,path+' script exists');
 new vm.Script(source,{filename:path});
}
assert(game.includes("this.burst(o.x,o.y,o.kind==='demeter'?'gold':'violet',.32)"));
assert(game.includes('nextSparkAt:1.2+(i%13)*.68'));
assert(game.includes("enemy.isMonster?'violet':'splinters'"));
assert(game.includes("if(this.missedWaterShots%3===0)this.burst(p.x,p.y,'foam',.42)"));
assert(game.includes('this.effectsActive<this.effectsLimit-12'),'FX budget must protect dense fights');
assert(effects.includes("e.isMonster?'violet':'splinters'"));
assert(effects.includes("e.isMonster && e.type!=='enguia' ? 0"),'non-eel monsters must never rotate during death');
assert(islands.includes('s.islandDepartureFx=choice.destroysIsland===true ? null'));
assert(islands.includes("s.burst(leaveAt.x,leaveAt.y,leaveFx,.72)"));
assert(islands.includes('if(choice.destroysIsland===true)this.showDestructionSmoke'),'destruction hook preserved');
assert(gallery.includes('Curadoria de efeitos em gameplay'));
assert(gallery.includes('data-vfx-search="island_destruction_smoke"'));
assert(gallery.includes("button.dataset.vfxSearch"),'curated cards must navigate to actual asset');
assert(sw.includes('v98-asset-vfx-polish-20261028'));

// Execute the original effects methods with lightweight Phaser-free stubs.
const context={localStorage:{getItem(){return null;}}};
vm.runInNewContext(effects+';this.COMBAT=SEA_COMBAT;',context);
const mock=(isMonster,type)=>({
 isMonster,type,id:2,x:12,y:16,radius:64,heading:2,spriteScale:1,
 ship:{rotation:1.4,active:true,destroy(){}},hp:90,maxhp:100,lastHitVisualTime:-300
});
const bursts=[],calls=[];
const scene={
 time:{now:2000},effectsActive:0,effectsLimit:48,elapsed:3,
 player:{x:0,y:0},add:{text(){return{setOrigin(){return this},setDepth(){return this}}},
 circle(){return{setDepth(){return this}}},rectangle(){return{setDepth(){return this},setRotation(){return this}}}},
 tweens:{add(opt){calls.push(opt);}},
 textures:{exists(){return false}},wrecks:[],
 floatingNumbers:14,
 burst:(x,y,kind,scale)=>bursts.push(kind),
 enemies:[]
};
const combat=context.COMBAT;
combat.hitEnemy(scene,mock(true,'kraken'),2,4,6);
combat.hitEnemy(scene,mock(false,'corsario'),2,4,6);
assert.deepEqual(bursts,['violet','splinters']);
const monster=mock(true,'kraken'),eel=mock(true,'enguia'),ship=mock(false,'corsario');
combat.sinkEnemy(scene,monster);
assert.equal(calls[calls.length-1].rotation,0);
combat.sinkEnemy(scene,eel);
assert.notEqual(calls[calls.length-1].rotation,0);
combat.sinkEnemy(scene,ship);
assert.notEqual(calls[calls.length-1].rotation,0);
console.log('PASS: FX palette, temple ambience, missed shots, dock actions, monster orientation, gallery and cache');
