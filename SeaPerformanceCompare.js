/* 3.6i — local comparison of two previously exported FPS reports.
 * Validation and comparison are read-only. Never load or write SeaProfile.
 * Imported text is never interpolated into HTML.
 */
const SEA_PERFORMANCE_COMPARE = {
  maxFileBytes:256*1024,
  format:'mar-de-sangue-performance-report',
  number(value,label,min=0,max=1000000){
    if(typeof value!=='number'||!Number.isFinite(value)||
       value<min||value>max)throw Error('Número inválido: '+label);
    return value;
  },
  effectBudget(value,frames){
    if(!value||typeof value!=='object'||Array.isArray(value))
      throw Error('Telemetria de efeitos inválida.');
    const meanActive=this.number(value.meanActive,'média de efeitos',0,1000);
    const peakActive=this.number(value.peakActive,'pico de efeitos',0,1000);
    const limit=this.number(value.limit,'limite de efeitos',1,1000);
    const atLimitFrames=this.number(value.atLimitFrames,'quadros no limite',0,frames);
    if(!Number.isInteger(peakActive)||!Number.isInteger(limit)||
       !Number.isInteger(atLimitFrames)||peakActive>limit||
       meanActive>peakActive||atLimitFrames>frames)
      throw Error('Telemetria de efeitos incompatível.');
    return {meanActive,peakActive,limit,atLimitFrames};
  },
  parse(raw){
    if(typeof raw!=='string'||!raw.trim()||raw.length>this.maxFileBytes)
      throw Error('Arquivo FPS vazio ou acima de 256 KB.');
    let data;
    try{data=JSON.parse(raw)}catch(_){throw Error('JSON do relatório FPS inválido.');}
    if(!data||typeof data!=='object'||Array.isArray(data)||
       data.format!==this.format||data.schema!==1)
      throw Error('O arquivo não é um relatório FPS v1 do Mar de Sangue.');
    if(!['compact','desktop'].includes(data.view)||
       !['viagem-concluida','viagem-em-andamento','captura-interrompida'].includes(data.source))
      throw Error('Origem ou formato de visualização inválido.');
    if(typeof data.startedAt!=='string'||!Number.isFinite(Date.parse(data.startedAt))||
       typeof data.capturedAt!=='string'||!Number.isFinite(Date.parse(data.capturedAt)))
      throw Error('Datas inválidas no relatório.');
    if(!Array.isArray(data.samples)||data.samples.length<1||data.samples.length>180)
      throw Error('O relatório precisa ter de 1 a 180 amostras.');
    if(data.retainedWindows!==data.samples.length||data.rollingLimit!==180||
       typeof data.truncated!=='boolean')
      throw Error('Quantidade de amostras ou limites inválidos.');
    this.number(data.seconds,'segundos',.1,360000);
    const summary=data.summary;
    if(!summary||typeof summary!=='object'||Array.isArray(summary))
      throw Error('Resumo de FPS ausente.');
    const keys=['minFps','medianFps','meanFps','worstFrameMs','slowFrames','updateFrames'];
    const summaryClean={};
    for(const key of keys)summaryClean[key]=this.number(summary[key],key,
      key==='updateFrames'||key==='minFps'||key==='meanFps'||key==='medianFps'?1:0);
    if(summaryClean.slowFrames>summaryClean.updateFrames)
      throw Error('Contagem de quadros lentos incompatível.');
    const fxSummary=summary.effectBudget===undefined?null:
      this.effectBudget(summary.effectBudget,summaryClean.updateFrames);
    let fxWindows=0,fxPeak=0,fxAtLimit=0;
    let countedFrames=0,countedSlow=0;
    let prev=0;
    for(const sample of data.samples){
      if(!sample||typeof sample!=='object'||Array.isArray(sample))
        throw Error('Amostra inválida.');
      this.number(sample.second,'tempo',.1,360000);
      if(sample.second<=prev)throw Error('Amostras fora da ordem temporal.');
      prev=sample.second;
      this.number(sample.fps,'FPS',1,1000);
      this.number(sample.meanMs,'média em ms',.1,1000);
      this.number(sample.maxMs,'pico em ms',.1,1000);
      this.number(sample.frames,'quadros',1,1000);
      this.number(sample.slowFrames,'quadros lentos',0,1000);
      if(!Number.isInteger(sample.frames)||!Number.isInteger(sample.slowFrames)||
         sample.slowFrames>sample.frames)
        throw Error('Contagem de quadros inválida.');
      countedFrames+=sample.frames;
      countedSlow+=sample.slowFrames;
      if(sample.effectBudget!==undefined){
        if(!fxSummary)throw Error('Telemetria de efeitos sem resumo.');
        const fx=this.effectBudget(sample.effectBudget,sample.frames);
        fxWindows++;fxPeak=Math.max(fxPeak,fx.peakActive);
        fxAtLimit+=fx.atLimitFrames;
      }
    }
    // Absolute totals must agree with their retained windows. Do not
    // normalize forged counts or compare incomplete / inconsistent records.
    if(countedFrames!==summaryClean.updateFrames||
       countedSlow!==summaryClean.slowFrames)
      throw Error('Contagens de quadros incompatíveis com as amostras.');
    if(fxSummary){
      if(fxWindows!==data.samples.length||fxPeak!==fxSummary.peakActive||
         fxAtLimit!==fxSummary.atLimitFrames)
        throw Error('Telemetria de efeitos incompatível com as amostras.');
      summaryClean.effectBudget=fxSummary;
    }
    // No imported arbitrary strings or user filenames survive validation.
    return {
      view:data.view,source:data.source,
      seconds:Math.round(data.seconds*10)/10,
      sampleCount:data.samples.length,truncated:data.truncated,
      summary:summaryClean
    };
  },
  compare(a,b){
    if(!a||!b)throw Error('Selecione dois relatórios FPS.');
    const warnings=[];
    if(a.view!==b.view)
      warnings.push('Os relatórios usam formatos de tela diferentes (desktop/compacto).');
    if(Math.min(a.sampleCount,b.sampleCount)<20)
      warnings.push('Uma captura possui menos de 20 janelas; o resultado pode oscilar.');
    const ratio=Math.max(a.sampleCount,b.sampleCount)/Math.max(1,Math.min(a.sampleCount,b.sampleCount));
    if(ratio>1.5)
      warnings.push('As capturas têm durações muito diferentes; compare sessões semelhantes.');
    if(a.truncated||b.truncated)
      warnings.push('Uma captura descartou janelas antigas (limite de 180).');
    if(a.source!=='viagem-concluida'||b.source!=='viagem-concluida')
      warnings.push('Uma captura foi interrompida ou ainda estava em andamento.');
    const keys=[
      ['FPS MÉDIO','meanFps','fps',true],
      ['FPS MEDIANO','medianFps','fps',true],
      ['FPS MÍNIMO','minFps','fps',true],
      ['PIOR QUADRO','worstFrameMs','ms',false],
      ['QUADROS >33 MS','slowFrames','quadros',false],
      ['TOTAL DE ATUALIZAÇÕES','updateFrames','quadros',null]
    ];
    const metrics=keys.map(([label,key,unit,higherBetter])=>{
      const av=a.summary[key],bv=b.summary[key],delta=Math.round((bv-av)*10)/10;
      return {label,unit,a:av,b:bv,delta,higherBetter};
    });
    // Different voyage lengths make raw slow-frame counts misleading.
    // Rates are derived from validated retained frame counts only.
    const perThousand=(events,frames)=>Math.round(events*10000/frames)/10;
    const rateRow=(label,av,bv,higherBetter)=>{
      metrics.push({label,unit:'por mil quadros',a:av,b:bv,
        delta:Math.round((bv-av)*10)/10,higherBetter});
    };
    rateRow('LENTOS / 1.000',
      perThousand(a.summary.slowFrames,a.summary.updateFrames),
      perThousand(b.summary.slowFrames,b.summary.updateFrames),false);
    // Optional field: old 3.6h/3.6i JSON files still compare normally.
    const af=a.summary.effectBudget,bf=b.summary.effectBudget;
    if(!!af!==!!bf)
      warnings.push('Apenas um relatório inclui a telemetria de efeitos da 3.6l.');
    if(af&&bf){
      if(af.limit!==bf.limit)
        warnings.push('Os relatórios usam limites de efeitos diferentes.');
      for(const [label,key,unit] of [
        ['FX · MÉDIA','meanActive','efeitos'],
        ['FX · PICO','peakActive','efeitos'],
        ['FX · NO LIMITE','atLimitFrames','quadros']
      ])metrics.push({label,unit,a:af[key],b:bf[key],
        delta:Math.round((bf[key]-af[key])*10)/10,higherBetter:null});
      rateRow('FX NO LIMITE / 1.000',
        perThousand(af.atLimitFrames,a.summary.updateFrames),
        perThousand(bf.atLimitFrames,b.summary.updateFrames),null);
      warnings.push('Carga de efeitos pode refletir diferenças de combate; não demonstra causalidade de FPS.');
    }
    return {a,b,metrics,warnings};
  }
};
