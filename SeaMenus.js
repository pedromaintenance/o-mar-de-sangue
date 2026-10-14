/* O MAR DE SANGUE v1.8.2 — UI naval desenhada proceduralmente.
 * Reutiliza sprites e fontes do jogo; nenhum download adicional de assets.
 */
const SEA_UI = {
    ink:0x101a26, shadow:0x080d16, wine:0x431f33, bronze:0x94704d,
    gold:0xf0ca88, pale:0xf1e0c8, foam:0x91b5b9,
    frame(scene,x,y,w,h,opt={}) {
        return SEA_PIXELS.panel(scene,x,y,w,h,opt);
    },
    divider(scene,y,x=240,w=380,depth=14){
        const g=scene.add.graphics().setDepth(depth);
        g.lineStyle(2,0xc6a279,.72);
        g.lineBetween(x-w/2,y,x-29,y);
        g.lineBetween(x+29,y,x+w/2,y);
        g.fillStyle(0xd3ab79,.9);
        g.fillTriangle(x,y-6,x+6,y,x,y+6);
        g.fillTriangle(x,y-6,x-6,y,x,y+6);
        SEA_PIXELS.flourish(scene,x,y,depth+1,.62);
        return g;
    },
    rim(scene){
        const g=scene.add.graphics().setDepth(-43);
        const x=12,y=16,w=456,h=766;
        g.lineStyle(3,0xc5a575,.91);g.strokeRect(x,y,w,h);
        g.lineStyle(1,0x522f3b,.77);g.strokeRect(x+6,y+6,w-12,h-12);
        for(let i=0;i<4;i++){
            const py=38+i*236;
            for(const px of [27,453]){
                g.fillStyle(0xa3845c,.72);g.fillCircle(px,py,3);
                g.fillStyle(0x180f19,.9);g.fillCircle(px,py,1.2);
            }
        }
    },
    compass(scene,x,y,r,alpha=.35){
        const g=scene.add.graphics().setDepth(8).setAlpha(alpha);
        g.lineStyle(2,0xe2c092,.77);g.strokeCircle(x,y,r);
        g.lineStyle(1,0xc19870,.6);g.strokeCircle(x,y,r*.83);
        for(let i=0;i<12;i++){
            const a=i*Math.PI/6-Math.PI/2;
            const inner=r*(i%3===0?.67:.81);
            g.lineBetween(x+Math.cos(a)*inner,y+Math.sin(a)*inner,
                          x+Math.cos(a)*r,y+Math.sin(a)*r);
        }
        g.fillStyle(0xe2bf8f,.84);
        g.fillTriangle(x,y-r*.66,x-r*.13,y,x+r*.13,y);
        g.fillStyle(0x6c354b,.97);
        g.fillTriangle(x,y+r*.66,x-r*.13,y,x+r*.13,y);
        g.fillStyle(0xd4b487,1);g.fillCircle(x,y,4);
        return g;
    },
    portDecor(scene){
        this.rim(scene);
        const page=scene.page;
        // Componentes estilizados permanecem atrás dos botões e do texto.
        if(page==='menu'){
            this.frame(scene,240,566,443,414,{fill:0x101c29,alpha:.92,depth:6});
            this.frame(scene,240,359,443,72,{fill:0x18232f,alpha:.86,depth:7});
            this.frame(scene,240,250,415,184,{fill:0x101b27,alpha:.64,depth:5});
            const glow=scene.add.circle(240,238,91,0x8c354b,.18).setDepth(8)
                .setStrokeStyle(1,0xc29966,.48);
            scene.tweens.add({targets:glow,alpha:.14,scale:1.075,duration:2800,yoyo:true,repeat:-1});
            this.compass(scene,240,235,82,.29);
            if(scene.textures.exists('player-ship')){
                const h=scene.textures.get('player-ship').getSourceImage().height||160;
                const ship=scene.add.image(240,233,'player-ship').setDepth(9)
                    .setScale(132/h).setRotation(-.08);
                scene.tweens.add({targets:ship,rotation:.075,y:237,duration:4000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
            }
            this.frame(scene,240,109,439,114,{fill:0x0d1622,alpha:.94,depth:4});
            SEA_PIXELS.flourish(scene,240,168,12,.85);
            this.divider(scene,417);
        }else if(page==='yard'){
            this.frame(scene,240,502,447,495,{fill:0x101c29,alpha:.58,depth:5});
            this.divider(scene,166);
            SEA_PIXELS.flourish(scene,240,174,14,.9);
        }else if(page==='help'){
            this.frame(scene,240,439,453,581,{fill:0x101a28,alpha:.67,depth:5});
            this.divider(scene,146);
        }else if(page==='reset'){
            this.frame(scene,240,423,445,463,{fill:0x321d2a,alpha:.88,stroke:0xd38e84,depth:5});
            this.compass(scene,240,391,108,.17);
            this.divider(scene,187);
        }else if(page==='result'){
            this.frame(scene,240,405,443,503,{fill:0x142330,alpha:.92,depth:5});
            this.compass(scene,240,270,99,.20);
            this.divider(scene,190);
            SEA_PIXELS.flourish(scene,240,190,14,.7);
        }
        if(SEA_DESKTOP)this.desktopWings(scene);
    },
    desktopWings(scene){
        const v=scene.page;
        const p=SeaProfile.load();
        const texts=v==='menu'?
            [['A CARCAÇA','Rotas perdidas','e juramentos','sob águas rubras.'],
             ['DIÁRIO DA FROTA',`Vitórias: ${p.wins}`,`Viagens: ${p.sorties}`,`Afundados: ${p.kills}`]]:
            [['COSTA SUL','A noite desce','sobre as velas','da Corte.'],
             ['MAR VIVO','Marés de sangue','e monstros antigos','não perdoam.']];
        for(const [i,x] of [-216,694].entries()){
            this.frame(scene,x,402,352,598,{fill:0x101924,alpha:.78,depth:5,stroke:0x86694f});
            this.compass(scene,x,282,130,.21);
            const image=i===0?'v15-flagship':'v15-spectral';
            if(scene.textures.exists(image)){
                const h=scene.textures.get(image).getSourceImage().height||150;
                scene.add.image(x,411,image).setScale(175/h).setAlpha(.55).setDepth(9).setAngle(i?18:-12);
            }
            const lines=texts[i];
            scene.txt(x,172,lines[0],17,'#e6c995',{center:true,bold:true,depth:20});
            lines.slice(1).forEach((line,j)=>scene.txt(x,546+j*24,line,15,j===0?'#ecd3ac':'#aebfc4',
                {center:true,depth:20,width:280}));
            this.divider(scene,520,x,245,15);
        }
    },
    button(scene,y,label,onTap,style='dark',x=240,w=416,h=43,font=16){
        // Pixel UI is painted as sprites on a 2px grid; the invisible hitbox
        // remains full-sized so keyboard, controller and touch are forgiving.
        const selectedColor=style==='gold'?'#1a1d23':style==='red'?'#f7dfc7':'#f4dbb8';
        const hit=scene.add.rectangle(x,y,w,h,0x0a131c,.001)
            .setDepth(29).setInteractive({useHandCursor:true});
        const skin=scene.add.graphics().setDepth(24);
        const caption=scene.txt(x,y,label,font,selectedColor,
            {center:true,mid:true,bold:true,depth:28,width:w-31});
        const focus=active=>{
            SEA_PIXELS.button(skin,x,y,w,h,style,active);
            caption.setColor(active?'#fff0c6':selectedColor);
        };
        focus(false);
        hit.on('pointerover',()=>{
            const i=scene.padOptions.findIndex(o=>o.rect===hit);
            if(i>=0)scene.setPadFocus(i);
            else focus(true);
        });
        hit.on('pointerout',()=>{
            focus(scene.padOptions[scene.padIndex]?.rect===hit);
        });
        hit.on('pointerdown',()=>onTap());
        scene.padOptions.push({rect:hit,x,y,label,onTap,color:0xe1bf82,focus,objects:[skin,caption]});
        return hit;
    },
    yardCard(scene,y,level,affordable){
        const g=this.frame(scene,240,y+20,441,97,{fill:affordable?0x1c313a:0x18242e,depth:10});
        const top=y-29;
        g.fillStyle(affordable?0xb28a56:0x6d4d50,.93).fillRect(24,top+12,4,69);
        const units=Math.min(8,Math.floor(Math.log2(1+Math.max(0,level)))*2);
        for(let i=0;i<8;i++){
            g.fillStyle(i<units?0xd1ae76:0x314652,.96).fillRect(35+i*18,top+80,13,4);
        }
        return g;
    },
    helpEntry(scene,index,y){
        const g=this.frame(scene,240,y+20,439,60,
            {fill:index%2?0x132735:0x192b37,depth:8});
        g.fillStyle(0xb68e61,.95).fillRect(445,y+2,3,34);
        return g;
    },
    resultSummary(scene,report){
        const gold=SEA_MATH.nice;
        const state=report.won?['✦  A CARCAÇA RECORDARÁ ESTA VITÓRIA',0x2a483f,0xb8d4ab]:
            report.withdrawn?['⚓  RETORNO SEGURO AO PORTO',0x3b3938,0xf0d39e]:
            ['☠  O OCEANO COBROU SEU PREÇO',0x4a2634,0xf0afb2];
        scene.add.rectangle(240,216,420,45,state[1],.93).setStrokeStyle(1,state[2]).setDepth(11);
        scene.txt(240,216,state[0],13,'#f9e4c6',{center:true,mid:true,bold:true,depth:20,width:406});
        const tiles=[
            ['OURO ENCONTRADO',gold(report.collected)],
            ['OURO RECUPERADO',gold(report.reward)],
            ['INIMIGOS AFUNDADOS',String(report.kills)],
            ['ABALROAMENTOS',String(report.rammings)],
            ['COFRE DO CAPITÃO',gold(report.bank)],
            [report.mode==='mission'?'MISSÃO':'ONDA',String(report.mode==='mission'?report.stage:report.wave)]
        ];
        tiles.forEach(([name,val],i)=>{
            const x=i%2?348:132;
            const y=276+Math.floor(i/2)*75;
            scene.add.rectangle(x,y,204,68,0x1b303a,.94)
                .setStrokeStyle(1,i===1?0xe4c083:0x6f8382).setDepth(10);
            scene.txt(x,y-15,name,10,'#a5c1c3',{center:true,mid:true,depth:20,width:193});
            scene.txt(x,y+12,val,22,i===1?'#f6d18b':'#f0e2c7',{center:true,mid:true,bold:true,depth:20,width:194});
        });
        scene.txt(240,462,`Ilhas exploradas: ${report.islands || 0} · O mar guarda seus segredos.`,12,'#bfaca0',{center:true,depth:20});
    },
    pause(scene){
        const x=SEA_VIEW.width/2, y=SEA_VIEW.height/2,desktop=SEA_DESKTOP;
        const w=desktop?630:454,h=desktop?612:612,top=y-h/2;
        const root=scene.add.container(0,0).setScrollFactor(0).setDepth(360);
        scene.pauseElements=root;
        const add=o=>{root.add(o);return o};
        // Máscara interativa impede clicar em controles do jogo atrás do diário.
        add(scene.add.rectangle(x,y,SEA_VIEW.width,SEA_VIEW.height,0x070d14,.90)
            .setInteractive());
        add(SEA_PIXELS.panel(scene,x,y,w,h,{fill:0x131c29,depth:1}));
        add(scene.add.rectangle(x,y,w-15,h-15,0x341e2d,.2).setStrokeStyle(1,0xddbd88,.53));
        const ornament=scene.add.graphics();
        add(ornament);
        ornament.lineStyle(2,0xd3b07e,.84);
        ornament.lineBetween(x-w/2+27,top+116,x+w/2-27,top+116);
        ornament.lineBetween(x-w/2+27,top+h-77,x+w/2-27,top+h-77);
        for(const cx of [x-w/2+18,x+w/2-18]){
            for(const cy of [top+18,top+h-18]){
                ornament.fillStyle(0xe5c38b,.84);
                ornament.fillCircle(cx,cy,3.5);
            }
        }
        const stamp=scene.add.image(x,top+58,'player-ship').setAlpha(.11);
        const hi=scene.textures.get('player-ship').getSourceImage().height||160;
        stamp.setScale(125/hi);
        add(stamp);
        const label=(yy,value,size=16,color='#ead4b2',bold=false,wrap=w-65)=>{
            return add(scene.add.text(x,yy,value,{fontFamily:'Georgia',fontSize:size+'px',fontStyle:bold?'bold':'normal',
                color,align:'center',lineSpacing:7,wordWrap:{width:wrap}}).setOrigin(.5));
        };
        label(top+48,'✥  DIÁRIO DO CAPITÃO  ✥',desktop?28:24,'#f4cf97',true);
        label(top+88,scene.mode==='mission'? `MISSÃO ${scene.stage}` : `SANDBOX · ONDA ${scene.wave}`,
            15,'#9ebbb9',true);
        const mission=scene.objectiveText();
        label(top+153,mission,desktop?18:16,'#f3dfbf',true);
        const width=w-76;
        const colW=width/3;
        const metrics=[
            [`${Math.ceil(scene.shipHP)}/${SEA_MATH.nice(scene.maxShipHP)}`,'CASCO'],
            [SEA_MATH.nice(scene.gold),'OURO'],
            [String(scene.kills),'AFUNDADOS']
        ];
        for(let i=0;i<3;i++){
            const mx=x+(i-1)*colW;
            add(scene.add.rectangle(mx,top+233,colW-8,82,0x192c39,.95)
                .setStrokeStyle(1,0x987550,.8));
            add(scene.add.text(mx,top+216,metrics[i][0],{fontFamily:'Georgia',fontSize:desktop?'21px':'18px',
                fontStyle:'bold',color:'#f6d599'}).setOrigin(.5));
            add(scene.add.text(mx,top+251,metrics[i][1],{fontFamily:'monospace',fontSize:'10px',
                color:'#9eb9ba'}).setOrigin(.5));
        }
        label(top+303,
            `${SEA_WEATHER.names?.[scene.seaEvent]||'MAR SERENO'} · MALDIÇÃO ${Math.round(scene.curse||0)}%`,
            desktop?14:12,'#d4bca9',false);
        const mk=(cy,text,onTap,tone='navy')=>{
            const ww=desktop?520:392,hh=55;
            const pal=tone==='exit'?[0x592a37,0xd79587,'#f9e6d5']:
                tone==='gold'?[0xa8804d,0xf2d09b,'#182431']:[0x203b48,0x9cbdba,'#f6ddbb'];
            const box=add(scene.add.rectangle(x,cy,ww,hh,0x08121c,.001));
            const artwork=scene.add.graphics();
            SEA_PIXELS.button(artwork,x,cy,ww,hh,
                tone==='exit'?'red':tone==='gold'?'gold':'dark',false);
            add(artwork);
            add(scene.add.rectangle(x-ww/2+8,cy,4,hh-10,pal[1]));
            const txt=add(scene.add.text(x,cy,text,{fontFamily:'Georgia',fontSize:desktop?'17px':'16px',
                color:pal[2],fontStyle:'bold',align:'center',wordWrap:{width:ww-25}}).setOrigin(.5));
            const option={box,text:txt,onTap,hit:{x,y:cy,w:ww,h:hh},base:pal[1]};
            option.artwork=artwork;
            option.tone=tone==='exit'?'red':tone==='gold'?'gold':'dark';
            scene.pausePadOptions.push(option);
            return option;
        };
        mk(top+385,'▶  CONTINUAR NAVEGAÇÃO',()=>scene.toggleCaptainMenu(),'gold');
        const audio=mk(top+451,SEA_AUDIO.enabled?'♫  DESATIVAR ÁUDIO':'♫  ATIVAR ÁUDIO',
            ()=>{const enabled=SEA_AUDIO.toggle();
                audio.text.setText(enabled?'♫  DESATIVAR ÁUDIO':'♫  ATIVAR ÁUDIO');},'navy');
        mk(top+517,'⚓  RETORNAR AO PORTO · 75% DO OURO',()=>scene.finish(false,true),'exit');
        label(top+h-40,'ESC / P  ·  TOQUE  ·  ENTER / CONTROLE',11,'#9ba5a4',false);
        scene.setPausePadFocus(0);
        return root;
    }
};
