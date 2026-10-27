const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('SeaOceanV3.js','utf8');
function exercise(desktop){
 const ctx={SEA_DESKTOP:true,SEA_TOUCH:!desktop,SEA_VIEW:{width:desktop?1280:480,height:desktop?720:800},Phaser:{Textures:{FilterMode:{NEAREST:'nearest'}}}};
 vm.createContext(ctx);vm.runInContext(src+';this.ocean=SEA_OCEAN_V3;',ctx);const ocean=ctx.ocean;
 const requests=[],textures={};
 const scene={game:{renderer:desktop?{gl:{MAX_TEXTURE_SIZE:4096,getParameter(){return 4096}}}:{}},
   load:{spritesheet(key,path,config){requests.push({key,path,config})},image(key,path){requests.push({key,path})}},
   textures:{exists(key){return !!textures[key]},get(key){return {setFilter(){}}}},
   cameras:{main:{scrollX:0,scrollY:0}},
   add:{image(x,y,key,frame){return {pos:null,tex:null,setOrigin(){return this},setDepth(){return this},setPosition(x,y){this.pos=[x,y];return this},setTexture(key,frame){this.tex=[key,frame];return this}}}}
 };
 ocean.preload(scene);assert.equal(requests.length,4);assert(requests.every(r=>desktop?r.config.frameWidth===1024:r.path.endsWith('_base.webp')));
 for(const r of requests)textures[r.key]=true;
 assert(ocean.create(scene));assert(scene.seaV3Tiles.length>=9);
 let ts=scene.seaV3Tiles.map(x=>x.sprite.tex[0]);
 ocean.update(scene,0.17);if(desktop)assert(scene.seaV3Tiles.every(x=>x.sprite.tex[1]===1));
 scene.cameras.main.scrollX=1050;scene.cameras.main.scrollY=119;
 ocean.update(scene,0.33);
 assert(scene.seaV3Tiles.some(x=>x.col===0));
 for(let col=-4;col<=5;col++)for(let row=-2;row<=5;row++)assert.equal(ocean.variant(col,row),ocean.variant(col,row));
 return requests;
}
exercise(true);exercise(false);console.log('PASS SeaOceanV3 desktop/mobile');

// Original illustrations were transcoded to WebP q94 for in-game delivery.
const expected={
 'sea_chunk_01_base.webp':'3063bb6b7828ea68203c7c2a3555fc7eb49619484bf57af35acfa947e0ff4fc3',
 'sea_chunk_01_atlas.webp':'d9fa4fa5a980426641f1e2abf513821f4ae27071c9b8c19901f2857928fa4b3a',
 'sea_chunk_02_base.webp':'da88b1cf77c7232f04d391510aec63ab7435e8905178d0e9a67d3c97dfabce3c',
 'sea_chunk_02_atlas.webp':'baee343e4d8f41a9ecdb3a2020ee046da44d15ff7da46ad7ebabd75dd9f361dd',
 'sea_chunk_03_base.webp':'98a66add73163ba6c6e013c7bbfd225ecc947282f8dfbb0ac160e3508e4873c4',
 'sea_chunk_03_atlas.webp':'9e0fa9142d46c388bb56c1b9f090c624ecb6c56b9211b1ebb81cf3cfbcc2029e',
 'sea_chunk_04_base.webp':'1bccb7183127aa95105929538687331a0154e4c6c572ef14e99604131b1e35f0',
 'sea_chunk_04_atlas.webp':'ec64557ca348652059704e45ed7d26bfc87836504f839879c0bdb2881e761712'};
const crypto=require('node:crypto');
for(const [name,sha] of Object.entries(expected)){
 const path='assets/tiles/sea-v3/'+name;
 assert(fs.existsSync(path),'Missing ocean asset '+path);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),sha);
}
console.log('PASS SeaOceanV3 8 asset checksums');