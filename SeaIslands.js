/* O MAR DE SANGUE v1.9.0 — O Arquipélago dos Condenados
 * Atracação, encontros de costa e escolhas com consequências.
 * Todos os recursos visuais reutilizam o Phaser e os sprites existentes.
 */
const SEA_ISLANDS = {
    titles: {
        reef:'RECIFES TABAXI', ruin:'RUÍNAS DA COSTA SUL',
        monastery:'MOSTEIRO TORTLE', daegon:'ALTAR DE DAEGON',
        demeter:'SANTUÁRIO DE DEMÉTER', wreck:'CEMITÉRIO DE NAUS'
    },
    lore: {
        reef: 'Águas rasas guardam pérolas e ossos. Entre os corais, uma passagem estreita conduz a um ancoradouro escondido.',
        ruin: 'Muralhas afogadas sustentam inscrições de uma era esquecida. Ainda há objetos de valor entre seus corredores.',
        monastery:'O sino de um mosteiro ressoa sobre o vermelho das águas. Monges tortle observam a embarcação em silêncio.',
        daegon:'Um ídolo coberto por sal e sangue se ergue sobre o rochedo. Alguém deixou oferendas muito recentes.',
        demeter:'A vegetação rompe as pedras de um pequeno templo. O ar cheira a folhas novas, mesmo sobre o mar rubro.',
        wreck:'Cascos abandonados rangem na maré. Um velho barqueiro recolhe aquilo que os afogados não reivindicaram.'
    },
    choices: {
        reef: [
            { id:'pearls', name:'MERGULHAR ENTRE OS CORAIS', hint:'+42 ouro · -9 casco', gold:42, hp:-9 },
            { id:'channel', name:'TRAÇAR O CANAL ESCONDIDO', hint:'+12 velocidade nesta viagem', speed:12 },
            { id:'tide', name:'OUVIR OS PESCADORES', hint:'-12 maldição · +8 casco', curse:-12, heal:8 }
        ],
        ruin: [
            { id:'relic', name:'ABRIR O COFRE DOS ANTIGOS', hint:'+54 ouro · +12 maldição', gold:54, curse:12 },
            { id:'chart', name:'COPIAR CARTAS DESBOTADAS', hint:'+190 alcance de radar', radar:190 },
            { id:'timbers', name:'RECUPERAR MADEIRAS ANTIGAS', hint:'+25 casco · +8 maldição', heal:25, curse:8 }
        ],
        monastery: [
            { id:'training', name:'TREINAR COM OS MONGES', hint:'18 ouro · manobras mais ágeis', cost:18, turn:.46 },
            { id:'meditation', name:'MEDITAR JUNTO ÀS ONDAS', hint:'-20 maldição · +10 casco', curse:-20, heal:10 },
            { id:'knowledge', name:'ESTUDAR AS CARTAS TORTLE', hint:'22 ouro · +230 alcance de radar', cost:22, radar:230 }
        ],
        daegon: [
            { id:'blood', name:'OFERECER SANGUE AO ÍDOLO', hint:'-18 casco · +85 ouro · +26 maldição', hp:-18, gold:85, curse:26 },
            { id:'pact', name:'ACEITAR A PÓLVORA MALDITA', hint:'+8 dano por disparo · +25 maldição', cannon:8, curse:25 },
            { id:'votive', name:'QUEBRAR AS OFERENDAS', hint:'-18 maldição · -25 ouro', cost:25, curse:-18 }
        ],
        demeter: [
            { id:'repair', name:'CONSAGRAR O CASCO', hint:'30 ouro · reparar 35% do casco', cost:30, healPercent:.35 },
            { id:'cleanse', name:'RECEBER A PURIFICAÇÃO', hint:'-30 maldição · +8 casco', curse:-30, heal:8 },
            { id:'offering', name:'DEPOSITAR UMA OFERENDA', hint:'15 ouro · +20 casco · -12 maldição', cost:15, heal:20, curse:-12 }
        ],
        wreck: [
            { id:'salvage', name:'RECOLHER OS COFRES PERDIDOS', hint:'+58 ouro · +7 maldição', gold:58, curse:7 },
            { id:'patch', name:'COMPRAR MADEIRA E CORDAME', hint:'20 ouro · +32 casco', cost:20, heal:32 },
            { id:'funeral', name:'HONRAR OS AFOGADOS', hint:'-18 maldição · +12 casco', curse:-18, heal:12 }
        ]
    },
    init(s) {
        s.islandVisits = new Set();
        s.islandDocked = false;
        s.islandCandidate = null;
        s.islandOptions = [];
        s.islandChoiceIndex = 0;
        s.islandOutcome = '';
        s.islandSelected = null;
        s.islandOverlay = null;
        s.islandNavAt = 0;
        s.anchorButton = s.add.rectangle(SEA_DESKTOP ? SEA_VIEW.width-123 : 240,
            SEA_DESKTOP ? 296 : 517,190,42,0x182321,.97)
            .setStrokeStyle(2,0xa58b64,.92).setScrollFactor(0).setDepth(190).setVisible(false);
        s.anchorText = s.add.text(SEA_DESKTOP ? SEA_VIEW.width-123 : 240,
            SEA_DESKTOP ? 296 : 517,'⚓ ATRACAR',{
                fontFamily:'Georgia',fontStyle:'bold',fontSize:'15px',color:'#ffdeac'
            }).setOrigin(.5).setScrollFactor(0).setDepth(191).setVisible(false);
        s.anchorHint = s.add.text(SEA_DESKTOP ? SEA_VIEW.width-123 : 240,
            SEA_DESKTOP ? 260 : 480,'',{
                fontFamily:'monospace',fontSize:'10px',color:'#ffe6c6',
                stroke:'#0b1019',strokeThickness:3,align:'center'
            }).setOrigin(.5).setScrollFactor(0).setDepth(191).setVisible(false);
        s.anchorHitbox = {x:SEA_DESKTOP?SEA_VIEW.width-123:240,y:SEA_DESKTOP?296:517,w:200,h:50};
        s.anchorPulse = s.add.graphics().setDepth(14);
    },
    nearest(s) {
        if (!s.player || s.ended || s.sinking) return null;
        let found=null;
        for(const island of s.islands){
            if(s.islandVisits.has(island.id))continue;
            const d=Math.hypot(s.player.x-island.x,s.player.y-island.y);
            const gap=d-island.radius-s.hullRadius;
            if(gap<-10||gap>112)continue;
            if(!found||gap<found.gap) found={island,gap};
        }
        if(!found)return null;
        const speed=Math.hypot(s.playerVelocity.x,s.playerVelocity.y);
        const threatened=s.enemies.some(e=>!e.dead&&
            Math.hypot(e.x-s.player.x,e.y-s.player.y)<295);
        return {...found,speed,threatened,
            allowed:speed<=67&&!threatened};
    },
    update(s,dt) {
        if(s.islandDocked)return;
        const near=this.nearest(s);
        s.islandCandidate=near;
        const visible=!!near;
        s.anchorButton.setVisible(visible);
        s.anchorText.setVisible(visible);
        s.anchorHint.setVisible(visible);
        s.anchorPulse.clear();
        if(!visible)return;
        let hint=near.allowed?'F / A OU TOQUE PARA ATRACAR':
            near.threatened?'PERIGO: NAVIOS HOSTIS NAS PROXIMIDADES':
            'REDUZA PARA 67 NÓS OU MENOS';
        s.anchorButton.setFillStyle(near.allowed?0x182521:0x30191e,.97);
        s.anchorButton.setStrokeStyle(2,near.allowed?0xbda47d:0x9a5352,.94);
        s.anchorText.setText(near.allowed?'⚓ ATRACAR':'⚓ ANCORA INDISPONÍVEL');
        s.anchorHint.setText(hint);
        const island=near.island;
        s.anchorPulse.lineStyle(2,near.allowed?0xb8a180:0xa65d65,.85);
        const ring=island.radius+s.hullRadius+48+Math.sin(s.elapsed*2.8)*4;
        s.anchorPulse.strokeCircle(island.x,island.y,ring);
    },
    tryDock(s) {
        if(s.ended||s.sinking||s.pausedByCaptain||s.islandDocked)return false;
        const near=this.nearest(s);
        s.islandCandidate=near;
        if(!near)return false;
        if(!near.allowed){
            s.announce(near.threatened?
                'AFUGENTE OS HOSTIS ANTES DE ATRACAR':'REDUZA A VELOCIDADE ANTES DE ATRACAR');
            return false;
        }
        s.touchReset();
        s.playerVelocity.x=0;s.playerVelocity.y=0;s.speed=0;
        s.islandDocked=true;
        s.islandSelected=near.island;
        s.islandOutcome='';
        s.islandError='';
        s.islandChoiceIndex=0;
        s.anchorButton.setVisible(false);s.anchorText.setVisible(false);
        s.anchorHint.setVisible(false);s.anchorPulse.clear();
        this.render(s);
        return true;
    },
    close(s) {
        if(!s.islandDocked)return;
        if(s.islandOverlay){s.islandOverlay.destroy(true);s.islandOverlay=null;}
        s.islandDocked=false;s.islandSelected=null;s.islandOptions=[];s.islandOutcome='';
        s.touchReset();s.islandCandidate=null;
    },
    apply(s,choice) {
        if(!s.islandDocked||s.islandOutcome||!choice||!s.islandSelected)return false;
        if(s.islandVisits.has(s.islandSelected.id))return false;
        if(choice.cost&&s.gold<choice.cost){
            s.islandError='OURO INSUFICIENTE PARA ESTA ESCOLHA';
            this.render(s);
            return false;
        }
        if(choice.hp<0 && s.shipHP<=Math.abs(choice.hp)){
            s.islandError='O CASCO NÃO SUPORTARIA ESSE SACRIFÍCIO';
            this.render(s);
            return false;
        }
        if(choice.cost && (choice.heal||choice.healPercent) &&
            !choice.curse && s.shipHP>=s.maxShipHP){
            s.islandError='O CASCO JÁ ESTÁ TOTALMENTE REPARADO';
            this.render(s);
            return false;
        }
        const changes=[];
        if(choice.cost) {
            s.gold-=choice.cost;changes.push('-'+choice.cost+' ouro');
        }
        if(choice.gold) {
            s.gold=SEA_MATH.safe(s.gold+choice.gold);
            changes.push('+'+choice.gold+' ouro');
        }
        if(choice.hp){
            // Um ritual não pode derrotar silenciosamente o jogador dentro do menu.
            const lost=Math.max(0,Math.min(s.shipHP-1,Math.abs(choice.hp)));
            s.shipHP-=lost;changes.push('-'+Math.floor(lost)+' casco');
        }
        if(choice.heal||choice.healPercent){
            const requested=(choice.heal||0)+(choice.healPercent||0)*s.maxShipHP;
            const gained=Math.min(s.maxShipHP-s.shipHP,requested);
            s.shipHP+=gained;
            changes.push('+'+Math.round(gained)+' casco');
        }
        if(choice.curse){
            const prev=s.curse;
            s.curse=SEA_MATH.clamp(s.curse+choice.curse,0,100);
            const change=Math.round(s.curse-prev);
            changes.push((change>0?'+':'')+change+' maldição');
            if(change>0)SEA_WEATHER.announceTier(s);
        }
        if(choice.turn){
            s.shipStats.turnSpeed+=choice.turn;
            changes.push('+'+choice.turn.toFixed(2)+' manobra');
        }
        if(choice.speed){
            s.shipStats.maxSpeed+=choice.speed;
            changes.push('+'+choice.speed+' velocidade');
        }
        if(choice.radar){
            s.shipStats.radar+=choice.radar;
            changes.push('+'+choice.radar+' radar');
        }
        if(choice.cannon){
            s.shipStats.cannonDamage+=choice.cannon;
            changes.push('+'+choice.cannon+' dano dos canhões');
        }
        s.islandVisits.add(s.islandSelected.id);
        s.islandError='';
        s.islandChoiceIndex=0;
        s.islandOutcome=changes.join('  ·  ')||'Os ventos mudaram.';
        s.lastDamageTime=s.time.now;
        s.updateHUD();
        if(s.drawHullScars)s.drawHullScars();
        if(typeof SEA_COMBAT!=='undefined'&&SEA_COMBAT.scars)SEA_COMBAT.scars(s);
        SEA_AUDIO.play('gold',.55);
        this.render(s);
        return true;
    },
    screenButton(s,root,x,y,w,h,name,detail,index,disabled=false) {
        const selected=index>=0?index===s.islandChoiceIndex:
            (s.islandOutcome?s.islandChoiceIndex===0:s.islandChoiceIndex===3);
        const bg=disabled?0x131a1d:selected?0x392025:0x161e21;
        const edge=disabled?0x534844:selected?0xc3a078:0x655343;
        root.add(s.add.rectangle(x,y,w,h,bg,.97).setStrokeStyle(selected?3:2,edge,.95));
        root.add(s.add.text(x,y-10,name,{
            fontFamily:'Georgia',fontSize:SEA_DESKTOP?'18px':'15px',fontStyle:'bold',
            color:disabled?'#928c84':'#e5d3bc',align:'center',wordWrap:{width:w-25}
        }).setOrigin(.5));
        if(detail)root.add(s.add.text(x,y+17,detail,{
            fontFamily:'monospace',fontSize:'11px',color:disabled?'#87837e':'#b3b9af',
            align:'center',wordWrap:{width:w-28}
        }).setOrigin(.5));
        s.islandOptions.push({hit:{x,y,w,h},onTap:()=>{
            if(index===-1)this.close(s);
            else this.apply(s,this.choices[s.islandSelected.kind][index]);
        }});
    },
    render(s) {
        if(s.islandOverlay)s.islandOverlay.destroy(true);
        const island=s.islandSelected;
        if(!island)return;
        const type=island.kind;
        const x=SEA_VIEW.width/2,ymid=SEA_VIEW.height/2;
        const top=SEA_DESKTOP?30:62,width=SEA_DESKTOP?620:448,height=SEA_DESKTOP?650:668;
        const root=s.add.container(0,0).setScrollFactor(0).setDepth(430);
        s.islandOverlay=root;s.islandOptions=[];
        root.add(s.add.rectangle(x,ymid,SEA_VIEW.width,SEA_VIEW.height,0x05080b,.94));
        root.add(s.add.rectangle(x,top+height/2,width,height,0x101719,.995)
            .setStrokeStyle(2,0x957356,.94));
        root.add(s.add.rectangle(x,top+height/2,width-16,height-16,0x1e151b,.46)
            .setStrokeStyle(1,0x5b4536,.86));
        root.add(s.add.rectangle(x,top+height-75,width-34,2,0x8d3740,.58));
        const ornament=s.add.graphics();root.add(ornament);
        ornament.lineStyle(1,0x937051,.8);
        ornament.lineBetween(x-width/2+28,top+99,x+width/2-28,top+99);
        ornament.lineBetween(x-width/2+28,top+height-77,x+width/2-28,top+height-77);
        root.add(s.add.text(x,top+29,'✦  O ARQUIPÉLAGO DOS CONDENADOS  ✦',{
            fontFamily:'monospace',fontSize:SEA_DESKTOP?'15px':'11px',
            color:'#b89d78'
        }).setOrigin(.5));
        root.add(s.add.text(x,top+68,this.titles[type],{
            fontFamily:'Georgia',fontSize:SEA_DESKTOP?'29px':'22px',
            fontStyle:'bold',color:'#e6d0b2',align:'center',wordWrap:{width:width-35}
        }).setOrigin(.5));
        const asset=type==='reef'?'island-reef':'island-'+type;
        if(s.textures.exists(asset)){
            const sourceHeight=s.textures.get(asset).getSourceImage().height||256;
            root.add(s.add.image(x,top+161,asset).setScale((SEA_DESKTOP?146:129)/sourceHeight));
        }
        root.add(s.add.text(x,top+262,this.lore[type],{
            fontFamily:'Georgia',fontSize:SEA_DESKTOP?'18px':'15px',
            color:'#d6c6b7',align:'center',lineSpacing:5,wordWrap:{width:width-52}
        }).setOrigin(.5));
        const visited=s.islandVisits.has(island.id);
        if(s.islandOutcome){
            root.add(s.add.text(x,top+360,'ESCOLHA REGISTRADA',{
                fontFamily:'Georgia',fontSize:'21px',fontStyle:'bold',color:'#d9bc95'
            }).setOrigin(.5));
            root.add(s.add.text(x,top+410,s.islandOutcome,{
                fontFamily:'monospace',fontSize:SEA_DESKTOP?'15px':'13px',
                color:'#aec2b1',align:'center',wordWrap:{width:width-45}
            }).setOrigin(.5));
        }else{
            const actions=this.choices[type];
            root.add(s.add.text(x,top+328,s.islandError||'QUAL SERÁ A SUA DECISÃO?',{
                fontFamily:'monospace',fontSize:'12px',color:s.islandError?'#d68c86':'#aba99d'
            }).setOrigin(.5));
            for(let i=0;i<actions.length;i++){
                const choice=actions[i];
                this.screenButton(s,root,x,top+385+i*72,width-48,63,
                    choice.name,choice.hint,i,!!(
                        (choice.cost&&s.gold<choice.cost)||
                        (choice.hp<0&&s.shipHP<=Math.abs(choice.hp))));
            }
        }
        this.screenButton(s,root,x,top+height-44,width-56,49,
            s.islandOutcome?'⚓  VOLTAR AO MAR':'◀  NÃO ATRACAR / VOLTAR', '',-1);
    },
    pointer(s,x,y) {
        if(!s.islandDocked)return false;
        const option=s.islandOptions.find(o=>
            Math.abs(x-o.hit.x)<=o.hit.w/2&&Math.abs(y-o.hit.y)<=o.hit.h/2);
        if(option)option.onTap();
        return true;
    },
    navigate(s,direction) {
        if(!s.islandDocked||!s.islandOptions.length)return;
        s.islandChoiceIndex=(s.islandChoiceIndex+direction+s.islandOptions.length)%s.islandOptions.length;
        // Recria só o modal, preservando a opção selecionada (sem alterar o mundo).
        this.render(s);
    },
    select(s) {
        if(!s.islandDocked)return;
        const choice=s.islandOptions[s.islandChoiceIndex];
        choice?.onTap();
    }
};
