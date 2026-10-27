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
assert.equal(png.readUInt32BE(20),682,'original full frame height');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8 alpha, noninterlaced');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
 '2185dc6e69c8b00e97fe4922d609edeac9d4ba75f1c4613220ca5059e348462e',
 'Committed bytes must match the original 26 Oct 2026 sheet');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('coral-animated', 'assets/v15/beast_coral.png'"),
 'Coral must be loaded as four-frame spritesheet, not a single image');
assert(/frameWidth:512,\s*frameHeight:682,\s*endFrame:3/.test(game),'exact frame dimensions');
assert(game.includes("coral:'coral-animated'"),'Coral enemy must use animated texture');
assert(game.includes("type==='coral' && tex==='coral-animated'"),
 'Use a single frame height for sprite scaling');
assert(game.includes("type==='coral' && e.ship.texture.key==='coral-animated'"),
 'Advance frames in the visual render loop');
assert(game.includes("e.coralFrame!==frame")&&game.includes("e.ship.setFrame(frame)"),
 'Frame caching and actual frame changes required');
assert(game.includes("e.type==='enguia'||e.type==='coral'||"),
 'Bow down must receive a +PI render correction');
assert(game.includes("e.heading+(artFacesDown?Math.PI:0)"),
 '180 degree offset belongs only to the drawn sprite');
assert(game.includes("e.type==='dagon'?0:"),'Dagon fixed orientation remains untouched');
assert(game.includes("coral: { name: 'Horror de Coral'"),'Enemy stats unchanged');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/v15/beast_coral.png"'),'Offline asset stays precached');
const cacheVersion=Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1]);
assert(cacheVersion>=71,'Cache must refresh the new sprite');
console.log('PASS original Coral spritesheet (2048x682 RGBA), animation, bow-down orientation, PWA');
