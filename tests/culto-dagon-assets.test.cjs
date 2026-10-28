/* Culto de Dagon — 20 etapas de navio: contrato de integridade dos assets. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const base='assets/player/culto_dagon/';
const source=base+'Evolucao_de_Navios_Eldritch_Culto_de_Dagon_original.png';
const atlas=base+'mar_de_sangue_navio_culto_dagon_20_evolucoes.png';
const manifest=JSON.parse(fs.readFileSync(base+'mar_de_sangue_navio_culto_dagon_manifest.json','utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function png(p) {
  const bytes=fs.readFileSync(p);
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',p+' must be a PNG');
  assert.equal(bytes[25],6,p+' must be RGBA');
  return [bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
}
assert.deepEqual(png(source),[1213,1296]);
assert.deepEqual(png(atlas),[1460,1560]);
assert.equal(sha(source),'59d50d3ef2371af640b6a4f98ba60cd1b91b090daebc3f3ff31345ea65c98008');
assert.equal(sha(atlas),'07b5591fd7f4aa23666c376a099addae6a3c69531066ad1c41e065b44df40b3c');
assert.equal(manifest.source_sha256,sha(source));
assert.equal(manifest.atlas_sha256,sha(atlas));
assert.equal(manifest.faction,'culto');
assert.equal(manifest.status,'staged_art_only');
assert.equal(manifest.orientation.bow,'down');
assert.equal(manifest.orientation.stern,'up');
assert.deepEqual(manifest.grid,{columns:5,rows:4,frame_width:260,frame_height:360,horizontal_gap:40,vertical_gap:40});
assert.equal(manifest.sprites.length,20);
const generated=new Set(fs.readdirSync(base+'evolucoes').filter(p=>p.endsWith('.png')));
assert.equal(generated.size,20);
for(let i=0;i<20;i++){
  const frame=manifest.sprites[i];
  const name='navio_culto_dagon_nivel_'+String(i+1).padStart(2,'0')+'.png';
  assert.equal(frame.level,i+1);
  assert.equal(frame.row,Math.floor(i/5));
  assert.equal(frame.column,i%5);
  assert.equal(frame.file,name);
  assert.deepEqual(frame.atlas_rect,{x:(i%5)*300,y:Math.floor(i/5)*400,width:260,height:360});
  assert.equal(frame.anchor.x,130);
  assert.equal(frame.anchor.y,352);
  const path=base+'evolucoes/'+name;
  assert(generated.has(name));
  assert.deepEqual(png(path),[260,360]);
  assert.equal(sha(path),frame.sha256,'frame hash mismatch: '+name);
  assert(frame.source_rect.x>=0&&frame.source_rect.y>=0);
  assert(frame.source_rect.x+frame.source_rect.width<=1213);
  assert(frame.source_rect.y+frame.source_rect.height<=1296);
  assert(frame.content_rect.x>=0&&frame.content_rect.y>=0);
  assert(frame.content_rect.x+frame.content_rect.width<=260);
  assert(frame.content_rect.y+frame.content_rect.height<=360);
}
const game=fs.readFileSync('Game.js','utf8');
assert(game.includes("this.load.spritesheet('player-ship-stages'"),'standard player ship remains the active fallback');
console.log('PASS Dagon: original + normalized atlas, 20 RGBA stages, manifest and SHA-256 integrity');
