/* MAR DE SANGUE V101 — efeitos políticos por bandeira.
 * Bônus multiplicativos são aplicados uma única vez; não se acumulam com
 * viagens nem alteram os 15 níveis do estaleiro.
 */
const SEA_FACTION_POLITICS={
  commissions:Object.freeze({
    'faction-rescue':Object.freeze({faction:'sobreviventes',base:'rescue',
      title:'CORREDOR DE DEMÉTER',desc:'Escolte novos sobreviventes até o santuário. A comunidade sustenta quem retorna.'}),
    'faction-hunt':Object.freeze({faction:'corte',base:'hunt',
      title:'MANDADO CONTRA UM DESERTOR',desc:'A Corte exige a captura de uma fragata rebelde antes de sua fuga.'}),
    'faction-smuggle':Object.freeze({faction:'culto',base:'smuggle',
      title:'PÓLVORA PARA O ABISMO',desc:'Leve pólvora ritual às ruínas, evitando a fiscalização feérica.'})
  }),
  allegiance(s){return typeof SEA_FACTIONS!=='undefined'?SEA_FACTIONS.faction(s?.faction?s:(s?.profile||s)):null;},
  commission(id,profile){
    const c=this.commissions[id];
    return c&&this.allegiance(profile)===c.faction?c:null;
  },
  bounty(p,id){
    const c=this.commission(id,p);
    if(!c||typeof SEA_CONTRACTS==='undefined')return 0;
    const base=SEA_CONTRACTS.offers[c.base].bounty;
    const sorties=Math.max(0,Number(p.sorties)||0);
    return Math.round(base*(1.55+Math.min(3,Math.sqrt(sorties)*.15)));
  },
  // Cosmetic identity has NO bearing on upgrade progression or hitbox.
  shipStats(s){
    if(this.allegiance(s)==='culto')
      s.shipStats.cannonDamage*=1.07;
  },
  treasure(s,raw){
    const amount=Math.max(0,Math.floor(Number(raw)||0));
    return this.allegiance(s)==='corte'?Math.floor(amount*1.10):amount;
  },
  healing(s,base){
    const amount=Math.max(0,Number(base)||0);
    return this.allegiance(s)==='sobreviventes'?amount*1.10:amount;
  },
  curseAdded(s,points){
    const value=Math.max(0,Number(points)||0);
    return this.allegiance(s)==='culto'?Math.round(value*1.10):value;
  },
  // The Court recognizes sworn captains. A scripted hostile inspector or
  // an explicit political pursuer MUST still attack (and can be provoked).
  isNeutral(s,type,options={}){
    return this.allegiance(s)==='corte' && type==='patrulha' &&
      !options.forcedHostile && !options.huntTarget;
  },
  markEnemy(s,e,options={}){
    if(!this.isNeutral(s,e.type,options))return false;
    e.neutral=true;
    e.label?.setText('✥ PATRULHA DA CORTE · ALIADA')
      ?.setColor?.('#b7e3bf');
    return true;
  },
  provoke(e){
    if(!e?.neutral)return false;
    e.neutral=false;e.provoked=true;
    e.label?.setText?.('PATRULHA DA CORTE · TRAÍDA')?.setColor?.('#f4a4a5');
    return true;
  },
  neutralSail(s,e,dt){
    if(!e.neutral||e.dead)return false;
    e.chargeMs=0;e.chargeStage=0;
    e.heading+=Math.sin((s.elapsed||0)*.5+(e.visualPhase||0))*.25*dt;
    e.vx+=Math.sin(e.heading)*45*dt;
    e.vy-=Math.cos(e.heading)*45*dt;
    if(typeof SEA_WEATHER!=='undefined')SEA_WEATHER.enemyCurrent(s,e,dt);
    const drag=Math.exp(-1.5*dt);
    e.vx*=drag;e.vy*=drag;
    const cap=Math.max(30,e.speed*.45);
    const speed=Math.hypot(e.vx,e.vy);
    if(speed>cap){e.vx*=cap/speed;e.vy*=cap/speed;}
    e.x+=e.vx*dt;e.y+=e.vy*dt;
    s.collideWorldBounds(e);
    for(const island of s.islands||[]){
      s.collideRock(e,island,false);
      if(e.dead)break;
    }
    return true;
  },
  // During the NEXT voyage after renouncing, one messenger fleet pursues
  // the deserter. Does not replace boss waves or contract objectives.
  desertion(s){
    const f=s.faction;
    if(!f||f.allegiance||!f.lockUntil||s.profile.sorties>=f.lockUntil||
       (s.elapsed||0)<15||s.deserterPursuitSent)return false;
    const last=[...(f.history||[])].reverse().find(h=>h.action==='leave');
    if(!last)return false;
    const type=last.faction==='culto'?'corsario':'patrulha';
    const e=s.spawnEnemy(type,670,{forcedHostile:true});
    if(!e)return false;
    s.deserterPursuitSent=true;
    e.deserterHunter=true;
    e.label?.setText?.('⚑ COBRADOR DO JURAMENTO');
    s.announce?.('SUA ANTIGA BANDEIRA EXIGE REPARAÇÃO · PERSEGUIÇÃO À VISTA');
    return true;
  },
  bonusAtSettlement(s){
    const c=s.contract;
    if(!c?.commission||!c.completed)return false;
    s.alignment[c.commission]=Math.min(100,
      (Number(s.alignment[c.commission])||0)+8);
    return true;
  }
};
