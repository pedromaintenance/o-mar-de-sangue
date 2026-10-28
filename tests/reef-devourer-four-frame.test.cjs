/* Recife Devorador: separate monster from the existing Horror de Coral.
 * The new supplied 2292×724 RGBA submerged sheet must be byte-for-byte exact.
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
assert.equal(png.readUInt32BE(16),2292,'four 543px frames with three 40px spacers');
assert.equal(png.readUInt32BE(20),724,'submerged frame height');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
 '7508f19bd40825d0702a577b8f1df0bd05968e0c96f335992690844eda228ba4',
 'Must match unmodified 28 Oct 2026 ZIP spritesheet exactly');
const newCoral=fs.readFileSync('assets/v15/beast_coral.png');
assert.equal(crypto.createHash('sha256').update(newCoral).digest('hex'),
 'd5e53e77468d1771095c0ba8e1b94e6723704e598d9ebae417636c3de7b5876f',
 'Horror de Coral must use the new uploaded submerged artwork; the independent reef remains unchanged');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('reef-devourer-animated', 'assets/abyss/coral_horror.png'"),
 'Old unused abyss asset must now be an animated texture');
assert(/frameWidth:543,\s*frameHeight:724,\s*spacing:40,\s*endFrame:3/.test(game),'four 543×724 frames with 40px spacing');
assert(!game.includes("this.load.image('foe-coral'"),'Remove unused texture alias');
assert(game.includes("recife: { name: 'Recife Devorador'"),'New enemy must be separate');
assert(game.includes("coral: { name: 'Horror de Coral', hp: 143, speed: 64"),
 'Keep existing monster stats');
assert(game.includes("this.load.spritesheet('coral-animated', 'assets/v15/beast_coral.png'"),
 'Keep original monster texture and animation');
assert(game.includes("coral:'coral-animated', recife:'reef-devourer-animated'"),
 'Keep unique texture mapping');
assert(game.includes("type==='recife' && tex==='reef-devourer-animated' ? 724"),
 'Frame scaling must use one 724px frame');
assert(game.includes("'coral','recife','caranguejo'"),'Recife needs monster behavior');
assert(game.includes("type==='coral'||type==='recife'||type==='afogados'"),
 'New monster must start with frame zero without altering the old one');
assert(game.includes("e.type==='recife' && e.ship.texture.key==='reef-devourer-animated'"));
assert(game.includes('const sequence=[0,1,2,3,2,1]'),'Reef animation should ping-pong 1-2-3-4-3-2');
assert(game.includes('t*1000/175+e.visualPhase'),'Reef ping-pong interval should be 175ms');
assert(game.includes("e.reefFrame!==frame")&&game.includes("e.ship.setFrame(frame)"),
 'Four-frame visual loop must actually progress');
assert(game.includes("e.type==='enguia'||e.type==='cultista'||"),
 'Only eel and downward-facing ship sprites need the +PI correction');
assert(game.includes("const fixedMonsterArt=e.isMonster && e.type!=='enguia';"),
 'Reef Devourer and Horror de Coral both maintain 0° visual orientation');
assert(game.includes("e.heading+(artFacesDown?Math.PI:0)"),
 'Rotation correction must never change physics heading');
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
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=90,'Bump offline revision');
console.log('PASS exact submerged reef sheet, ping-pong animation, independent fixed Coral, encounter modes, PWA');
