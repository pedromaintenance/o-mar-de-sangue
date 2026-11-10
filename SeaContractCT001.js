/* O Mar de Sangue — CT-001 v0.5, vertical slice de laboratório.
 * Isolado: só roda quando Game recebe contractId 'ct001' pelo parâmetro
 * explícito ?contractLab=ct001 no modo sandbox. Não gera ofertas nem
 * altera os contratos legados. Rotas e prazo auditáveis; QA visual pendente.
 */
const SEA_CT001 = Object.freeze({
  id:'ct001',
  title:'O Dízimo dos Afogados',
  bands:Object.freeze([
    {min:2,max:5,ship:'fragata',escorts:['patrulha','corsario']},
    {min:6,max:10,ship:'galeao',escorts:['fragata','bombardeiro']},
    {min:11,max:15,ship:'galeao',escorts:['fragata','fragata','corsario']},
    {min:16,max:25,ship:'galeao',escorts:['fragata','bombardeiro','corsario','corsario']},
    {min:26,max:Infinity,ship:'galeao',escorts:['fragata','bombardeiro','corsario','corsario']}
  ]),
  active(s){return s?.contract?.id===this.id;},
  band(stage){return this.bands.find(b=>stage>=b.min&&stage<=b.max)||this.bands[0];},
  baseBounty(stage){
    const rank=Math.max(2,Math.floor(Number(stage)||2));
    // Proxy de calibragem: comissão líquida + coleta da missão de carga.
    // Não há telemetria de loot real ainda; manter como valor PROVISÓRIO.
    const principal=(typeof SEA_ECONOMY!=='undefined'
      ?SEA_ECONOMY.missionCommission(rank)*SEA_ECONOMY.missionPayoutMultiplier:40)+
      (70+rank*28)*.25;
    return Math.max(240,Math.round(principal*6));
  },
  init(s){
    const stage=Math.max(2,Math.floor(Number(s.profile?.mission)||2));
    const dist=(i,p)=>Math.hypot(i.x-p.x,i.y-p.y);
    const origin=s.player||{x:s.W/2,y:s.H/2};
    const wreck=[...(s.islands||[])].filter(i=>i.kind==='wreck')
      .sort((a,b)=>dist(a,origin)-dist(b,origin)||String(a.id).localeCompare(String(b.id)))[0];
    const sanctuary=[...(s.islands||[])].filter(i=>i.kind==='demeter')
      .sort((a,b)=>dist(a,wreck||origin)-dist(b,wreck||origin))[0];
    const ruin=[...(s.islands||[])].filter(i=>i.kind==='ruin')
      .sort((a,b)=>dist(a,wreck||origin)-dist(b,wreck||origin))[0];
    if(!wreck||!sanctuary||!ruin)return false;
    s.contract={id:this.id,lab:true,phase:'clue',completed:false,
      failed:false,escaped:false,activeMainMission:stage,clueId:wreck.id,
      shelterId:sanctuary.id,destinationId:ruin.id,targetEnemyId:null,
      exitX:null,exitY:null,escapeAt:0,boardUntil:0,route:null,
      routeWaypoints:[],routeIndex:0,routeDistance:0,initialWindow:0,
      launchedAt:0,capturedAt:null,failureReason:null,
      baseBounty:this.baseBounty(stage),bounty:0,ambushIds:[],boarded:false};
    s.chartDiscovered?.add(wreck.id);
    s.chartWaypointId=wreck.id;s.atlasFocusedId=wreck.id;
    return true;
  },
  target(s){
    const c=s.contract;
    if(!this.active(s)||c.completed||c.failed)return null;
    if(c.phase==='choose')return c.deckIsland||null;
    const id=c.phase==='clue'?c.clueId:
      c.phase==='deliver'?c.shelterId:
      c.phase==='manifest'?c.destinationId:null;
    return (s.islands||[]).find(i=>i.id===id)||null;
  },
  mark(s){
    const target=this.target(s);
    if(!target||!(s.islands||[]).some(i=>i.id===target.id))return false;
    s.chartDiscovered?.add(target.id);
    s.chartWaypointId=target.id;s.atlasFocusedId=target.id;
    return true;
  },
  status(s){
    const c=s.contract;
    if(!this.active(s))return '';
    if(c.completed)return 'DÍZIMO DOS AFOGADOS · CONTRATO CONCLUÍDO';
    if(c.failed)return 'DÍZIMO DOS AFOGADOS · OPERAÇÃO FRACASSADA';
    if(c.phase==='clue')return 'DÍZIMO · LOCALIZE O MANIFESTO NO NAUFRÁGIO MARCADO';
    if(c.phase==='chase'){
      const e=(s.enemies||[]).find(e=>e.id===c.targetEnemyId&&!e.dead);
      const d=e&&s.player?Math.round(Math.hypot(s.player.x-e.x,s.player.y-e.y)):null;
      return 'DÍZIMO · INTERCEPTE O TRANSPORTE · '+
        (d===null?'ALVO NÃO LOCALIZADO':d+' UNID. · ')+
        Math.max(0,Math.ceil(c.escapeAt-(s.elapsed||0)))+'s';
    }
    if(c.phase==='board')return 'DÍZIMO · ABORDE O CASCO AVARIADO · '+
      Math.max(0,Math.ceil(c.boardUntil-(s.elapsed||0)))+'s';
    if(c.phase==='choose')return 'DÍZIMO · ESCOLHA O DESTINO DA CARGA';
    if(c.phase==='deliver')return 'DÍZIMO · LEVE OS PRISIONEIROS A DEMÉTER';
    if(c.phase==='manifest')return 'DÍZIMO · ENTREGUE AS PROVAS ÀS RUÍNAS';
    if(c.phase==='ambush')return 'DÍZIMO · SOBREVIVA À CONTRAEMBOSCADA · '+
      c.ambushIds.filter(id=>(s.enemies||[]).some(e=>e.id===id&&!e.dead)).length+' NAVIOS';
    return 'DÍZIMO · OPERAÇÃO EM ANDAMENTO';
  },
  scene(s,island){
    const c=s.contract,t=this.target(s);
    if(!this.active(s)||!t||t.id!==island?.id)return null;
    if(c.phase==='clue')return 'No casco partido de um cargueiro, um livro de tributos registra ouro, farinha e pessoas escravizadas. A rota do próximo comboio está anotada no manifesto.';
    if(c.phase==='choose')return 'O transporte está dominado. Nos porões há prisioneiros e cofres da Corte. A tripulação espera a ordem do capitão. Libertar, pilhar ou negociar: nenhuma escolha é neutra.';
    if(c.phase==='deliver')return 'Os guardiões do santuário de Deméter oferecem abrigo aos prisioneiros. Os perseguidores ainda podem alcançá-los antes do desembarque.';
    if(c.phase==='manifest')return 'Corretores de ruínas oferecem dinheiro pelo manifesto. O documento revela o comércio de prisioneiros da Corte; o comprador pode usá-lo ou ocultá-lo.';
    return null;
  },
  options(s,island){
    const c=s.contract,t=this.target(s);
    if(!this.active(s)||!t||t.id!==island?.id)return null;
    if(c.phase==='clue')return [
      {id:'ct001-clue',contractAction:'ct001-clue',
        name:'SEGUIR A ROTA DO COMBOIO',
        hint:'Ler manifesto · localizar transporte e escoltas no mar'}
    ];
    if(c.phase==='choose')return [
      {id:'ct001-free',contractAction:'ct001-free',
        name:'ABRIR OS PORÕES',
        hint:'Deméter · perseguição · '+Math.round(c.baseBounty*.8)+' ouro'},
      {id:'ct001-loot',contractAction:'ct001-loot',
        name:'TOMAR O COFRE',
        hint:'Contraemboscada · '+Math.round(c.baseBounty*1.25)+' ouro'},
      {id:'ct001-sell',contractAction:'ct001-sell',
        name:'VENDER O MANIFESTO',
        hint:'Entrega às ruínas · '+c.baseBounty+' ouro'}
    ];
    if(c.phase==='deliver')return [
      {id:'ct001-deliver',contractAction:'ct001-deliver',
        name:'DESEMBARCAR OS PRISIONEIROS',
        hint:'Concluir resgate · '+Math.round(c.baseBounty*.8)+' ouro'}
    ];
    if(c.phase==='manifest')return [
      {id:'ct001-manifest',contractAction:'ct001-manifest',
        name:'ENTREGAR O MANIFESTO',
        hint:'Fechar acordo · '+c.baseBounty+' ouro'}
    ];
    return null;
  },
  launch(s){
    const c=s.contract;
    if(!this.active(s)||c.phase!=='clue')return false;
    const band=this.band(c.activeMainMission);
    const target=s.spawnEnemy?.(band.ship,620,{capturable:true,forcedHostile:true});
    if(!target||!target.capturable)return false;
    target.ct001Transport=true;target.reward=0;
    target.label?.setText?.('⚑ TRANSPORTE DE TRIBUTOS · CAPTURE');
    const plan=SEA_CONVOY_NAV.plan(s,target,target.x<s.W/2,target.radius);
    if(!plan){
      // Não deixar um transporte órfão quando o mapa não tem rota segura.
      target.dead=true;
      for(const key of ['ship','wake','bar','label'])target[key]?.destroy?.();
      s.announce?.('SEM CORREDOR NAVEGÁVEL PARA O COMBOIO · TENTE NOVAMENTE');
      return false;
    }
    c.targetEnemyId=target.id;
    c.routeWaypoints=plan.waypoints;
    c.routeIndex=0;
    c.routeDistance=Math.round(plan.length);
    c.exitX=plan.end.x;c.exitY=plan.end.y;
    c.initialWindow=SEA_CONVOY_NAV.captureWindow(s,target,plan,c.activeMainMission);
    c.launchedAt=s.elapsed||0;
    c.escapeAt=c.launchedAt+c.initialWindow;
    for(const [index,type] of band.escorts.entries()){
      const guard=s.spawnEnemy?.(type,480+index*100,{forcedHostile:true});
      if(guard){guard.ct001Escort=true;guard.label?.setText?.('⚔ ESCOLTA DA CORTE · '+SEA_FOES[type].name);}
    }
    c.phase='chase';
    s.chartWaypointId=null;
    s.announce?.('COMBOIO À VISTA · ROTA NAVEGÁVEL · AVARIE, NÃO AFUNDE · '+c.initialWindow+'s');
    return true;
  },
  evade(s,e,dt){
    const c=s.contract;
    if(!this.active(s)||!e?.ct001Transport||e.dead||e.boardingDisabled||
       c.targetEnemyId!==e.id||c.phase!=='chase')return false;
    const delta=Math.max(.001,Math.min(.1,Number(dt)||0));
    while(c.routeIndex<c.routeWaypoints.length-1){
      const waypoint=c.routeWaypoints[c.routeIndex];
      if(Math.hypot(e.x-waypoint.x,e.y-waypoint.y)>Math.max(105,e.radius+44))break;
      c.routeIndex++;
    }
    const waypoint=c.routeWaypoints[c.routeIndex]||{x:c.exitX,y:c.exitY};
    const dx=waypoint.x-e.x,dy=waypoint.y-e.y;
    const desired=Math.atan2(dx,-dy);
    const angle=Math.atan2(Math.sin(desired-e.heading),Math.cos(desired-e.heading));
    e.heading+=Math.max(-1.45*delta,Math.min(1.45*delta,angle));
    // A tripulação reduz pano para virar: evita entrar de proa nas ilhas.
    const throttle=Math.max(.08,1-Math.min(1,Math.abs(angle)/1.15));
    e.vx+=Math.sin(e.heading)*175*throttle*delta;
    e.vy-=Math.cos(e.heading)*175*throttle*delta;
    if(typeof SEA_WEATHER!=='undefined')SEA_WEATHER.enemyCurrent(s,e,delta);
    const friction=Math.exp(-1.25*delta);
    e.vx*=friction;e.vy*=friction;
    const speed=Math.hypot(e.vx,e.vy),cap=Math.max(75,Math.min(130,e.speed*1.05));
    const turnCap=Math.max(38,cap*(1-.7*Math.min(1,Math.abs(angle)/1.5)));
    if(speed>turnCap){e.vx*=turnCap/speed;e.vy*=turnCap/speed;}
    e.x+=e.vx*delta;e.y+=e.vy*delta;
    s.collideWorldBounds?.(e);
    for(const island of s.islands||[]){
      s.collideRock?.(e,island,false);
      if(e.dead)break;
    }
    return true;
  },
  onCapture(s,e){
    const c=s.contract;
    if(!this.active(s)||!e?.ct001Transport||c.targetEnemyId!==e.id||
       !['chase','board'].includes(c.phase)||c.boarded)return false;
    c.boarded=true;c.phase='choose';c.capturedAt=s.elapsed||0;c.escapeAt=0;
    c.deckIsland={id:'ct001-deck',kind:'wreck',contractTitle:'O DÍZIMO DOS AFOGADOS',
      x:e.x,y:e.y,radius:88};
    s.chartWaypointId=null;
    s.touchReset?.();
    s.playerVelocity.x=0;s.playerVelocity.y=0;s.speed=0;
    s.islandDocked=true;s.islandSelected=c.deckIsland;
    s.islandOutcome='';s.islandError='';s.islandChoiceIndex=0;
    s.anchorButton?.setVisible(false);s.anchorText?.setVisible(false);
    s.anchorHint?.setVisible(false);s.anchorPulse?.clear();
    SEA_ISLANDS.render(s);
    s.updateHUD?.();
    return true;
  },
  fail(s,reason='O COMBOIO ESCAPOU'){
    const c=s.contract;
    if(!this.active(s)||c.completed||c.failed)return false;
    c.failed=true;c.escaped=true;c.bounty=0;c.phase='failed';
    c.failureReason=reason;
    s.announce?.(reason);
    s.finish?.(false,true);
    return true;
  },
  record(s,route,description,terms){
    const c=s.contract;
    if(!this.active(s)||c.completed)return false;
    c.completed=true;c.phase='complete';c.route=route;
    c.bounty=Math.round(c.baseBounty*({free:.8,loot:1.25,sell:1}[route]||1));
    const changes={free:{sobreviventes:10,corte:-7,culto:-2},
      loot:{sobreviventes:-6,corte:-3,culto:0},
      sell:{sobreviventes:-8,corte:5,culto:-4}}[route]||{};
    if(s.alignment)for(const [key,delta] of Object.entries(changes))
      s.alignment[key]=Math.max(0,Math.min(100,(Number(s.alignment[key])||0)+delta));
    s.politicalEvents?.push?.({eventId:'ct001',choiceId:'ct001-'+route,
      text:description,terms:terms+' · '+c.bounty+' ouro ao concluir'});
    s.chartWaypointId=null;
    s.updateHUD?.();
    return true;
  },
  update(s){
    const c=s.contract;
    if(!this.active(s)||s.ended||s.sinking||c.completed||c.failed)return;
    if(c.phase==='chase'||c.phase==='board'){
      const target=(s.enemies||[]).find(e=>e.id===c.targetEnemyId&&!e.dead);
      if(!target)return this.fail(s,'TRANSPORTE PERDIDO · CONTRATO FRACASSADO');
      if(target.boardingDisabled){
        if(c.phase!=='board'){
          c.phase='board';
          const seconds=Math.max(38,55-Math.floor(c.activeMainMission*.6));
          c.boardUntil=(s.elapsed||0)+seconds;
          s.announce?.('TRANSPORTE IMOBILIZADO · '+seconds+'s PARA ABORDAR');
        }
        if((s.elapsed||0)>=c.boardUntil)
          this.fail(s,'A ESCOLTA RESGATOU O TRANSPORTE ANTES DA ABORDAGEM');
        return;
      }
      if(Math.hypot(target.x-c.exitX,target.y-c.exitY)<120||
          (s.elapsed||0)>=c.escapeAt)this.fail(s,'O COMBOIO PASSOU PELO LIMITE · SEM RECOMPENSA');
      return;
    }
    if(c.phase==='ambush'){
      const living=c.ambushIds.some(id=>(s.enemies||[]).some(e=>e.id===id&&!e.dead));
      if(!living&&c.ambushIds.length){
        this.record(s,'loot','TRIBUTOS TOMADOS DA CORTE',
          'Cofre confiscado · Sobreviventes −6 · Corte −3');
        s.announce?.('A CONTRAEMBOSCADA FOI DERROTADA · CONTRATO CUMPRIDO');
        s.finish?.(true);
      }
    }
  },
  metrics(s){
    const c=s.contract;
    if(!this.active(s))return null;
    return {stage:c.activeMainMission,routeLength:c.routeDistance,
      routeNodes:c.routeWaypoints.length,initialWindow:c.initialWindow,
      captureSeconds:c.capturedAt===null?null:Math.round(c.capturedAt-c.launchedAt),
      escapeSeconds:c.failed?Math.round((s.elapsed||0)-c.launchedAt):null,
      failureReason:c.failureReason||null,phase:c.phase,choice:c.route||null,
      bounty:c.bounty||0};
  },
  apply(s,choice){
    const c=s.contract,t=this.target(s);
    if(!this.active(s)||!t||s.islandSelected?.id!==t.id||
       c.completed||c.failed||!choice?.contractAction)return false;
    const action=choice.contractAction;
    if(c.phase==='clue'&&action==='ct001-clue'){
      if(!this.launch(s)){
        s.islandError='NÃO FOI POSSÍVEL LOCALIZAR O COMBOIO · TENTE NOVAMENTE';
        return false;
      }
      s.islandOutcome='O manifesto revela a rota.\n'+
        'O transporte avança com escolta da Corte: avarie o casco até a rendição e aborde antes da fuga.';
      s.islandVisits.add(t.id);
    }else if(c.phase==='choose'){
      if(action==='ct001-free'){
        const pursuer=s.spawnEnemy?.('corsario',570,{forcedHostile:true});
        if(!pursuer){s.islandError='CORSÁRIO NÃO PÔDE SER MOBILIZADO · TENTE DE NOVO';return false;}
        pursuer.label?.setText?.('☠ CAÇADOR DE PRISIONEIROS');
        c.phase='deliver';c.route='free';
        this.mark(s);
        s.islandOutcome='Os prisioneiros estão a bordo.\n'+
          'Um corsário persegue sua nau. Leve-os ao santuário de Deméter, marcado na Carta.';
      }else if(action==='ct001-loot'){
        const ids=[];
        for(const type of ['patrulha','corsario']){
          const e=s.spawnEnemy?.(type,510+ids.length*135,{forcedHostile:true});
          if(e){e.ct001Ambush=true;ids.push(e.id);
            e.label?.setText?.('⚔ COBRADOR DOS TRIBUTOS');}
        }
        if(!ids.length){s.islandError='NÃO FOI POSSÍVEL ENVIAR COBRADORES · TENTE DE NOVO';return false;}
        c.ambushIds=ids;c.phase='ambush';c.route='loot';s.chartWaypointId=null;
        s.islandOutcome='O cofre foi confiscado, mas a Corte não aceita a perda.\n'+
          'Derrote os cobradores que chegaram para recuperar a carga.';
      }else if(action==='ct001-sell'){
        const inspector=s.spawnEnemy?.('patrulha',640,{forcedHostile:true});
        if(!inspector){s.islandError='NÃO FOI POSSÍVEL ABRIR A ROTA DE NEGOCIAÇÃO';return false;}
        inspector.label?.setText?.('⚔ FISCAL DOS MANIFESTOS');
        c.phase='manifest';c.route='sell';this.mark(s);
        s.islandOutcome='Você guarda as provas em vez de libertar as pessoas.\n'+
          'Um fiscal tenta interceptar sua nau. Os compradores aguardam nas ruínas marcadas.';
      }else return false;
    }else if(c.phase==='deliver'&&action==='ct001-deliver'){
      this.record(s,'free','PRISIONEIROS ENTREGUES A DEMÉTER',
        'Sobreviventes +10 · Corte −7 · Culto −2');
      s.islandOutcome='Os sobreviventes recebem abrigo e água limpa.\n'+
        'O santuário registra seus nomes e promete lembrar do capitão.';
      s.islandVisits.add(t.id);
    }else if(c.phase==='manifest'&&action==='ct001-manifest'){
      this.record(s,'sell','MANIFESTO NEGOCIADO COM INTERMEDIÁRIOS',
        'Corte +5 · Sobreviventes −8 · Culto −4');
      s.islandOutcome='Os compradores lacram a denúncia e pagam pelo silêncio.\n'+
        'As pessoas ainda estão cativas, mas os documentos mudaram de mãos.';
      s.islandVisits.add(t.id);
    }else return false;
    s.islandChoiceIndex=0;s.islandError='';
    s.updateHUD?.();
    return true;
  }
});
