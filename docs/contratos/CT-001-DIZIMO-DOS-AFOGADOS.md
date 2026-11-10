# CT-001 — O Dízimo dos Afogados

**Versão autoral:** 0.6 — 2026-11-10  
**Estado:** RASCUNHO, **vertical slice jogável em laboratório**; CT-001 não disponível no quadro nem elegível para sorteio. [Ciclo 3 — Jogabilidade](./CT-001-CICLO-3.md) · [Ciclo 4 — Persistência e efeitos](./CT-001-CICLO-4.md) · [Ciclo 5 — Rotas, balanceamento e telemetria](./CT-001-CICLO-5.md)  
**Tipo:** interceptação de comboio, investigação e decisão político-econômica  
**Constituição:** [regras comuns](./CONSTITUICAO.md)  
**Dados parametrizados:** [CT-001.json](./CT-001.json)

## 1. O dossiê que chega ao capitão

> A Corte cobra tributo das aldeias costeiras. Ouro, farinha, velas, ferramentas — e agora gente. Um manifesto de carga foi retirado de um navio afundado: os registros comerciais ocultam nomes de prisioneiros destinados às águas do Mar de Sangue. O comboio partirá em breve. Há dinheiro suficiente para enriquecer um capitão, ou pessoas suficientes para arruinar sua vida tentando salvá-las.

**Primeira aparição sugerida:** após vencer a missão principal 1, **O Ouro de Portomonte**, quando a missão 2, **Carga nas Águas Rubras**, estiver ativa. A partir daí o mesmo template pode retornar em outros quadros com instâncias e riscos diferentes, sem ser duplicado dentro do mesmo quadro.

**Contratante público:** informante anônimo da Costa Sul, anunciado no quadro do porto.  
**Por trás do anúncio:** identidade selecionada entre um desertor de patrulha, um agente de Deméter e um corretor de tributos; cada origem altera uma pista opcional, sem alterar o dilema central.  
**Beneficiários possíveis:** prisioneiros, redes de abrigo, capitão, informantes e facções que possam explorar o manifesto.  
**Quem suporta os custos:** tripulantes ameaçados, aldeias tributadas, prisioneiros abandonados e, conforme escolha, agentes de comércio da Corte.  
**Conflito central:** roubar o dinheiro, libertar as pessoas ou transformar as provas de exploração em moeda de influência.

A Corte é parte concreta do aparato de cobrança; os Sobreviventes organizam abrigo; agentes do Culto de Dagon procuram redirecionar os prisioneiros aos seus ritos. Nenhuma facção é apresentada como bloco absolutamente homogêneo.

## 2. Elegibilidade e variáveis sorteadas

- **Minimissão ativa:** 2 (nenhum máximo; ciclos posteriores exigem novos testes).
- **Peso de seleção inicial:** 1, sujeito a ajuste segundo variedade do catálogo.
- **Juramento exigido:** nenhum.
- **Locais existentes para pista:** ilhas do tipo **wreck** e **ruin**.
- **Locais existentes para entrega humanitária:** ilhas do tipo **demeter**.
- **Área de interceptação:** trecho navegável do mapa selecionado a partir da posição das ilhas existentes e de uma rota possível do alvo.
- **Variáveis congeladas na oferta:** semente, etapa principal ativa, tipo e ilha da pista, identidade do informante, rota do comboio, lista de inimigos, tempo, maldição/risco, recompensa-base e alerta previsto.
- **Restrições:** não gerar sem pista alcançável e ponto de entrega válido; não criar comboio em rocha, fora da área navegável ou dentro de outro objeto; impedir regeneração ao recarregar.
- **Valor narrativo por estágio:** a mesma atividade de cobrança fica mais militarizada e mais associada ao comércio oculto de prisioneiros conforme a campanha avança.

## 3. Loop jogável

| Fase | Jogabilidade | Encerramento |
|---|---|---|
| Pista | Aproximar-se do naufrágio ou ruína marcada no atlas, abordar, obter o manifesto | Aponta uma rota concreta de comboio |
| Caçada | Navegar antes de a embarcação ultrapassar a fronteira de fuga | Timer termina com falha; alcançar alvo inicia combate |
| Interceptação | Neutralizar escoltas e **imobilizar** o transporte sem destruí-lo | Alvo imobilizado e rota de fuga interrompida |
| Decisão | Escolher libertação, saque ou venda das provas, com custos claros | Ativa uma fase final diferente |
| Resolução | Cumprir objetivo da rota, escapar de ameaça complementar e retornar ao porto | Pagamento e efeito da escolha registrados |

