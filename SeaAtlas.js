/* O MAR DE SANGUE — Atlas 3.4: Carta dos Náufragos
 * Presentation-only voyage map. No profile writes, no fog-of-war spoilers,
 * no alteration of ship/radar physics or enemy AI. Uses Phaser objects
 * already available to the Game scene and its fixed world coordinates.
 */
const SEA_ATLAS = {
    colors: {
        reef:0x8c9b9b, ruin:0xb49a7a, monastery:0xc9b394,
        daegon:0xbc6672, demeter:0x91b8a0, wreck:0xa38a75,
        parley:0xe0aa71
    },
    kindNames: {reef:'RECIFE',ruin:'RUÍNAS',monastery:'MOSTEIRO',
        daegon:'ALTAR DE DAEGON',demeter:'SANTUÁRIO',
        wreck:'NAUFRÁGIO',parley:'TRÊS BANDEIRAS'},
    // Only discovered places can be waypoints. Entirely voyage-local.
    landmarks(s) {return (s.islands||[]).filter(i=>s.chartDiscovered?.has(i.id));},
    destination(s) {return this.landmarks(s).find(i=>i.id===s.chartWaypointId)||null;},
    navigation(s) {
        const island=this.destination(s);
        if(!island||!s.player)return null;
        const dx=island.x-s.player.x,dy=island.y-s.player.y;
        const bearing=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
        const head=((s.player.rotation||0)*180/Math.PI%360+360)%360;
        const turn=((bearing-head+540)%360)-180;
        const cardinal=['N','NE','L','SE','S','SO','O','NO'][Math.round(bearing/45)%8];
        return {island,distance:Math.round(Math.hypot(dx,dy)),
            bearing:Math.round(bearing)%360,turn:Math.round(turn),cardinal};
    },
    focus(s,step) {
        const known=this.landmarks(s);
        if(!known.length)return false;
        const at=known.findIndex(i=>i.id===s.atlasFocusedId);
        const index=at<0?(step<0?known.length-1:0):(at+step+known.length)%known.length;
        s.atlasFocusedId=known[index].id;
        if(s.atlasOpen)this.render(s);
        return true;
    },
    mark(s,id=s.atlasFocusedId) {
        if(!this.landmarks(s).some(i=>i.id===id))return false;
        s.chartWaypointId=s.chartWaypointId===id?null:id;
        s.atlasFocusedId=id;
        if(s.atlasOpen)this.render(s);
        return true;
    },
    discover(s) {
        if(!s.chartDiscovered||!s.player||!s.islands)return;
        // Sight radius is derived from the existing radar upgrade.
        // Discovery is voyage-only and never modifies SeaProfile.
        const range=Math.max(0,s.shipStats?.radar||0);
        for(const isl of s.islands) {
            if(Math.hypot(isl.x-s.player.x,isl.y-s.player.y)<=range+isl.radius)
                s.chartDiscovered.add(isl.id);
        }
    },
    init(s) {
        s.chartDiscovered=new Set();
        s.atlasOpen=false;
        s.atlasElements=null;
        s.chartWaypointId=null;
        s.atlasFocusedId=null;
        s.atlasPoints=[];
        // Same footprint as the existing 80x80 radar, now tappable.
        s.chartHitbox={
            x:SEA_DESKTOP?SEA_VIEW.width-82:390,
            y:187,w:80,h:80
        };
        this.discover(s);
    },
    close(s) {
        if(!s.atlasOpen)return false;
        s.atlasElements?.destroy(true);
        s.atlasElements=null;
        s.atlasOpen=false;
        s.touchReset();
        return true;
    },
    toggle(s) {
        if(s.atlasOpen)return this.close(s);
        if(s.ended||s.sinking||s.pausedByCaptain||s.islandDocked)return false;
        s.touchReset();
        this.discover(s);
        if(!this.landmarks(s).some(i=>i.id===s.atlasFocusedId))
            s.atlasFocusedId=this.landmarks(s)[0]?.id??null;
        this.render(s);
        s.atlasOpen=true;
        return true;
    },
    render(s) {
        if(s.atlasElements)s.atlasElements.destroy(true);
        const desktop=SEA_DESKTOP,V=SEA_VIEW;
        const cx=V.width/2,cy=V.height/2;
        const top=desktop?15:65,w=desktop?680:444,h=desktop?690:662;
        const mapW=desktop?568:362,mapH=desktop?360:268;
        const mapX=cx,mapY=top+(desktop?323:308);
        const root=s.add.container(0,0).setScrollFactor(0).setDepth(460);
        s.atlasElements=root;
        const add=o=>{root.add(o);return o;};
        add(s.add.rectangle(cx,cy,V.width,V.height,0x03070a,.95)
            .setInteractive());
        add(s.add.rectangle(cx,top+h/2,w,h,0x101719,1)
            .setStrokeStyle(3,0x8c7053,.95));
        add(s.add.rectangle(cx,top+h/2,w-14,h-14,0x1e161b,.55)
            .setStrokeStyle(1,0x5b4939,.9));
        const txt=(x,y,value,size=13,color='#decbb0',options={})=>
            add(s.add.text(x,y,value,{
                fontFamily:options.mono?'monospace':'Georgia',fontSize:size+'px',
                fontStyle:options.bold?'bold':'normal',
                color,align:options.align||'center',
                wordWrap:{width:options.wrap||w-60},lineSpacing:4
            }).setOrigin(.5));
        txt(cx,top+35,'✥  CARTA DOS NÁUFRAGOS  ✥',desktop?27:21,'#e5c8a0',{bold:true});
        txt(cx,top+78,'O mundo conhecido termina onde a proa ainda não esteve.',
            desktop?14:12,'#b8ab99');
        add(s.add.rectangle(mapX,mapY,mapW+10,mapH+10,0x060b0e,1)
            .setStrokeStyle(1,0xb0926c,.9));
        add(s.add.rectangle(mapX,mapY,mapW,mapH,0x111e23,1)
            .setStrokeStyle(1,0x534536,.95));
        // Clip with containment: every landmark is translated from real
        // world coordinates. No map click teleports or reveals unknown sites.
        const g=add(s.add.graphics());
        const L=mapX-mapW/2,T=mapY-mapH/2;
        const scaleX=mapW/s.W,scaleY=mapH/s.H;
        const known=this.landmarks(s),nav=this.navigation(s);
        s.atlasPoints=known.map(i=>({id:i.id,x:L+i.x*scaleX,y:T+i.y*scaleY}));
        if(nav)g.lineStyle(2,0xd2aa78,.64).lineBetween(
            L+s.player.x*scaleX,T+s.player.y*scaleY,
            L+nav.island.x*scaleX,T+nav.island.y*scaleY);
        g.lineStyle(1,0x53636a,.19);
        for(let k=1;k<6;k++){
            const vx=L+mapW*k/6,vy=T+mapH*k/6;
            g.lineBetween(vx,T+2,vx,T+mapH-2);
            g.lineBetween(L+2,vy,L+mapW-2,vy);
        }
        // Unvisited locations need discovery; visited ones are desaturated.
        let visible=0;
        for(const isl of known) {
            visible++;
            const mx=L+isl.x*scaleX,my=T+isl.y*scaleY;
            const visited=s.islandVisits?.has(isl.id);
            const color=visited?0x667074:(this.colors[isl.kind]||0xa88e7a);
            g.fillStyle(0x050b0d,1).fillCircle(mx,my,5);
            if(isl.politicalEcho&&!isl.politicalEcho.resolved&&!visited){
                // Political aftershocks are known through a clue, not map-wide discovery.
                g.lineStyle(2,0xe1b879,1).strokeCircle(mx,my,9);
                g.fillStyle(0xe1b879,1).fillRect(mx-3,my-3,6,6);
            }else if(isl.kind==='parley'&&!visited){
                g.lineStyle(1,0xe5b780,.95).strokeCircle(mx,my,7);
                g.fillStyle(color,1).fillRect(mx-3,my-3,6,6);
            }else if(isl.kind==='daegon'&&!visited) {
                // A dangerous altar is square: distinguish by shape and hue.
                g.fillStyle(color,1).fillRect(mx-4,my-4,8,8);
            }else if(isl.kind==='demeter'&&!visited) {
                // Sanctuary cross remains recognizable without color vision.
                g.lineStyle(2,color,1).lineBetween(mx-5,my,mx+5,my);
                g.lineBetween(mx,my-5,mx,my+5);
            }else{
                g.fillStyle(color,visited?.55:1).fillCircle(mx,my,3.5);
                if(visited)g.lineStyle(1,0x748384,.55).strokeCircle(mx,my,5);
            }
            if(isl.id===s.atlasFocusedId)
                g.lineStyle(1,0xeed6b2,.95).strokeCircle(mx,my,10);
            if(isl.id===s.chartWaypointId)
                g.lineStyle(2,0xf2b86d,1).strokeCircle(mx,my,14);
        }
        // One disclosed ship, not the location of any undiscovered island.
        const fugitive=typeof SEA_CONTRACTS!=='undefined'?SEA_CONTRACTS.hunted(s):null;
        if(fugitive){
            const hx=L+fugitive.x*scaleX,hy=T+fugitive.y*scaleY;
            g.lineStyle(2,0xe2ad70,.95).strokeCircle(hx,hy,8);
            g.lineStyle(1,0xf0d6ac,.95).strokeCircle(hx,hy,12);
            g.fillStyle(0xf0b67a,1).fillCircle(hx,hy,3.5);
            txt(cx,top+(desktop?507:446),'✦ PRESA MARCADA: FRAGATA EM MOVIMENTO · '+Math.max(0,Math.ceil(s.contract.escapeAt-(s.elapsed||0)))+'s',desktop?12:10,'#e5bc88',{mono:true});
        }
        const px=L+s.player.x*scaleX,py=T+s.player.y*scaleY;
        // The sailor's green arrow uses the actual heading; no route
        // guidance/waypoints are invented on the captain's behalf.
        g.fillStyle(0x0b1415,1).fillCircle(px,py,8);
        g.fillStyle(0xc6e4cc,1).fillCircle(px,py,5);
        const angle=s.player.rotation||0;
        g.lineStyle(2,0xc6e4cc,1).lineBetween(px,py,
            px+Math.sin(angle)*14,py-Math.cos(angle)*14);
        // Real world map cardinal orientation, not camera orientation.
        txt(L+14,T+13,'N',12,'#e1c99f',{bold:true});
        const visitedCount=Array.from(s.chartDiscovered).filter(id=>s.islandVisits?.has(id)).length;
        const focused=known.find(i=>i.id===s.atlasFocusedId);
        const labelFor=island=>island?.politicalEcho&&!island.politicalEcho.resolved?
            'ECO POLÍTICO':this.kindNames[island?.kind]||'ILHA';
        const title=nav?labelFor(nav.island):focused?labelFor(focused):null;
        txt(cx,top+(desktop?525:463),
            nav?'◆ DESTINO MARCADO: '+title+' #'+nav.island.id:
                focused?'MARCO EM FOCO: '+title+' #'+focused.id:
                    'NENHUM MARCO CONHECIDO',
            desktop?13:11,nav?'#e4bf8b':'#d4c0a0',{bold:!!nav});
        txt(cx,top+(desktop?550:485),
            nav?'DIST '+nav.distance+' UNID. · RUMO '+nav.bearing+'° '+nav.cardinal+
                ' · '+(Math.abs(nav.turn)<=1?'PROA ALINHADA':
                    Math.abs(nav.turn)+'° '+(nav.turn>0?'ESTIB.':'BOMB.')):
                'ESCOLHA UM MARCO PARA TRAÇAR O RUMO',
            desktop?12:10,'#c5b5a3',{mono:true});
        txt(cx,top+(desktop?574:516),
            'CONHECIDAS '+visible+'  ·  VISITADAS '+visitedCount+
            '  ·  OUTRAS AINDA OCULTAS',
            desktop?12:10,'#c2ae95',{mono:true});
        txt(cx,top+(desktop?598:546),
            '▣ NEGOCIAÇÃO   ■ ALTAR   ✚ SANTUÁRIO   ○ VISITADA',
            desktop?12:10,'#bfaa8c',{mono:true});
        txt(cx,top+(desktop?622:574),
            'TOQUE: MARCAR · SETAS / DIRECIONAL: ESCOLHER · ENTER / A: MARCAR · ESC / B: FECHAR',
            desktop?11:10,'#b4a08a',{mono:true});
        const closeY=top+h-(desktop?30:40),closeW=desktop?300:322,closeH=48;
        add(s.add.rectangle(cx,closeY,closeW,closeH,0x362128,.98)
            .setStrokeStyle(2,0xa47d60,.95));
        txt(cx,closeY,'◀  RETORNAR À NAVEGAÇÃO',desktop?17:15,'#e5ceb4',{bold:true});
        s.atlasCloseHitbox={x:cx,y:closeY,w:closeW,h:closeH};
        // Canvas touches are routed by handleCaptainPointer; this full
        // backdrop prevents any shot or ship movement through the atlas.
        return root;
    },
    pointer(s,x,y) {
        if(!s.atlasOpen)return false;
        const point=(s.atlasPoints||[]).find(p=>Math.hypot(p.x-x,p.y-y)<=12);
        if(point){this.mark(s,point.id);return true;}
        this.close(s);
        return true;
    }
};
