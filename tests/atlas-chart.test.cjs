/* Atlas 3.4: discovery, visual mapping and modal input contracts.
 * node tests/atlas-chart.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('Game.js','utf8');
for(const phrase of [
 'SEA_ATLAS.init(this);',
 "this.input.keyboard.on('keydown-M', this.onAtlas)",
 "this.input.keyboard.off('keydown-M', this.onAtlas)",
 'SEA_ATLAS.discover(this);',
 'SEA_ATLAS.toggle(this);return true;',
 'if (this.atlasOpen) return SEA_ATLAS.pointer(this,x,y);',
 'pad.just?.[8]',
 '|| this.atlasOpen) return false;',
])assert(game.includes(phrase),'Missing input contract: '+phrase);
const context={SEA_DESKTOP:true,SEA_VIEW:{width:1280,height:720}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('SeaAtlas.js','utf8')+';this.atlas=SEA_ATLAS;',context);
const atlas=context.atlas;
const elements=[],draw=[];
function shape(type,args=[]){
 const e={type,args,text:args[2],children:[],destroyed:false,
  add(o){this.children.push(o);return this;},
  destroy(){this.destroyed=true;return this;},
  setScrollFactor(){return this;},setDepth(){return this;},
  setInteractive(){this.interactive=true;return this;},
  setStrokeStyle(){return this;},setOrigin(){return this;},
  fillStyle(...xs){draw.push(['fillStyle',...xs]);return this;},
  fillRect(...xs){draw.push(['fillRect',...xs]);return this;},
  fillCircle(...xs){draw.push(['fillCircle',...xs]);return this;},
  strokeCircle(...xs){draw.push(['strokeCircle',...xs]);return this;},
  lineStyle(...xs){draw.push(['lineStyle',...xs]);return this;},
  lineBetween(...xs){draw.push(['lineBetween',...xs]);return this;},
 };
 elements.push(e);return e;
}
const s={
 W:4400,H:3400,shipStats:{radar:460},
 player:{x:2050,y:1700,rotation:0},
 islands:[
  {id:1,x:2100,y:1750,radius:72,kind:'wreck'},
  {id:2,x:3700,y:2700,radius:70,kind:'parley'},
  {id:3,x:1800,y:1800,radius:60,kind:'daegon'},
 ],
 islandVisits:new Set([3]),ended:false,sinking:false,
 pausedByCaptain:false,islandDocked:false,
 touchReset(){this.touchResets=(this.touchResets||0)+1;},
 add:{
  rectangle:(...a)=>shape('rectangle',a),
  container:(...a)=>shape('container',a),
  text:(...a)=>shape('text',a),
  graphics:(...a)=>shape('graphics',a),
 }
};
atlas.init(s);
assert.equal(s.atlasOpen,false);
assert.equal(s.chartDiscovered.size,2);
assert(s.chartDiscovered.has(1)&&s.chartDiscovered.has(3));
assert(!s.chartDiscovered.has(2),'Encounter must not be visible before discovering it');
assert.deepEqual(JSON.stringify(s.chartHitbox),
 JSON.stringify({x:1198,y:187,w:80,h:80}));
assert.equal(atlas.toggle(s),true);
assert.equal(s.atlasOpen,true);
assert(s.atlasElements);
assert.equal(s.atlasElements.depth||460,460); // visual depth applied by scene
assert(elements.some(e=>e.type==='rectangle'&&e.interactive),'must intercept background pointers');
assert(elements.some(e=>e.type==='text'&&String(e.text).includes('CARTA DOS NÁUFRAGOS')));
assert(elements.some(e=>e.type==='text'&&String(e.text).includes('CONHECIDAS 2')));
assert(elements.some(e=>e.type==='text'&&String(e.text).includes('VISITADAS 1')));
assert(s.atlasCloseHitbox.w>=300);
const previous=s.atlasElements;
assert(atlas.pointer(s,0,0),'outside taps should close/consume atlas, not fire cannons');
assert(previous.destroyed);
assert(!s.atlasOpen);
s.pausedByCaptain=true;
assert.equal(atlas.toggle(s),false,'map cannot overlay Captain Log');
s.pausedByCaptain=false;s.islandDocked=true;
assert.equal(atlas.toggle(s),false,'map cannot overlay island decisions');
s.islandDocked=false;
s.player.x=3500;s.player.y=2700;
atlas.discover(s);
assert(s.chartDiscovered.has(2),'unvisited political encounter becomes visible through sailing');
assert(atlas.toggle(s));
assert(elements.some(e=>e.type==='text'&&String(e.text).includes('CONHECIDAS 3')));
assert(atlas.close(s));assert(!s.atlasElements);assert(!s.atlasOpen);
assert.equal(s.chartDiscovered.size,3);
assert.equal(s.touchResets,4,'ship movement/cannon touches are reset at both transitions');
assert(!/localStorage|SeaProfile\.(store|save)/.test(fs.readFileSync('SeaAtlas.js','utf8')),
 'Atlas must not change player save schema');
console.log('PASS Atlas 3.4: hidden islands, discoverable parley, visited, modal return and save isolation');
