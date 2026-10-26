# Roadmap — O Mar de Sangue

**Identidade:** horror naval, horror cósmico e conflito político no universo da **Carcaça**.  
**Plataforma atual:** jogo web estático (GitHub Pages), PWA offline, Phaser + porto HTML/CSS.  
**Atualização:** 26 de outubro de 2026.  
**Fase do produto:** **PRÉ-ALFA**. GitHub Pages é ambiente público de testes, **não lançamento comercial**.  

## Política de desenvolvimento — pré-alfa (decisão de produto de 26/10/2026)

- **Prioridade absoluta:** qualidade final do jogo, diversão, coesão narrativa, regressão funcional e arquitetura sustentável.
- **Saves de teste são descartáveis:** não exigir retrocompatibilidade v3/v4 ou migração automática como condição para aprovar uma mecânica nova. Se o modelo de dados mudar, é permitido zerar o progresso experimental, desde que isso seja comunicado na entrega e o salvamento da versão atual funcione.
- **Estabilidade NÃO significa imutabilidade:** preservar funcionalidades aprovadas, controles, PWA offline, testes e capacidade de rollback via Git, mas permitir refatorar esquemas, combate, progressão e regras para melhorar a experiência.
- **Limite da regra:** ao entrar em beta com testadores externos, reavaliar política de resets; no lançamento efetivo, formalizar compatibilidade e migração de saves.
- **Definição de pronto:** uma entrega precisa ser jogável, passar regressões e ter riscos conhecidos declarados. Checklists históricos que exigem preservação do save v4 descrevem decisões das versões antigas, e **não têm precedência** sobre esta política.

## Sprint 01 — Ecos da Maré Sangrenta (em desenvolvimento)

**Objetivo:** colocar narrativa e consequências políticas no núcleo da navegação. Incremento pequeno: três encontros políticos em ilhas já existentes, três decisões cada, recursos/ameaças perceptíveis e crônica da expedição no Diário do Capitão. Sem pontuação permanente de reputação neste sprint.

- [ ] Encontro de refugiados perseguidos pela Corte, com proteção, delação ou informação de navegação.
- [ ] Comboio de contrabando, com colaboração, denúncia ou recuperação de mapas.
- [ ] Ritual kuo-toa, com resgate de prisioneiros, roubo de pólvora ou pacto sobrenatural.
- [ ] Limite de frequência: no máximo uma ocorrência de cada encontro por expedição, sem repetição de prêmios nem interrupção constante da navegação.
- [ ] Consequências imediatas explícitas e, quando indicado, perseguição hostil retardada após sair da ilha; crônica consultável na pausa.
- [ ] Preservar contratos anteriores, combate, controles, offline, atlas e save funcional; compatibilidade histórica de saves não é requisito.
- [ ] Testes de lógica/anti-replay, testes visuais, CI e inspeção no Pages; testes físicos só podem ser marcados como concluídos após execução real.


**Responsabilidade:** itens marcados como planejados são propostas; ainda não foram implementados ou aprovados como recursos.

> **Princípio de desenvolvimento:** avançar em blocos jogáveis sem quebrar subsistemas já aprovados. Separar apresentação de regras; preservar acessibilidade básica, funcionamento offline, mouse/toque, teclado e controle Xbox. **Em pré-alfa, os saves de teste podem ser reiniciados e os esquemas de dados redesenhados.** Toda interface nova deve passar por testes de regressão antes do merge.

## Onde estamos

