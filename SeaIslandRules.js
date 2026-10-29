/* O MAR DE SANGUE — regras porcentuais do Laboratório das Ilhas.
 * A ÚNICA fonte de números e textos é laboratorio-ilhas/catalog.json,
 * carregado no Phaser Boot; os contratos especiais continuam independentes.
 */
const SEA_ISLAND_RULES = {
    cacheKey:'mar-ilhas-v2',
    alignmentKeys:{FS:'sobreviventes',FC:'corte',FD:'culto'},
    statsKeys:{D:'cannonDamage',S:'maxSpeed',R:'radar',T:'turnSpeed'},
    titles:{G:'ouro',H:'casco',C:'maldição',D:'dano',S:'velocidade',
        R:'radar',T:'manobra',FS:'Sobreviventes',FC:'Corte',FD:'Dagon'},
    // Only explicit devastation of an entire island uses the ruin animation.
    destroyedChoices:new Set(['demeter_4','daegon_4','reef_4']),
    echoIds:{
        'refugees:shelter':'echo_ref_shelter',
        'refugees:inform':'echo_ref_inform',
        'refugees:pilot':'echo_ref_pilot',
        'convoy:hide':'echo_convoy_hide',
        'convoy:report':'echo_convoy_report',
        'convoy:charts':'echo_convoy_charts',
        'ritual:free':'echo_ritual_free',
        'ritual:powder':'echo_ritual_powder',
        'ritual:pact':'echo_ritual_pact'
    },
    // Every one of the five political choices keeps a canonical echo route.
    storyBranches:{
        refugees:['shelter','inform','pilot','shelter','inform'],
        convoy:['hide','report','charts','hide','hide'],
        ritual:['free','powder','pact','free','pact']
    },
    pursuitChoices:{
        refugees_1:'patrulha',refugees_4:'patrulha',
        convoy_1:'patrulha',convoy_4:'patrulha',
        ritual_1:'cultista',ritual_4:'cultista',
        echo_convoy_hide_1:'patrulha',echo_convoy_hide_4:'patrulha',
        echo_ritual_powder_2:'cultista',echo_ritual_powder_5:'cultista',
        echo_ritual_pact_2:'cultista'
    },
    catalog(s) {
        const data=s?.cache?.json?.get(this.cacheKey);
        return data && Array.isArray(data.events) ? data : null;
    },
    event(s,id) {return this.catalog(s)?.events.find(e=>e.id===id)||null;},
    parse(formula) {
        if(typeof formula!=='string')return [];
        return formula.split(',').map(v=>{
            const m=/^([A-Z]{1,2}):(-?\d+(?:\.\d+)?|zero)$/.exec(v.trim());
            if(!m || !Object.hasOwn(this.titles,m[1]))throw Error('Fórmula desconhecida: '+v);
            if(m[2]==='zero'&&m[1]!=='C')throw Error('zero somente para maldição');
            return {key:m[1],value:m[2]==='zero'?'zero':Number(m[2])};
        });
    },
    options(s,id,props={}) {
        const evt=this.event(s,id);
        if(!evt)return null;
        return evt.options.map((o,index)=>{
            const meta={id:o.id,name:o.title.toUpperCase(),description:o.text,
                formula:o.formula,kind:o.kind,faction:o.faction||null,
                alert:o.alert||'',destroysIsland:this.destroyedChoices.has(o.id),...props};
            if(this.storyBranches[id])meta.storyChoice=this.storyBranches[id][index];
            if(this.pursuitChoices[o.id])meta.pursuit=this.pursuitChoices[o.id];
            meta.hint=this.price(s,meta);
            return meta;
        });
    },
    preview(s,choice) {
        if(!choice?.formula)return {ok:false,error:'ESCOLHA SEM REGRA'};
        const before={
            gold:Math.max(0,Number(s.gold)||0),hp:Number(s.shipHP)||0,
            maxhp:Math.max(1,Number(s.maxShipHP)||1),curse:Number(s.curse)||0,
            damage:Number(s.shipStats?.cannonDamage)||1,
            speed:Number(s.shipStats?.maxSpeed)||1,
            radar:Number(s.shipStats?.radar)||1,
            turn:Number(s.shipStats?.turnSpeed)||1,
            align:{...{sobreviventes:0,corte:0,culto:0},...(s.alignment||{})}
        };
        const next={...before,align:{...before.align}};
        const parts=this.parse(choice.formula);
        const payments=[],changes=[];
        // All costs derive from STARTING state, not a sequentially mutated pot.
        for(const {key,value} of parts) {
            if(key==='G'&&value<0){
                if(before.gold<=0)return {ok:false,error:'SEM OURO PARA A OFERENDA',payments};
                const n=Math.max(1,Math.ceil(before.gold*Math.abs(value)/100));
                payments.push({type:'OURO',amount:n});
                if(n>before.gold)return {ok:false,error:'OURO INSUFICIENTE',payments};
            }
            if(key==='H'&&value<0){
                const n=Math.max(1,Math.round(before.maxhp*Math.abs(value)/100));
                payments.push({type:'CASCO',amount:n});
                if(n>=before.hp)return {ok:false,error:'O SACRIFÍCIO AFUNDARIA O NAVIO',payments};
            }
        }
        if(parts.every(({key,value})=>(key==='G'&&value<0)||(key==='H'&&value>0)) &&
           before.hp>=before.maxhp)return {ok:false,error:'O CASCO JÁ ESTÁ ÍNTEGRO',payments};
        if(parts.every(({key,value})=>(key==='G'&&value<0)||(key==='C'&&value==='zero')) &&
           before.curse<=0)return {ok:false,error:'NÃO HÁ MALDIÇÃO PARA PURIFICAR',payments};
        const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
        for(const {key,value} of parts){
            if(key==='G'){
                const n=value<0?Math.max(1,Math.ceil(before.gold*Math.abs(value)/100)):
                    Math.floor(before.gold*value/100);
                next.gold=clamp(next.gold+(value<0?-n:n),0,1e10);
                changes.push((value<0?'-':'+')+n+' ouro');
            }else if(key==='H'){
                const n=Math.max(1,Math.round(before.maxhp*Math.abs(value)/100));
                if(value<0){next.hp-=n;changes.push('-'+n+' casco');}
                else{const gained=Math.min(before.maxhp-next.hp,n);next.hp+=gained;
                    changes.push('+'+Math.round(gained)+' casco');}
            }else if(key==='C'){
                const previous=next.curse;
                next.curse=value==='zero'?0:clamp(next.curse+value,0,100);
                changes.push((next.curse-previous>=0?'+':'')+
                    Math.round(next.curse-previous)+' maldição');
            }else if(Object.hasOwn(this.statsKeys,key)){
                const attr={D:'damage',S:'speed',R:'radar',T:'turn'}[key];
                const old=next[attr];
                next[attr]=clamp(old*(1+value/100),.01,1e8);
                changes.push((value>=0?'+':'')+Math.round(value)+'% '+this.titles[key]);
            }else if(Object.hasOwn(this.alignmentKeys,key)){
                const fac=this.alignmentKeys[key],old=next.align[fac];
                next.align[fac]=clamp(old+value,0,100);
                changes.push((value>=0?'+':'')+Math.round(next.align[fac]-old)+' '+fac);
            }
        }
        return {ok:true,payments,changes,next};
    },
    price(s,choice) {
        const quote=this.preview(s,choice);
        const p=quote.payments||[];
        const displayed=p.length?p.map(x=>x.amount+' '+x.type).join(' · '):'SEM OFERENDA';
        return quote.ok?'PREÇO: '+displayed:displayed+' · INDISPONÍVEL';
    },
    commit(s,choice) {
        const quote=this.preview(s,choice);
        if(!quote.ok)return quote;
        const n=quote.next,previousCurse=s.curse||0;
        s.gold=n.gold;s.shipHP=n.hp;s.curse=n.curse;
        s.shipStats.cannonDamage=n.damage;
        s.shipStats.maxSpeed=n.speed;
        s.shipStats.radar=n.radar;
        s.shipStats.turnSpeed=n.turn;
        s.alignment={...n.align};
        if(n.curse>previousCurse && typeof SEA_WEATHER!=='undefined')
            SEA_WEATHER.announceTier(s);
        return quote;
    }
};
