/* O Mar de Sangue — CT-001 v0.6: bancada de QA, SEM progresso.
 * Somente o Sandbox com ?contractLab=ct001 usa esses parâmetros.
 * Bandeira, equipamento e missão selecionados são cópias de cena;
 * nunca gravar configurações simuladas em SeaProfile.
 */
const SEA_CT001_LAB=Object.freeze({
  version:'0.6',
  seedDefault:20261110,
  scenarios:Object.freeze([2,10,25]),
  presets:Object.freeze({
    2:Object.freeze({casco:1,blindagem:0,velas:1,leme:1,impulso:0,
      canhoes:1,cadencia:1,bateria:0,alcance:0,esporao:0,reforco:0,
      oficina:0,ima:0,cofre:0,cartas:0}),
    10:Object.freeze({casco:5,blindagem:3,velas:4,leme:3,impulso:3,
      canhoes:4,cadencia:4,bateria:3,alcance:3,esporao:2,reforco:3,
      oficina:2,ima:0,cofre:0,cartas:3}),
    25:Object.freeze({casco:12,blindagem:10,velas:10,leme:9,impulso:9,
      canhoes:11,cadencia:10,bateria:9,alcance:9,esporao:6,reforco:9,
      oficina:6,ima:0,cofre:0,cartas:8})
  }),
  config(query,actualStage){
    const params=typeof query==='string'?
      new URLSearchParams(query.replace(/^\?/,'')):query;
    const rawStage=params?.get?.('ct001Stage')||'';
    const benchmark=this.scenarios.some(x=>String(x)===rawStage);
    const stage=benchmark?Number(rawStage):
      Math.max(2,Math.floor(Number(actualStage)||2));
    const rawSeed=params?.get?.('ct001Seed')||'';
    const validSeed=/^(0|[1-9]\d{0,9})$/.test(rawSeed)&&
      Number(rawSeed)<=4294967295;
    const seed=validSeed?Number(rawSeed):this.seedDefault;
    return {stage,benchmark,seed,actualStage:Math.max(1,
      Math.floor(Number(actualStage)||1))};
  },
  sceneProfile(real,config){
    if(!config?.benchmark)return real;
    const levels=this.presets[config.stage];
    if(!levels)return real;
    // Cópia, jamais gravação no save; facção neutra comparável.
    const neutral=typeof SEA_FACTIONS!=='undefined'?
      SEA_FACTIONS.initial():{allegiance:null,proofs:{
        sobreviventes:false,corte:false,culto:false},lockUntil:0,history:[]};
    return {...real,mission:config.stage,levels:{...levels},
      alignment:{sobreviventes:0,corte:0,culto:0},faction:neutral};
  },
  rng(seed){
    let state=(seed>>>0)||0x9e3779b9;
    return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
      return (state>>>0)/4294967296;};
  }
});
