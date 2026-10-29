/* O MAR DE SANGUE — Conselho das Três Bandeiras.
 * Alignment is influence; allegiance is an explicit, exclusive oath.
 * A completed faction trial is a permanent proof, not a temporary reward.
 */
const SEA_FACTIONS = {
  threshold:40,
  ids:['sobreviventes','corte','culto'],
  definitions:{
    sobreviventes:{
      name:'OS SOBREVIVENTES',label:'Sobreviventes',color:'#a7c6a4',sigil:'❦',
      subtitle:'Resistência, abrigo e solidariedade',
      trial:'Resgate dos Afogados concluído, ou acolhimento dos refugiados',
      promise:'O capitão assume a proteção das comunidades perseguidas.',
      ship:'player-ship-survivors',
      atlas:'assets/player/sobreviventes/mar_de_sangue_navio_sobreviventes_20_evolucoes.png',
      preview:'assets/player/sobreviventes/evolucoes/navio_sobreviventes_nivel_',
      rival:'corte'
    },
    corte:{
      name:'A CORTE FEÉRICA',label:'Corte Feérica',color:'#d39eaf',sigil:'✥',
      subtitle:'Diplomacia, comércio e domínio',
      trial:'Vender nomes à Corte, ou denunciar o comboio clandestino',
      promise:'O capitão reconhece a autoridade da Corte e aceita seus encargos.',
      ship:'player-ship-court',
      atlas:'assets/player/corte_feerica/mar_de_sangue_navio_corte_feerica_20_evolucoes.png',
      preview:'assets/player/corte_feerica/evolucoes/navio_corte_feerica_nivel_',
      rival:'sobreviventes'
    },
    culto:{
      name:'O CULTO DE DAGON',label:'Culto de Dagon',color:'#c5879b',sigil:'⛧',
      subtitle:'Devoção, sacrifício e transformação',
      trial:'Realizar o grande sacrifício, ou aceitar o Pacto das Marés',
      promise:'O capitão entrega sua bandeira às marés e aceita a marca abissal.',
      ship:'player-ship-dagon',
      atlas:'assets/player/culto_dagon/mar_de_sangue_navio_culto_dagon_20_evolucoes.png',
      preview:'assets/player/culto_dagon/evolucoes/navio_culto_dagon_nivel_',
      rival:'sobreviventes'
    }
  },
  initial(){
    return {allegiance:null,proofs:{sobreviventes:false,corte:false,culto:false},
      lockUntil:0,history:[]};
  },
  normalize(f){
    const d=this.initial();
    if(!f || typeof f!=='object')return d;
    d.allegiance=this.ids.includes(f.allegiance)?f.allegiance:null;
    for(const id of this.ids)d.proofs[id]=f.proofs?.[id]===true;
    d.lockUntil=Number.isSafeInteger(f.lockUntil)&&f.lockUntil>=0?f.lockUntil:0;
    if(Array.isArray(f.history))d.history=f.history.filter(x=>x&&
      ['join','leave'].includes(x.action)&&this.ids.includes(x.faction)&&
      Number.isSafeInteger(x.sortie)&&x.sortie>=0).slice(-24)
      .map(x=>({action:x.action,faction:x.faction,sortie:x.sortie}));
    return d;
  },
  faction(s){return this.ids.includes(s?.faction?.allegiance)?s.faction.allegiance:null;},
  texture(profile){return this.definitions[this.faction(profile)]?.ship||'player-ship-stages';},
  preview(faction,stage){
    const def=this.definitions[faction];if(!def)return '';
    const n=Math.max(1,Math.min(20,Math.floor(stage||1)));
    return def.preview+String(n).padStart(2,'0')+'.png';
  },
  status(p,id){
    if(!this.ids.includes(id))return {ok:false,reason:'Facção desconhecida'};
    const faction=this.normalize(p.faction),score=Number(p.alignment?.[id])||0;
    if(faction.allegiance===id)return {ok:false,reason:'Você já jurou esta bandeira.',active:true};
    if(faction.allegiance)return {ok:false,reason:'Renuncie primeiro à bandeira atual.'};
    if((p.sorties||0)<faction.lockUntil)return {ok:false,
      reason:'A deserção exige uma viagem independente.'};
    if(score<this.threshold)return {ok:false,reason:'A confiança ainda não alcançou 40 pontos.'};
    if(!faction.proofs[id])return {ok:false,reason:'Sua provação ainda não foi reconhecida.'};
    return {ok:true,reason:'Juramento disponível.'};
  },
  join(p,id){
    const ready=this.status(p,id);
    if(!ready.ok)return ready;
    const f=this.normalize(p.faction);
    f.allegiance=id;
    f.history.push({action:'join',faction:id,sortie:p.sorties||0});
    f.history=f.history.slice(-24);
    p.faction=f;return {ok:true,faction:id};
  },
  leave(p){
    const f=this.normalize(p.faction),old=f.allegiance;
    if(!old)return {ok:false,reason:'O capitão já navega sem bandeira.'};
    f.allegiance=null;
    f.lockUntil=Math.max(f.lockUntil,(p.sorties||0)+1);
    f.history.push({action:'leave',faction:old,sortie:p.sorties||0});
    f.history=f.history.slice(-24);
    p.alignment[old]=Math.max(0,(Number(p.alignment[old])||0)-20);
    p.faction=f;
    return {ok:true,faction:old,lockUntil:f.lockUntil};
  },
  // Proof comes from a definite deed, not merely reaching a numerical score.
  proofFromChoice(choice){
    switch(choice?.id){
      case 'parley_1':case 'refugees_1':case 'refugees_4':
      case 'ritual_1':return 'sobreviventes';
      case 'parley_2':case 'refugees_2':case 'convoy_2':return 'corte';
      case 'daegon_3':case 'ritual_3':return 'culto';
      default:return null;
    }
  },
  recordChoice(s,choice){
    const id=this.proofFromChoice(choice);
    if(!id)return false;
    const f=this.normalize(s.faction);
    const first=!f.proofs[id];f.proofs[id]=true;s.faction=f;
    return first;
  },
  recordContract(s,contract){
    if(contract?.id!=='rescue'||!contract.completed)return false;
    const f=this.normalize(s.faction);const first=!f.proofs.sobreviventes;
    f.proofs.sobreviventes=true;s.faction=f;return first;
  }
};
