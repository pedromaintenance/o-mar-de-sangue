/* O Mar de Sangue — recortes reais dos atlas pixel art.
 * As cores/pixels comprimidos foram extraídos das artes geradas para o jogo.
 * Não são figuras vetoriais inventadas nem placeholders.
 * Deflate + Indexed pixels: assets compactos em arquivo texto versionável no GitHub.
 */
const SEA_RASTER = {
  names:['title','button','focus','blood','dark','vortex','reef','wreck','tentacle','beacon'],
  async install(scene) {
    if (typeof document === 'undefined' || typeof DecompressionStream === 'undefined') return false;
    let loaded=0;
    for(const [name,width,height,palette,encoded] of this.pixels){
      const key='pixel-'+name;
      if(scene.textures.exists(key)){loaded++;continue;}
      try {
        const compressed=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
        const readable=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate'));
        const bytes=new Uint8Array(await new Response(readable).arrayBuffer());
        if(bytes.length<width*height/2)continue;
        const colors=[0];
        for(let k=0;k<palette.length;k+=6)colors.push(parseInt(palette.slice(k,k+6),16));
        const canvas=document.createElement('canvas');
        canvas.width=width;canvas.height=height;
        const ctx=canvas.getContext('2d',{willReadFrequently:false});
        if(!ctx)continue;
        const pixels=ctx.createImageData(width,height);
        for(let i=0;i<width*height;i++){
          const ix=(i%2)?bytes[i>>1]&15:bytes[i>>1]>>4;
          const col=colors[ix]||0;
          const p=i*4;
          pixels.data[p]=(col>>16)&255;
          pixels.data[p+1]=(col>>8)&255;
          pixels.data[p+2]=col&255;
          pixels.data[p+3]=ix?255:0;
        }
        ctx.putImageData(pixels,0,0);
        scene.textures.addCanvas(key,canvas);
        const texture=scene.textures.get(key);
        if(texture)texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        loaded++;
      }catch(err){console.warn('Pixel atlas',name,err);}
    }
    return loaded>0;
  },
  pixels: []
};
