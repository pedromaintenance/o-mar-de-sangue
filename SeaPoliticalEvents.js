/* O MAR DE SANGUE — Sprint 01: Ecos da Maré Sangrenta.
 * Encontros políticos de uma só ocorrência por viagem.
 * Não altera topologia, contratos, física, perfis ou a versão do save.
 * O nome "reputação" fica reservado para um sistema persistente futuro.
 */
const SEA_POLITICAL_EVENTS = {
    events: Object.freeze({
        refugees: {
            kind:'wreck', title:'REFUGIADOS SOB AS VELAS',
            lore:'Um casco ferido deriva sem bandeira. Famílias da Costa Sul escondem-se no porão enquanto uma patrulha feérica procura seus nomes. A decisão de um capitão pode comprar abrigo ou entregar vidas à Corte.',
            label:'REFUGIADOS', choices:[
                {id:'shelter',politicalEvent:'refugees',faction:'sobreviventes',
                    name:'ABRIGAR OS REFUGIADOS',hint:'+18 casco · -8 maldição · patrulha após partir',
                    heal:18,curse:-8,pursuit:'patrulha',
                    outcome:'Os refugiados se ocultam em seu navio. Sinais da Corte começam a surgir à distância.'},
                {id:'inform',politicalEvent:'refugees',faction:'corte',
                    name:'ENTREGAR OS NOMES À CORTE',hint:'+55 ouro · +12 maldição',
                    gold:55,curse:12,
                    outcome:'A Corte compra seus nomes. Os tripulantes evitam falar sobre o destino das famílias.'},
                {id:'pilot',politicalEvent:'refugees',faction:'sobreviventes',
                    name:'PEDIR UM GUIA PELA NEBLINA',hint:'+170 radar · +5 maldição',
                    radar:170,curse:5,
                    outcome:'Uma navegadora revela passagens esquecidas. Ela não embarca sem exigir silêncio.'}
            ]
        },
        convoy: {
            kind:'ruin', title:'CARGA SEM BANDEIRA',
            lore:'Nas ruínas de um antigo entreposto, mercadores sem insígnia repartem pólvora clandestina. Um fiscal feérico aproxima-se pelo canal. Os homens oferecem participação, delação ou uma carta de rotas proibidas.',
            label:'CONTRABANDO', choices:[
                {id:'hide',politicalEvent:'convoy',faction:'sobreviventes',
                    name:'ESCONDER A CARGA',hint:'+75 ouro · +12 maldição · patrulha após partir',
                    gold:75,curse:12,pursuit:'patrulha',
                    outcome:'A pólvora passa sob seu convés. A fiscalização logo descobrirá que houve ajuda.'},
                {id:'report',politicalEvent:'convoy',faction:'corte',
                    name:'DENUNCIAR O COMBOIO',hint:'+48 ouro · +7 maldição',
                    gold:48,curse:7,
                    outcome:'Um recibo lacrado traz a recompensa da Corte. Os contrabandistas lembrarão da denúncia.'},
                {id:'charts',politicalEvent:'convoy',faction:'sobreviventes',
                    name:'COMPRAR CARTAS CLANDESTINAS',hint:'-15 ouro · +210 radar',
                    cost:15,radar:210,
                    outcome:'Mapas costurados em couro revelam atalhos ao redor dos recifes rubros.'}
            ]
        },
        ritual: {
            kind:'daegon', title:'A LITURGIA INTERROMPIDA',
            lore:'Ao pé de um ídolo de Daegon, devotos kuo-toa disputam prisioneiros amarrados a mastros. O sangue já escorre para o mar. As testemunhas oferecem súplicas; os sacerdotes oferecem poder.',
            label:'RITUAL KUO-TOA', choices:[
                {id:'free',politicalEvent:'ritual',faction:'sobreviventes',
                    name:'LIBERTAR OS PRISIONEIROS',hint:'+16 casco · -12 maldição · cultistas após partir',
                    heal:16,curse:-12,pursuit:'cultista',
                    outcome:'Os cativos fogem em barcos menores. Um sacerdote de Daegon pronuncia sua sentença.'},
                {id:'powder',politicalEvent:'ritual',faction:'culto',
                    name:'ROUBAR A PÓLVORA RITUAL',hint:'+5 dano dos canhões · +19 maldição',
                    cannon:5,curse:19,
                    outcome:'A pólvora escura adere aos canhões. O convés murmura nomes desconhecidos.'},
                {id:'pact',politicalEvent:'ritual',faction:'culto',
                    name:'ACEITAR O PACTO DAS MARÉS',hint:'+20 velocidade · +22 maldição',
                    speed:20,curse:22,
                    outcome:'As velas respiram contra o vento. A água rubra cobra sua parcela de memória.'}
            ]
        }
    }),
    init(s) {
        s.politicalThreats=[];
        // One event per theme, seeded by voyage/stage, at existing landmarks.
        // Contract targets are excluded before placement, including future
        // sanctuary delivery sites. Kind and island id NEVER change.
        const reserved=new Set(['pickupId','shelterId','destinationId','clueId']
            .map(key=>s.contract?.[key]).filter(id=>id!==undefined&&id!==null));
        const placed=[];
        const seed=Math.max(0,Math.floor(Number(s.profile?.sorties)||0))+
            Math.max(0,Math.floor(Number(s.stage)||0));
        Object.entries(this.events).forEach(([id,script],order)=>{
            const eligible=(s.islands||[]).filter(island=>
                island.kind===script.kind&&!reserved.has(island.id)&&
                !island.politicalEventId);
            if(!eligible.length)return;
            eligible.sort((a,b)=>a.id-b.id);
            const rotated=eligible.slice(seed+order*3>=eligible.length?
                (seed+order*3)%eligible.length:seed+order*3)
                .concat(eligible.slice(0,(seed+order*3)%eligible.length));
            const chosen=rotated.find(island=>placed.every(other=>
                Math.hypot(island.x-other.x,island.y-other.y)>=650))||rotated[0];
            chosen.politicalEventId=id;
            placed.push(chosen);
        });
        return placed.length;
    },
    encounter(s,island) {
        if(!island||!island.politicalEventId)return null;
        // A contract action must never be replaced by a political encounter.
        if(s.contract && ['pickupId','shelterId','destinationId','clueId']
            .some(key=>s.contract[key]===island.id))return null;
        return this.events[island.politicalEventId]||null;
    },
    record(s,choice,changes) {
        const event=this.encounter(s,s.islandSelected);
        if(!event||!choice||choice.politicalEvent!==s.islandSelected.politicalEventId||
           !event.choices.some(c=>c.id===choice.id))return false;
        if(!Array.isArray(s.politicalEvents))s.politicalEvents=[];
        s.politicalEvents.push({
            eventId:choice.politicalEvent,choiceId:choice.id,faction:choice.faction,
            text:event.label+': '+choice.name,
            terms:changes.join(' · ')||'Sem custo imediato'
        });
        if(choice.pursuit){
            s.politicalThreats.push({
                type:choice.pursuit,
                dueAt:(s.elapsed||0)+12,
                attempts:0
            });
        }
        return true;
    },
    update(s) {
        if(!s.politicalThreats?.length||s.ended||s.sinking||
           s.pausedByCaptain||s.atlasOpen||s.islandDocked)return;
        const remaining=[];
        for(const threat of s.politicalThreats){
            if((s.elapsed||0)<threat.dueAt){remaining.push(threat);continue;}
            const hostile=s.spawnEnemy?.(threat.type,540);
            if(hostile){
                s.announce?.(threat.type==='cultista'?
                    'O CULTO EXIGE REPARAÇÃO · NAVIO DEVOTO À VISTA':
                    'A CORTE RECONHECEU SUA BANDEIRA · PATRULHA À VISTA');
            }else if((threat.attempts||0)<2){
                remaining.push({...threat,dueAt:(s.elapsed||0)+6,
                    attempts:(threat.attempts||0)+1});
            }
        }
        s.politicalThreats=remaining;
    }
};
