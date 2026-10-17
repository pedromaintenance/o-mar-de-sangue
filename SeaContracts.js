/* O Mar de Sangue — 3.7a: primeiro contrato jogável da Costa Sul.
 * Resgate com dois portos físicos, risco em combate e pagamento no retorno.
 * Estado somente na cena: não modifica SeaProfile nem o esquema do save v4.
 */
const SEA_CONTRACTS = {
  offers:Object.freeze({
    rescue:Object.freeze({title:'RESGATE DOS AFOGADOS',bounty:125,
      description:'Recolha sobreviventes de um naufrágio e conduza-os a um santuário de Deméter. Fuja dos navios hostis: o contrato só paga após a entrega.'}),
    smuggle:Object.freeze({title:'PÓLVORA SEM BANDEIRA',bounty:190,
      description:'Leve pólvora clandestina a uma ruína da Costa Sul. A fiscalização da Corte pode confiscar a carga. Navegue discretamente ou suborne os agentes no destino.'})
  }),
  init(s,id) {
    s.contract=null;
    if(id==='smuggle'){
      const center={x:s.W/2,y:s.H/2};
      // Reuse known physical ruins, never generate a new unreachable site.
      const distance=i=>Math.hypot(i.x-center.x,i.y-center.y);
      const ruins=s.islands.filter(i=>i.kind==='ruin'&&distance(i)>800)
        .sort((a,b)=>distance(a)-distance(b)||a.id-b.id);
      if(!ruins.length)return false;
      s.contract={id:'smuggle',destinationId:ruins[0].id,phase:'deliver',
        completed:false,intercepted:false,inspectorSpawned:false,
        suspicion:0,route:null,bounty:this.offers.smuggle.bounty};
      this.mark(s);
      return true;
    }
    if(id!=='rescue')return false;
    const center={x:s.W/2,y:s.H/2};
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const wrecks=s.islands.filter(i=>i.kind==='wreck');
    const shelters=s.islands.filter(i=>i.kind==='demeter');
    if(!wrecks.length||!shelters.length)return false;
    // Deterministic, obtainable locations in the existing fixed map.
    const pickup=[...wrecks].sort((a,b)=>dist(a,center)-dist(b,center)||a.id-b.id)[0];
    const shelter=[...shelters].sort((a,b)=>dist(a,pickup)-dist(b,pickup)||a.id-b.id)[0];
    s.contract={id:'rescue',pickupId:pickup.id,shelterId:shelter.id,
      phase:'pickup',completed:false,bounty:this.offers.rescue.bounty};
    this.mark(s);
    return true;
  },
  target(s) {
    const c=s.contract;
    if(!c||c.completed)return null;
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
    if(c.id==='smuggle'){
      if(c.intercepted)return 'CARGA APREENDIDA PELA CORTE';
      if(c.completed)return 'CONTRABANDO ENTREGUE · RETORNE AO PORTO';
      return 'CONTRABANDO · SUSPEITA '+Math.round(c.suspicion)+'% · ENTREGA ÀS RUÍNAS';
    }
    return c.completed?'RESGATE CONCLUÍDO · RETORNE AO PORTO':
      c.phase==='pickup'?'RESGATE · LOCALIZE OS NÁUFRAGOS NA CARTA':
      'RESGATE · ENTREGUE OS NÁUFRAGOS A DEMÉTER';
  },
  options(s,island) {
    const c=s.contract,target=this.target(s);
    if(!c||!target||!island||island.id!==target.id)return null;
    if(c.id==='smuggle')return [
      {id:'smuggle-hidden',contractAction:'smuggle-hidden',
        name:'ENTREGAR SEM SER VISTO',
        hint:'Suspeita abaixo de 60% · 190 ouro · +12 maldição'},
      {id:'smuggle-bribe',contractAction:'smuggle-bribe',
        name:'COMPRAR O SILÊNCIO DA CORTE',
        hint:'Acordo corrupto · prêmio reduzido a 115 ouro'}
    ];
    return c.phase==='pickup'?
      [{id:'rescue-pickup',contractAction:'pickup',name:'RECOLHER OS NÁUFRAGOS',
        hint:'Embarcar sobreviventes · depois buscar o santuário'}]:
      [{id:'rescue-deliver',contractAction:'deliver',name:'DESEMBARCAR SOBREVIVENTES',
        hint:'Concluir o resgate · contrato de 125 ouro'}];
  },
  update(s,dt) {
    const c=s.contract;
    if(!c||c.id!=='smuggle'||c.completed||c.intercepted||s.ended||s.sinking)
      return;
    const delta=Math.max(0,Math.min(Number(dt)||0,.1));
    if(s.elapsed<6||!s.player||!delta)return;
    if(!c.inspectorSpawned){
      c.inspectorSpawned=true;
      const inspector=s.spawnEnemy?.('patrulha',330)||
        s.enemies?.find(e=>!e.dead&&e.type==='patrulha');
      if(inspector){
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
  apply(s,choice) {
    const c=s.contract,target=this.target(s);
    if(!c||!choice||!target||s.islandSelected?.id!==target.id||
       (c.phase==='pickup'&&s.islandVisits?.has(target.id))||c.completed||
       c.intercepted)return false;
    if(c.id==='smuggle'){
      // A visited ruin can still receive cargo; c.completed prevents replay.
      const hidden=choice.contractAction==='smuggle-hidden';
      if(!hidden&&choice.contractAction!=='smuggle-bribe')return false;
      if(hidden&&c.suspicion>=60){
        s.islandError='SUSPEITA ELEVADA: USE O ACORDO COM A CORTE';
        return false;
      }
      c.route=hidden?'hidden':'bribe';
      c.bounty=hidden?190:115;
      if(hidden){
        s.curse=Math.min(100,Math.max(0,(s.curse||0)+12));
        if(typeof SEA_WEATHER!=='undefined')SEA_WEATHER.announceTier(s);
      }
      c.completed=true;c.phase='complete';
      s.islandOutcome=hidden?
        'A pólvora desaparece pelas passagens da ruína.\n'+
          'Entrega clandestina concluída · 190 ouro · +12 maldição.':
        'Os fiscais recebem sua parte e apagam o registro.\n'+
          'A Corte tolera o tráfico por hoje · 115 ouro.';
      s.chartWaypointId=null;
      s.islandVisits.add(target.id);s.islandChoiceIndex=0;s.islandError='';
      s.updateHUD?.();
      s.announce?.(this.status(s));
      return true;
    }
    if((c.phase==='pickup'&&choice.contractAction!=='pickup')||
       (c.phase==='deliver'&&choice.contractAction!=='deliver'))return false;
    if(c.phase==='pickup'){
      c.phase='deliver';
      s.islandOutcome='Os náufragos estão a bordo. Seus perseguidores continuam no mar.\n'+
        'Leve-os ao Santuário de Deméter, agora marcado na Carta.';
      this.mark(s);
    }else{
      c.completed=true;
      c.phase='complete';
      s.islandOutcome='Os náufragos desembarcam sob a proteção do santuário.\n'+
        'Contrato cumprido: 125 ouro será pago ao retornar ao Porto.';
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
