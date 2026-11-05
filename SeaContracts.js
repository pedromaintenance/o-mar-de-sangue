/* O Mar de Sangue — V115: dilemas jogáveis dos Contratos da Costa Sul.
 * Resgate com dois portos físicos, risco em combate e pagamento no retorno.
 * Estado somente na cena: não modifica SeaProfile nem o esquema do save v4.
 */
const SEA_CONTRACTS = {
  offers:Object.freeze({
    rescue:Object.freeze({title:'RESGATE DOS AFOGADOS',bounty:125,
      description:'Um barco de refugiados foi abandonado pela frota. Quem fica para trás? Resgate o grupo e escolha entre uma evacuação segura ou levar todos sob perseguição.'}),
    hunt:Object.freeze({title:'A CAÇADA DOS CONDENADOS',bounty:240,
      description:'A Corte quer silenciar um capitão desertor. Siga o rastro ou compre tempo investigando as provas: menos ouro, mais chances de interceptação.'}),
    smuggle:Object.freeze({title:'PÓLVORA SEM BANDEIRA',bounty:190,
      description:'Carregue pólvora sem registro. Fuja da inspeção, compre o silêncio dos fiscais ou denuncie a rede à Corte e aceite o preço político.'})
  }),
  init(s,id) {
    s.contract=null;
    const authorized=typeof SEA_FACTION_POLITICS!=='undefined'?
      SEA_FACTION_POLITICS.commission(id,s.profile):null;
    if(typeof SEA_FACTION_POLITICS!=='undefined'&&
       Object.hasOwn(SEA_FACTION_POLITICS.commissions,id)&&!authorized)return false;
    const base=authorized?.base||id;
    if(base==='hunt'){
      const wrecks=s.islands.filter(i=>i.kind==='wreck');
      if(!wrecks.length)return false;
      const center={x:s.W/2,y:s.H/2};
      const clue=[...wrecks].sort((a,b)=>
        Math.hypot(a.x-center.x,a.y-center.y)-Math.hypot(b.x-center.x,b.y-center.y)||a.id-b.id)[0];
      s.contract={id:'hunt',clueId:clue.id,phase:'clue',completed:false,
        escaped:false,targetEnemyId:null,escapeAt:0,exitX:null,exitY:null,
        bounty:this.offers.hunt.bounty,method:'pursuit'};
      this.decorate(s,id,authorized);
      this.mark(s);
      return true;
    }
    if(base==='smuggle'){
      const center={x:s.W/2,y:s.H/2};
      // Reuse known physical ruins, never generate a new unreachable site.
      const distance=i=>Math.hypot(i.x-center.x,i.y-center.y);
      const ruins=s.islands.filter(i=>i.kind==='ruin'&&distance(i)>800)
        .sort((a,b)=>distance(a)-distance(b)||a.id-b.id);
      if(!ruins.length)return false;
      s.contract={id:'smuggle',destinationId:ruins[0].id,phase:'deliver',
        completed:false,intercepted:false,inspectorSpawned:false,
        suspicion:0,route:null,bounty:this.offers.smuggle.bounty};
      this.decorate(s,id,authorized);
      this.mark(s);
      return true;
    }
    if(base!=='rescue')return false;
    const center={x:s.W/2,y:s.H/2};
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const wrecks=s.islands.filter(i=>i.kind==='wreck');
    const shelters=s.islands.filter(i=>i.kind==='demeter');
    if(!wrecks.length||!shelters.length)return false;
    // Deterministic, obtainable locations in the existing fixed map.
    const pickup=[...wrecks].sort((a,b)=>dist(a,center)-dist(b,center)||a.id-b.id)[0];
    const shelter=[...shelters].sort((a,b)=>dist(a,pickup)-dist(b,pickup)||a.id-b.id)[0];
    s.contract={id:'rescue',pickupId:pickup.id,shelterId:shelter.id,
      phase:'pickup',completed:false,bounty:this.offers.rescue.bounty,
      evacuation:'priority',pursuerId:null};
    this.decorate(s,id,authorized);
    this.mark(s);
    return true;
  },
  decorate(s,id,commission){
    if(!commission||!s.contract)return;
    s.contract.commission=commission.faction;
    s.contract.commissionTitle=commission.title;
    s.contract.bounty=SEA_FACTION_POLITICS.bounty(s.profile,id);
    s.contract.commissionBounty=s.contract.bounty;
  },
  target(s) {
    const c=s.contract;
    if(!c||c.completed)return null;
    if(c.id==='hunt')return c.phase==='clue'?
      s.islands.find(i=>i.id===c.clueId)||null:null;
    const id=c.id==='smuggle'?c.destinationId:
      c.phase==='pickup'?c.pickupId:c.shelterId;
    return s.islands.find(i=>i.id===id)||null;
  },
  mark(s) {
    const target=this.target(s);
    if(!target)return false;
    // Contract provides coordinates of exactly the next port. Fog of war
    // for every unrelated island remains intact.
    s.chartDiscovered?.add(target.id);
    s.chartWaypointId=target.id;
    s.atlasFocusedId=target.id;
    return true;
  },
  status(s) {
    const c=s.contract;
    if(!c)return '';
    if(c.id==='hunt'){
      if(c.completed)return 'CAÇADA CONCLUÍDA · ALVO ABATIDO';
      if(c.escaped)return 'CAÇADA FRACASSADA · A FRAGATA ESCAPOU';
      if(c.phase==='clue')return 'CAÇADA · INVESTIGUE O NAUFRÁGIO MARCADO NA CARTA';
      const remaining=Math.max(0,Math.ceil(c.escapeAt-(s.elapsed||0)));
      return 'CAÇADA · '+(c.method==='evidence'?'PROVAS EM MÃOS · ':'')+
        'INTERCEPTE A FRAGATA · '+remaining+'s PARA FUGA';
    }
    if(c.id==='smuggle'){
      if(c.intercepted)return 'CARGA APREENDIDA PELA CORTE';
      if(c.completed)return 'CONTRABANDO ENTREGUE · RETORNE AO PORTO';
      return 'CONTRABANDO · SUSPEITA '+Math.round(c.suspicion)+'% · ENTREGA ÀS RUÍNAS';
    }
    return c.completed?'RESGATE CONCLUÍDO · RETORNE AO PORTO':
      c.phase==='pickup'?'RESGATE · LOCALIZE OS NÁUFRAGOS NA CARTA':
      (c.evacuation==='all'?'RESGATE TOTAL · CORSÁRIOS NA SUA ESTEIRA · ':'RESGATE · ')+
      'ENTREGUE OS NÁUFRAGOS A DEMÉTER';
  },
  scene(s,island){
    const c=s.contract,target=this.target(s);
    if(!c||!island||target?.id!==island.id)return null;
    if(c.id==='rescue')return c.phase==='pickup'?
      'Entre tábuas partidas, os últimos náufragos suplicam por lugar. Uma escolta inimiga vigia o canal. Decida quem embarca antes que a maré feche.':
      'As lanternas de Deméter tremem no cais. Os resgatados estão exaustos, e o abrigo conta cada nome para saber quem não voltou.';
    if(c.id==='hunt')return 'O capitão foi declarado desertor. Um diário manchado registra sua rota; as testemunhas exigem parte da recompensa para revelar o que a Corte apagou.';
    if(c.id==='smuggle')return 'O armazém não tem bandeira. Há fiscais nas sombras e compradores sem rosto. A suspeita marca '+Math.round(c.suspicion)+'%; a carga pode ser entregue, vendida ou denunciada.';
    return null;
  },
  options(s,island) {
    const c=s.contract,target=this.target(s);
    if(!c||!target||!island||island.id!==target.id)return null;
    if(c.id==='hunt')return [
      {id:'hunt-clue',contractAction:'hunt-clue',
        name:'SEGUIR AS PEGADAS DA FRAGATA',
        hint:'105 s para caçar · '+c.bounty+' ouro · alvo resistente'},
      {id:'hunt-evidence',contractAction:'hunt-evidence',
        name:'INTERROGAR A TRIPULAÇÃO E REUNIR PROVAS',
        hint:'160 s para caçar · alvo menos resistente · prêmio 28% menor'}
    ];
    if(c.id==='smuggle')return [
      {id:'smuggle-hidden',contractAction:'smuggle-hidden',
        name:'ENTREGAR SEM SER VISTO',
        hint:'Suspeita abaixo de 60% · 190 ouro · +12 maldição'},
      {id:'smuggle-bribe',contractAction:'smuggle-bribe',
        name:'COMPRAR O SILÊNCIO DA CORTE',
        hint:'Acordo corrupto · prêmio reduzido a 115 ouro'},
      {id:'smuggle-inform',contractAction:'smuggle-inform',
        name:'ENTREGAR OS NOMES DOS COMPRADORES',
        hint:'85 ouro · +8 confiança da Corte · −5 do Culto'}
    ];
    return c.phase==='pickup'?
      [
        {id:'rescue-pickup',contractAction:'pickup',name:'PRIORIZAR OS FERIDOS',
          hint:'Evacuação controlada · pagamento normal · sem novo perseguidor'},
        {id:'rescue-all',contractAction:'rescue-all',name:'NÃO DEIXAR NINGUÉM PARA TRÁS',
          hint:'+'+80+' ouro · um corsário hostil tentará impedir a travessia'}
      ]:
      [{id:'rescue-deliver',contractAction:'deliver',name:'DESEMBARCAR SOBREVIVENTES',
        hint:'Concluir o resgate · '+c.bounty+' ouro'}];
  },
  update(s,dt) {
    const c=s.contract;
    if(!c||s.ended||s.sinking)return;
    if(c.id==='hunt'){
      if(c.phase!=='chase'||c.completed||c.escaped)return;
      const target=this.hunted(s);
      if(target&&Math.hypot(target.x-c.exitX,target.y-c.exitY)<105||
          (s.elapsed||0)>=c.escapeAt){
        c.escaped=true;c.phase='escaped';c.bounty=0;
        s.announce?.('A FRAGATA PASSOU O LIMITE DO ARQUIPÉLAGO · CAÇADA PERDIDA');
        s.finish?.(false,true);
      }
      return;
    }
    if(c.id!=='smuggle'||c.completed||c.intercepted)return;
    const delta=Math.max(0,Math.min(Number(dt)||0,.1));
    if(s.elapsed<6||!s.player||!delta)return;
    if(!c.inspectorSpawned){
      c.inspectorSpawned=true;
      const inspector=s.spawnEnemy?.('patrulha',330,{forcedHostile:true})||
        s.enemies?.find(e=>!e.dead&&e.type==='patrulha');
      if(inspector){
        if(typeof SEA_FACTION_POLITICS!=='undefined')
          SEA_FACTION_POLITICS.provoke(inspector);
        inspector.smugglingInspector=true;
        s.announce?.('FISCAL DA CORTE NA MARÉ · EVITE A INSPEÇÃO');
      }
    }
    // Only the designated inspector generates suspicion. Other ships still
    // fight normally, but do not magically see through the cargo hold.
    const close=(s.enemies||[]).some(e=>e.smugglingInspector&&!e.dead&&
      Math.hypot(e.x-s.player.x,e.y-s.player.y)<340);
    const speed=Math.hypot(s.playerVelocity?.x||0,s.playerVelocity?.y||0);
    c.suspicion=Math.max(0,Math.min(100,c.suspicion+
      (close?(speed>85?25:17):-11)*delta));
    if(c.suspicion>=100){
      c.intercepted=true;c.phase='seized';c.bounty=0;
      s.announce?.('CARGA APREENDIDA · A CORTE CONFISCOU A PÓLVORA');
      // A seizure is a withdrawal without the contract bounty, not a
      // fabricated shipwreck or an advancement of the mission campaign.
      s.finish?.(false,true);
    }
  },
  hunted(s) {
    const c=s.contract;
    if(c?.id!=='hunt'||c.phase!=='chase')return null;
    return s.enemies?.find(e=>e.id===c.targetEnemyId&&!e.dead)||null;
  },
  launch(s,method='pursuit') {
    const c=s.contract;
    if(c?.id!=='hunt'||c.phase!=='clue')return false;
    if(method!=='pursuit'&&method!=='evidence')return false;
    const enemy=s.spawnEnemy?.('fragata',640);
    if(!enemy)return false;
    // Named fugitive, not a generic mission kill. The exit lies on the
    // opposite edge, so the player has a meaningful interception window.
    enemy.huntTarget=true;
    enemy.hp=Math.round(enemy.hp*(method==='evidence'?1.05:1.25));
    enemy.maxhp=enemy.hp;
    enemy.reward=Math.round(enemy.reward*.7);
    enemy.label?.setText('✦ CAPITÃO CONDENADO · FRAGATA');
    const escapeEast=enemy.x<s.W/2;
    c.exitX=escapeEast?s.W-105:105;
    c.exitY=Math.max(125,Math.min(s.H-125,enemy.y));
    c.targetEnemyId=enemy.id;
    c.phase='chase';
    c.method=method;
    if(method==='evidence')c.bounty=Math.round(c.bounty*.72);
    c.escapeAt=(s.elapsed||0)+(method==='evidence'?160:105);
    s.chartWaypointId=null;
    s.announce?.('A CARTA MARCOU A FRAGATA · '+(method==='evidence'?
      '160s · PROVAS EM MÃOS, PRÊMIO REDUZIDO':'105s PARA INTERCEPTAR'));
    return true;
  },
  evade(s,e,dt) {
    if(!e||e.dead||!e.huntTarget)return false;
    const c=s.contract;
    if(c?.id!=='hunt'||c.phase!=='chase')return false;
    const dx=c.exitX-e.x,dy=c.exitY-e.y;
    // Use the original vessel's movement conventions and world collisions.
    const desired=Math.atan2(dx,-dy);
    const delta=typeof Phaser!=='undefined'?
      Phaser.Math.Angle.Wrap(desired-e.heading):
      Math.atan2(Math.sin(desired-e.heading),Math.cos(desired-e.heading));
    const turn=Math.max(-1.45*dt,Math.min(1.45*dt,delta));
    e.heading+=turn;
    const throttle=Math.hypot(s.player.x-e.x,s.player.y-e.y)<580?1.25:1;
    e.vx+=Math.sin(e.heading)*190*throttle*dt;
    e.vy-=Math.cos(e.heading)*190*throttle*dt;
    if(typeof SEA_WEATHER!=='undefined')SEA_WEATHER.enemyCurrent(s,e,dt);
    const drag=Math.exp(-1.25*dt);
    e.vx*=drag;e.vy*=drag;
    const speed=Math.hypot(e.vx,e.vy);
    const limit=Math.min(170,Math.max(135,e.speed*1.25));
    if(speed>limit){e.vx*=limit/speed;e.vy*=limit/speed;}
    e.x+=e.vx*dt;e.y+=e.vy*dt;
    s.collideWorldBounds?.(e);
    for(const island of s.islands||[]){
      s.collideRock?.(e,island,false);
      if(e.dead)break;
    }
    return true;
  },
  onSink(s,e) {
    const c=s.contract;
    if(c?.id!=='hunt'||c.phase!=='chase'||c.completed||c.escaped||
      !e||!e.huntTarget||e.id!==c.targetEnemyId)return false;
    c.completed=true;c.phase='complete';
    s.announce?.('O CAPITÃO CONDENADO AFUNDOU · RECOMPENSA DA CAÇADA');
    s.finish?.(true);
    return true;
  },
  apply(s,choice) {
    const c=s.contract,target=this.target(s);
    if(!c||!choice||!target||s.islandSelected?.id!==target.id||
       (c.phase==='pickup'&&s.islandVisits?.has(target.id))||c.completed||
       c.intercepted)return false;
    if(c.id==='hunt'){
      const method=choice.contractAction==='hunt-clue'?'pursuit':
        choice.contractAction==='hunt-evidence'?'evidence':null;
      if(!method||c.phase!=='clue')return false;
      if(!this.launch(s,method)){
        s.islandError='NÃO FOI POSSÍVEL LOCALIZAR A FRAGATA · TENTE NOVAMENTE';
        return false;
      }
      s.islandOutcome=method==='evidence'?
        'Os marinheiros testemunham contra a Corte e revelam a rota de fuga.\n'+
        'A perseguição terá 160 segundos e a fragata está mais frágil, mas os informantes levaram 28% do prêmio.':
        'Um diário de bordo registra o capitão foragido.\n'+
        'A Carta revela sua posição atual. Você tem 105 segundos para interceptá-lo.';
      s.islandVisits.add(target.id);s.islandChoiceIndex=0;s.islandError='';
      s.updateHUD?.();
      return true;
    }
    if(c.id==='smuggle'){
      // A visited ruin can still receive cargo; c.completed prevents replay.
      const hidden=choice.contractAction==='smuggle-hidden';
      const inform=choice.contractAction==='smuggle-inform';
      if(!hidden&&!inform&&choice.contractAction!=='smuggle-bribe')return false;
      if(hidden&&c.suspicion>=60){
        s.islandError='SUSPEITA ELEVADA: USE O ACORDO COM A CORTE';
        return false;
      }
      c.route=hidden?'hidden':inform?'inform':'bribe';
      // The clandestine delivery is worth more than a Court bribe.
      c.bounty=c.commission?
        (hidden?c.commissionBounty:Math.round(c.commissionBounty*(inform?.45:.61))):
        (hidden?190:inform?85:115);
      if(inform&&s.alignment){
        s.alignment.corte=Math.min(100,Math.max(0,(s.alignment.corte||0)+8));
        s.alignment.culto=Math.min(100,Math.max(0,(s.alignment.culto||0)-5));
      }
      if(hidden){
        s.curse=Math.min(100,Math.max(0,(s.curse||0)+12));
        if(typeof SEA_WEATHER!=='undefined')SEA_WEATHER.announceTier(s);
      }
      c.completed=true;c.phase='complete';
      s.islandOutcome=hidden?
        'A pólvora desaparece pelas passagens da ruína.\n'+
          'Entrega clandestina concluída · prêmio conforme o contrato · +12 maldição.':
        inform?
        'Você entrega os nomes dos compradores e abre suas rotas à fiscalização.\n'+
          'A Corte paga menos, ganha influência e o Culto perde confiança em você.':
        'Os fiscais recebem sua parte e apagam o registro.\n'+
          'A Corte tolera o tráfico por hoje · prêmio reduzido.';
      s.chartWaypointId=null;
      s.islandVisits.add(target.id);s.islandChoiceIndex=0;s.islandError='';
      s.updateHUD?.();
      s.announce?.(this.status(s));
      return true;
    }
    if((c.phase==='pickup'&&!['pickup','rescue-all'].includes(choice.contractAction))||
       (c.phase==='deliver'&&choice.contractAction!=='deliver'))return false;
    if(c.phase==='pickup'){
      const all=choice.contractAction==='rescue-all';
      if(all){
        // Extra risk is required for the bonus: no phantom +80 when spawn fails.
        const pursuer=s.spawnEnemy?.('corsario',700,{forcedHostile:true});
        if(!pursuer){
          s.islandError='NÃO FOI POSSÍVEL MOBILIZAR O PERSEGUIDOR · TENTE OUTRA ROTA';
          return false;
        }
        pursuer.contractPursuer=true;
        pursuer.label?.setText?.('☠ CORSÁRIO · NÃO DEIXE NINGUÉM ESCAPAR');
        c.pursuerId=pursuer.id;
        c.bounty+=80;
        c.evacuation='all';
      }
      c.phase='deliver';
      s.islandOutcome=all?
        'Você acolhe os últimos sobreviventes e desafia os traficantes que os caçavam.\n'+
        'Um corsário segue seu rastro. Leve TODOS a Deméter por '+c.bounty+' ouro.':
        'Os náufragos feridos estão a bordo. Quem ficou aguarda outra embarcação.\n'+
        'Leve os resgatados ao Santuário de Deméter, marcado na Carta.';
      this.mark(s);
    }else{
      c.completed=true;
      c.phase='complete';
      s.islandOutcome='Os náufragos desembarcam sob a proteção do santuário.\n'+
        'Contrato cumprido: '+c.bounty+' ouro será pago ao retornar ao Porto.';
      s.chartWaypointId=null;
    }
    s.islandVisits.add(target.id);
    s.islandChoiceIndex=0;
    s.islandError='';
    s.updateHUD?.();
    s.announce?.(this.status(s));
    return true;
  }
};
