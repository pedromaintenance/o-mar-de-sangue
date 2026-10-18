/* 3.8a.4: the v1.5 Coral Horror PNG must not retain the atlas strip.
 * Test actual PNG bytes, CRC and decoded dimensions; no external packages.
 */
const fs=require('node:fs'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const path='assets/v15/beast_coral.png';
const png=fs.readFileSync(path),sig=Buffer.from('89504e470d0a1a0a','hex');
assert(png.subarray(0,8).equals(sig),'expected PNG signature');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
assert.equal(width,323);
assert.equal(height,302,'cropped image must exclude 28 stray atlas rows');
assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0],
 'retain RGBA8 noninterlaced transparency');
assert(png.length<210000,'asset should stay reasonably small');
let off=8,foundIend=false,idat=[];
const crcTable=Array.from({length:256},(_,i)=>{
 let c=i;for(let n=0;n<8;n++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;return c>>>0;
});
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
while(off<png.length){
 const len=png.readUInt32BE(off),kind=png.toString('ascii',off+4,off+8);
 assert(len>=0&&off+12+len<=png.length,'invalid PNG chunk');
 const tagAndData=png.subarray(off+4,off+8+len);
 const stored=png.readUInt32BE(off+8+len);
 assert.equal(crc32(tagAndData),stored,'PNG CRC '+kind);
 if(kind==='IDAT')idat.push(png.subarray(off+8,off+8+len));
 off+=12+len;
 if(kind==='IEND'){foundIend=true;break;}
}
assert(foundIend&&idat.length,'valid PNG image data');
const pixels=zlib.inflateSync(Buffer.concat(idat));
const stride=1+width*4;
assert.equal(pixels.length,stride*height);
assert.equal(pixels[0],0,'cropped top row is reconstructed without dependence on removed pixels');
let colored=0,topColored=0,bottomColored=0;
for(let y=0;y<height;y++){
 const rawRow=pixels.subarray(y*stride+1,(y+1)*stride);
 // For filtered rows, alpha bytes are not raw alpha, so only count the
 // first reconstructed row and ensure the other rows have content.
 if(y===0){
  for(let i=3;i<rawRow.length;i+=4)if(rawRow[i]>0)topColored++;
 }
 if(y>height-10){
  for(let i=0;i<rawRow.length;i++)if(rawRow[i]!==0)bottomColored++;
 }
 for(const byte of rawRow)if(byte)colored++;
}
assert(colored>20000,'body and detailed artwork must remain');
assert(topColored<100,'coral head has a clean top border with no detached frame');
assert(bottomColored>5,'tentacles must remain in the bottom scanlines');
const game=fs.readFileSync('Game.js','utf8');
assert(game.includes("this.load.image('v15-coral', 'assets/v15/beast_coral.png')"),
 'live game must use corrected PNG, not switch to old placeholder');
assert(game.includes("coral:'v15-coral'"),
 'the v1.5 enemy mapping must still select this artwork');
assert(game.includes("coral: { name: 'Horror de Coral'"),
 'species definition must stay intact');
const worker=fs.readFileSync('sw.js','utf8');
assert(worker.includes('./assets/v15/beast_coral.png'),
 'corrected sprite must remain in PWA offline cache');
const cacheVersion=Number(worker.match(/omar-mar-de-sangue-v(\d+)-/)?.[1]);
assert(cacheVersion>=60,
 'PWA cache version must not regress below coral fix v60');
console.log('PASS 3.8a.4: corrected full PNG, real alpha, image integrity, enemy mapping and offline cache');
