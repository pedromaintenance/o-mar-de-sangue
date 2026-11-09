/* O Mar de Sangue — efeitos da PRÓXIMA expedição (v1).
 * No save writes on scene entry, update, combat or lab.
 * Effects are stored by SeaContractState only for approved paid contracts.
 */
const SEA_CONTRACT_EFFECTS=Object.freeze({
  descriptions:Object.freeze({
    'fx-ct001-demeter-abrigo':'ABRIGO DE DEMÉTER · +15% do casco, uma vez, após sair de combate',
    'fx-ct001-cacadores-tributo':'COBRADORES DO DÍZIMO · um encontro hostil extra',
    'fx-ct001-salvo-conduto':'SALVO-CONDUTO · uma patrulha comum da Corte fica neutra'
  }),
  routeEffect:Object.freeze({
    free:'fx-ct001-demeter-abrigo',
    loot:'fx-ct001-cacadores-tributo',
    sell:'fx-ct001-salvo-conduto'
  }),
  describeRoute(route){
    const id=this.routeEffect[route];
    return id?this.descriptions[id]:null;
  },
  enter(s){
    s.contractEffects=[];
    // The lab deliberately does not consume or apply persistent campaign effects.
    if(!s?.profile||s.contractId==='ct001'||s.contract?.lab)return [];
    const progress=SEA_CONTRACT_STATE.normalize(s.profile.contractProgress);
    const next=(Number(s.profile.sorties)||0)+1;
    s.contractEffects=progress.pendingEffects
      .filter(x=>x.expiresOnSortie===next)
      .map(x=>({id:x.id,fromInstanceId:x.instanceId,used:false}));
    return s.contractEffects;
  },
  pending(s,id){
    return (s?.contractEffects||[]).find(x=>x.id===id&&!x.used)||null;
  },
  onSpawn(s,e,options={}){
    const permit=this.pending(s,'fx-ct001-salvo-conduto');
    if(!permit||e?.dead||e?.type!=='patrulha'||e?.neutral||
       options.forcedHostile||options.huntTarget||
       e.ct001Escort||e.ct001Ambush||e.smugglingInspector)return false;
    // No override of scripted hostility or of a patrol already neutral
    // because of the player's sworn allegiance.
    permit.used=true;
    e.neutral=true;
    e.contractPassage=true;
    e.label?.setText?.('✥ SALVO-CONDUTO · PATRULHA NEUTRA');
    e.label?.setColor?.('#b7e3bf');
    s.announce?.('O SALVO-CONDUTO FOI RECONHECIDO POR UMA PATRULHA');
    return true;
  },
  update(s,dt){
    if(!s||s.ended||s.sinking)return false;
    const blessing=this.pending(s,'fx-ct001-demeter-abrigo');
    if(blessing&&s.elapsed>=8&&s.lastDamageTime>=0&&
       (s.time?.now??0)-s.lastDamageTime>=5500&&
       s.shipHP>0&&s.shipHP<s.maxShipHP){
      const danger=(s.enemies||[]).some(e=>!e.dead&&!e.neutral&&
        Math.hypot(e.x-s.player.x,e.y-s.player.y)<550);
      if(!danger){
        s.shipHP=Math.min(s.maxShipHP,
          s.shipHP+Math.max(1,Math.round(s.maxShipHP*.15)));
        blessing.used=true;
        s.announce?.('DEMÉTER · O CASCO SE REGENERA APÓS O COMBATE');
        s.updateHUD?.();
      }
    }
    const hunters=this.pending(s,'fx-ct001-cacadores-tributo');
    if(hunters&&s.elapsed>=15){
      const e=s.spawnEnemy?.('corsario',650,{forcedHostile:true});
      if(e){
        hunters.used=true;e.contractHunter=true;
        e.label?.setText?.('☠ COBRADORES DOS TRIBUTOS');
        s.announce?.('OS COBRADORES DA CORTE ENCONTRARAM SUA NAU');
      }
    }
    return true;
  },
  report(s){
    return (s?.contractEffects||[]).map(x=>({
      id:x.id,description:this.descriptions[x.id]||x.id,used:!!x.used
    }));
  }
});
