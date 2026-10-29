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

    // A second encounter is selected by the *actual choice* made at sea.
    // Each arc has a different site and two meaningful responses.
    // Rumors only reveal their own destination, never unrelated islands.
    echoes: {
        refugees: {
            kind:'demeter',
            shelter: {
                title:'AS TESTEMUNHAS DE DEMÉTER',
                lore:'Aqueles que você salvou alcançaram o santuário. Querem repouso, mas um escriba pede que seu testemunho seja levado a Portomonte.',
                choices:[
                    {id:'rest',name:'GARANTIR ASILO AOS REFUGIADOS',hint:'+24 casco · -8 maldição',heal:24,curse:-8,faction:'sobreviventes',
                        outcome:'Os refugiados recebem abrigo. A benção das águas acompanha seu casco.'},
                    {id:'witness',name:'RECOLHER O TESTEMUNHO',hint:'+220 radar · +5 maldição',radar:220,curse:5,faction:'sobreviventes',
                        outcome:'As testemunhas descrevem enseadas ocultas. Agora você carrega nomes que a Corte deseja.'}
                ]
            },
            inform: {
                title:'NOMES À PORTA DO SANTUÁRIO',
                lore:'Uma lista de procurados foi afixada no santuário. Você reconhece os nomes que vendeu. Um sacerdote pergunta quem ainda pode ser salvo.',
                choices:[
                    {id:'burn',name:'QUEIMAR A LISTA',hint:'-20 ouro · -13 maldição',cost:20,curse:-13,faction:'sobreviventes',
                        outcome:'Você compra o silêncio do mensageiro e destrói as cópias ao alcance.'},
                    {id:'profit',name:'COBRAR PELA SEGUNDA LISTA',hint:'+35 ouro · +12 maldição',gold:35,curse:12,faction:'corte',
                        outcome:'Mais uma lista é entregue à Corte. O templo fecha as portas à sua passagem.'}
                ]
            },
            pilot: {
                title:'O RECADO DA NAVEGADORA',
                lore:'No santuário, a navegadora deixou duas cartas: uma leva a águas rápidas; a outra aponta para a costa onde sua família se esconde.',
                choices:[
                    {id:'shortcut',name:'SEGUIR A PASSAGEM SECRETA',hint:'+18 velocidade · +7 maldição',speed:18,curse:7,faction:'sobreviventes',
                        outcome:'A passagem encurta distâncias, mas cruzar suas águas exige silêncio ritual.'},
                    {id:'home',name:'DEVOLVER A CARTA À FAMÍLIA',hint:'+17 casco · -6 maldição',heal:17,curse:-6,faction:'sobreviventes',
                        outcome:'A família recupera seu caminho. Uma vigia do templo repara seu casco.'}
                ]
            }
        },
        convoy: {
            kind:'wreck',
            hide: {
                title:'O PREÇO DA CARGA ESCONDIDA',
                lore:'Um naufrágio guarda a segunda metade da carga que você protegeu. Os contrabandistas oferecem pagamento, mas a Corte patrulha a região.',
                choices:[
                    {id:'deliver',name:'ENTREGAR A CARGA RESTANTE',hint:'+45 ouro · +9 maldição · perseguição',gold:45,curse:9,pursuit:'patrulha',faction:'sobreviventes',
                        outcome:'A carga muda de mãos. O farol da fiscalização se acende atrás da sua embarcação.'},
                    {id:'burn',name:'DESTRUIR AS PROVAS',hint:'-10 maldição · +12 casco',curse:-10,heal:12,faction:'sobreviventes',
                        outcome:'Você queima os barris e recolhe madeira aproveitável do navio.'}
                ]
            },
            report: {
                title:'OS RESTOS DA FISCALIZAÇÃO',
                lore:'Depois da sua denúncia, um barco foi encontrado destruído. Entre os corpos há gente que nunca participou do contrabando.',
                choices:[
                    {id:'evidence',name:'RESGATAR AS PROVAS',hint:'+180 radar · -7 maldição',radar:180,curse:-7,faction:'sobreviventes',
                        outcome:'Os registros mostram rotas usadas pela fiscalização. Os sobreviventes terão como contar a história.'},
                    {id:'erase',name:'APAGAR AS MARCAS DA CORTE',hint:'+38 ouro · +11 maldição',gold:38,curse:11,faction:'corte',
                        outcome:'Você recolhe os cofres e afunda os documentos. Os mortos permanecem anônimos.'}
                ]
            },
            charts: {
                title:'AS CARTAS DOS AFOGADOS',
                lore:'Os mapas clandestinos levam a outro navio perdido. Os caminhos estão corretos, mas alguém apagou deliberadamente os nomes dos portos.',
                choices:[
                    {id:'current',name:'DECIFRAR A PASSAGEM',hint:'+15 velocidade · +7 maldição',speed:15,curse:7,faction:'sobreviventes',
                        outcome:'As correntes obedecem ao novo rumo. Você compreende por que o caminho foi escondido.'},
                    {id:'resell',name:'REVENDER AS CARTAS',hint:'+48 ouro',gold:48,faction:'corte',
                        outcome:'O comprador leva os mapas. Você prefere não descobrir quem financiará a próxima travessia.'}
                ]
            }
        },
        ritual: {
            kind:'monastery',
            free: {
                title:'A VIGÍLIA DOS CATIVOS',
                lore:'Os prisioneiros libertados chegaram ao mosteiro tortle. Um monge oferece abrigo ou a oportunidade de ouvir o que viram sob as águas.',
                choices:[
                    {id:'refuge',name:'AJUDAR A PROTEGER OS CATIVOS',hint:'+20 casco · -12 maldição',heal:20,curse:-12,faction:'sobreviventes',
                        outcome:'Os monges reforçam suas tábuas. Os sobreviventes permanecem sob proteção.'},
                    {id:'visions',name:'OUVIR OS SONHOS DOS CATIVOS',hint:'+190 radar · +9 maldição',radar:190,curse:9,faction:'sobreviventes',
                        outcome:'Os relatos descrevem um caminho que nenhum mapa registra, e uma voz que chama pelo seu nome.'}
                ]
            },
            powder: {
                title:'A FUMAÇA TEM VOZ',
                lore:'Os monges percebem que a pólvora roubada continua sussurrando. É possível silenciá-la ou aceitar que ela ensine uma nova salva.',
                choices:[
                    {id:'cleanse',name:'APAZIGUAR A PÓLVORA',hint:'-18 ouro · -16 maldição',cost:18,curse:-16,faction:'sobreviventes',
                        outcome:'As preces abafam os sussurros por esta viagem. A pólvora permanece potente.'},
                    {id:'ignite',name:'ESCUTAR A PÓLVORA',hint:'+4 dano · +15 maldição · cultistas',cannon:4,curse:15,pursuit:'cultista',faction:'culto',
                        outcome:'As mechas brilham em rubro. Algo nas profundezas reconhece a nova chama.'}
                ]
            },
            pact: {
                title:'A ÂNCORA DO PACTO',
                lore:'No mosteiro, os sinos soam sem vento. Os monges oferecem quebrar parte do vínculo com Daegon ou deixá-lo penetrar ainda mais no navio.',
                choices:[
                    {id:'release',name:'ALIVIAR O VÍNCULO',hint:'-30 ouro · -20 maldição',cost:30,curse:-20,faction:'sobreviventes',
                        outcome:'O cântico desfaz parte do peso invisível. O mar continua cobrando suas promessas.'},
                    {id:'deepen',name:'APROFUNDAR O PACTO',hint:'+15 velocidade · +18 maldição · cultistas',speed:15,curse:18,pursuit:'cultista',faction:'culto',
                        outcome:'As velas se movem como brânquias. Devotos percebem seu novo sinal sobre as ondas.'}
                ]
            }
        }
    },
    echoEncounter(s,island) {
        const data=island?.politicalEcho;
        if(!data)return null;
        const group=this.echoes[data.source];
        const echo=group?.[data.originalChoice];
        if(!echo||island.kind!==group.kind)return null;
        const catalogId=typeof SEA_ISLAND_RULES!=='undefined'?
            SEA_ISLAND_RULES.echoIds[data.source+':'+data.originalChoice]:null;
        const expanded=catalogId&&SEA_ISLAND_RULES.options(s,catalogId,{politicalEcho:data.source});
        return {...echo,label:'ECO DA ESCOLHA',choices:expanded||echo.choices.map(choice=>({
            ...choice,politicalEcho:data.source
        }))};
    },
    scheduleEcho(s,source,originalChoice) {
        const group=this.echoes[source];
        if(!group?.[originalChoice])return null;
        const reserved=new Set(['pickupId','shelterId','destinationId','clueId']
            .map(key=>s.contract?.[key]).filter(id=>id!==undefined&&id!==null));
        const origin=s.islandSelected;
        const available=(s.islands||[]).filter(island=>
            island.kind===group.kind&&island.id!==origin.id&&
            !reserved.has(island.id)&&!island.politicalEventId&&
            !island.politicalEcho&&!s.islandVisits?.has(island.id));
        available.sort((a,b)=>{
            const da=Math.hypot(a.x-origin.x,a.y-origin.y);
            const db=Math.hypot(b.x-origin.x,b.y-origin.y);
            const pa=da>=650?0:2000,pb=db>=650?0:2000;
            return da+pa-(db+pb)||a.id-b.id;
        });
        const target=available[0];
        if(!target)return null;
        target.politicalEcho={source,originalChoice};
        s.chartDiscovered?.add(target.id);
        // Never override a contract's navigation objective or an existing waypoint.
        if(!s.contract&&!s.chartWaypointId){
            s.chartWaypointId=target.id;
            s.atlasFocusedId=target.id;
        }
        s.announce?.('UM ECO DA SUA ESCOLHA SURGIU NA COSTA · CONSULTE A CARTA');
        return target.id;
    },
    resolveEcho(s,choice,changes) {
        const site=s.islandSelected,echo=this.echoEncounter(s,site);
        if(!echo||site.politicalEcho.resolved||
           choice.politicalEcho!==site.politicalEcho.source||
            !echo.choices.some(c=>c.id===choice.id))return false;
        s.politicalEvents.push({
            eventId:'echo:'+site.politicalEcho.source,choiceId:choice.id,
            faction:choice.faction,text:'CONSEQUÊNCIA: '+choice.name,
            terms:changes.join(' · ')||'Sem custo imediato'
        });
        if(choice.pursuit)this.pursue(s,choice.pursuit);
        // A resolved rumor should no longer dominate the navigator's waypoint.
        if(s.chartWaypointId===site.id)s.chartWaypointId=null;
        site.politicalEcho.resolved=true;
        return true;
    },
    pursue(s,type) {
        if(!Array.isArray(s.politicalThreats))s.politicalThreats=[];
        s.politicalThreats.push({type,dueAt:(s.elapsed||0)+12,attempts:0});
    },
    init(s) {
        s.politicalThreats=[];
        for(const island of s.islands||[]){
            delete island.politicalEventId;
            delete island.politicalEcho;
        }
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
        if(!island)return null;
        const echo=this.echoEncounter(s,island);
        if(echo)return echo;
        if(!island.politicalEventId)return null;
        // A contract action must never be replaced by a political encounter.
        if(s.contract && ['pickupId','shelterId','destinationId','clueId']
            .some(key=>s.contract[key]===island.id))return null;
        const event=this.events[island.politicalEventId];
        if(!event)return null;
        const expanded=typeof SEA_ISLAND_RULES!=='undefined'?
            SEA_ISLAND_RULES.options(s,island.politicalEventId,
                {politicalEvent:island.politicalEventId}):null;
        return expanded?{...event,choices:expanded}:event;
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
        if(choice.pursuit)this.pursue(s,choice.pursuit);
        this.scheduleEcho(s,choice.politicalEvent,choice.storyChoice||choice.id);
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
