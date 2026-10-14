/* O Mar de Sangue v1.9.1 — acabamento pixel-art procedural
 * Os atlas ilustrados ficam como direção de arte; estes elementos são leves,
 * desenhados em blocos de pixels e não dependem de downloads binários.
 */
const SEA_PIXEL = {
  palette: [0x0e1521,0x142432,0x283442,0x4b2736,0x7e3341,0x9b554f,0xcda76e,0xe8cf9e,0x245858,0x3b8781],
  hash(x,y,seed=11) {
    let n=((x*374761393+y*668265263+seed*2246822519)|0);
    n=Math.imul(n^(n>>>13),1274126177);
    return ((n^(n>>>16))>>>0)/4294967295;
  },
  star(g,x,y,size=9) {
    const gold=0xcda76e;
    g.fillStyle(gold,.88).fillRect(Math.round(x-size/2),Math.round(y-1),size,3);
    g.fillRect(Math.round(x-1),Math.round(y-size/2),3,size);
    g.fillStyle(0xf7e2af,.96).fillRect(Math.round(x),Math.round(y),2,2);
    g.fillStyle(0x8b3e45,.95).fillRect(Math.round(x-1),Math.round(y-1),2,2);
  },
  skull(g,x,y,size=2) {
    const u=size;
    g.fillStyle(0xe2ceab,1);
    g.fillRect(x+u,y,5*u,4*u);
    g.fillRect(x, y+u,7*u,2*u);
    g.fillRect(x+2*u,y+4*u,3*u,2*u);
    g.fillStyle(0x13212c,1);
    g.fillRect(x+u,y+2*u,2*u,u);
    g.fillRect(x+4*u,y+2*u,2*u,u);
    g.fillRect(x+3*u,y+4*u,u,u);
  },
  rope(g,x,y,w) {
    const unit=9;
    for(let p=0;p<w;p+=unit) {
      g.fillStyle(0x4f392c,.92).fillRect(x+p,y,unit,4);
      g.fillStyle(0xb79664,.95).fillRect(x+p+1,y,Math.max(2,unit-3),2);
      g.fillStyle(0xd5b97b,.86).fillRect(x+p+2,y-1,2,5);
    }
  },
  menu(scene) {
    const g=scene.add.graphics().setDepth(18);
    // Acabamento de pixel art sobre as molduras existentes.
    const page=scene.page;
    for(const edge of [24,455]){
      for(let y=35;y<762;y+=31){
        const v=this.hash(edge,y);
        g.fillStyle(v>.78?0xa07c52:0x293d46,v>.78?.85:.75);
        g.fillRect(edge,y,3,v>.78?8:4);
      }
    }
    this.rope(g,37,24,397);this.rope(g,37,767,397);
    for(const y of [175,364,738]){
      this.star(g,36,y,11);this.star(g,444,y,11);
    }
    if(page==='menu'){
      // Faixa sob o título; nunca cobre os textos ou os alvos interativos.
      this.rope(g,67,180,344);
      for(let i=0;i<7;i++){
        const px=80+i*53;
        g.fillStyle(i%2?0x882b42:0x245c65,.83);
        g.fillRect(px,185,18,3);g.fillRect(px+6,188,8,3);
      }
      this.skull(g,37,431,2);this.skull(g,427,431,2);
    }else if(page==='yard'){
      this.star(g,240,173,14);
    }else if(page==='result'){
      this.rope(g,37,475,397);
    }else if(page==='help'){
      this.star(g,240,143,13);
    }
    if(SEA_DESKTOP) {
      for(const x of [-373,-45,527,855]){
        this.star(g,x,132,17);this.star(g,x,676,17);
      }
    }
  },
  seaInit(scene) {
    if(!scene.seaBase)return;
    scene.seaPixelG=scene.add.graphics().setScrollFactor(0).setDepth(-106.6);
    scene.seaPixelT=0;
    // Borda de espuma e pequenos vestígios são elementos visuais, não colisores.
    this.seaFrame(scene,0);
  },
  seaFrame(scene,t) {
    const g=scene.seaPixelG;if(!g)return;
    const width=SEA_VIEW.width,height=SEA_VIEW.height;
    const camX=scene.cameras.main.scrollX||0,camY=scene.cameras.main.scrollY||0;
    const tile=28,step=6, offX=((camX*.44+t*12)%tile+tile)%tile,
          offY=((camY*.37+t*8)%tile+tile)%tile;
    g.clear();
    const storm=scene.seaEvent==='storm';
    const fog=scene.seaEvent==='fog';
    const cursed=scene.curse>=65;
    const count=SEA_DESKTOP?190:110;
    for(let i=0;i<count;i++){
      const x=Math.floor(this.hash(i,3)* (width+tile));
      const y=Math.floor(this.hash(i,9)* (height+tile));
      const px=Math.floor((x-offX)/step)*step,
            py=Math.floor((y-offY)/step)*step;
      const flicker=this.hash(i,Math.floor(t*1.5));
      if(flicker<.22)continue;
      const color=storm?0x8b9ba4:
            cursed?(i%4===0?0xb54d55:0x61283b):
            i%5===0?0xbd7770:i%3===0?0x9e8d7d:0x3b7879;
      const alpha=(fog?.24:.20)+(flicker>.90?.17:0);
      g.fillStyle(color,alpha);
      g.fillRect(px,py,3+(i%3)*3,i%6===0?3:2);
      if(i%11===0){
        g.fillStyle(i%2?0xcf6b72:0x9fbbba,alpha*.72);
        g.fillRect(px+6,py+4,12,2);
      }
    }
    if(cursed||storm)for(let i=0;i<11;i++){
      const x=Math.floor((this.hash(i,19)*width+t*8*(i%2?1:-1)+width*8)%width);
      const y=Math.floor(this.hash(i,23)*height);
      g.fillStyle(cursed?0xaa354c:0xc0d0c9,.25);
      g.fillRect(x,y,18+(i%3)*9,2);
    }
  },
  seaUpdate(scene,dt) {
    if(!scene.seaPixelG)return;
    scene.seaPixelT+=(dt||0);
    if(scene.seaPixelT-scene.seaPixelLast<.12)return;
    scene.seaPixelLast=scene.seaPixelT;
    this.seaFrame(scene,scene.seaPixelT);
  }
};
