/* Recife Devorador: separate monster from the existing Horror de Coral.
 * The original uploaded 2048×682 RGBA sprite remains byte-for-byte unchanged.
 */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const vm=require('node:vm');
const asset='assets/abyss/coral_horror.png';
assert(fs.existsSync(asset),'New reef enemy sprite is missing');
const png=fs.readFileSync(asset);
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16),2048,'four original 512px horizontal frames');
assert.equal(png.readUInt32BE(20),682,'original frame height');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
 'f1702259836c17771d3de50c28acdd35ba915fd858bb5cef5b0ef323540b3431',
 'Never overwrite or reprocess the uploaded original');
const original=fs.readFileSync('assets/v15/beast_coral.png');
assert.equal(crypto.createHash('sha256').update(original).digest('hex'),
 '2185dc6e69c8b00e97fe4922d609edeac9d4ba75f1c4613220ca5059e348462e',
 'Original V15 Horror de Coral must remain untouched');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('reef-devourer-animated', 'assets/abyss/coral_horror.png'"),
 'Old unused abyss asset must now be an animated texture');
assert(/frameWidth:512,\s*frameHeight:682,\s*endFrame:3/.test(game),'four complete frames');
assert(!game.includes("this.load.image('foe-coral'"),'Remove unused texture alias');
assert(game.includes("recife: { name: 'Recife Devorador'"),'New enemy must be separate');
assert(game.includes("coral: { name: 'Horror de Coral', hp: 143, speed: 64"),
 'Keep existing monster stats');
assert(game.includes("this.load.spritesheet('coral-animated', 'assets/v15/beast_coral.png'"),
 'Keep original monster texture and animation');
assert(game.includes("coral:'coral-animated', recife:'reef-devourer-animated'"),
 'Keep unique texture mapping');
assert(game.includes("type==='recife' && tex==='reef-devourer-animated'"),
 'Frame scaling must use one frame');
assert(game.includes("'coral','recife','caranguejo'"),'Recife needs monster behavior');
assert(game.includes("type==='coral'||type==='recife'||type==='afogados'"),
 'New monster must start with frame zero without altering the old one');
assert(game.includes("e.type==='recife' && e.ship.texture.key==='reef-devourer-animated'"));
assert(game.includes("Math.floor((t*4+e.visualPhase)%4)"));
assert(game.includes("e.reefFrame!==frame")&&game.includes("e.ship.setFrame(frame)"),
 'Four-frame visual loop must actually progress');
assert(game.includes("e.type==='enguia'||e.type==='coral'||"),
 'Existing bow-down correction remains exclusive to existing coral');
assert(game.includes("if (rank >= 7) pool.push('recife')"),
 'New monster must be in random encounters');
assert(game.includes("this.mode === 'mission' && this.stage === 7) this.spawnEnemy('recife', 720)"),
 'First guaranteed story appearance');
assert(game.includes("if (this.wave === 3) this.spawnEnemy('recife', 610)"),
 'First guaranteed sandbox appearance');
assert(game.includes("if(e.type==='kraken')this.tentacleAttack(e)"),
 'Kraken encounter remains intact');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/abyss/coral_horror.png"'),'Precache replacement at existing path');
assert(sw.includes('"./assets/v15/beast_coral.png"'),'Keep other coral precached');
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=79,'Bump offline revision');
console.log('PASS independent Recife Devorador, original Coral preserved, animation, both modes, PWA');
