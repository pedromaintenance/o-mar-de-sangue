/* O Mar de Sangue — análise local de playtests CT-001.
 * Não faz chamadas de rede, não acessa save e não inventa resultados.
 * Aceita somente o JSON exportado pelo laboratório (schema 1 ou 2).
 */
const SEA_CT001_ANALYTICS=Object.freeze({
  routes:Object.freeze({free:'ABRIR PORÕES',loot:'TOMAR COFRE',
    sell:'VENDER MANIFESTO',unknown:'SEM DECISÃO'}),
  safeNumber(value){
    return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
  },
  validate(obj){
    if(!obj||typeof obj!=='object'||Array.isArray(obj)||
       obj.format!=='mar-de-sangue-ct001-playtest'||![1,2].includes(obj.schema)||
       obj.contractId!=='CT-001'||!obj.result||typeof obj.result!=='object')
      throw Error('O arquivo não é um playtest CT-001 válido.');
    const stage=this.safeNumber(obj.stage);
    if(stage===null||!Number.isSafeInteger(stage)||stage<2||stage>1000)
      throw Error('Missão do teste fora do intervalo permitido.');
    const r=obj.result,route=obj.route;
    if(route!==null&&route!==undefined&&!['free','loot','sell'].includes(route))
      throw Error('Escolha do capitão inválida.');
    for(const key of ['won','withdrawn','completed']){
      if(typeof r[key]!=='boolean')throw Error('Resultado inválido: '+key);
    }
    const numberKeys=['kills','rammings','collectedGold','contractBounty','simulatedReward'];
    for(const key of numberKeys)if(this.safeNumber(r[key])===null)
      throw Error('Métrica inválida: '+key);
    const seconds=obj.schema===2?this.safeNumber(r.elapsedSeconds):null;
    if(obj.schema===2&&(seconds===null||seconds>86400))
      throw Error('Tempo do teste v2 inválido.');
    const seed=obj.schema===2?this.safeNumber(obj.seed):null;
    if(obj.schema===2&&(seed===null||!Number.isSafeInteger(seed)||seed>4294967295))
      throw Error('Semente do teste v2 inválida.');
    const date=String(obj.generatedAt||'');
    if(date.length>40||!/^\d{4}-\d\d-\d\dT/.test(date))
      throw Error('Data do teste inválida.');
    return {
      key:[date,obj.schema,stage,seed??'legacy',route??'none',
        r.completed,r.simulatedReward].join(':'),
      schema:obj.schema,stage,seed,benchmark:obj.schema===2?!!obj.benchmark:false,
      actualSaveMission:obj.schema===2?this.safeNumber(obj.actualSaveMission):null,
      generatedAt:date,route:route||'unknown',completed:r.completed,won:r.won,
      withdrawn:r.withdrawn,elapsedSeconds:seconds,
      captureSeconds:this.safeNumber(obj.captureSeconds),
      routeLength:this.safeNumber(obj.routeLength),
      windowSeconds:this.safeNumber(obj.interceptionWindowSeconds),
      hullMax:this.safeNumber(r.hullMax),
      hullRemaining:this.safeNumber(r.hullRemaining),
      collectedGold:r.collectedGold,contractBounty:r.contractBounty,
      simulatedReward:r.simulatedReward,kills:r.kills,
      failureReason:typeof obj.failureReason==='string'?
        obj.failureReason.slice(0,160):null
    };
  },
  median(nums){
    if(!nums.length)return null;
    const sorted=[...nums].sort((a,b)=>a-b);
    const m=Math.floor(sorted.length/2);
    return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;
  },
  group(rows){
    const groups=new Map();
    for(const row of rows){
      const key=row.stage+'|'+row.route;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(row);
    }
    return [...groups.entries()].map(([key,items])=>{
      const [stage,route]=key.split('|');
      const times=items.map(r=>r.elapsedSeconds).filter(n=>n!==null&&n>0);
      const rewards=items.map(r=>r.simulatedReward);
      const victories=items.filter(r=>r.completed&&r.won).length;
      const known=items.filter(r=>r.captureSeconds!==null);
      const totalTime=times.reduce((a,b)=>a+b,0);
      const timeRows=items.filter(r=>r.elapsedSeconds!==null&&r.elapsedSeconds>0);
      const money=timeRows.reduce((sum,r)=>sum+r.simulatedReward,0);
      return {stage:Number(stage),route,
        label:this.routes[route]||route,n:items.length,victories,
        successRate:items.length?victories/items.length:0,
        medianTime:this.median(times),
        durationSamples:times.length,
        medianCapture:this.median(known.map(r=>r.captureSeconds)),
        payoutMedian:this.median(rewards),
        goldPerMinute:totalTime?money/totalTime*60:null,
        hullMean:(()=>{
          const candidates=items.filter(r=>r.hullMax>0&&r.hullRemaining!==null);
          return candidates.length?candidates.reduce((acc,r)=>acc+r.hullRemaining/r.hullMax,0)/candidates.length:null;
        })()};
    }).sort((a,b)=>a.stage-b.stage||a.label.localeCompare(b.label));
  },
  modelProxy(stage){
    // Comparação hipotética, NÃO substitui ouro real observado na campanha.
    const commission=Math.round(24+4.5*stage+6*Math.sqrt(stage));
    return {commission,mainProxy:(commission+70+stage*28)*.25,
      proposedBase:Math.max(240,Math.round((commission+70+stage*28)*.25*6))};
  },
  summarize(rows){
    const groups=this.group(rows);
    const timeRows=rows.filter(r=>r.elapsedSeconds!==null&&r.elapsedSeconds>0);
    const elapsed=timeRows.reduce((sum,r)=>sum+r.elapsedSeconds,0);
    return {
      schema:1,kind:'ct001-playtest-aggregate',tests:rows.length,
      stages:[...new Set(rows.map(r=>r.stage))].sort((a,b)=>a-b),
      wins:rows.filter(r=>r.won&&r.completed).length,
      measuredDurations:timeRows.length,
      medianDuration:this.median(timeRows.map(x=>x.elapsedSeconds)),
      goldPerMinute:elapsed?
        timeRows.reduce((sum,r)=>sum+r.simulatedReward,0)/elapsed*60:null,
      groups
    };
  }
});
