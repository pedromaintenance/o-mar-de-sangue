/* Horror de Coral — original four-frame animation, bow down and offline regression.
 * Supersedes the 3.8a.4 static cropped-image contract; same canonical PNG path.
 * No external dependencies. The uploaded original must remain byte-for-byte intact.
 */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const vm=require('node:vm');
const path='assets/v15/beast_coral.png';
assert(fs.existsSync(path),'Coral sprite missing');
const png=fs.readFileSync(path);
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
assert.equal(png.readUInt32BE(16),2048,'four 512px frames, horizontal');
assert.equal(png.readUInt32BE(20),644,'submerged artwork: four 512x644 frames');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8 alpha, noninterlaced');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
 'd5e53e77468d1771095c0ba8e1b94e6723704e598d9ebae417636c3de7b5876f',
 'Committed bytes must match the user-uploaded 27 Oct 2026 submerged sheet');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('coral-animated', 'assets/v15/beast_coral.png'"),
 'Coral must be loaded as four-frame spritesheet, not a single image');
assert(/frameWidth:512,\s*frameHeight:644,\s*endFrame:3/.test(game),'exact frame dimensions');
assert(game.includes("coral:'coral-animated'"),'Coral enemy must use animated texture');
assert(game.includes("type==='coral' && tex==='coral-animated'"),
 'Use a single frame height for sprite scaling');
assert(game.includes("type==='coral' && e.ship.texture.key==='coral-animated'"),
 'Advance frames in the visual render loop');
assert(game.includes("e.coralFrame!==frame")&&game.includes("e.ship.setFrame(frame)"),
 'Frame caching and actual frame changes required');
assert(game.includes("e.type==='enguia'||e.type==='recife'||"),
 'Other downward-facing monsters retain their own visual +PI correction');
assert(!game.includes("e.type==='enguia'||e.type==='coral'||"),
 'Coral must not receive the previous heading-driven correction');
assert(game.includes("e.type==='coral'?0:"),
 'Coral must have fixed visual rotation 0°, independent of heading');
assert(game.includes("e.heading+(artFacesDown?Math.PI:0)"),
 'Heading remains available for other sprites and physics');
assert(game.includes("e.type==='dagon'?0:"),'Dagon fixed orientation remains untouched');
assert(game.includes("coral: { name: 'Horror de Coral'"),'Enemy stats unchanged');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/v15/beast_coral.png"'),'Offline asset stays precached');
const cacheVersion=Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1]);
assert(cacheVersion>=71,'Cache must refresh the new sprite');
// Execute only paintEnemies in isolation to verify heading changes cannot rotate the coral sprite.
const start=game.indexOf('    paintEnemies() {');
const end=game.indexOf('\n    }',start);
assert(start>=0&&end>start,'paintEnemies should exist');
const Painter=new Function('return class Painter {'+game.slice(start,end+6)+'}')();
function mockEnemy(type,heading){
  return {type,heading,dead:false,x:150,y:175,radius:76,hp:143,maxhp:143,boss:false,
    ship:{rotation:undefined,setPosition(x,y){this.x=x;this.y=y;return this;},
      setRotation(r){this.rotation=r;return this;},
      texture:{key:type==='coral'?'coral-animated':'reef-devourer-animated'}},
    bar:{clear(){return this;},fillStyle(){return this;},fillRect(){return this;}}};
}
const painter=new Painter();
const coral=mockEnemy('coral',0),reef=mockEnemy('recife',0);
painter.enemies=[coral,reef];
for(const heading of [0,Math.PI/3,-Math.PI/2,Math.PI,Math.PI*1.75]){
  coral.heading=reef.heading=heading;
  painter.paintEnemies();
  assert.equal(coral.ship.rotation,0,'Coral sprite must never rotate regardless of heading');
  assert(Math.abs(reef.ship.rotation-(heading+Math.PI))<1e-9,
    'Reef Devourer still faces navigation direction');
}
console.log('PASS Coral submerso (2048x644 RGBA), animation, rotation locked, PWA');
