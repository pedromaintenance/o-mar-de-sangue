/* O MAR DE SANGUE — Porto 3.1 | Diário do Capitão — A Maré Negra
 * Modal Phaser during combat. Palette and ornaments only: all three
 * actions, hit boxes, focus contract, save/withdrawal and controls stay put.
 * The HTML port and the combat engine are intentionally untouched.
 */
const SEA_UI = {
    pause(scene){
        const x=SEA_VIEW.width/2, y=SEA_VIEW.height/2,desktop=SEA_DESKTOP;
        const w=desktop?630:454,h=612,top=y-h/2;
        const edge=0x8b6b50,red=0x87333e,ink=0x0a1013;
        const root=scene.add.container(0,0).setScrollFactor(0).setDepth(360);
        scene.pauseElements=root;
        const add=o=>{root.add(o);return o};
        // Modal interception is vital: never send clicks to cannons underneath.
        add(scene.add.rectangle(x,y,SEA_VIEW.width,SEA_VIEW.height,0x05080b,.94)
            .setInteractive());
        // Iron frame, scorched timber and an inlaid dark-red ledger.
        add(scene.add.rectangle(x,y,w+6,h+6,0x080b0d,.99)
            .setStrokeStyle(2,0x49382e,.95));
        add(scene.add.rectangle(x,y,w,h,0x101719,.995)
            .setStrokeStyle(2,edge,.83));
        add(scene.add.rectangle(x,y,w-13,h-13,0x161619,.79)
            .setStrokeStyle(1,0x4d3a31,.85));
        add(scene.add.rectangle(x,top+68,w-26,117,0x20171b,.86));
        add(scene.add.rectangle(x,top+115,w-27,2,red,.75));
        add(scene.add.rectangle(x,top+h-86,w-27,2,red,.55));
        const ornament=scene.add.graphics();add(ornament);
        ornament.lineStyle(1,0xa58262,.7);
        ornament.lineBetween(x-w/2+28,top+120,x+w/2-28,top+120);
        ornament.lineBetween(x-w/2+28,top+h-80,x+w/2-28,top+h-80);
        ornament.lineStyle(1,0x55463b,.9);
        ornament.lineBetween(x-w/2+20,top+22,x-w/2+20,top+h-22);
        ornament.lineBetween(x+w/2-20,top+22,x+w/2-20,top+h-22);
        for(const cx of [x-w/2+13,x+w/2-13]){
            for(const cy of [top+13,top+h-13]){
                ornament.fillStyle(0x8b654b,.9);ornament.fillCircle(cx,cy,3);
                ornament.fillStyle(0x171317,1);ornament.fillCircle(cx,cy,1);
            }
        }
        const stamp=scene.add.image(x,top+62,'player-ship-stages',
            SEA_PLAYER_SHIP.stage(scene.profile?.levels || SeaProfile.load().levels)-1)
            .setRotation(Math.PI).setAlpha(.095);
        stamp.setScale(125/SEA_PLAYER_SHIP.frameHeight);add(stamp);
        const label=(yy,value,size=16,color='#d7ccba',bold=false,wrap=w-65)=>{
            return add(scene.add.text(x,yy,value,{
                fontFamily:'Georgia',fontSize:size+'px',
                fontStyle:bold?'bold':'normal',color,align:'center',
                lineSpacing:7,wordWrap:{width:wrap}
            }).setOrigin(.5));
        };
        label(top+48,'✥  DIÁRIO DO CAPITÃO  ✥',desktop?27:23,'#e4ccb0',true);
        label(top+88,scene.mode==='mission'? `MISSÃO ${scene.stage}` : `SANDBOX · ONDA ${scene.wave}`,
            14,'#ad8871',true);
        label(top+153,scene.objectiveText(),desktop?18:16,'#e7d5bd',true);
        const width=w-76,colW=width/3;
        const metrics=[
            [`${Math.ceil(scene.shipHP)}/${SEA_MATH.nice(scene.maxShipHP)}`,'CASCO'],
            [SEA_MATH.nice(scene.gold),'OURO'],
            [String(scene.kills),'AFUNDADOS']
        ];
        for(let i=0;i<3;i++){
            const mx=x+(i-1)*colW;
            add(scene.add.rectangle(mx,top+233,colW-8,82,0x0c1518,.98)
                .setStrokeStyle(1,0x57463b,.95));
            add(scene.add.rectangle(mx,top+194,colW-12,2,i===0?red:0x66503f,.7));
            add(scene.add.text(mx,top+216,metrics[i][0],{
                fontFamily:'Georgia',fontSize:desktop?'21px':'18px',
                fontStyle:'bold',color:'#e7cb9f'
            }).setOrigin(.5));
            add(scene.add.text(mx,top+251,metrics[i][1],{
                fontFamily:'monospace',fontSize:'10px',color:'#9a9f98'
            }).setOrigin(.5));
        }
        label(top+291,
            `${SEA_WEATHER.names?.[scene.seaEvent]||'MAR SERENO'} · MALDIÇÃO ${Math.round(scene.curse||0)}%`,
            desktop?14:12,'#b8a093',false);
        // A voyage's political act remains legible after leaving the coast.
        // Do not infer permanent reputation or disclose an undiscovered event.
        const pact=SEA_ISLANDS.politicalRecord(scene);
        label(top+310,pact.title,desktop?12:11,
            pact.agreed?'#d7b18b':'#999a91',true,w-70);
        const politicalLines=label(top+337,pact.detail,desktop?10:9,
            '#b9b0a2',false,w-65);
        politicalLines.setLineSpacing?.(0);
        const mk=(cy,text,onTap,tone='navy')=>{
            // Keep the original selectable centers, size and structure for
            // the existing Game.js controller, touch and keyboard handlers.
            const ww=desktop?520:392,hh=55;
            const pal=tone==='exit'?[0x2b171c,0xa44b50,'#e5c9bb']:
                tone==='gold'?[0x292024,0xc6a078,'#f0d7b5']:
                [0x151e21,0x7d6654,'#d7c9b5'];
            const box=add(scene.add.rectangle(x,cy,ww,hh,pal[0],1)
                .setStrokeStyle(2,pal[1],.96));
            add(scene.add.rectangle(x-ww/2+8,cy,3,hh-12,
                tone==='exit'?red:pal[1]));
            const txt=add(scene.add.text(x,cy,text,{
                fontFamily:'Georgia',fontSize:desktop?'17px':'16px',
                color:pal[2],fontStyle:'bold',align:'center',
                wordWrap:{width:ww-25}
            }).setOrigin(.5));
            const option={box,text:txt,onTap,hit:{x,y:cy,w:ww,h:hh},base:pal[1]};
            scene.pausePadOptions.push(option);
            return option;
        };
        mk(top+385,'▶  CONTINUAR NAVEGAÇÃO',()=>scene.toggleCaptainMenu(),'gold');
        const audio=mk(top+451,SEA_AUDIO.enabled?'♫  DESATIVAR ÁUDIO':'♫  ATIVAR ÁUDIO',
            ()=>{const enabled=SEA_AUDIO.toggle();
                audio.text.setText(enabled?'♫  DESATIVAR ÁUDIO':'♫  ATIVAR ÁUDIO');},'navy');
        mk(top+517,'⚓  RETORNAR AO PORTO · 75% DO OURO',
            ()=>scene.finish(false,true),'exit');
        label(top+h-40,'↑↓: ESCOLHER · ENTER/A: CONFIRMAR · ESC/P/B: VOLTAR · TOQUE',11,'#988a7c',false);
        scene.setPausePadFocus(0);
        return root;
    }
};
