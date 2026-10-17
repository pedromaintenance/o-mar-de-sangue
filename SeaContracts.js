/* O Mar de Sangue — 3.7a: primeiro contrato jogável da Costa Sul.
 * Resgate com dois portos físicos, risco em combate e pagamento no retorno.
 * Estado somente na cena: não modifica SeaProfile nem o esquema do save v4.
 */
const SEA_CONTRACTS = {
  offers:Object.freeze({
    rescue:Object.freeze({title:'RESGATE DOS AFOGADOS',bounty:125,
      description:'Recolha sobreviventes de um naufrágio e conduza-os a um santuário de Deméter. Fuja dos navios hostis: o contrato só paga após a entrega.'})
  }),
  init(s,id) {
    s.contract=null;
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
    const id=c.phase==='pickup'?c.pickupId:c.shelterId;
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
    return c.completed?'RESGATE CONCLUÍDO · RETORNE AO PORTO':
      c.phase==='pickup'?'RESGATE · LOCALIZE OS NÁUFRAGOS NA CARTA':
      'RESGATE · ENTREGUE OS NÁUFRAGOS A DEMÉTER';
  },
  options(s,island) {
    const c=s.contract,target=this.target(s);
    if(!c||!target||!island||island.id!==target.id)return null;
    return c.phase==='pickup'?
      [{id:'rescue-pickup',contractAction:'pickup',name:'RECOLHER OS NÁUFRAGOS',
        hint:'Embarcar sobreviventes · depois buscar o santuário'}]:
      [{id:'rescue-deliver',contractAction:'deliver',name:'DESEMBARCAR SOBREVIVENTES',
        hint:'Concluir o resgate · contrato de 125 ouro'}];
  },
  apply(s,choice) {
    const c=s.contract,target=this.target(s);
    if(!c||!choice||!target||s.islandSelected?.id!==target.id||
       (c.phase==='pickup'&&s.islandVisits?.has(target.id))||c.completed)return false;
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
