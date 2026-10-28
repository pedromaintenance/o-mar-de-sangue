/* Visual-only orientation contract: ships and eel rotate; other monsters do not.
 * Deliberately execute the real paintEnemies() implementation without Phaser.
 */
'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const game = fs.readFileSync('Game.js', 'utf8');
new vm.Script(game, {filename:'Game.js'});

const start = game.indexOf('    paintEnemies() {');
const end = game.indexOf('\n    }', start);
assert(start >= 0 && end > start, 'paintEnemies() must exist');
const Painter = new Function('return class Painter {' + game.slice(start, end + 6) + '}')();

const monsters = [
  'afogados', 'coral', 'recife', 'caranguejo', 'tartaruga',
  'tentaculo', 'kraken', 'dagon', 'dagon_senhor', 'olho_dagon'
];
const ships = [
  'patrulha', 'corsario', 'ariete', 'bombardeiro', 'espectral',
  'fragata', 'galeao', 'almirante', 'cultista', 'nauabissal'
];
function mockEnemy(type, isMonster, heading) {
  return {
    type, isMonster, heading, dead:false, x:150, y:175,
    radius:80, hp:100, maxhp:100, boss:false,
    ship:{
      texture:{key:type==='ariete'?'v15-ram':type==='cultista'?'cult-barge-animated':'test-texture'},
      rotation:undefined,
      setPosition(x,y){this.x=x;this.y=y;return this;},
      setRotation(rotation){this.rotation=rotation;return this;}
    },
    bar:{
      clear(){return this;}, fillStyle(){return this;}, fillRect(){return this;}
    }
  };
}

const painter = new Painter();
const objects = [
  ...monsters.map(type => mockEnemy(type, true, 0)),
  mockEnemy('enguia', true, 0),
  ...ships.map(type => mockEnemy(type, false, 0))
];
painter.enemies=objects;

for(const heading of [0, Math.PI/3, -Math.PI/2, Math.PI, Math.PI*1.75]){
  for(const enemy of objects) enemy.heading=heading;
  painter.paintEnemies();
  for(const enemy of objects){
    assert.equal(enemy.heading, heading, 'visual rendering must not change physics heading: '+enemy.type);
    let expected;
    if(monsters.includes(enemy.type)) expected=0;
    else expected=heading+(['enguia','cultista','ariete'].includes(enemy.type)?Math.PI:0);
    assert(Math.abs(enemy.ship.rotation-expected)<1e-9,
      enemy.type+' rotation: expected '+expected+', received '+enemy.ship.rotation);
  }
}
assert(game.includes('Math.sin(e.heading) * thrust') && game.includes('Math.cos(e.heading) * thrust'),
  'Monsters must still travel using the independent AI heading');
assert(game.includes('e.ship.setFrame(frame)'), 'Sprite-sheet animations must remain active');
console.log('PASS: ten monster types fixed at 0 degrees, eel and ten ships track heading');
