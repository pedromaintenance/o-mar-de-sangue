# Roadmap — O Mar de Sangue

**Identidade:** horror naval, horror cósmico e conflito político no universo da **Carcaça**.  
**Plataforma atual:** jogo web estático (GitHub Pages), PWA offline, Phaser + porto HTML/CSS.  
**Atualização:** 16 de outubro de 2026.  
**Responsabilidade:** itens marcados como planejados são propostas; ainda não foram implementados ou aprovados como recursos.

> **Princípio de desenvolvimento:** evoluir a experiência sem reescrever subsistemas que já funcionam. Separar apresentação de regras; preservar saves, acessibilidade básica, funcionamento offline, mouse/toque, teclado e controle Xbox. Toda interface nova deve passar por testes de regressão antes do merge.

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
| **3.6a — PWA Resiliente** | 🟡 PR #37 em validação | Aviso offline e atualização voluntária, viagem offline testável; [PR #37](https://github.com/pedromaintenance/o-mar-de-sangue/pull/37) ainda sem merge |
| **3.6b — Backup do Capitão** | 🟡 Implementada; CI pendente | Download manual JSON do save v4 sem modificação; opção de segurança antes do reset; [especificação](docs/captain-backup-3-6b.md) |

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

**3.6a — PWA Resiliente:** [PR #37](https://github.com/pedromaintenance/o-mar-de-sangue/pull/37) implementou aviso offline, update opt-in e teste de navegação sem internet; permanece aguardando aprovação integral do CI para merge. [Detalhes](docs/pwa-3-6a.md) na branch do PR.

**3.6b — Backup do Capitão (implementada, sob CI):**

- [x] Baixar uma cópia JSON v4 do perfil consolidado diretamente do Porto.
- [x] Oferecer backup antes da confirmação de apagar todo o progresso, sem alterar as opções originais.
- [x] Usar apenas leitura de `SeaProfile.load()`, sem sobrescrever saves, economia ou campanha.
- [x] Testar arquivo real no Chromium em desktop e Android emulado, preservando `localStorage`.
- [ ] Testes CI verdes, merge e verificação de download no Pages. [Design e QA](docs/captain-backup-3-6b.md).

**3.6c — Planejado:** restauração de backup após validação estrita, pré-visualização, confirmação explícita e preservação automática do save anterior.

**Outros trabalhos:** consolidar guia de controles Xbox/teclado/toque, revisar navegação sem mouse e desempenho em celulares modestos, testar PWA instalada e reconexão reais.

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

Validar os PRs #37 (PWA offline) e #38 (Backup do Capitão) separadamente; conferir ambos no GitHub Pages após merge. Antes de implementar **3.3b — Reputação persistente**, aprovar regras e migração v4→v5. Continuam pendentes as verificações físicas de Xbox, Android, Atlas e áudio.

O roadmap não é uma promessa de datas; a ordem pode mudar conforme testes, bugs e feedback dos jogadores.