**Sucesso:** cumprir a condição específica da rota escolhida e encerrar a expedição com o navio do jogador sobrevivente.  
**Falha:** expiração do prazo com o transporte em fuga, destruição do transporte antes da decisão, naufrágio do jogador ou descumprimento definitivo do objetivo final.  
**Retirada:** permitida; nenhum prêmio contratual integral, porém valem as regras gerais de retenção de saque já coletado. Não renovar o quadro.

**Atualização do ciclo 4:** o [motor de captura](./CAPTURA_NAVIOS_v0.1.md) está integrado ao [CT-001 experimental](./CT-001-CICLO-3.md), com comboio, `onCapture`, três rotas, fuga e relatório simulado. [SeaContractState.js](../../SeaContractState.js) e [SeaContractEffects.js](../../SeaContractEffects.js) implementam infraestrutura persistente de quadros e consequências de uma expedição, mas o CT-001 continua **sem autorização de sorteio ou liquidação real**. O save v4 aceita o ledger opcional. [Relatório completo](./CT-001-CICLO-4.md).

**Atualização do ciclo 6:** o laboratório permite simular as missões 2, 10 e 25 com equipamento e facção temporários, seed controlada e exportação JSON v2. O [observatório local de playtests](../../ct001-playtests.html) aceita múltiplas partidas e calcula conclusão, tempos e ouro simulado/minuto, sem modificar o save. **Não existem dados de partidas reais importadas ou autorização de pagamento.** [Relatório do ciclo 6](./CT-001-CICLO-6.md).

**Atualização do ciclo 5:** o comboio usa [rotas navegáveis A*](../../SeaConvoyNavigation.js), orientação móvel no radar/Carta, janela de abordagem por estágio e relatório exportável em JSON. A economia de prêmio ainda é **proxy**, não validada por ouro/minuto. Os testes simulados somam 1.070 verificações aprovadas; **QA real em navegador pendente**. [Relatório e planilha de comparação](./CT-001-CICLO-5.md).

## 4. Pressões e escalonamento por missão principal ativa

O estágio controla a composição, a pressão e o comportamento, mas não sorteia o destino moral dos prisioneiros. Recomendações **provisórias para teste**, não números implementados:

| Missão ativa | Esquema hostil sugerido | Pressão adicional |
|---|---|---|
| 2–5 | Transporte do tipo fragata + 1 patrulha + 1 corsário perseguidor | Pista e interceptação cronometrada |
| 6–10 | Transporte tipo galeão + 2 fragatas ou 1 fragata e 1 bombardeiro | Escolta em múltiplas direções; visibilidade reduzida |
| 11–15 | Galeão com defesa reforçada + 2 escoltas + 1 corsário de reforço | Alarme que chama reforços após atraso |
| 16–25 | Transporte pesado + 2 escoltas de elite + 2 perseguidores em momentos diferentes | Clima hostil e contraemboscada mais intensa |
| 26+ | Reutilizar banda final com escalonamento limitado e variações de IA | Exige teste específico; não escalar infinitamente sem limites |

**Tipos de inimigos já existentes no jogo:** patrulha, corsário, fragata, bombardeiro e galeão. **Novo papel de IA:** transporte valioso que foge e pode ser abordado. Não introduzir arbitrariamente navio ou monstruosidade sem asset e comportamento.

### Fórmulas-base propostas

- **Referência:** S = número da **missão principal ativa** no momento do sorteio.
- **Banda de ameaça:** depende de S, conforme tabela acima, sem contar o nível visual do navio como estágio da campanha.
- **Velocidade do transporte:** derivada da classe de inimigo correspondente; não usar velocidade superior ao navio-base sem janela justa de interceptação.
- **Tempo de interceptação:** calculado após sortear o percurso: tempo de navegação plausível (distância da pista ao primeiro ponto de contato / velocidade efetiva de navegação) + reserva de combate por banda + margem de erro. A janela **não** deve ser um número fixo que torne rotas longas impossíveis.
- **Vida/dano de inimigos:** utilizar estatísticas já existentes, com eventual modificador de dificuldade por banda, limitado após testes. Proibido depender somente de aumentar PV.
- **Desafios simultâneos mínimos:** interceptação no tempo + combate em inferioridade, acrescidos de escolta/contraemboscada após escolha.
- **Restrições matemáticas:** bloquear seeds que produzam caminho sem saída, alvo inalcançável, tempo inferior ao percurso mínimo ou navio que precise ser abordado sendo destruído por dano inevitável.
- **Dados congelados:** o estágio S não muda se o jogador melhorar o navio antes de aceitar a oferta.

