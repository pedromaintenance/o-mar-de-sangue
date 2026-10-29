/* 3.6c — explicitly versioned save transfer, no automatic migration.
 * Loading/importing is read-only. apply() writes only after keeping a rollback
 * snapshot in localStorage; importing third-party arbitrary data is forbidden.
 */
const SEA_SAVE_TRANSFER = {
  saveKey:'carcaca.mar-de-sangue.v4',
  rollbackKey:'carcaca.mar-de-sangue.restore-rollback.v1',
  maxSize:256*1024,
  format:'mar-de-sangue-captain-backup',
  profileFields:['version','gold','levels','sorties','wins','losses','kills',
    'rammings','earned','best','mission','bestMission','bestWave','mode'],
  numberFields:['gold','sorties','wins','losses','kills','rammings',
    'earned','best','mission','bestMission','bestWave'],
  sameKeys(value,fields) {
    return value && typeof value==='object'&&!Array.isArray(value)
      && Object.keys(value).length===fields.length
      && Object.keys(value).every(key=>fields.includes(key));
  },
  profile(value) {
    // Accept canonical pre-alignment backups and newer v4 files with the
    // optional three-field alignment object. Never accept arbitrary extras.
    const withAlignment=[...this.profileFields,'alignment'];
    const withFaction=[...withAlignment,'faction'];
    if(!this.sameKeys(value,this.profileFields)&&
       !this.sameKeys(value,withAlignment)&&
       !this.sameKeys(value,withFaction))
      throw Error('O arquivo não tem os campos exatos do save v4.');
    if(value.version!==4)throw Error('Apenas saves v4 são aceitos nesta versão.');
    if(!['mission','sandbox'].includes(value.mode))
      throw Error('Modo de jogo inválido.');
    for(const field of this.numberFields) {
      const n=value[field];
      if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0||
          (field==='mission'&&n<1))
        throw Error('Valor inválido no progresso: '+field);
    }
    const ids=SEA_UPGRADES.map(x=>x.id);
    // The 15th upgrade is optional ONLY for backups created before 3.8b.
    // Unknown extra keys and absent older fields are still rejected.
    const oldIds=ids.filter(id=>id!=='impulso');
    if(!this.sameKeys(value.levels,ids) &&
       !this.sameKeys(value.levels,oldIds))
      throw Error('A lista de melhorias não corresponde ao save v4.');
    const levels={};
    for(const id of ids) {
      const level=id==='impulso' && !Object.hasOwn(value.levels,id)
        ? 0 : value.levels[id];
      if(typeof level!=='number'||!Number.isSafeInteger(level)||
          level<0||level>999999)
        throw Error('Nível inválido: '+id);
      levels[id]=level;
    }
    if(Object.hasOwn(value,'alignment')){
      if(!this.sameKeys(value.alignment,['sobreviventes','corte','culto']))
        throw Error('Alinhamentos de facção inválidos.');
      for(const key of ['sobreviventes','corte','culto']){
        const n=value.alignment[key];
        if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0||n>100)
          throw Error('Alinhamento fora do limite: '+key);
      }
    }
    if(Object.hasOwn(value,'faction')){
      const f=value.faction;
      if(!this.sameKeys(f,['allegiance','proofs','lockUntil','history'])||
         !this.sameKeys(f.proofs,['sobreviventes','corte','culto'])||
         ![null,'sobreviventes','corte','culto'].includes(f.allegiance)||
         !Number.isSafeInteger(f.lockUntil)||f.lockUntil<0||
         !Array.isArray(f.history)||f.history.length>24)
        throw Error('Juramento de facção inválido.');
      for(const id of ['sobreviventes','corte','culto'])if(typeof f.proofs[id]!=='boolean')
        throw Error('Prova de facção inválida: '+id);
      for(const entry of f.history)if(!this.sameKeys(entry,['action','faction','sortie'])||
          !['join','leave'].includes(entry.action)||
          !['sobreviventes','corte','culto'].includes(entry.faction)||
          !Number.isSafeInteger(entry.sortie)||entry.sortie<0)
        throw Error('Histórico de facção inválido.');
    }
    const cleaned={version:4};
    for(const f of this.profileFields){
      if(f==='version')continue;
      cleaned[f]=f==='levels'?levels:value[f];
    }
    if(value.alignment)cleaned.alignment={...value.alignment};
    if(value.faction)cleaned.faction={...value.faction,proofs:{...value.faction.proofs},
      history:value.faction.history.map(e=>({...e}))};
    return cleaned;
  },
  parse(text) {
    if(typeof text!=='string'||!text.trim()||text.length>this.maxSize)
      throw Error('Arquivo vazio ou maior que 256 KB.');
    let json;
    try { json=JSON.parse(text); } catch(_) {throw Error('JSON inválido ou danificado.');}
    if(!this.sameKeys(json,['format','schema','exportedAt','profile'])||
       json.format!==this.format||json.schema!==4||
       typeof json.exportedAt!=='string'||
       !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(json.exportedAt)||
       !Number.isFinite(Date.parse(json.exportedAt)))
      throw Error('Formato de backup inválido: exige exportação v4 do Capitão.');
    return {profile:this.profile(json.profile),exportedAt:json.exportedAt};
  },
  clearRollback() {
    // A deliberate "erase progress" must also remove the undo copy.
    localStorage.removeItem(this.rollbackKey);
  },
  lastRollback() {
    try {
      const raw=localStorage.getItem(this.rollbackKey);
      if(!raw)return null;
      const snapshot=JSON.parse(raw);
      if(!snapshot||snapshot.format!=='mar-de-sangue-pre-restore'||
         snapshot.schema!==1||typeof snapshot.createdAt!=='string')return null;
      return {profile:this.profile(snapshot.previousProfile),
        exportedAt:snapshot.createdAt,source:'rollback'};
    }catch(_){return null;}
  },
  apply(candidate) {
    // Check everything before touching storage.
    const profile=this.profile(candidate);
    const payload=JSON.stringify(profile);
    const previous=localStorage.getItem(this.saveKey);
    const priorSnapshot=localStorage.getItem(this.rollbackKey);
    // Preserve the currently visible progress even for a player still using
    // an old v3 save. The old raw v4 string is kept for exact recovery.
    const current=SeaProfile.load();
    // The game may read older saves with extra legacy metadata. Keep only
    // canonical v4 fields in the rollback, while retaining exact raw v4 bytes.
    const previousFields=[...this.profileFields,
      ...(current.alignment?['alignment']:[]),
      ...(current.faction?['faction']:[])];
    const previousProfile=this.profile(Object.fromEntries(
      previousFields.map(field=>[field,current[field]])));
    const snapshot=JSON.stringify({
      format:'mar-de-sangue-pre-restore',schema:1,
      createdAt:new Date().toISOString(),previousProfile,previousRawV4:previous
    });
    // A full storage device must abort BEFORE replacing the save.
    localStorage.setItem(this.rollbackKey,snapshot);
    try {
      localStorage.setItem(this.saveKey,payload);
      if(localStorage.getItem(this.saveKey)!==payload)
        throw Error('O navegador não confirmou a gravação do save.');
    } catch(err) {
      try{
        if(previous===null)localStorage.removeItem(this.saveKey);
        else localStorage.setItem(this.saveKey,previous);
        if(priorSnapshot===null)localStorage.removeItem(this.rollbackKey);
        else localStorage.setItem(this.rollbackKey,priorSnapshot);
      }catch(_){/* Last known snapshot is retained whenever possible. */}
      throw Error('Falha ao salvar. O progresso anterior foi preservado quando possível.');
    }
    return profile;
  }
};
