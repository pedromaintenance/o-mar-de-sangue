/* O Mar de Sangue — eight-frame pirate coin, normalized from supplied artwork. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const vm=require('node:vm');
const file='assets/items/treasure_coin.png';
assert(fs.existsSync(file),'Animated coin spritesheet is missing');
const png=fs.readFileSync(file);
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
assert.equal(png.readUInt32BE(16),2176,'Eight frames must each be 272 pixels wide');
assert.equal(png.readUInt32BE(20),272,'Frame height must be 272 pixels');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],'RGBA8, no interlace');
assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
 '935e0631c0a9644e52ea4cf73823529aabd0e96b46492f10dc20e720961e15b3',
 'The centered, original-art frames must match the reviewed normalized spritesheet');
const game=fs.readFileSync('Game.js','utf8');
new vm.Script(game,{filename:'Game.js'});
assert(game.includes("this.load.spritesheet('treasure-coin', 'assets/items/treasure_coin.png'"),'spritesheet preload');
assert(/frameWidth:272,\s*frameHeight:272,\s*endFrame:7/.test(game),'eight equal-sized frames');
assert(!game.includes("this.load.image('treasure-coin'"),'remove static load');
assert(game.includes("'treasure-coin':.16"),'adjust coin scale for normalized cell size');
assert(game.includes("(kind==='treasure-chest'||kind==='treasure-coin')?0:undefined"),
 'spawn must begin animated pickups at frame 0');
assert(game.includes("coinSprite:kind==='treasure-coin'?sprite:null,coinFrame:0"),
 'pickup must keep coin sprite reference and cached frame');
assert(game.includes("if(loot.coinSprite?.active)"),'coin must animate only while in scene');
assert(game.includes("Math.floor((t*10+loot.phase)%8)"),'coin rotates at 10 FPS through 8 frames');
assert(game.includes("loot.coinSprite.setFrame(frame)"),'update coin frame');
assert(game.includes("loot.coinFrame!==frame"),'avoid redundant frame changes');
assert(game.includes("const kind=fromEnemy?'treasure-chest'"),'enemies still drop chests');
assert(/this\.gold = SEA_MATH\.safe\(this\.gold \+\s*SEA_FACTION_POLITICS\.treasure\(this,t\.value\)\)/.test(game),
 'pickup keeps its value and applies the established Court faction bonus');
assert(game.includes("t.coin.destroy(); this.burst("),'collection destroys coin');
assert(game.includes("this.load.image('treasure-crate'"),'crate still static');
assert(game.includes("this.load.spritesheet('treasure-chest'"),'floating chest still animated');
assert(game.includes("loot.chestSprite.setFrame(frame)"),'chest remains animated');
const sw=fs.readFileSync('sw.js','utf8');
assert(sw.includes('"./assets/items/treasure_coin.png"'),'offline precache includes coin');
assert(Number(sw.match(/omar-mar-de-sangue-v(\d+)-/)?.[1])>=78,'PWA version updated');
console.log('PASS: normalized 8-frame coin, rotation, reward, chest, and offline cache');