### Três cenários de verificação obrigatória

**S = 2:** primeira oferta, navio ainda pouco desenvolvido; demonstrar que é possível vencer com habilidade, navegação e decisões táticas, mesmo sendo mais difícil que a principal.  
**S = 10:** validar escoltas, risco e janela temporal na região dos primeiros grandes chefes da campanha.  
**S = 25:** validar estabilidade dos efeitos especiais e dificuldade diante de navio muito evoluído; retestar em 26+.

## 5. Decisão central — três destinos para o comboio

### CT-001-A: Abrir os porões

**Promessa visível:** menos ouro, gente viva e um favor de Deméter.  
**Mudança imediata:** o transporte libera os prisioneiros; o jogador deve atravessar até uma ilha de Deméter com perseguidores adicionais. O porto marca a chegada; perda do grupo escoltado invalida o objetivo humanitário.  
**Premiação provisória:** 80% do prêmio base.  
**Política indicativa:** Sobreviventes +10, Corte −7, Culto −2 (validar caps e facção ativa).  
**Efeito especial proposto:** **fx-ct001-demeter-abrigo**. Uma vez, na próxima expedição, após deixar combate e caso não esteja afundando, restaura até 15% do casco máximo; não acumula consigo, expira após uma expedição e exige save aditivo. Esse efeito NÃO existe hoje.  
**Final:** entrega dos prisioneiros num santuário de Deméter e retorno vivo.

### CT-001-B: Tomar o cofre

**Promessa visível:** muito mais ouro, nenhuma proteção e uma reação armada.  
**Mudança imediata:** a carga passa ao jogador e ativa contraemboscada da patrulha de cobrança. A rota fica mais curta, mas a ameaça militar cresce.  
**Premiação provisória:** 125% do prêmio base, condicionada à sobrevivência e à conclusão; a carga não é paga antecipadamente como loot irrestrito.  
**Política indicativa:** Sobreviventes −6 e Corte −3, se o crime for identificado; Culto sem bônus automático.  
**Efeito especial:** nenhum benefício sobrenatural. **fx-ct001-cacadores-tributo** é um ônus opcional de próxima expedição (marcador de perseguição, com expiração), sujeito a aprovação.  
**Final:** escapar da reação armada e retornar ao porto com o cofre.

### CT-001-C: Vender o manifesto

**Promessa visível:** ouro intermediário, informação e um salvo-conduto de curta duração — a preço de cumplicidade.  
**Mudança imediata:** levar provas a um posto elegível de negociação. Um denunciante pode iniciar perseguição, e a proteção das provas passa a ser o objetivo.  
**Premiação provisória:** 100% do prêmio base.  
**Política indicativa:** Corte +5 **somente se o comprador for uma casa rival que reconheça o trato**; Sobreviventes −8 se descobrirem; Culto −4 se perder acesso à carga. Não conceder favor automaticamente após agressão a uma patrulha aliada.  
**Efeito especial proposto:** **fx-ct001-salvo-conduto**. Na expedição seguinte, uma patrulha comum da Corte evita hostilidade por uma travessia, exceto se o jogador a provocar ou estiver sob perseguição política explícita; não afeta caçadores obrigatórios, expira em uma expedição. NÃO implementado.  
**Final:** entregar o manifesto no destino negociado e retornar vivo.

**Decisão não procedural:** as três opções devem ser sempre compreensíveis; o sorteio muda custo, janela, encontro e destino, não elimina arbitrariamente o poder de escolha do capitão.

## 6. Economia

**Fórmula editorial:** prêmio base = arredondar (referência líquida de uma vitória principal comparável × **6,0**). Multiplicadores por rota: A **0,80**; B **1,25**; C **1,00**. O valor base é congelado e mostrado antes da partida; prêmio da rota só é confirmado quando suas condições são cumpridas.

