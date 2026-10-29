/* Guardiao Caranguejo / Templo Tartaruga — exact-original animated assets.
 * Pixel-integrity SHA256 plus real frame logic extracted from Game.js.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
const cases=[
 {type:'caranguejo',path:'assets/abyss/shell_guardian.png',key:'foe-shell',
  height:646,interval:190,field:'crabFrame',
  sha:'d38b8ab1a04551035b9a144f05f2283ea53b9b347c9d9c2365c8cf8165301d7b'},
 {type:'tartaruga',path:'assets/abyss/temple_turtle.png',key:'foe-turtle',
  height:682,interval:230,field:'turtleFrame',
  sha:'80649705063ad4ae5b175861f93e7e7ae8a4de701ad5ac8db99596ac7e856936'}
];
const visualMethod=game.slice(game.indexOf('    animateWorldVisuals(dt=.016) {'),
 game.indexOf('    paintEnemies() {')); 
assert(visualMethod.length>3000,'Real animation method must be present');
for(const item of cases){
 const png=fs.readFileSync(item.path);
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
 assert.equal(png.subarray(12,16).toString('ascii'),'IHDR','PNG IHDR');
 assert.equal(png.readUInt32BE(16),2048,'exact 4 x 512 original pixel width');
 assert.equal(png.readUInt32BE(20),item.height,'one frame height preserved');
 assert.equal(png[25],6,'original RGBA mode');
 assert.equal(crypto.createHash('sha256').update(png).digest('hex'),item.sha,
  'original upload binary must stay unmodified');
 const preload=new RegExp("this\\.load\\.spritesheet\\('"+item.key+
  "', '"+
  item.path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+
  "', \\{\\s*frameWidth:512, frameHeight:"+item.height+", endFrame:3");
 assert(preload.test(game),'Phaser must load 4 distinct original frames for '+item.type);
 assert(game.includes(item.type+":'"+item.key+"'"),'enemy spawns with correct animated texture');
 assert(game.includes("type==='"+item.type+"'"),'monster type referenced in Game.js');
 const sourceHPattern=new RegExp("type==='"+
  item.type+"'\\s*&&\\s*tex==='"+item.key+"'\\s*\\?\\s*"+item.height);
 assert(sourceHPattern.test(game),'render size must use ONE frame height');
 const start=visualMethod.indexOf("            if(e.type==='"+item.type+"'");
 const finish=visualMethod.indexOf("\n            if(",start+14);
 assert(start>=0&&finish>start,'live animation block missing for '+item.type);
 const block=visualMethod.slice(start,finish);
 const animation=new Function('e','t',block);
 const history=[];
 const e={type:item.type,visualPhase:0,
  ship:{texture:{key:item.key},setFrame(n){history.push(n);this.frame=n;}}};
 for(const step of [0,1,2,3,4,5,6]){
  const time=(step+.01)*item.interval/1000;
  animation(e,time);
 }
 assert.deepEqual(history,[0,1,2,3,2,1,0],
  item.type+': frames must animate 0-1-2-3-2-1 without changing AI');
 const oldCount=history.length;
 animation(e,(6+.01)*item.interval/1000);
 assert.equal(history.length,oldCount,'same frame must not be sent to GPU twice');
 assert.equal(e[item.field],0,'animation state stored per enemy');
}
const sw=fs.readFileSync('sw.js','utf8');
for(const x of cases)assert(sw.includes('"./'+x.path+'"'),'PWA precache missing '+x.path);
assert(/omar-mar-de-sangue-v105-/.test(sw),'PWA must refresh cached monster art');
assert(game.includes('fixedMonsterArt ? 0 : e.heading+'),
 'Crab and Turtle must remain visually fixed at 0 degrees');
console.log('PASS 4-frame crab + turtle: uploaded SHA256, dimensions/alpha, live animation, orientation, scaling, PWA');
