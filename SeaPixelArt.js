/* O MAR DE SANGUE v1.9.1 — pixel art procedural, sem PNG externo.
 * Texturas 100% locais, nítidas (nearest), reproduzíveis e leves no PWA.
 * Uma folha visual de sprites é gerada no preload e pode ser substituída
 * mais tarde por PNGs artísticos de mesma chave.
 */
const SEA_PIXELS = {
    palette: {ink:'#101a26',night:'#080b15',deep:'#172434',gold:'#dfb777',
        brass:'#9a6b43',edge:'#594235',blood:'#961c30',red:'#dd3849',
        white:'#f2dab2',foam:'#f9dfaa',teal:'#319f9a',kelp:'#155e57'},
    rand(seed) {
        let n=seed|0;return ()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return ((n>>>0)%100000)/100000;};
    },
    texture(scene,name,w,h,paint) {
        if(scene.textures.exists(name))return;
        const canvas=scene.textures.createCanvas(name,w,h),ctx=canvas.getContext();
        ctx.imageSmoothingEnabled=false;
        paint(ctx,w,h);
        canvas.refresh();
        const texture=scene.textures.get(name);
        if(texture?.setFilter&&typeof Phaser!=='undefined')
            texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    },
    rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));},
    block(ctx,x,y,shade){
        this.rect(ctx,x+3,y+13,31,13,'#0a111a');
        this.rect(ctx,x+8,y+4,20,13,shade);
        this.rect(ctx,x+12,y,12,7,'#4d5b63');
        this.rect(ctx,x,y+23,39,3,'#16141b');
    },
    seaTile(ctx,w,h,variant){
        const rng=this.rand(1887+variant*53);
        const dark=variant===2?'#071d29':'#210c1d', middle=variant===2?'#123944':'#3c112a';
        this.rect(ctx,0,0,w,h,dark);
        for(let i=0;i<320;i++){
            const x=Math.floor(rng()*w/4)*4,y=Math.floor(rng()*h/4)*4;
            const p=rng(),len=4+(rng()*30|0),tall=p>.88?4:2;
            const color=variant===2?
                p>.92?'#70afa7':p>.72?'#29777b':p>.36?'#183f51':middle
                :p>.94?'#c56863':p>.76?'#8e3045':p>.36?'#601c32':middle;
            this.rect(ctx,x,y,len,tall,color);
            if(p>.96)this.rect(ctx,x+5,y+4,len*.36,2,variant===2?'#94cac2':'#dec9a5');
        }
        for(let i=0;i<17;i++){
            const x=rng()*w|0,y=rng()*h|0,l=12+rng()*25|0;
            this.rect(ctx,x,y,l,2,variant===2?'#3b8d8f':'#ae3144');
            if(i%5===0)this.rect(ctx,x+5,y+4,l*.55,2,'#e7b5a0');
        }
    },
    vortex(ctx,w,h,ghost){
        const cx=w/2,cy=h/2,rng=this.rand(ghost?404:909);
        const colors=ghost?['#0b474f','#147f80','#58b5ae','#c3dcc5']:
            ['#3a0b21','#841d33','#ce394a','#eac8a1'];
        for(let j=0;j<5;j++){
            let points=[];
            for(let i=0;i<=92;i++){
                const t=i/92,rad=68-j*8-t*(48-j*5);
                const a=t*Math.PI*(3.25+j*.22)+j*1.12;
                const x=Math.round(cx+Math.cos(a)*rad)/2*2;
                const y=Math.round(cy+Math.sin(a)*rad)/2*2;
                points.push([x,y]);
            }
            for(let i=1;i<points.length;i++){
                const col=colors[(j+i/17|0)%colors.length];
                const [x,y]=points[i], [px,py]=points[i-1];
                ctx.strokeStyle=col;ctx.lineWidth=i%9<3?4:2;
                ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();
            }
        }
        this.rect(ctx,cx-11,cy-11,22,22,'#060c17');
        for(let i=0;i<28;i++){
            const a=rng()*6.283,r=30+rng()*42;
            this.rect(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r,2,2,colors[i%colors.length]);
        }
    },
    reef(ctx,w,h){
        const rnd=this.rand(176);
        for(let i=0;i<39;i++){
            const x=15+rnd()*(w-30)|0,y=55+rnd()*30|0;
            this.rect(ctx,x,y,5+(rnd()*17|0),3,i%4?'#d4b69e':'#5d9690');
        }
        for(const [x,y,wide,tall] of [[16,32,24,39],[43,18,29,53],[71,30,22,41],[36,44,13,28]]){
            this.rect(ctx,x+2,y+6,wide,tall,'#0d1a24');
            ctx.fillStyle='#384655';ctx.beginPath();
            ctx.moveTo(x,y+wide*.7);ctx.lineTo(x+wide*.48,y);
            ctx.lineTo(x+wide,y+wide*.7);ctx.lineTo(x+wide,y+tall);
            ctx.lineTo(x+2,y+tall);ctx.closePath();ctx.fill();
            this.rect(ctx,x+wide*.48,y+8,5,tall*.58,'#52616a');
            this.rect(ctx,x+3,y+tall-4,wide-3,4,'#162330');
        }
    },
    buoy(ctx,w,h){
        const R=this.rect.bind(this,ctx);
        for(let i=0;i<12;i++)R(10+i*5,89+i%3*3,16,3,i%3?'#43a09a':'#9b3542');
        R(28,42,22,53,'#36251e');R(25,74,28,16,'#70452e');
        R(32,26,8,48,'#a57747');R(30,28,12,4,'#e5be75');
        R(15,57,52,4,'#987142');R(19,62,40,4,'#201720');
        R(28,9,25,17,'#9b6c42');R(33,5,15,6,'#edcc88');
        R(34,15,13,12,'#500b20');R(37,17,7,9,'#ff5662');
        R(31,33,20,3,'#cfab7c');R(20,85,45,5,'#c0804c');
        for(let i=0;i<3;i++)R(42+i*3,89-i*7,2,5,'#d9be85');
    },
    wreck(ctx,w,h){
        const R=this.rect.bind(this,ctx);
        for(let i=0;i<26;i++)R(13+i*4,77+i%4*4,20,3,i%3?'#9b3040':'#458987');
        ctx.fillStyle='#2a1b1a';ctx.beginPath();
        ctx.moveTo(16,45);ctx.lineTo(128,48);ctx.lineTo(116,87);
        ctx.lineTo(39,91);ctx.closePath();ctx.fill();
        R(27,51,84,27,'#5e352a');R(35,56,70,4,'#b4814e');
        for(let i=0;i<5;i++){R(32+i*17,61,4,22,'#251d21');R(31+i*17,82,15,3,'#cc965c');}
        R(58,9,6,49,'#a67b4f');R(86,21,5,40,'#8c6143');
        R(47,13,41,7,'#783b3c');R(52,20,26,5,'#912b38');
        for(let i=0;i<5;i++)R(54+i*5,29+i*4,20,3,'#541c2c');
        R(109,36,16,6,'#dfbb7e');R(110,43,7,28,'#251a24');
    },
    tentacle(ctx,w,h){
        const R=this.rect.bind(this,ctx);
        const pts=[[20,104],[29,80],[47,60],[72,44],[82,28],[73,17],[61,18],[57,29]];
        for(let i=0;i<pts.length-1;i++){
            const [x,y]=pts[i],[xx,yy]=pts[i+1];
            ctx.strokeStyle='#390b27';ctx.lineWidth=21;
            ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();
            ctx.strokeStyle='#bb2842';ctx.lineWidth=13;
            ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();
            ctx.strokeStyle='#e05b60';ctx.lineWidth=4;
            ctx.beginPath();ctx.moveTo(x-2,y-2);ctx.lineTo(xx-2,yy-2);ctx.stroke();
        }
        for(let i=0;i<7;i++){
            const [x,y]=pts[i];R(x+4,y+5,5,5,'#126d63');
            R(x+5,y+6,2,2,'#b3dac0');
        }
        for(let i=0;i<18;i++){
            const x=15+(i*29)%92,y=94+(i*13)%17;
            R(x,y,8,3,i%3?'#e8c8a0':'#53a59a');
        }
    },
    build(scene){
        this.texture(scene,'p-sea-red',192,192,(c,w,h)=>this.seaTile(c,w,h,1));
        this.texture(scene,'p-sea-haunted',192,192,(c,w,h)=>this.seaTile(c,w,h,2));
        this.texture(scene,'p-vortex',160,160,(c,w,h)=>this.vortex(c,w,h,false));
        this.texture(scene,'p-vortex-teal',160,160,(c,w,h)=>this.vortex(c,w,h,true));
        this.texture(scene,'p-reef',104,104,(c,w,h)=>this.reef(c,w,h));
        this.texture(scene,'p-wreck',144,115,(c,w,h)=>this.wreck(c,w,h));
        this.texture(scene,'p-buoy',88,110,(c,w,h)=>this.buoy(c,w,h));
        this.texture(scene,'p-tentacle',120,132,(c,w,h)=>this.tentacle(c,w,h));
    },
    panel(scene,x,y,w,h,opt={}){
        const g=scene.add.graphics().setDepth(opt.depth??7);
        const left=x-w/2,top=y-h/2,alpha=opt.alpha??.96;
        const dark=opt.fill??0x101925;
        g.fillStyle(0x030914,alpha).fillRect(left,top,w,h);
        g.fillStyle(dark,alpha).fillRect(left+5,top+5,w-10,h-10);
        g.fillStyle(0x916644,.96).fillRect(left,top,w,3);
        g.fillRect(left,top+h-3,w,3);g.fillRect(left,top,3,h);g.fillRect(left+w-3,top,3,h);
        g.fillStyle(0xe0bd7f,.9).fillRect(left+4,top+4,w-8,2);
        g.fillRect(left+4,top+h-6,w-8,2);
        g.fillStyle(0x294450,.78).fillRect(left+10,top+10,w-20,3);
        g.fillStyle(0x431e2a,.70).fillRect(left+10,top+h-14,w-20,3);
        for(const dx of [0,w]){
            for(const dy of [0,h]){
                const fx=left+dx,fy=top+dy,sx=dx? -1:1,sy=dy?-1:1;
                g.fillStyle(0xcca06e,.94).fillRect(fx+(sx===1?2:-12),fy+(sy===1?2:-12),10,10);
                g.fillStyle(0x39252a,.98).fillRect(fx+(sx===1?5:-9),fy+(sy===1?5:-9),4,4);
                g.fillStyle(0xc22d43,.93).fillRect(fx+(sx===1?6:-8),fy+(sy===1?6:-8),2,2);
            }
        }
        // Réguas de bronze e remendos de tecido, todos alinhados à grade.
        for(let i=0;i<Math.floor((w-24)/28);i++){
            const px=left+14+i*28;
            g.fillStyle(i%3===0?0x7b3c3d:0x8c674a,.43).fillRect(px,top+7,11,2);
        }
        return g;
    },
    button(g,x,y,w,h,tone,selected){
        g.clear();
        const ink=tone==='red'?0x4c1b2a:tone==='gold'?0x695032:0x122b37;
        const core=selected?0x81543c:ink;
        g.fillStyle(0x070e19,.98).fillRect(x-w/2,y-h/2,w,h);
        g.fillStyle(core,.99).fillRect(x-w/2+4,y-h/2+4,w-8,h-8);
        g.fillStyle(selected?0xffdf9a:0xc3a171,1).fillRect(x-w/2,y-h/2,w,3);
        g.fillRect(x-w/2,y+h/2-3,w,3);
        g.fillStyle(0x7f5b3c,1).fillRect(x-w/2,y-h/2,3,h);
        g.fillRect(x+w/2-3,y-h/2,3,h);
        g.fillStyle(0xa4754d,.84).fillRect(x-w/2+7,y-h/2+7,w-14,2);
        g.fillStyle(0x241924,.82).fillRect(x-w/2+7,y+h/2-9,w-14,3);
        for(const dir of [-1,1]){
            const cx=x+dir*(w/2-11);
            g.fillStyle(selected?0xeed2a0:0xae885a,1).fillRect(cx-6,y-7,12,14);
            g.fillStyle(0x451929,1).fillRect(cx-3,y-4,6,8);
            g.fillStyle(selected?0xffe1a3:0xd14b4d,1).fillRect(cx-1,y-2,2,4);
        }
    },
    flourish(scene,x,y,depth=12,scale=1){
        const g=scene.add.graphics().setDepth(depth);const u=scale;
        g.fillStyle(0xae7c4b,.95).fillRect(x-18*u,y-2*u,36*u,4*u);
        g.fillStyle(0xd1ad73,1).fillRect(x-5*u,y-9*u,10*u,18*u);
        g.fillStyle(0x491a27,1).fillRect(x-3*u,y-6*u,6*u,12*u);
        g.fillStyle(0xe2434f,1).fillRect(x-u,y-3*u,2*u,6*u);
        return g;
    }
};
