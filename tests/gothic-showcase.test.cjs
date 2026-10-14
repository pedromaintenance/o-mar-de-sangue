/* Standalone Node smoke test:
   node tests/gothic-showcase.test.cjs
   The game itself is not booted here; this protects feature-flag and
   purely decorative drawing contracts. Manual browser QA is still required. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('SeaGothic.js','utf8');
function load(search){
 const ctx={window:{location:{search}},URLSearchParams};
 vm.runInNewContext(src+'\nthis.skin=SEA_GOTHIC;',ctx);
 return ctx.skin;
}
assert.equal(load('').enabled,false);
const skin=load('?gothic=1');
assert.equal(skin.enabled,true);
const called=[];
function graphic(){
 const g={};
 for(const k of ['fillStyle','fillGradientStyle','fillRect','fillRoundedRect',
 'lineStyle','lineBetween','fillCircle','strokeCircle','strokeRect','fillTriangle','clear','setDepth'])
    g[k]=(...args)=>{called.push(k);return g};
 return g;
}
function sprite(){
 const obj={};
 for(const k of ['setAlpha','setDepth','setScale','setRotation','setTint'])
   obj[k]=()=>obj;
 return obj;
}
const scene={
 page:'menu',
 add:{graphics:graphic,tileSprite:sprite,image:sprite},
 textures:{exists:k=>k==='v15-flagship'||k==='sea-foam',
   get:()=>({getSourceImage:()=>({height:160})})},
 tweens:{add(){}}
};
skin.backdrop(scene);skin.titlePlate(scene);skin.decoratePort(scene);
for(const page of ['yard','help','reset','result']){
 scene.page=page;skin.decoratePort(scene);
}
const button=skin.button(scene,240,480,416,43,'gold');
skin.repaintButton(button,true);
assert(called.includes('fillGradientStyle'));
assert(called.includes('strokeRect'));
assert(called.includes('fillTriangle'));
assert(called.includes('clear'));
const root={indexes:[],addAt(_,i){this.indexes.push(i)}};
skin.pause(scene,root,{x:240,y:400,w:454,h:612,top:94});
skin.island(scene,root,{x:240,top:62,width:448,height:668});
assert.deepEqual(root.indexes,[3,3]);
console.log('PASS: gothic feature flag, menu panels, button focus, pause, islands');