| Marco | Situação | Entrega e evidência |
| --- | --- | --- |
| **2.1 — Porto responsivo** | ✅ Concluído | Reestruturação dos menus do porto em HTML/CSS; [PR #21](https://github.com/pedromaintenance/o-mar-de-sangue/pull/21) |
| **2.2 — Bestiário / Dagon** | ✅ Concluído | Sprite completo emergindo do Mar de Sangue; [PR #22](https://github.com/pedromaintenance/o-mar-de-sangue/pull/22) |
| **2.3–2.5 — Navegação Xbox** | ✅ Concluído | Direcional espacial, foco em compras e troca de abas com LB/RB e Q/E; [PRs #23–#26](https://github.com/pedromaintenance/o-mar-de-sangue/pull/26) |
| **3.0 — A Maré Negra** | ✅ Concluído | Identidade sombria dos menus; [PR #27](https://github.com/pedromaintenance/o-mar-de-sangue/pull/27), oficialização [PR #28](https://github.com/pedromaintenance/o-mar-de-sangue/pull/28) |
| **3.1 — Interfaces durante a viagem** | ✅ Concluído | Diário do Capitão e atracação com paleta Maré Negra, sem alterar regras; [PR #29](https://github.com/pedromaintenance/o-mar-de-sangue/pull/29) |
| **3.2 — HUD de combate** | ✅ Implementado; CI aprovado | Casco e recarga legíveis, maldição crítica e estado do mar; [PR #30](https://github.com/pedromaintenance/o-mar-de-sangue/pull/30) |
| **3.3a — Três Bandeiras na Maré** | ✅ Concluído | Primeira negociação política entre sobreviventes, Corte e culto de Daegon; efeitos temporários; [PR #31](https://github.com/pedromaintenance/o-mar-de-sangue/pull/31) |
| **3.3b.0 — Registro Político** | ✅ Integrado; CI verde | Diário mostra os acordos políticos da expedição, facções identificadas antes da escolha e save v4 preservado; [PR #35](https://github.com/pedromaintenance/o-mar-de-sangue/pull/35) e [documentação](docs/political-ledger-3-3b0.md). Teste manual no Pages pendente |
| **3.4a — Carta dos Náufragos** | ✅ Integrado; teste físico pendente | Atlas M/View/toque e descoberta progressiva sem alterar saves; [PR #32](https://github.com/pedromaintenance/o-mar-de-sangue/pull/32) |
| **3.4b — Rumos da Carta** | ✅ Integrado; CI verde | Waypoints manuais para marcos descobertos, rumo, distância e radar; [PR #33](https://github.com/pedromaintenance/o-mar-de-sangue/pull/33); verificação física/Pages pendente |
| **3.5a — Paisagem Sonora Reativa** | ✅ Integrada; CI verde | 6 contextos de trilha e teclas M (Atlas) / N (som); [PR #34](https://github.com/pedromaintenance/o-mar-de-sangue/pull/34) e [documentação](docs/soundscape-3-5.md). Validação auditiva no Pages pendente |
| **3.5b — Mixagem Separada** | ✅ Integrada; CI verde | Música/efeitos independentes, mute mestre, persistência isolada e PWA v39; [PR #36](https://github.com/pedromaintenance/o-mar-de-sangue/pull/36) e [documentação](docs/audio-mixer-3-5b.md). QA auditivo físico pendente |
| **3.6a — PWA Resiliente** | ✅ Integrada; CI verde | Modo offline, atualização voluntária e precache v42 reparado; [PR #37](https://github.com/pedromaintenance/o-mar-de-sangue/pull/37) e [documentação](docs/pwa-3-6a.md). Testes físicos no Pages/PWA pendentes |
| **3.6b — Backup do Capitão** | ✅ Integrada; CI verde | Download JSON v4 sem modificação e proteção antes do reset; [PR #38](https://github.com/pedromaintenance/o-mar-de-sangue/pull/38) e [documentação](docs/captain-backup-3-6b.md). Conferência física no Pages pendente |
| **3.6c — Restauração Segura** | ✅ Integrada; CI verde | Importação JSON v4, prévia, dupla confirmação, backup automático e desfazer; [PR #39](https://github.com/pedromaintenance/o-mar-de-sangue/pull/39) e [documentação](docs/captain-restore-3-6c.md). Teste físico no Pages pendente |
| **3.6d — Diálogos Acessíveis** | ✅ Integrada; CI verde | Tabela de saves com semântica acessível, confirmação anunciada e cancelamento seguro por ESC/B; [PR #40](https://github.com/pedromaintenance/o-mar-de-sangue/pull/40) e [documentação](docs/critical-dialog-accessibility-3-6d.md). QA físico pendente |
| **3.6e — Leitura Ampliada** | ✅ Integrada; CI verde | Texto ampliado no Porto, preferência isolada, QA Node/Chromium desktop e Android; [PR #41](https://github.com/pedromaintenance/o-mar-de-sangue/pull/41) e [documentação](docs/port-readability-3-6e.md). Teste físico pendente |
| **3.6f — Guias Contextuais da Viagem** | ✅ Integrada; CI verde | Instruções na pausa, Carta e ilhas; Node/Chromium aprovados e hitboxes preservadas; [PR #42](https://github.com/pedromaintenance/o-mar-de-sangue/pull/42) e [documentação](docs/voyage-control-guides-3-6f.md). QA físico pendente |
| **3.6g — Diagnóstico de Desempenho** | ✅ Integrado; CI verde | FPS aproximado, tempo médio/pico, quadros lentos, botão no Porto e F3; [PR #43](https://github.com/pedromaintenance/o-mar-de-sangue/pull/43) e [documentação](docs/performance-diagnostics-3-6g.md). QA físico pendente |
| **3.6h — Relatório FPS Exportável** | ✅ Integrada; CI verde | Até 180 amostras temporárias e download JSON com resumo; [PR #44](https://github.com/pedromaintenance/o-mar-de-sangue/pull/44) e [especificação](docs/fps-export-report-3-6h.md). Testes físicos pendentes |
| **3.6i — Comparação FPS Local** | ✅ Integrada; CI verde | Comparação local de dois JSON, seis métricas e avisos de comparabilidade; [PR #45](https://github.com/pedromaintenance/o-mar-de-sangue/pull/45) e [documentação](docs/fps-comparison-3-6i.md). QA físico pendente |
| **3.6j — Redesenho Eficiente do Clima** | ✅ Integrada; CI verde | Elimina redesenhos redundantes do clima sem reduzir efeitos nem alterar o save; [PR #46](https://github.com/pedromaintenance/o-mar-de-sangue/pull/46) e [documentação](docs/weather-render-cache-3-6j.md). QA físico pendente |
| **3.6k — Cache do Mar Procedural** | ✅ Integrada; CI verde | Reutilização de cálculos fixos e cintilação com comandos gráficos idênticos à 3.6j; [PR #47](https://github.com/pedromaintenance/o-mar-de-sangue/pull/47) e [documentação](docs/procedural-sea-cache-3-6k.md). QA físico pendente |

A página padrão usa **A Maré Negra**. Para comparação, a aparência antiga ainda está disponível em `?theme=classic`.

## Prioridades seguintes

### P0 — 3.1: Diário do Capitão e arquipélago

**Objetivo:** eliminar o contraste visual entre o porto e os modais usados durante a navegação.

**Escopo desta entrega:**
- [x] Aplicar a mesma paleta de ferro escuro, vermelho seco, bronze antigo e marfim ao **Diário do Capitão** (pausa).
- [x] Uniformizar as janelas de encontro nas **ilhas**, incluindo botões selecionados, aviso de recursos insuficientes, confirmação de escolhas e botão de atracação.
- [x] Obter e revisar as capturas automáticas dos dois modais em desktop e layout compacto.
- [x] Verificar contratos funcionais e capturas no GitHub Actions (desktop e mobile).
- [ ] Confirmar merge e funcionamento na versão publicada (revisão posterior à publicação).

**Não alterar:** valores de danos, eventos das ilhas, efeitos das escolhas, restituição do ouro, atributos, progressão, zona de toque, sequência de opções, modo offline ou funcionamento da pausa.

**Critério de conclusão:** continuar/áudio/retornar funcionando com mouse, teclado e gamepad; três escolhas + retorno nas ilhas, incluindo após o resultado; sem erro de JavaScript e sem elementos importantes cortados na tela.

### P1 — 3.2: Legibilidade e identidade do HUD

**Objetivo:** tornar as informações do combate visualmente consistentes sem esconder os elementos críticos.

- [x] Aplicar a paleta Maré Negra ao HUD (casco, ouro, objetivos, velocidade, maldição, condições do mar e alertas).
- [x] Separar indicadores críticos (casco abaixo de 28% e maldição acima de 65%) de informações secundárias, preservando as três barras de recarga/casco.
- [x] Validar capturas e contraste em 1600×900, 1280×720 e 390×844 no Chromium (incluindo emulação Android e estados críticos).
- [x] Preservar geometria de hitboxes, posição da carta, joystick, canhões, pausa e valores de jogo; adicionar testes de contrato.

**QA automatizada concluída:** estados normal/crítico do HUD em 1600×900, 1280×720 e emulação Android 390×844, com screenshots; contrato das hitboxes de pausa, joystick e canhões validado. **Teste manual em controle/dispositivo físico ainda recomendado.**

### P1 — 3.3: Eventos narrativos e política do Mar de Sangue

**Objetivo:** fazer a viagem expressar conflitos entre **cultistas, feéricos e sobreviventes**, não apenas combate.

- [x] Definir uma cena com **apresentação, três decisões e consequências**, baseada na Costa Sul, Portomonte, Corte Feérica Sombria e devotos de Daegon.
- [x] Documentar facções e custos/recompensas em [docs/political-events-3-3.md](docs/political-events-3-3.md).
- [x] Implementar protótipo vertical de uma negociação em uma ilha de naufrágio determinística, com efeitos na viagem.
- [x] Preservar o save v4 sem campos novos; especificar previamente a **migração necessária** para reputações persistentes (3.3b).
- [x] Aprovar testes Node e Chromium: escolhas, consequências, retorno por B, layout Android/desktop e ausência de alteração do save.
- [ ] Confirmar merge e disponibilização no GitHub Pages (verificação após integração).

**3.3a é deliberadamente um protótipo jogável**, não um sistema completo de reputação. `politicalLedger` e `politicalChoice` vivem apenas na cena. `SeaProfile` e seus saves não mudam.

**3.3b.0 — Registro das Três Bandeiras (integrado à `main`, CI aprovado em 16/10/2026):**

- [x] Exibir no Diário do Capitão o acordo político da viagem, inclusive ausência de acordo, sem revelar encontro oculto antes da decisão.
- [x] Identificar o interlocutor de cada escolha (sobreviventes, Corte Feérica, culto de Daegon) antes de confirmar.
- [x] Exibir os termos materiais do pacto separadamente de reputação, sem criar pontos, bônus ou penalidades políticos ocultos.
- [x] Manter os três botões da pausa, todas as áreas de toque, navegação do controle e retirada com 75% do ouro.
- [x] Ampliar testes Node/Chromium e capturas do registro, com verificação de save v4.
- [x] Smoke/Chromium aprovados; PR #35 integrado via squash merge (`c21d318`). [Documentação e escopo](docs/political-ledger-3-3b0.md).
- [ ] Conferir visualmente no Pages e testar no dispositivo físico e PWA instalada.

**3.3b persistente — Especificação preparada:** [docs/reputation-3-3b-design.md](docs/reputation-3-3b-design.md) descreve proposta de reputação e migração v4→v5. **Ainda não implementada nem aprovada.**

**Pronto para 3.3a quando:** evento testável com escolhas significativas e efeitos na viagem, **sem persistência nova**, retorno seguro à navegação e testes de regressão aprovados. A persistência e reputação fazem parte da 3.3b, após definição do esquema de migração.

### P1 — 3.4: Atlas e orientação

**3.4a — Carta dos Náufragos (protótipo implementado, em validação)**

- [x] Criar Atlas modal com posição real, rumo do navio e coordenadas das ilhas, sem viagem rápida.
- [x] Descobrir apenas ilhas ao alcance do radar existente; ilhas ocultas não aparecem.
- [x] Diferenciar ilhas visitadas, santuários, altares e a negociação política descoberta.
- [x] Abrir/fechar com M/ESC no teclado, View/B no Xbox ou toque no radar; congelar controles de navegação e canhões sob a carta.
- [x] Manter `SeaProfile` v4 e saves existentes intactos; observações são somente por expedição.
- [ ] Testar no Chromium 1600×900, 1280×720 e Android 390×844 com capturas de mapa e navegação.
- [ ] Integrar e conferir manualmente no Pages em dispositivo real.

**3.4b — Rumos da Carta (integrado à `main` em 16/10/2026, CI aprovado)**

- [x] Marcar e desmarcar um único destino já descoberto por toque/clique no marcador, setas + Enter ou direcional Xbox + A.
- [x] Exibir rumo absoluto (norte 0°), distância em unidades de mundo e correção relativa à proa.
- [x] Mostrar waypoint no radar/HUD durante a navegação, inclusive além do raio do radar (marcado na borda).
- [x] Conservar o waypoint apenas durante a expedição; negar seleção de ilhas ocultas; não alterar SeaProfile v4.
- [x] Ampliar QA Node e Chromium para seleção, rumo, HUD e integridade do save.
- [x] Testes automatizados Node e Chromium concluídos com sucesso; PR #33 integrado via squash merge (`d3cbc2d`).
- [ ] Conferir visualmente o Pages publicado e a atualização da PWA instalada; capturas de CI disponíveis para revisão.
- [ ] Testes manuais em Xbox real e PWA instalada.

**Posteriormente:** arte e símbolos autorais, escala mais detalhada e eventual persistência de descoberta apenas após migração planejada. [Especificação do Atlas](docs/atlas-3-4.md).

### P2 — 3.5: Áudio, efeitos e atmosfera

**3.5a — Paisagem Sonora Reativa (integrada à `main`; CI aprovado em 16/10/2026)**

- [x] Corrigir conflito entre `M` (Carta dos Náufragos) e áudio: `N` passa a silenciar/restaurar; botões do porto e Diário preservados.
- [x] Reutilizar as duas faixas existentes em seis contextos: porto, mar, ilha, negociação política, perigo e chefe.
- [x] Reaproveitar crossfade e preferências anteriores de volume; não introduzir áudio de terceiros nem alterar importação manual FLAC/MP3.
- [x] Adicionar testes de contexto, fades e atalhos, além de browser test M/N e CI.
- [x] Smoke, testes Node de áudio e testes Chromium de teclado/Atlas concluídos; [PR #34](https://github.com/pedromaintenance/o-mar-de-sangue/pull/34) integrado à `main` (`20e85a0`).
- [ ] Confirmar publicação e testar as transições **ouvindo** no GitHub Pages.
- [ ] Testar PWA offline e som com Xbox/Android físicos.

**3.5b — Mixagem Separada (integrada à `main`, CI aprovado em 16/10/2026)**

- [x] Volume da **música** separado do volume de **efeitos sonoros**, ambos com botões de incremento/decremento no rodapé do porto.
- [x] Manter botão de silenciar todos os sons; silenciar não apaga preferências individuais.
- [x] Manter chave de volume musical preexistente e criar apenas uma chave isolada de preferências de efeitos no navegador, sem migrar o `SeaProfile` v4.
- [x] Preservar o volume padrão de efeitos de jogadores antigos (100% do ganho já usado pelo motor); zerar efeitos evita sintetizar sons.
- [x] Cobrir persistência/recarregamento, mute mestre, clamping de volumes e acesso por mouse/toque/teclado no CI Node/Chromium.
- [x] Smoke, testes Node e Chromium aprovados; [PR #36](https://github.com/pedromaintenance/o-mar-de-sangue/pull/36) integrado via squash merge (`326225a`).
- [ ] Conferir a atualização no GitHub Pages, o áudio real e a PWA instalada/controle físico.

**3.5c — Planejado:** ampliar trilhas por contexto após seleção de arquivos; otimizar efeitos e FPS. [3.5a — Atmosfera](docs/soundscape-3-5.md) · [3.5b — Mixagem](docs/audio-mixer-3-5b.md).

### P2 — 3.6: Acessibilidade e robustez

**3.6a — PWA Resiliente (integrada à `main`; CI aprovado em 16/10/2026):**
- [x] Aviso de conexão offline e atualização do service worker com recarga somente por ação do jogador.
- [x] Identificar e eliminar duas referências inexistentes que impediam o `cache.addAll()`: `assets/abyss/manifest.json` e `assets/asset_pack_manifest.json`.
- [x] Acrescentar contrato do precache: todos os caminhos precached devem existir no repositório.
- [x] Testar instalação do service worker, recarga offline e expedição com save v4 intacto em Chrome desktop e Android emulado.
- [x] Smoke/Chromium verdes, incluindo viagem offline e verificação de 124 entradas válidas no precache; [PR #37](https://github.com/pedromaintenance/o-mar-de-sangue/pull/37) integrada (`b4f5956`). [Especificação](docs/pwa-3-6a.md).
- [ ] Conferir instalação real, troca offline/online e botão de atualização no Pages e em dispositivo físico.

**3.6b — Backup do Capitão (integrada à `main`; CI aprovado em 16/10/2026):**

- [x] Baixar uma cópia JSON v4 do perfil consolidado diretamente do Porto.
- [x] Oferecer backup antes da confirmação de apagar todo o progresso, sem alterar as opções originais.
- [x] Usar apenas leitura de `SeaProfile.load()`, sem sobrescrever saves, economia ou campanha.
- [x] Testar arquivo real no Chromium em desktop e Android emulado, preservando `localStorage`.
- [x] CI Node e Chromium aprovados; [PR #38](https://github.com/pedromaintenance/o-mar-de-sangue/pull/38) integrado (`f1f4e60`). [Design e QA](docs/captain-backup-3-6b.md).
- [ ] Conferir o download JSON na versão publicada do Pages e na PWA instalada.

**3.6c — Restauração Segura (integrada à `main`; CI aprovado em 16/10/2026):**

- [x] Importar backups JSON v4 exportados pelo Capitão, limitados a 256 KB e esquema estrito, sem código arbitrário.
- [x] Mostrar diferenças do progresso atual e do importado antes de qualquer gravação.
- [x] Exigir dois cliques/ações independentes de confirmação; cancelar não modifica o save.
- [x] Guardar snapshot local do save atual **antes** da escrita e permitir desfazer a última restauração.
- [x] Recusar dados v3/v5, campos inesperados e níveis inválidos; não alterar música, física, combate ou save v4.
- [x] Adicionar testes Node e Chromium de restauração, undo, falhas de armazenamento e Android emulado.
- [x] CI smoke/Chromium verdes; [PR #39](https://github.com/pedromaintenance/o-mar-de-sangue/pull/39) integrado via squash (`d26718c`). [Especificação e QA](docs/captain-restore-3-6c.md).
- [ ] Conferir no Pages e PWA instalada importação, cancelamento e desfazer.

**3.6d — Diálogos Acessíveis (integrada à `main`; CI aprovado em 16/10/2026):**

- [x] Identificar semanticamente a comparação dos saves v4 para leitores de tela, com cabeçalhos e células nomeados.
- [x] Anunciar a confirmação destrutiva e manter o foco inicial em **CANCELAR**.
- [x] Explicar no Diário de Bordo os controles de backup e restauração com teclado/controle.
- [x] Testar ESC e B do Xbox cancelando a restauração sem qualquer gravação; validar layout desktop/Android em Chromium.
- [x] Smoke e Chromium aprovados (desktop e Android emulado); [PR #40](https://github.com/pedromaintenance/o-mar-de-sangue/pull/40) integrado (`3a8e3a7`). [Design e testes](docs/critical-dialog-accessibility-3-6d.md).
- [ ] Conferir leitor de tela, teclado e Xbox físicos e a atualização do Pages/PWA.

**3.6e — Leitura Ampliada (integrada à `main`; CI aprovado em 16/10/2026):**

- [x] Incluir botão reversível **AMPLIAR TEXTO / TEXTO PADRÃO** no rodapé do Porto.
- [x] Ampliar textos de menu, Diário, estaleiro e comparação de saves preservando responsividade (Android em duas colunas na barra de status).
- [x] Salvar a preferência em chave isolada de `localStorage`, sem mudar `SeaProfile` v4, áudio ou PWA.
- [x] Cobrir alternância por botão, `aria-pressed`, tamanho computado e ausência de overflow no Chromium em 1600×900, 1280×720 e Android 390×844.
- [x] CI smoke e Chromium (1600×900, 1280×720, Android 390×844) aprovados; [PR #41](https://github.com/pedromaintenance/o-mar-de-sangue/pull/41) integrado (`11f8ceb`). [Escopo e QA](docs/port-readability-3-6e.md).
- [ ] Conferir no Pages/PWA, leitor de tela e Xbox físico.

**3.6f — Guias Contextuais da Viagem (integrada à `main`; CI aprovado em 17/10/2026):**

- [x] Padronizar os comandos exibidos em pausa, Carta e encontros (↑↓/direcional, Enter/A, ESC/B, toque).
- [x] Adicionar instrução de sobreposições ao Diário de Bordo, preservando teclado/gamepad/hitboxes existentes.
- [x] Testar contrato de opções e hitboxes por Node, e geometria das legendas diante dos botões de retorno no Chromium desktop/Android emulado.
- [x] CI smoke e Chromium verdes, inclusive geometria das legendas; [PR #42](https://github.com/pedromaintenance/o-mar-de-sangue/pull/42) integrado via squash (`e143a4e`). [Design e QA](docs/voyage-control-guides-3-6f.md).
- [ ] Conferir no Pages/PWA e em controle Xbox/Android físicos.

**3.6g — Diagnóstico Optativo de Desempenho (integrado à `main`; CI aprovado em 17/10/2026):**

- [x] Medir FPS aproximado, média/pico de duração de quadro e contagem de quadros >33 ms com amostragem limitada a uma atualização de texto por segundo.
- [x] Alternar no rodapé do Porto e com F3 em viagem, persistindo apenas preferência isolada em `localStorage`.
- [x] Não criar objetos gráficos nem amostrar métricas quando desligado; destruir sobreposição na saída da expedição.
- [x] Testar Node, Chrome e Android emulado para leitura de números, posicionamento, persistência e save v4 intacto.
- [x] Smoke/Chromium verdes; [PR #43](https://github.com/pedromaintenance/o-mar-de-sangue/pull/43) integrado por squash (`ee2396e`). [Especificação](docs/performance-diagnostics-3-6g.md).
- [ ] Conferir o indicador no Pages/PWA em celulares modestos e com controle físico.

**3.6h — Relatório FPS Exportável (integrada à `main`; CI aprovado em 17/10/2026):**

- [x] Reter até 180 janelas de aproximadamente 1 segundo, exclusivamente na memória, descartando as mais antigas com indicador `truncated`.
- [x] Calcular FPS mínimo, mediano e médio, pico de quadro e contagem de quadros lentos entre as amostras retidas.
- [x] Disponibilizar **BAIXAR RELATÓRIO FPS** no Porto somente quando houver medição real; gerar JSON sem dados do save.
- [x] Cobrir isolamento de dados, vida útil da sessão, download e visual desktop/Android por testes Node e Chromium.
- [x] CI `port-smoke` e `port-visual` verdes; [PR #44](https://github.com/pedromaintenance/o-mar-de-sangue/pull/44) integrado por squash (`fa2ccf6`). [Escopo e QA](docs/fps-export-report-3-6h.md).
- [ ] Conferir download e captura no Pages/PWA em aparelhos reais.

**3.6i — Comparador Local de FPS (integrado à `main`; CI aprovado em 17/10/2026):**

- [x] Validar exatamente dois relatórios FPS v1 locais por formato, tamanho, limites numéricos e ordem temporal, sem importar textos não confiáveis à interface.
- [x] Comparar FPS médio, mediano e mínimo, pior tempo de quadro e contagens, com diferença B − A em tabela responsiva.
- [x] Destacar limitações de capturas curtas, durações diferentes, modos de visualização distintos, perda de amostras e sessões incompletas.
- [x] Garantir operação offline, isolamento do save v4 e descarte do comparativo ao voltar ao Porto.
- [x] Adicionar testes Node e Chromium desktop/Android para arquivos válidos, inválidos, cancelamento e layout.
- [x] CI `port-smoke` e `port-visual` verdes; [PR #45](https://github.com/pedromaintenance/o-mar-de-sangue/pull/45) integrado por squash (`76e33ab`). [Design e QA](docs/fps-comparison-3-6i.md).
- [ ] Verificar comparações no Pages, Android físico e PWA instalada.

**3.6j — Cache de Redesenho do Clima (integrado à `main`; CI aprovado em 17/10/2026):**

- [x] Evitar repetição de `setAlpha`/`setFillStyle` em clima inalterado, preservando os valores originais.
- [x] Eliminar limpezas redundantes do céu e remoinho quando inativos, sem alterar a animação em tempestade, neblina ou remoinho.
- [x] Redesenhar o rótulo/barra da maldição somente quando o texto, cor ou largura visível em pixels muda.
- [x] Adicionar regressões Node e Chromium desktop/Android para chamadas gráficas e transições, sem alterar física, IA ou save.
- [x] CI `port-smoke` e `port-visual` aprovados; [PR #46](https://github.com/pedromaintenance/o-mar-de-sangue/pull/46) integrado via squash (`7b4e8d2`). [Documentação técnica](docs/weather-render-cache-3-6j.md).
- [ ] Testar no Pages/PWA com dispositivos físicos, medir FPS sem atribuir ganho sem benchmark.

**3.6k — Cache Determinístico do Mar Procedural (integrado à `main`; CI aprovado em 17/10/2026):**

- [x] Reutilizar posições fixas dos 190/110 vestígios e 11 faixas decorativas, com cache local à cena e reinicialização em cada viagem.
- [x] Reutilizar hashes da cintilação até a janela `Math.floor(t*1.5)` mudar, sem alterar ritmo ou geometria.
- [x] Comparar todas as operações de desenho com uma referência da 3.6j em vários climas, graus de maldição, câmeras e instantes no Node.
- [x] Verificar no Chromium o cache ativo durante uma viagem real e a ausência de gravações de save.
- [x] CI `port-smoke` e `port-visual` aprovados; [PR #47](https://github.com/pedromaintenance/o-mar-de-sangue/pull/47) integrado via squash (`c2634cc`). [Documentação e QA](docs/procedural-sea-cache-3-6k.md).
- [ ] Verificar a água no Pages, Android/PWA e colher relatórios FPS em aparelhos reais.

**3.6l — Telemetria de Orçamento dos Efeitos (integrada à `main` em 17/10/2026; PR #48, CI do PR verde):**

- [x] Instrumentar passivamente o orçamento **já existente** (48 efeitos `burst` / `v15Burst`) quando o diagnóstico FPS estiver ligado, sem criar ou eliminar partículas.
- [x] Acrescentar à janela de FPS e ao JSON v1 campos opcionais de média, pico e quadros no limite; preservar compatibilidade com relatórios antigos.
- [x] Adicionar comparação opcional de carga FX entre dois relatórios e alertas de incerteza; validar valores importados.
- [x] Incluir testes Node, verificações em Chromium e cache PWA v52 sem mudar `Game.js`, save, controles, física, IA ou o orçamento visual.
- [x] CI `port-smoke` e `port-visual` aprovados no PR; squash merge [#48](https://github.com/pedromaintenance/o-mar-de-sangue/pull/48) (`d7b554c`).
- [x] Deploy GitHub Pages confirmado em 17/10/2026 após o merge (run [39037006934](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39037006934)); CI na `main` também aprovado.
- [ ] Verificar FPS/PWA em aparelho físico e colher relatórios reais.
- [ ] Coletar relatórios comparáveis de mar calmo vs. eventos/combate. **Ainda não há benchmark real justificando redução de partículas.**
- [Especificação, limitações e roteiro de QA](docs/effect-budget-3-6l.md).

**3.6l.1 — Comparação Normalizada de FPS (integrada à `main` em 17/10/2026):**

- [x] Adicionar **LENTOS / 1.000** atualizações retidas, mantendo os seis indicadores absolutos e a diferença B − A.
- [x] Adicionar **FX NO LIMITE / 1.000** somente quando os dois arquivos JSON incluem a telemetria 3.6l.
- [x] Conferir que totais de quadros e quadros lentos importados correspondem às amostras; manter compatibilidade com FPS v1 anteriores.
- [x] Atualizar Diário de Bordo, testes Node/Chromium, workflow CI e cache offline PWA v53.
- [x] `port-smoke` e `port-visual` verdes no PR; [PR #49](https://github.com/pedromaintenance/o-mar-de-sangue/pull/49) integrado via squash (`4b5ca20`).
- [x] CI pós-merge na `main` aprovado ([run 39039034306](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39039034306)); [GitHub Pages](https://pedromaintenance.github.io/o-mar-de-sangue/) publicado em 17/10/2026 ([run 39039056469](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39039056469)).
- [ ] Testar comparações com medições reais no mesmo dispositivo; **ainda não há dados justificando redução de partículas**.
- [Especificação e roteiro de QA](docs/fps-normalization-3-6l1.md).

## Novo ciclo de gameplay — 3.7 a 4.0 (proposta de 17/10/2026)

**Princípio:** a evolução seguinte deve ampliar **o que o jogador pode escolher e como pode vencer**, não apenas aumentar dano, vida e número de inimigos. Nenhum item abaixo marcado como planejado é uma funcionalidade publicada.

### 3.7 — A Costa dos Condenados: contratos, eventos e rotas

**3.7a.1 — Resgate dos Afogados (publicada em 17/10/2026):**
- [x] Adicionar ao Porto um quadro acessível de **CONTRATOS DA COSTA SUL**, com um contrato real e retorno seguro.
- [x] Nova expedição **Resgate dos Afogados** em modo sandbox já existente: recolher sobreviventes em um naufrágio e entregá-los a Deméter; sem nova modalidade no save.
- [x] Marcar somente o destino atual no Atlas: o ponto de entrega é revelado apenas após o resgate. Permitir entrega mesmo em santuário já visitado.
- [x] Manter atracação lenta/sem inimigos próximos, combates e controles existentes; suspender ondas de 52 s apenas durante a expedição de contrato.
- [x] Premiar com 125 ouro exclusivamente ao concluir a entrega; retirada ou derrota sem bônus. Não avançar missão nem alterar reputação/save v4.
- [x] Incluir documentação, teste Node e percurso funcional automatizado em Chromium desktop/Android; PWA offline v54.
- [x] PR [#50](https://github.com/pedromaintenance/o-mar-de-sangue/pull/50) aprovado (Node e Chromium desktop/Android), squash merge `412856c`.
- [x] Publicação concluída no [GitHub Pages](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39067335133](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39067335133)).
- [x] CI pós-merge `port-smoke` / `port-visual` aprovado na `main` ([run 39067335575](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39067335575)).
- [ ] Validar no controle Xbox e Android físicos, PWA offline e sessões longas.
- [Especificação, anti-replay e roteiro de QA](docs/contracts-rescue-3-7a.md).

**3.7a.2 — Pólvora sem Bandeira: Contrabando (publicado em 17/10/2026):**
- [x] Expandir o quadro **CONTRATOS DA COSTA SUL** para dois contratos independentes, sem alterar a campanha ou o save v4.
- [x] Carga clandestina embarcada desde o início; ruína real de destino marcada na Carta, sem revelar outras ilhas.
- [x] Introduzir **patrulha fiscal da Corte** após seis segundos, com suspeita de 0–100% que sobe por proximidade e cai ao fugir/afundar o fiscal; telemetria no objetivo.
- [x] Confisco aos 100%: retorno ao Porto por apreensão, bônus zero e resultado específico, sem fingir naufrágio.
- [x] Duas decisões de entrega: clandestina com suspeita <60% (190 ouro, +12 maldição) ou suborno à Corte (115 ouro, sem maldição adicional); validação e proteção contra pagamentos duplicados.
- [x] Integrar atracação existente, inclusive ruína já visitada, feedback de suspeita, recompensa no settlement normal e PWA offline v55.
- [x] Adicionar testes Node e Chromium em três viewports ao workflow; preservar o teste de resgate 3.7a.1.
- [x] PR [#51](https://github.com/pedromaintenance/o-mar-de-sangue/pull/51) aprovado (Node e Chromium nas três resoluções), integrado por squash (`baf76d7`).
- [x] CI pós-merge na `main` aprovado ([run 39072990117](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39072990117)); [GitHub Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39072989625](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39072989625)).
- [ ] Teste físico Android/Xbox/PWA e balanceamento após relatos de jogabilidade.
- [Documentação de regras, riscos, QA e limites](docs/contracts-smuggling-3-7a2.md).

**3.7a.3 — A Caçada dos Condenados (publicada em 18/10/2026):**

- [x] Adicionar terceiro contrato da Costa Sul: **investigar um naufrágio → descobrir a fragata fugitiva → interceptá-la e afundá-la antes de escapar**.
- [x] Alvo único com +25% casco, nome próprio, IA de fuga rumo à borda oposta e aceleração ao ser perseguido; **105 segundos** após ler a pista para capturá-lo.
- [x] Indicar na Carta a posição real do navio marcado, sem revelar outras ilhas nem criar autopiloto.
- [x] Concluir com **240 ouro somente após destruir o alvo exato**; fuga ou prazo esgotado encerram o contrato sem comissão. Não há sistema de captura/rendição nesta etapa — fica reservado à Abordagem Naval 3.8c.
- [x] Preservar sandbox, missões anteriores, resgate, contrabando, save v4, controladores e PWA offline v63.
- [x] Testes de regras e anti-replay para pista, fuga, alvo errado, prazo e ausência de escrita no save.
- [x] [PR #59](https://github.com/pedromaintenance/o-mar-de-sangue/pull/59) integrado por squash (`e3bfd44`); `port-smoke` e `port-visual` verdes no PR e pós-merge da `main` ([run 39190646695](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39190646695)).
- [x] [GitHub Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39190647027](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39190647027)) com PWA offline v63.
- [ ] Testar dificuldade e legibilidade em desktop, Android e controle físico.
- [Especificação e roteiro de QA](docs/contracts-hunt-3-7a3.md).

**3.7b — Eventos dinâmicos (planejado):** navios pedindo socorro, perseguições, encontros com sobreviventes/cultistas/Corte e decisões com impacto em rota, risco e recursos. Criar limites de frequência para preservar combate e exploração.

**3.7c — Rotas perigosas (planejado):** três perfis de rota para contratos (curta/patrulhada, longa/perigosa, sobrenatural/maldição). Reaproveitar Atlas e condições climáticas existentes, sem introduzir autopiloto ou spoiler de locais desconhecidos.

**Critérios da fase:** pelo menos três objetivos jogáveis distintos, mapa útil à decisão, falha/retirada bem definidas, nenhum bloqueio de missão e controles/CI protegidos.

### 3.8 — Ferro, Pólvora e Sangue (primeiro marco em validação)

**3.8a.0 — Salva Preparada, Recuo e Predadores do Mar (publicado em 17/10/2026):**

- [x] Trocar disparo imediato por **segurar o comando** em teclado, Xbox e toque, com carga independente por bordo e cancelamento ao soltar.
- [x] Iniciar em **2000 ms** e reduzir o tempo por `2000 × exp(-0,105 × nível de Serventes Treinados)`, preservando recarga/limites preexistentes.
- [x] Barras do HUD exibem carga de bombordo/estibordo sem mudar suas posições ou áreas de toque.
- [x] Recuo de cada salva proporcional ao poder de fogo e número de projéteis; **Escoras do Abismo** amortecem exponencialmente; navios inimigos sofrem recuo proporcional à massa.
- [x] Navios inimigos carregam salvas com tempo inicial de 2 s na dificuldade 1 e progressão exponencial na dificuldade.
- [x] Criaturas marinhas deixam de lançar projéteis: enguias, afogados, coral, caranguejo, tartaruga e Dagon investem fisicamente; Kraken mantém tentáculo próximo; fases de invocação de Dagon preservadas.
- [x] Testes Node, HUD Chromium em três viewports, documentação e cache PWA v56; mantém save v4 e níveis de estaleiro.
- [x] PR [#52](https://github.com/pedromaintenance/o-mar-de-sangue/pull/52) aprovado (Node e Chromium nas três resoluções), integrado por squash (`74c28be`).
- [x] CI pós-merge na `main` aprovado ([run 39076723611](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39076723611)); [Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39076723306](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39076723306)).
- [ ] Validar controle Xbox e Android físicos, PWA offline instalado e balanceamento dos níveis de carga/recuo.
- [Especificação, cálculos e roteiro de QA](docs/gunnery-charge-recoil-3-8a.md).

**3.8a.1 — Uma Salva por Acionamento (correção publicada em 17/10/2026):**

- [x] Corrigir o disparo automático indesejado da 3.8a.0: **um único tiro por pressão e carga**, obrigatoriamente **soltar para rearmar**. Segurar indefinidamente não repete o tiro.
- [x] Rearme independente por bordo para Q/E/ESPAÇO, gatilhos Xbox, botões de toque, fontes de input simultâneas e dois dedos no mesmo botão; sem perder a preparação exponencial de 2 segundos.
- [x] Interromper cargas em pausa/Atlas/doca/blur sem conceder salvas gratuitas ou reiniciar carga na mesma pressão.
- [x] Atualizar instruções de jogo/Diário, cache PWA v57, teste de regressão com 15 s pressionados, níveis altíssimos e validação Chromium.
- [x] PR [#53](https://github.com/pedromaintenance/o-mar-de-sangue/pull/53) integrado por squash (`62a2532`); `port-smoke` e `port-visual` verdes no PR e pós-merge na `main` ([run 39086251515](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39086251515)).
- [x] Correção publicada no [GitHub Pages](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39086251234](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39086251234)); PWA cache v57 validado em Chromium.
- [ ] Confirmar controles físicos e balanceamento com jogadores.
- [Diagnóstico, protocolo de testes e nova regra](docs/gunnery-single-shot-3-8a1.md).

**3.8a.2 — Preparação com Custo de Velocidade e Recuo Perceptível (publicada em 17/10/2026):**

- [x] **Manter o comando segurar**: só dispara após completar a carga (2 s inicialmente); soltar antes cancela, manter após a salva não gera outro tiro. Rearmar exige soltura e nova pressão, individualmente em cada bordo.
- [x] **Custo tático real de preparar canhões**: com um bordo, velocidade máxima 60% e aceleração 55%; com dois bordos, 45% e 38%; arrasto extra apenas durante a preparação, sem alterar as condições de movimento fora dela.
- [x] **Recuo físico perceptível**: aumentar de ~11 para ~65 unidades de impulso lateral no navio inicial; reduzir arrasto lateral por 0,5 s após a salva e adicionar breve inclinação do casco e tremor discreto de câmera.
- [x] Manter recuo escalonado com dano/projéteis e mitigado por Escoras do Abismo; manter sprite/hitbox, progressão de estaleiro, save v4 e os monstros marinhos sem tiros.
- [x] Atualizar orientações de tela e Diário, PWA offline v58, testes de física com Game.js real e QA visual nas três resoluções.
- [x] [PR #54](https://github.com/pedromaintenance/o-mar-de-sangue/pull/54) integrado por squash (`8f92a3e`), com `port-smoke` e `port-visual` aprovados no PR e pós-merge ([run 39088831585](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39088831585)).
- [x] [GitHub Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39088831479](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39088831479)); cache offline v58.
- [ ] Testar a sensação de perda de velocidade e recuo em teclado/Xbox/Android físicos e ajustar valores conforme feedback.
- [Especificação e roteiro de QA](docs/braced-gunnery-recoil-3-8a2.md).

**3.8a.3 — Faísca da Mecha dos Canhões (publicada em 18/10/2026):**

- [x] Converter o atlas de faíscas aprovado em um PNG de produção **480×96**, cinco quadros transparentes de 96×96, otimizado em ~3,9 KB (`assets/fx/cannon_charge_sparks.png`).
- [x] Animar a faísca gradualmente durante a **preparação ao segurar Q/E, ESPAÇO, Xbox e toque**, com posições separadas e discretas por bordo, acompanhando o navio, sem ocultar centro ou HUD.
- [x] Apagar instantaneamente ao soltar antes do tiro, pausar, atracar ou abrir Atlas; impedir reativação enquanto o disparo único permanece travado, sem alterar o clarão de tiro existente.
- [x] Renderizar somente dois sprites reutilizados (sem criação de partículas por quadro, sem tocar em `effectsLimit=48`), mantendo save v4, física, velocidade, inimigos e contratos intactos.
- [x] Adicionar teste Node do PNG/quadros/cancelamento/orçamento, inspeção Chromium desktop/mobile, módulo JS isolado e cache offline PWA **v59**.
- [x] PR [#55](https://github.com/pedromaintenance/o-mar-de-sangue/pull/55) integrado por squash (`922e850`), com **port-smoke/port-visual aprovados no PR e pós-merge na main** ([run 39116274770](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39116274770)).
- [x] [GitHub Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39116274514](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39116274514)), com asset local e cache PWA v59.
- [ ] Validar brilho e intensidade em dispositivo físico (desktop, Android, Xbox).
- [Especificação do asset, implementação e testes](docs/cannon-fuse-sparks-3-8a3.md).

**3.8a.4 — Horror de Coral: Correção do Sprite (publicada em 18/10/2026):**

- [x] Identificar a causa no **PNG ativo** `assets/v15/beast_coral.png`, que continha uma faixa superior de pixels soltos (não em `assets/abyss/coral_horror.png` nem na lógica de colisão).
- [x] **Corrigir o arquivo binário**, recortando exatamente 28 linhas contaminadas (**323×330 → 323×302**) sem mudar o corpo, os tentáculos ou o estilo do monstro. Guardar reparo reproduzível em `tools/repair_coral_png.py`.
- [x] Manter textura `v15-coral`, raio 76, escala proporcional e todas as regras de spawn, combate e movimentação; não alterar save v4.
- [x] Bump de cache offline **PWA v60**, teste Node de integridade PNG/CRC e teste visual do monstro real nas três resoluções.
- [x] PR [#56](https://github.com/pedromaintenance/o-mar-de-sangue/pull/56) integrado por squash (`686b0f7`); `port-smoke` e `port-visual` aprovados no PR e pós-merge ([run 39117992857](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39117992857)).
- [x] [GitHub Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39117992501](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39117992501)), cache PWA v60.
- [ ] Confirmar em desktop/celular físico que não há fragmentos soltos durante a rotação.
- [Relatório de causa, correção e QA](docs/coral-horror-asset-fix-3-8a4.md).

**3.8a.5 — Faísca de Ignição Legível: correção do borrão escuro (publicada em 18/10/2026):**

- [x] Diagnosticar o sprite 3.8a.3: **PNG de produção com fluxo IDAT corrompido**, não detectado por verificação apenas do cabeçalho; fumaça escura e opacidade/escala reduzidas também prejudicavam o efeito.
- [x] Substituir de fato o asset por **PNG RGBA 480×96 válido**, cinco quadros com faíscas douradas progressivas e transparência ampla, sem borrões pretos. Script de geração reproduzível em `tools/rebuild_cannon_sparks.py`, sprite final ~2,2 KB.
- [x] Aplicar `Phaser.BlendModes.ADD` aos dois sprites reutilizados de bombordo/estibordo, aumentar discretamente escala/opacidade e preservar cancelamento, disparo único, controles e orçamento FX.
- [x] Incluir teste **completo de decodificação PNG** (`CRC + IDAT + filtros + pixels`) e verificações de luz/alpha por quadro para evitar nova regressão, além de QA Phaser desktop/mobile; PWA v61.
- [x] [PR #57](https://github.com/pedromaintenance/o-mar-de-sangue/pull/57) integrado por squash (`f6924ab`); `port-smoke` e `port-visual` aprovados no PR e pós-merge na `main` ([run 39176430439](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39176430439)).
- [x] [GitHub Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39176430237](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39176430237)), PNG luminoso corrigido e PWA v61.
- [ ] Validar em desktop e celular físico a legibilidade contra o Mar de Sangue sem poluir o combate.
- [Relatório da falha, reparo e testes](docs/bright-cannon-sparks-3-8a5.md).

### 3.8 — Ferro, Pólvora e Sangue (próximas armas/abordagem planejadas)

- **3.8a — Equipamentos ativos:** selecionar entre arpão, morteiro, fumaça e pólvora amaldiçoada, com usos, recargas e limites explícitos, sem desbalancear os canhões normais.
- **3.8c — Abordagem naval:** opção após enfraquecer/imobilizar inimigos, com saquear, libertar cativos ou capturar, inclusive risco de perda e consequência política.
- **3.8d — Danos localizados:** velas, leme e canhões com efeitos temporários e telegráficos, evitando simulação excessivamente complexa.
- **Dependência:** testes de interface e de IA, preservação das hitboxes touch/Xbox e economia/recompensas não exploráveis.

### 3.8b — Arrancada Naval (publicada em 18/10/2026)

- [x] **Botão IMPULSO**, com `R` no teclado, `X` no controle Xbox e botão próprio no toque/mouse (desktop 613,77; celular 240,616).
- [x] Impulso de **0,7 segundo**, multiplicador máximo **1,85×** do teto normal, impulso imediato para escapar/abalroar sem invulnerabilidade; desacelera gradualmente até a velocidade normal.
- [x] **Recarga de 10 segundos** inicialmente, diminuindo com a melhoria **Mestres da Arrancada** no Estaleiro/Motor conforme `T(n)=2+8×exp(-0,13n)`, com limite assintótico de **2 segundos**.
- [x] Prevenir repetições de entrada e recargas ilegais, interromper preparação de canhões ao impulsionar, preservar risco físico e colisões preexistentes.
- [x] Preservar **save v4** e aceitar imports legados de 14 melhorias e novos de 15, sem alteração de progresso; PWA **v62**.
- [x] Testes Node para matemática/input/save e Chromium nas resoluções 1600×900, 1280×720 e 390×844, incluindo alvo tátil e cooldown.
- [x] PR [#58](https://github.com/pedromaintenance/o-mar-de-sangue/pull/58) integrado por squash (`aa59e7f`), `port-smoke` e `port-visual` verdes no PR e pós-merge da `main` ([run 39185589085](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39185589085)).
- [x] [GitHub Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39185589073](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39185589073)) com cache offline v62.
- [ ] Validação física de teclado, controle Xbox, touch, abalroamentos e riscos da aceleração.
- [Especificação, fórmulas, compatibilidade e testes](docs/naval-impulse-3-8b.md).

### 3.9 — Os Homens do Convés (proposto, não implementado)

- **3.9a — Oficiais:** timoneiro, artilheiro, carpinteiro e navegador com função tática distinta. Preferir dois ou três slots com decisões relevantes a dezenas de atributos.
- **3.9b — Interesses da tripulação:** personagens reagem a escolhas e condições materiais sem moralidade simplista ou micromanagement de fome.
- **3.9c — Especialização do navio:** estilos de construção rápida, blindada, saqueadora ou sobrenatural. Definir caps/alternativas antes de adicionar upgrades permanentes.
- **Dependência:** balancear interface do estaleiro; qualquer persistência além do save v4 exige design e migração aprovados.

### 4.0 — As Três Bandeiras (proposto, não implementado)

- **4.0a — Reputação e dívidas:** relações independentes de sobreviventes, Corte Feérica e culto de Daegon; definir efeitos e limites antes de realizar migração testada `v4→v5` (ver [proposta 3.3b](docs/reputation-3-3b-design.md)).
- **4.0b — Domínio de rotas/portos:** pedágios, bloqueios, informações e refúgios vinculados a relações políticas.
- **4.0c — Campanhas divergentes:** proteger comunidades, colaborar com a Corte, buscar pactos ou recusar alinhamentos permanentes.
- **4.0d — Consequências narrativas:** encontros posteriores e respostas materiais ao histórico político do jogador, com alternativas viáveis.
- **Dependência:** salvamento/migração reversível, campanha balanceada e aprovação da lore; evitar tratar facções como alinhamentos morais fixos.

**Ordem tática de implementação:** 3.7a.1 → 3.7a.2/3.7a.3 → eventos/rotas → equipamentos ativos → abordagem → tripulação → reputação persistente → campanha ramificada.

**Regras de proteção:** publicar apenas marcos testados; distinguir proposta de entrega; preservar progresso do jogador, acessibilidade, PWA offline e funcionamento das versões anteriores. Desempenho 3.6m segue **condicionado a medições** em aparelhos reais, não bloqueia gameplay novo.

**3.6m — Condicionada a evidências:** avaliar otimizações conservadoras de efeitos apenas com medições repetidas e referência de equivalência visual.

**Outros trabalhos:** foco sem mouse, testes Xbox físico, leitor de tela e PWA instalada/reconexão reais.

## Regras técnicas que protegem as funcionalidades

1. **Menus do porto:** `PortUI.js` contém as ações e a navegação; `PortUI.css` e `PortThemeAbyss.css` ficam responsáveis pela apresentação.
2. **Combate:** `Game.js` e suas regras são fonte da verdade; `SeaMenus.js` apresenta o modal de pausa, `SeaIslands.js` apresenta os encontros costeiros.
3. **Contrato de controles:** A confirma, B retorna, LB/RB ou Q/E trocam as abas do estaleiro; as abas não entram no percurso de foco do controle.
4. **Persistência:** não mudar a estrutura de `SeaProfile` sem migração testada e plano de reversão.
5. **PWA:** mudanças visíveis exigem incremento do `CACHE_NAME` em `sw.js` e inclusão de novos recursos no precache, se aplicável.
6. **Revisão:** todo PR deve documentar escopo, riscos, arquivos modificados, casos testados e screenshots de mudanças visuais.
7. **Reversibilidade:** priorizar alterações isoladas que possam ser revertidas sem desfazer mecânicas ou dados de jogadores.

## Critérios padrão de QA / Definition of Done

- `node --check` nos arquivos JavaScript modificados.
- Testes Node de contrato do menu, botões e efeitos de escolhas.
- Testes Chromium em **1600×900, 1280×720 e 390×844**, com screenshots anexadas ao GitHub Actions.
- Controle Xbox, teclado, mouse e toque sem regressões funcionais conhecidas.
- Save e progresso anteriores preservados; PWA revalidada se houver mudança de cache.
- PR integrado à `main` **somente depois** de os testes obrigatórios estarem verdes.
- Roadmap atualizado na mesma entrega; mudanças puramente estéticas não devem alterar o balanço.

## Próxima execução sugerida

**Executar Sprint 01 — Ecos da Maré Sangrenta**, priorizando narrativa política e diversidade de encontros, sem interromper a validação do HUD paisagem de 26/10. Sprint 02 (captura e especializações temporárias) e Sprint 03 (reputação persistente e possíveis mudanças do save) dependem de avaliação separada. A migração v4→v5 não é pré-requisito em pré-alfa.

O roadmap não é uma promessa de datas; a ordem pode mudar conforme testes, bugs e feedback dos jogadores.
