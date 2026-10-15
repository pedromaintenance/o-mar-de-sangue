/* O MAR DE SANGUE — Combat pause only.
 * The port was rebuilt in PortUI.js/PortUI.css. The legacy procedural
 * port methods have been removed; only the combat pause is preserved.
 */
const SEA_UI = {
    pause(scene){
        const x=SEA_VIEW.width/2, y=SEA_VIEW.height/2,desktop=SEA_DESKTOP;
        const w=desktop?630:454,h=desktop?612:612,top=y-h/2;
        const root=scene.add.container(0,0).setScrollFactor(0).setDepth(360);
        scene.pauseElements=root;
        const add=o=>{root.add(o);return o};
        // Máscara interativa impede clicar em controles do jogo atrás do diário.
        add(scene.add.rectangle(x,y,SEA_VIEW.width,SEA_VIEW.height,0x070d14,.90)
            .setInteractive());
        add(scene.add.rectangle(x,y,w,h,0x111d29,.985).setStrokeStyle(3,0xb28b5c));
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
            const box=add(scene.add.rectangle(x,cy,ww,hh,pal[0],1)
                .setStrokeStyle(2,pal[1],.96));
            add(scene.add.rectangle(x-ww/2+8,cy,4,hh-10,pal[1]));
            const txt=add(scene.add.text(x,cy,text,{fontFamily:'Georgia',fontSize:desktop?'17px':'16px',
                color:pal[2],fontStyle:'bold',align:'center',wordWrap:{width:ww-25}}).setOrigin(.5));
            const option={box,text:txt,onTap,hit:{x,y:cy,w:ww,h:hh},base:pal[1]};
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
