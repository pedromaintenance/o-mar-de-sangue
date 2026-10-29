/* Sobreviventes — preserve original 20-stage atlas and add separate animated final. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const base='assets/player/sobreviventes/';
const expectedFrameShas=["4dd3f23a3594290436e286d6b72ae597d7af3016","7052bfea9b2691c278241250cf7293545c407872","dc05062e1189b5eb33e79d3a037883856456ce1e","9648302b7726270e40d081488dafcbb3c69a5cda","a52a56c1e4dd8d63b444a77fd4c14ed87d171d55","f49b324b428be9a6550b6eb3da34b24dc9cb3b3a","b9321beb3a663f10bdc3ccb47e1a41375d78c1de","78754700fe0d57343a7071f0915f4cf5a24a1c1a","3d8de17b7ffce507f38a93d6f2be19dbd85e90a7","480d2ab1c879710a88f04c4ec73d411a8e896bd6","06b5eab10e65f5a838fc37325aa0700edc91d8ec","6d92f78b190f1383c57d4102718a0b06b3a37fed","2127a40d50ac90c9f27b26c7e25dd151d89395ee","83b1f8f2d674986f25a15a2b2bdca67579720c6a","c9830fb6a674373fbfd5263beafa44f3b9e218b6","bf78546a7bd6a135b3343ed84011406b41ffd5a4","8f0bbadccbe83ee7b5b2169b92e34952a641d8e7","900d2b3a26c772e0d790c48740947c7c8cb76fe2","fdb5bfb3e3301b79fcbd0f7ac218869c302d5fca","23deb8f11cc4f59156ae653020fc0786d6caee74"];
function fileSha(path){
 const b=fs.readFileSync(path);
 return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
}
function dimensions(path){
 const b=fs.readFileSync(path);
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',path+': valid PNG');
 assert.equal(b[25],6,path+': RGBA transparency support');
 return [b.readUInt32BE(16),b.readUInt32BE(20)];
}
const atlasPath=base+'mar_de_sangue_navio_sobreviventes_20_evolucoes.png';
const manifestPath=base+'mar_de_sangue_navio_sobreviventes_manifest.json';
assert.equal(fileSha(atlasPath),'cea4f80a2d873b6fafc9434be99bd44c31980d3b');
assert.equal(fileSha(manifestPath),'56f06f3e7520c32717b9df37c40f881e95f6e807');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(atlasPath)).digest('hex'),
 '829d69f7ea8a48a30b66b08b4d990af98c935b8ae338461c968568e95699efe1',
 'Unmodified original provided atlas');
assert.deepEqual(dimensions(atlasPath),[1460,1560]);
const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert.equal(m.faction,'Sobreviventes');
assert.equal(m.theme,'Deméter / vida, colheita, proteção e sobrevivência');
assert.deepEqual(m.atlas_size,{width:1460,height:1560});
assert.equal(m.layout.rows,4);
assert.equal(m.layout.columns,5);
assert.equal(m.layout.reading_order,'left_to_right_top_to_bottom');
assert.deepEqual(m.frame_size,{width:260,height:360});
assert.deepEqual(m.gutter_px,{horizontal:40,vertical:40});
assert.equal(m.orientation.bow,'down');
assert.equal(m.orientation.stern,'up');
assert.equal(m.orientation.view,'top-down');
assert.equal(m.frames.length,20);
for(let i=0;i<20;i++){
 const frame=m.frames[i];
 const name='navio_sobreviventes_nivel_'+String(i+1).padStart(2,'0')+'.png';
 assert.equal(frame.level,i+1);
 assert.equal(frame.file,name);
 assert.equal(frame.row,Math.floor(i/5));
 assert.equal(frame.col,i%5);
 assert.equal(frame.x,(i%5)*300);
 assert.equal(frame.y,Math.floor(i/5)*400);
 assert.equal(frame.width,260);
 assert.equal(frame.height,360);
 assert.equal(frame.blue_water,i===19);
 assert.equal(frame.approved_reference_exact,i===19);
 const path=base+'evolucoes/'+name;
 assert.deepEqual(dimensions(path),[260,360]);
 assert.equal(fileSha(path),expectedFrameShas[i],'Original pixel-preserving export '+name);
}
assert.equal(m.level_20_reference,'a_highly_detailed_fantasy_pixel_art_isometric_sty.png');
// This reference is metadata only: no separate high-resolution file was supplied.
assert(!fs.existsSync(base+'referencia_final/'+m.level_20_reference));
const game=fs.readFileSync('Game.js','utf8');
assert(game.includes("assets/player/mar_de_sangue_navio_proa_baixo_20_evolucoes.png"),
 'Existing player ship remains the active default');
assert(game.includes('SEA_FACTIONS.final20.texture'),'Level 20 animated texture is loaded independently');
console.log('PASS Sobreviventes: original 20-stage atlas preserved; animated level 20 separate');