A **referência principal líquida** deve representar comissão + loot típico transferido ao banco, após regras existentes de campanha. Não confundir com a comissão nominal isolada: o jogo já aplica fator de 0,25 nas missões e a coleta real pode variar. Se faltarem dados, usar provisoriamente a fórmula de economia prevista, mas testar o resultado frente aos contratos legados de 125/190/240 ouro e ao custo das melhorias.

**Não fixar ouro absoluto ainda.** Antes de habilitar, coletar as recompensas típicas de missões ativas 2, 10 e 25, e determinar piso/teto e rendimento em ouro/hora. O multiplicador de 1,25 da rota B é condicionado ao risco extra e não significa ouro garantido.

**Liquidação:** usar uma única vez SeaProfile.settle; impedir dupla cobrança da recompensa ou crédito bancário paralelo. Marcar resultado consumido com instanceId e rewardSettled.

## 7. Efeitos e persistência

| ID | Rota | Janela | Regras |
|---|---|---|---|
| fx-ct001-demeter-abrigo | A | Próxima expedição | Cura única de até 15% do casco máx.; não empilha; expira no fim |
| fx-ct001-cacadores-tributo | B (ônus opcional) | Próxima expedição | Cobrança armada adicional uma única vez; não empilha |
| fx-ct001-salvo-conduto | C | Próxima expedição | Uma patrulha comum não-hostil; nunca suprime perseguição forçada |

Todos são **propostas**, não itens ou bônus presentes no jogo atual. Seus efeitos devem mostrar gatilho, consumo e expiração no porto, relatório e save. Não sobrescrever bônus de facção já existentes.

## 8. Plano técnico de implementação

**Reutilização confirmada em código (consulta de 07/11/2026):**

- **Game.js:** estágios, navegação, classes de inimigos, SeaProfile.stats, SeaProfile.settle, combate e relatório.
- **SeaContracts.js:** fases, alvos de ilha e escolhas; contratos legados sem persistência de quadro.
- **SeaIslands.js / SeaAtlas.js:** ilhas físicas e marcação de destino.
- **SeaFactions.js / SeaFactionPolitics.js:** confiança, juramentos, benefícios e hostilidade da Corte.
- **PortUI.js:** cartões e entrada para expedições de contrato, atualmente fixos.

**Implementado em laboratório:** incapacitação e abordagem de alvo marcado; IA de comboio em fuga; escoltas por faixa de missão ativa; gancho `onCapture` com tela de decisão; objetivos específicos das rotas A/B/C; fuga, contraemboscada, destinos reais e relatório com **pagamento apenas simulado**. **Pendências:** sorteio/persistência por instância, navegação e tempo validados em várias seeds, efeitos na próxima expedição, liquidação efetiva no save após aprovação, telemetria de economia e QA gráfico. Implementar em peças testáveis, sem desativar os três contratos existentes.

## 9. Critérios de aprovação CT-001

- [ ] O transporte e o percurso são gerados apenas em água navegável.
- [ ] A perseguição tem tempo alcançável em múltiplas seeds, sem teleporte.
- [ ] Imobilizar um transporte não exige afundá-lo.
- [ ] Abrir porões muda a jogabilidade para escolta e proteção.
- [ ] Saquear ativa a contraemboscada; não paga imediatamente.
- [ ] Manifesto exige entrega e respeita hostilidade política existente.
- [ ] Todas as rotas são concluíveis nos estágios 2, 10 e 25.
- [ ] Recompensa e custo da expedição passam pelo fluxo econômico único.
- [ ] Efeitos podem ser consumidos, expirados e salvos sem duplicação.
- [ ] Escolha e resultado ficam visíveis no relatório pós-viagem.
- [ ] Salvamento legado v4 não perde ouro, melhorias ou missões.
- [ ] Controle por toque, teclado e gamepad permite todas as escolhas.

## 10. Próxima decisão autoral

**Ainda em aberto para revisão:** se o transporte deve poder ser apenas **imobilizado** ou se aceitamos **abordagem por aproximação sem combate de captura**, além do nível de pressão do primeiro estágio (S = 2). Essa decisão determina a implementação das fases 2 e 3. Nenhum valor acima é definitivo antes de teste.

**Regra de processo:** manter CT-001 em rascunho até aprovação individual; só então iniciar CT-002.
