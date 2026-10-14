/* O MAR DE SANGUE — Gothic UI Showcase, v2 visual
   Visual extension only. Default OFF; enable ?gothic=1.
   Reuses existing high-resolution ship/sea sprites, preserving PNG details.
   No re-encoding, quantization or pixel downscaling. */
const SEA_GOTHIC = {
  enabled: typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('gothic') === '1',
  c: {black:0x08090e,abyss:0x10151d,wood:0x221d1e,plank:0x302528,iron:0x37343a,
      wine:0x4c1728,blood:0x842b38,red:0xb64643,brass:0x9f7649,
      gold:0xd7ae70,ivory:0xf5dfad,moss:0x4a7270},
  seed(n){const k=Math.sin(n*127.1+37.39)*43758.545;return k-Math.floor(k);},
  skull(g,x,y,s=1,opacity=1){
    const c=this.c;
    g.fillStyle(0x100c10,opacity*.9).fillRect(x-12*s,y-9*s,24*s,31*s);
    g.fillStyle(0xcdb38b,opacity).fillRect(x-10*s,y-12*s,20*s,20*s);
    g.fillRect(x-7*s,y+6*s,14*s,8*s);
    g.fillStyle(0xf2d7a0,opacity).fillRect(x-6*s,y-10*s,12*s,2*s);
    g.fillStyle(0x1a1417,opacity).fillRect(x-7*s,y-1*s,5*s,5*s);
    g.fillRect(x+2*s,y-1*s,5*s,5*s);
    g.fillStyle(c.wine,opacity).fillRect(x-6*s,y+7*s,12*s,3*s);
    g.fillStyle(0x1a1417,opacity).fillRect(x-2*s,y+3*s,4*s,5*s);
    g.fillStyle(0xecd0a2,opacity);
    for(let i=0;i<4;i++)g.fillRect(x-6*s+i*3.3*s,y+10*s,2*s,5*s);
  },
  rivet(g,x,y,r=2){
    g.fillStyle(0x0a0b12,.9).fillCircle(x+1,y+2,r+1.5);
    g.fillStyle(0xa68659,1).fillCircle(x,y,r);
    g.fillStyle(0xf0cd8a,.8).fillCircle(x-1,y-1,Math.max(.65,r*.4));
  },
  rope(g,x1,x2,y){
    const c=this.c;g.fillStyle(c.iron,1).fillRect(x1,y-3,x2-x1,8);
    for(let x=x1;x<x2-7;x+=9){
      g.fillStyle(0x7b5b3f,1).fillRect(x,y-2,8,6);
      g.fillStyle(0xd2aa6e,.84).fillRect(x+2,y-3,2,8);
      g.fillStyle(0x523a31,.7).fillRect(x+5,y-2,2,6);
    }
  },
  ornament(g,x,y,s=1,tint=0xd3a569){
    g.lineStyle(Math.max(1,2*s),tint,.87);
    g.lineBetween(x-21*s,y,x-6*s,y);
    g.lineBetween(x+6*s,y,x+21*s,y);
    g.fillStyle(tint,.95).fillTriangle(x,y-7*s,x+7*s,y,x,y+7*s);
    g.fillStyle(this.c.wine,1).fillCircle(x,y,3*s);
    g.fillStyle(0xf8d5a0,.8).fillCircle(x-1*s,y-1*s,1.2*s);
  },
  tentacle(g,x,y,endY,side=1,scale=1,opacity=.7){
    const c=this.c,points=[];
    for(let i=0;i<9;i++){
      const p=i/8;
      points.push([x+side*(Math.sin(p*7)*24+Math.sin(p*13)*7)*scale,
                   y+(endY-y)*p]);
    }
    // Thick angular strokes evoke blocky pixel-art tentacles, not smooth vectors.
    for(let i=0;i<8;i++){
      const a=points[i],b=points[i+1],w=Math.max(2,Math.round((8-i*.7)*scale));
      g.lineStyle(w,c.wine,opacity).lineBetween(a[0],a[1],b[0],b[1]);
      g.lineStyle(Math.max(1,w*.33),0xc95655,opacity*.72)
       .lineBetween(a[0]-side*2*scale,a[1],b[0]-side*2*scale,b[1]);
      if(i%2===0){g.fillStyle(0xe9bb8d,opacity*.8).fillCircle(a[0]+side*4*scale,a[1],Math.max(1,(4-i*.22)*scale));}
    }
  },
  panel(g,x,y,w,h,kind='wood'){
    const c=this.c,l=Math.round(x-w/2),t=Math.round(y-h/2);
    const fill=kind==='blood'?0x26131b:kind==='navy'?0x13222a:c.wood;
    // Layered solid metal shell, beveled oak, carved inset, irregular planks.
    g.fillStyle(0x05060a,.85).fillRect(l+5,t+8,w,h);
    g.fillStyle(c.black,.98).fillRect(l,t,w,h);
    g.fillStyle(c.brass,1).fillRect(l+3,t+3,w-6,h-6);
    g.fillStyle(c.iron,1).fillRect(l+6,t+6,w-12,h-12);
    g.fillStyle(fill,1).fillRect(l+10,t+10,w-20,h-20);
    g.fillStyle(0x3d2930,.28);
    for(let yy=t+24;yy<t+h-16;yy+=30){
      g.fillRect(l+14,yy,w-28,2);
      g.fillStyle(0x080e16,.38).fillRect(l+14,yy+2,w-28,2);
    }
    g.lineStyle(1,0xd4a66d,.54).strokeRect(l+13,t+13,w-26,h-26);
    g.fillStyle(c.brass,1).fillRect(l+2,t+17,5,h-34);
    g.fillRect(l+w-7,t+17,5,h-34);
    // Forged corner plates, spikes, cabochons, rivets.
    for(const sx of [-1,1]) for(const sy of [-1,1]){
      const cx=x+sx*(w/2-17),cy=y+sy*(h/2-17);
      g.fillStyle(0x655040,1).fillRect(cx-12,cy-12,24,24);
      g.fillStyle(c.black,.9).fillRect(cx-9,cy-9,18,18);
      g.fillStyle(c.gold,.85).fillTriangle(cx,cy-sy*10,cx-sx*9,cy,cx,cy+sy*10);
      this.rivet(g,cx,cy,2.5);
    }
    for(const sx of [-1,1]){
      const xx=x+sx*(w/2-6);
      for(let yy=t+58;yy<t+h-45;yy+=73)this.rivet(g,xx,yy,2);
    }
    this.ornament(g,x,t+7,1.1);
    this.ornament(g,x,t+h-8,.9);
    return g;
  },
  backdrop(scene){
    if(!this.enabled)return;
    const c=this.c;
    const g=scene.add.graphics().setDepth(-48);
    // The menu has a navigable blood-red coastline, not a generic blue panel.
    g.fillGradientStyle(0x06090f,0x06090f,0x33141e,0x421b26,1,1,1,1);
    g.fillRect(0,0,480,800);
    g.fillStyle(0x7c2532,.21).fillCircle(260,221,139);
    g.fillStyle(0xaa3d45,.14).fillCircle(260,221,115);
    g.fillStyle(0x9a4044,.47).fillCircle(264,223,77);
    g.fillStyle(0xd18b76,.4).fillCircle(264,218,67);
    for(let i=0;i<44;i++){
      const x=12+this.seed(i+51)*455,y=22+this.seed(i+92)*312;
      g.fillStyle(i%5===0?0xc9a67a:0x9aa5a2,.25+this.seed(i+209)*.35);
      g.fillRect(x,y,i%8===0?3:1,i%6===0?3:1);
    }
    // A violent blood sea, stern silhouettes and staggered foam.
    g.fillStyle(0x0a131c,.85).fillRect(0,292,480,508);
    for(let j=0;j<38;j++){
      const yy=298+j*13,x=15+Math.floor(this.seed(j+4)*47);
      g.fillStyle([0x3e1826,0x632333,0x852c38,0x3b3543,0x885348][j%5],.14+.25*this.seed(j));
      for(let xx=x-80;xx<490;xx+=91+((j*7)%19))
        g.fillRect(xx,yy,42+(j%7)*6,2+(j%3));
    }
    for(let i=0;i<9;i++){
      const x=i*65-15;
      g.fillStyle(0x070d12,.87);
      g.fillTriangle(x,315,x+18,258+(i%3)*9,x+40,318);
      g.fillRect(x+15,301,16,17);
    }
    if(scene.textures.exists('sea-foam')){
      scene.add.tileSprite(240,405,480,755,'sea-foam')
        .setDepth(-46).setAlpha(.11).setTint(0xb85f6a);
    }
  },
  decoratePort(scene){
    if(!this.enabled)return;
    const c=this.c,p=scene.page;
    const g=scene.add.graphics().setDepth(11);
    if(p==='menu'){
      this.panel(g,240,566,443,414,'wood');
      this.panel(g,240,359,443,75,'navy');
      // Portal behind the ship; empty center preserves the existing hero art.
      g.lineStyle(4,c.brass,.87).strokeCircle(240,236,97);
      g.lineStyle(2,c.gold,.68).strokeCircle(240,236,89);
      for(let i=0;i<16;i++){
        const a=i*Math.PI/8;
        const ax=240+Math.cos(a)*96,ay=236+Math.sin(a)*96;
        g.fillStyle(i%2?c.gold:0xbe5755,.92).fillRect(ax-2,ay-2,4,4);
      }
      this.skull(g,51,403,1.05);this.skull(g,429,403,1.05);
      this.rope(g,34,446,433);
      for(const side of [-1,1]) {
        const bx=240+side*210;
        this.tentacle(g,bx,318,195,-side,.46,.78);
        this.tentacle(g,bx,752,628,-side,.4,.58);
      }
      // Rusty navigation flourish, discreet enough to keep costs legible.
      this.ornament(g,240,414,1.25);
      this.ornament(g,240,743,1);
      for(const x of [61,419])for(const y of [466,525,583,640,695])this.rivet(g,x,y,2.3);
      if(scene.textures.exists('v15-flagship')){
        const source=scene.textures.get('v15-flagship').getSourceImage();
        const ship=scene.add.image(240,241,'v15-flagship').setDepth(12)
         .setScale(154/(source.height||160)).setAlpha(.92).setRotation(-.035);
        scene.tweens.add({targets:ship,y:246,rotation:.025,duration:3800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      }
    }else if(p==='yard'){
      this.panel(g,240,502,449,495,'wood');
      this.rope(g,35,445,171);
      for(const y of [269,375,485,594,706])this.ornament(g,240,y,.64);
    }else if(p==='help'){
      this.panel(g,240,438,455,581,'navy');
      this.rope(g,31,449,159);
    }else if(p==='reset'){
      this.panel(g,240,423,449,463,'blood');
      this.skull(g,55,420,1.5);this.skull(g,425,420,1.5);
      this.tentacle(g,53,593,272,1,.9,.7);
      this.tentacle(g,427,593,272,-1,.9,.7);
    }else if(p==='result'){
      this.panel(g,240,405,449,505,'wood');
      this.skull(g,46,206,.85);this.skull(g,434,206,.85);
      this.rope(g,34,446,482);
    }
    this.skull(g,34,38,.54,.92);
    this.skull(g,446,38,.54,.92);
    this.ornament(g,240,158,1);
  },
  button(scene,x,y,w,h,style){
    if(!this.enabled)return null;
    const g=scene.add.graphics().setDepth(25.8);
    const api={g,x,y,w,h,style};
    this.repaintButton(api,false);
    return api;
  },
  repaintButton(api,selected){
    if(!api)return;
    const {g,x,y,w,h,style}=api,c=this.c;
    const l=x-w/2,t=y-h/2;
    g.clear();
    const highlight=selected||style==='gold',warning=style==='red';
    const fill=highlight?0x724326:warning?0x461922:0x141d25;
    const edge=highlight?0xf0d29a:warning?0xc57974:0xa88657;
    g.fillStyle(0x090b12,.98).fillRect(l+3,t+4,w,h);
    g.fillStyle(edge,1).fillRect(l,t,w,h);
    g.fillStyle(0x333039,1).fillRect(l+3,t+3,w-6,h-6);
    g.fillStyle(fill,1).fillRect(l+6,t+6,w-12,h-12);
    g.fillStyle(0x1b1217,.35).fillRect(l+9,t+9,w-18,h*.38);
    g.fillStyle(edge,.58).fillRect(l+9,t+5,w-18,2);
    g.fillStyle(0x070a12,.87).fillRect(l+9,t+h-7,w-18,2);
    // Side rails are fixed-width even on 112px-wide tab controls.
    for(const sign of [-1,1]){
      const bx=x+sign*(w/2-13);
      g.fillStyle(edge,.86).fillRect(bx-5,y-9,10,18);
      g.fillStyle(0x101017,1).fillRect(bx-3,y-7,6,14);
      g.fillStyle(highlight?0xffe6ae:0xb59865,.95).fillTriangle(bx,y-6,bx+4,y,bx,y+6);
      this.rivet(g,bx,y,1.6);
    }
    const left=l+32,right=l+w-32;
    if(w>=220){
      g.lineStyle(1,edge,.59).lineBetween(left,t+6,right,t+6);
      g.lineBetween(left,t+h-6,right,t+h-6);
      for(let i=0;i<3;i++){
        const ox=l+45+i*11;
        g.fillStyle(edge,.41).fillRect(ox,t+4,4,2);
        g.fillRect(l+w-49-i*11,t+h-6,4,2);
      }
    }
  },
  pause(scene,root,{x,y,w,h,top}){
    if(!this.enabled)return;
    const g=scene.add.graphics();
    this.panel(g,x,y,w,h,'wood');
    const c=this.c;
    this.rope(g,x-w/2+22,x+w/2-22,top+112);
    this.skull(g,x-w/2+31,top+53,.58,.85);
    this.skull(g,x+w/2-31,top+53,.58,.85);
    this.tentacle(g,x-w/2+23,top+h-21,top+h-158,1,.46,.53);
    this.tentacle(g,x+w/2-23,top+h-21,top+h-158,-1,.46,.53);
    root.addAt(g,3);
  },
  island(scene,root,{x,top,width,height}){
    if(!this.enabled)return;
    const g=scene.add.graphics();
    this.panel(g,x,top+height/2,width,height,'navy');
    this.rope(g,x-width/2+20,x+width/2-20,top+98);
    this.skull(g,x-width/2+28,top+46,.5,.86);
    this.skull(g,x+width/2-28,top+46,.5,.86);
    this.tentacle(g,x-width/2+17,top+290,top+122,1,.42,.57);
    this.tentacle(g,x+width/2-17,top+290,top+122,-1,.42,.57);
    root.addAt(g,3);
  }
};