/* O Mar de Sangue — quadro de contratos e consequências persistentes v1.
 * Pure data/model: no Phaser, DOM, economy transfer or automatic payouts.
 * CONTRACTS_APPROVED must contain >=3 templates before creating any offers.
 * CT-001 is intentionally NOT authorized: it is still a laboratory draft.
 */
const SEA_CONTRACT_STATE=Object.freeze({
  version:1,
  minOffers:3,maxOffers:6,
  approvedTemplates:Object.freeze([]),
  effectIds:Object.freeze([
    'fx-ct001-demeter-abrigo',
    'fx-ct001-cacadores-tributo',
    'fx-ct001-salvo-conduto'
  ]),
  routeEffect:Object.freeze({
    'CT-001:free':'fx-ct001-demeter-abrigo',
    'CT-001:loot':'fx-ct001-cacadores-tributo',
    'CT-001:sell':'fx-ct001-salvo-conduto'
  }),
  defaults(){
    return {version:1,board:null,pendingEffects:[],settledInstances:[]};
  },
  exact(value,keys){
    return !!value&&typeof value==='object'&&!Array.isArray(value)&&
      Object.keys(value).length===keys.length&&
      Object.keys(value).every(k=>keys.includes(k));
  },
  uint(n,min=0,max=Number.MAX_SAFE_INTEGER){
    return typeof n==='number'&&Number.isSafeInteger(n)&&n>=min&&n<=max;
  },
  instanceId(id){
    return typeof id==='string'&&id.length>=6&&id.length<=95&&
      /^[A-Za-z0-9._:-]+$/.test(id);
  },
  templateId(id){
    return typeof id==='string'&&/^CT-\\d{3}$/.test(id);
  },
  validate(value){
    const keys=['version','board','pendingEffects','settledInstances'];
    if(!this.exact(value,keys)||value.version!==1)throw Error('Estrutura dos contratos inválida.');
    const p=this.defaults();
    if(value.board!==null){
      const b=value.board;
      if(!this.exact(b,['activeMission','clearedMission','seed','offers'])||
         !this.uint(b.activeMission,2)||!this.uint(b.clearedMission,1)||
         b.clearedMission!==b.activeMission-1||
         !this.uint(b.seed,0,4294967295)||
         !Array.isArray(b.offers)||b.offers.length<3||b.offers.length>6)
        throw Error('Quadro de contratos inválido.');
      const ids=new Set(),templates=new Set();
      for(const entry of b.offers){
        if(!this.exact(entry,['id','templateId','mission','seed','status'])||
           !this.instanceId(entry.id)||!this.templateId(entry.templateId)||
           !this.uint(entry.mission,2)||entry.mission!==b.activeMission||
           !this.uint(entry.seed,0,4294967295)||
           !['offered','accepted','done','failed'].includes(entry.status)||
           ids.has(entry.id)||templates.has(entry.templateId))
          throw Error('Oferta de contrato inválida ou repetida.');
        ids.add(entry.id);templates.add(entry.templateId);
      }
      p.board={activeMission:b.activeMission,clearedMission:b.clearedMission,
        seed:b.seed,offers:b.offers.map(x=>({...x}))};
    }
    if(!Array.isArray(value.pendingEffects)||value.pendingEffects.length>12||
       !Array.isArray(value.settledInstances)||value.settledInstances.length>48)
      throw Error('Histórico dos contratos excede o limite.');
    const seen=new Set();
    for(const x of value.pendingEffects){
      if(!this.exact(x,['id','instanceId','expiresOnSortie'])||
         !this.effectIds.includes(x.id)||!this.instanceId(x.instanceId)||
         !this.uint(x.expiresOnSortie,1)||seen.has(x.id))
        throw Error('Efeito contratual inválido.');
      seen.add(x.id);
      p.pendingEffects.push({...x});
    }
    const history=new Set();
    for(const id of value.settledInstances){
      if(!this.instanceId(id)||history.has(id))
        throw Error('Liquidação contratual repetida ou inválida.');
      history.add(id);p.settledInstances.push(id);
    }
    return p;
  },
  normalize(raw){
    try{return this.validate(raw)}catch(_){return this.defaults()}
  },
  seed(){
    // One seed for an entire board; persisted immediately at settlement.
    if(typeof crypto!=='undefined'&&typeof crypto.getRandomValues==='function'){
      const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]>>>0;
    }
    return Math.floor(Math.random()*4294967296)>>>0;
  },
  rng(seed){
    let x=(seed>>>0)||0x9e3779b9;
    return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
  },
  generate(activeMission,templates=this.approvedTemplates,seed=this.seed()){
    // Fail closed: never invent duplicates to fill a 3–6 contract board.
    if(!this.uint(activeMission,2)||!this.uint(seed,0,4294967295)||
       !Array.isArray(templates))return null;
    const unique=[...new Set(templates.filter(x=>this.templateId(x)))].sort();
    if(unique.length<this.minOffers)return null;
    const rand=this.rng(seed),pool=[...unique];
    for(let i=pool.length-1;i>0;i--){
      const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];
    }
    const count=Math.min(pool.length,this.minOffers+Math.floor(rand()*4));
    const offers=pool.slice(0,count).map((templateId,i)=>({
      id:templateId+':M'+activeMission+':'+seed.toString(16)+':'+i,
      templateId,mission:activeMission,seed:Math.floor(rand()*4294967296)>>>0,
      status:'offered'
    }));
    return {activeMission,clearedMission:activeMission-1,seed,offers};
  },
  grant(progress,instanceId,templateId,route,nextSortie){
    const effectId=this.routeEffect[templateId+':'+route];
    if(!effectId||!this.instanceId(instanceId)||!this.uint(nextSortie,1))return false;
    progress.pendingEffects=progress.pendingEffects.filter(x=>x.id!==effectId);
    progress.pendingEffects.push({id:effectId,instanceId,expiresOnSortie:nextSortie});
    progress.pendingEffects=progress.pendingEffects.slice(-12);
    return true;
  },
  hasSettled(profile,instanceId){
    if(!this.instanceId(instanceId))return false;
    return this.normalize(profile?.contractProgress).settledInstances.includes(instanceId);
  },
  canSettle(profile,contract){
    if(!contract||!this.instanceId(contract.instanceId))return false;
    const progress=this.normalize(profile?.contractProgress);
    const offer=progress.board?.offers.find(x=>x.id===contract.instanceId);
    return !!offer&&offer.templateId===contract.templateId&&
      offer.status==='accepted'&&!progress.settledInstances.includes(contract.instanceId)&&
      this.approvedTemplates.includes(offer.templateId);
  },
  afterSortie(profile,opts,previousMission){
    const state=this.normalize(profile.contractProgress);
    // Expire the used/unused one-sortie effects, then grant new effects.
    state.pendingEffects=state.pendingEffects.filter(e=>e.expiresOnSortie>profile.sorties);
    const contract=opts.contractInstance;
    if(opts.won&&contract&&this.canSettle({...profile,contractProgress:state},contract)){
      const offer=state.board.offers.find(x=>x.id===contract.instanceId);
      offer.status='done';
      state.settledInstances.push(contract.instanceId);
      state.settledInstances=state.settledInstances.slice(-48);
      this.grant(state,contract.instanceId,contract.templateId,contract.route,profile.sorties+1);
    }
    if(opts.mode==='mission'&&opts.won&&profile.mission>previousMission){
      // A board belongs to the NEW active mission. With <3 approved templates
      // it stays null, without showing fake or repeated contracts.
      state.board=this.generate(profile.mission);
    }
    profile.contractProgress=state;
    return state;
  },
  accept(profile,instanceId){
    const state=this.normalize(profile.contractProgress);
    if(state.board?.activeMission!==profile.mission)return false;
    const offer=state.board.offers.find(x=>x.id===instanceId&&x.status==='offered');
    if(!offer||!this.approvedTemplates.includes(offer.templateId))return false;
    if(state.board.offers.some(x=>x.status==='accepted'))return false;
    offer.status='accepted';profile.contractProgress=state;
    return true;
  }
});
