/* 3.2 — HUD presentation contract without Phaser/WebGL.
 * Run: node tests/mare-negra-hud.test.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('Game.js','utf8');
function method(name,next){
  const start=src.indexOf('    '+name+'() {');
  const end=src.indexOf('    '+next+'() {',start);
  assert(start>=0&&end>start,name+' source method not found');
  return src.slice(start,end);
}
const createHUD=method('createHUD','createTouchControls');
const updateHUD=method('updateHUD','drawRadar');
const input=src.slice(src.indexOf('    createTouchControls() {'),
  src.indexOf('    isNativeTouchPointer(',src.indexOf('    createTouchControls() {')));
// The 26/10 landscape HUD moved all input hitboxes into the 1280x720 canvas.
assert(input.includes('const jc={x:140,y:576}, port={x:1051,y:548}, starboard={x:1158,y:548}'),
  'Landscape HUD joystick and cannon centers changed unexpectedly');
assert(input.includes('joystick:{x:jc.x,y:jc.y,radius:94}'),
  'Joystick must keep the enlarged landscape touch radius');
assert(input.includes('port:{x:port.x,y:port.y,radius:48}'),
  'Port cannon touch radius changed unexpectedly');
assert(input.includes('starboard:{x:starboard.x,y:starboard.y,radius:48}'),
  'Starboard cannon touch radius changed unexpectedly');
assert(!src.includes('getElementById("hud")'),'HUD should be Phaser-only');
for(const desktop of [false,true]){
 const rects=[],texts=[],draws=[];
 function elem(kind,args){
  const o={kind,args,width:args[2]?.length*7||0,height:17,value:'',
   setScrollFactor(){return this;},setDepth(){return this;},
   setStrokeStyle(){return this;},setOrigin(){return this;},
   setAlpha(){return this;},setScale(v){this.scale=v;return this;},
   setText(t){this.value=t;this.width=t.length*7;return this;},
   setColor(c){this.color=c;return this;},
   clear(){draws.push(['clear']);return this;},
   fillStyle(...z){draws.push(['fillStyle',...z]);return this;},
   fillRect(...z){draws.push(['fillRect',...z]);return this;}
  };
  (kind==='text'?texts:rects).push(o);return o;
 }
 const s={mode:'mission',stage:1,shipHP:100,maxShipHP:120,
  gold:45,speed:21,curse:24,seaEvent:'calm',
  lastPortShot:0,lastStarboardShot:0,shipStats:{reload:1000},
  time:{now:500},add:{
   rectangle:(...args)=>elem('rectangle',args),
   text:(...args)=>elem('text',args),
   graphics:(...args)=>elem('graphics',args)
  },
  objectiveText:()=> 'RECUPERAR CARGA · 45/100 ouro',
  drawRadar(){this.radarDrawn=(this.radarDrawn||0)+1;}
 };
 const SEA_DESKTOP=desktop,SEA_VIEW={width:desktop?1280:480,height:720};
 const SEA_MISSION_TITLES=['Mar das Sombras'];
 const SEA_MATH={nice:v=>String(v),clamp:(v,a,b)=>Math.max(a,Math.min(b,v))};
 const SEA_WEATHER={names:{calm:'MAR SERENO',storm:'TEMPESTADE RUBRA'}};
 const SEA_ATLAS={navigation:()=>null};
 const SEA_GUNNERY={chargeMs:()=>2000};
 const SEA_IMPULSE={cooldown:()=>10};
 const build=new Function('SEA_DESKTOP','SEA_VIEW','SEA_MISSION_TITLES','SEA_MATH',
   'SEA_WEATHER','SEA_ATLAS','SEA_GUNNERY','SEA_IMPULSE','return ({'+createHUD+','+updateHUD+'});');
 const ui=build(SEA_DESKTOP,SEA_VIEW,SEA_MISSION_TITLES,SEA_MATH,SEA_WEATHER,SEA_ATLAS,SEA_GUNNERY,SEA_IMPULSE);
 ui.createHUD.call(s);
 assert.deepEqual(s.pauseButtonHitbox,{x:desktop?454:412,y:78,w:120,h:40});
 assert.equal(rects.find(e=>e.args[2]===SEA_VIEW.width&&e.args[3]===SEA_VIEW.height)
   ?.kind,'rectangle','fullscreen damageFlash still present');
 assert.equal(s.hudConditions.args[0],desktop?1154:338);
 assert.equal(s.hudConditions.args[1],239);
 assert.equal(s.hudConditions.args[3].fontSize,'10px');
 assert(texts.find(e=>String(e.args[2]).startsWith('CARTA')),
  'Radar label may include new Atlas hotkey but must remain present');
 ui.updateHUD.call(s);
 assert(s.hud.value.includes('CASCO 100/120')&&s.hud.value.includes('OURO 45'));
 assert(s.hud.value.includes('NÓS 21'));
 assert.equal(s.quest.value,s.objectiveText());
 assert(s.hudConditions.value.includes('MAR SERENO'));
 assert(s.hudConditions.value.includes('MALDIÇÃO 24%'));
 assert.equal(s.radarDrawn,1);
 assert.equal(draws.filter(d=>d[0]==='fillRect'&&d[2]===92&&d[4]===7).length,3,
   'Three status gauges must remain in their original x/width slots');
 const gaugeXs=draws.filter(d=>d[0]==='fillRect'&&d[2]===92&&d[4]===7)
   .map(d=>d[1]);
 assert.deepEqual(gaugeXs,[16,175,249]);
 assert(s.quest.scale>0&&s.quest.scale<=1);
 // Critical cues: low HP and high curse visibly change state, not mechanics.
 s.shipHP=22;s.curse=82;s.seaEvent='storm';
 ui.updateHUD.call(s);
 assert.equal(s.hud.color,'#f2a5a0');
 assert.equal(s.hudConditions.color,'#f0a3a3');
 assert(s.hudConditions.value.includes('TEMPESTADE RUBRA'));
 assert(s.hudConditions.value.includes('82%'));
 assert.equal(s.radarDrawn,2);
 SEA_ATLAS.navigation=()=>({bearing:90,distance:420});
 ui.updateHUD.call(s);
 assert(s.hudConditions.value.includes('DESTINO 90° · 420u'),
  'Waypoint bearing and distance should appear in HUD without changing status');
 // No attr changes to save values, mission objectives, or reload mechanics.
 assert.equal(s.gold,45);assert.equal(s.shipStats.reload,1000);
 console.log('PASS 3.2 HUD shape/alert and touch geometry:',desktop?'desktop':'mobile');
}
