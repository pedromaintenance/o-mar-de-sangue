/* Drowned sprite exact source / four-frame gameplay regression contract. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const vm=require('node:vm');
const path='assets/v15/beast_drowned.png', data=fs.readFileSync(path);
assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Original PNG');
assert.equal(data.readUInt32BE(16),2048,'Sheet must retain 2048px width');
assert.equal(data.readUInt32BE(20),682,'Sheet must retain 682px height');
assert.equal(crypto.createHash('sha256').update(data).digest('hex'),
 '1c4f59aeed5167219ffcd2635bfeba71f9db8bedc29772eebe03bf9edf6f7db7',
 'The image MUST be the exact RGBA asset sent by the user');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('v15-drowned', 'assets/v15/beast_drowned.png'"));
assert(/frameWidth:512,\s*frameHeight:682,\s*endFrame:3/.test(game),'4 animation frames');
assert(game.includes("afogados:'v15-drowned'"),'Enemy spawns using new source');
assert(game.includes("type==='afogados'?0:dagonInitialFrame"),'Starts frame zero');
assert(game.includes("e.type==='afogados' && e.ship.texture.key==='v15-drowned'"));
assert(game.includes("e.ship.setFrame(frame)"),'Frames switch in update');
assert(game.includes("e.drownedFrame!==frame"),'No redundant frame mutation');
assert(game.includes("e.ship.setAlpha(e.type==='afogados' ?"),'Ghost transparency preserved');
assert(game.includes("e.heading+(artFacesDown?Math.PI:0)"),'Physics heading renderer retained');
assert(game.includes("this.spawnEnemy('afogados'"),'Boss Dagon still conjures drowned minions');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/v15/beast_drowned.png"'),'Precache spritesheet');
assert(sw.includes('v71-drowned-sprites'),'Bump precache');
console.log('PASS original drowned: exact 2048x682 PNG, 4 frames, existing gameplay intact');
