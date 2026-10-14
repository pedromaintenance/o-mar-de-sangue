/* Teste isolado da integração visual; não requer Phaser ou navegador.
 * Executar: node tests/art-v2-pilot.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('SeaArtPilot.js','utf8');
function make(search){
  const context={window:{location:{search}},URLSearchParams};
  vm.runInNewContext(source+'\nthis.pilot=SEA_ART_PILOT;',context);
  return context.pilot;
}
const off=make(''),on=make('?artPilot=1');
assert.equal(off.enabled,false);
assert.equal(on.enabled,true);
const dims={
  'art2-logo':[790,282],'art2-reef':[277,239],'art2-wreck':[313,253],
  'art2-dark-left':[73,75],'art2-dark-middle':[7,75],'art2-dark-right':[73,75],
  'art2-focus-left':[73,75],'art2-focus-middle':[7,75],'art2-focus-right':[54,75]
};
const loaded=[];
const sprite=(key)=>({key,texture:key,setDepth(){return this},
    setDisplaySize(){return this},setTexture(t){this.texture=t;return this}});
const scene={page:'menu',load:{image:(key,path)=>loaded.push([key,path])},
  textures:{exists:key=>!!dims[key],get:key=>({
    getSourceImage:()=>({width:dims[key][0],height:dims[key][1]})
  })},add:{image:(x,y,key)=>sprite(key),tileSprite:(x,y,w,h,key)=>sprite(key)}};
on.preload(scene);
assert.equal(loaded.length,9);
assert(loaded.every(([key,path])=>dims[key]&&path.startsWith('assets/art-v2/')));
assert.equal(on.logo(scene),true);
const b=on.button(scene,240,480,416,43,'gold');
assert(b&&b.left&&b.mid&&b.right);
assert.equal(b.mid.tileScaleX,43/75);
on.focus(scene,b,false,'dark');assert.equal(b.left.texture,'art2-dark-left');
on.focus(scene,b,true,'dark');assert.equal(b.right.texture,'art2-focus-right');
assert.equal(on.islandTexture(scene,'reef','island-reef'),'art2-reef');
assert.equal(off.islandTexture(scene,'reef','island-reef'),'island-reef');
const fallback={...scene,textures:{exists:()=>false}};
assert.equal(on.button(fallback,240,480,416,43,'dark'),null);
assert.equal(on.logo(fallback),false);
assert.equal(loaded.filter(([k])=>k.includes('pixel-')).length,0);
console.log('PASS: opt-in pilot, sprite loading, three-slice, focus and fallback');
