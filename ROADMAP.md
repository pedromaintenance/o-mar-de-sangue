# Roadmap — O Mar de Sangue

**Identidade:** horror naval, horror cósmico e conflito político no universo da **Carcaça**.  
**Plataforma atual:** jogo web estático (GitHub Pages), PWA offline, Phaser + porto HTML/CSS.  
**Atualização:** 15 de outubro de 2026.  
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
| **3.2 — HUD de combate** | 🟡 Em validação | Casco/recarga com contraste, estado do mar, maldição e alertas; implementação no PR desta etapa, pendente de QA |

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
- [ ] Validar capturas e contraste em 1600×900, 1280×720 e 390×844 no navegador real.
- [x] Preservar geometria de hitboxes, posição da carta, joystick, canhões, pausa e valores de jogo; adicionar testes de contrato.

**Pronto quando:** leitura clara em 390 px e desktop, alertas reconhecíveis, screenshots comparativas e regressão de toque/canhões aprovada.

### P1 — 3.3: Eventos narrativos e política do Mar de Sangue

**Objetivo:** fazer a viagem expressar conflitos entre **cultistas, feéricos e sobreviventes**, não apenas combate.

- [ ] Desenhar a estrutura de eventos com **apresentação, decisão e consequência**, respeitando a lore canônica da Carcaça.
- [ ] Propor facções, barganhas, reputação e custos das decisões antes de codificar suas regras.
- [ ] Implementar primeiro um pequeno encontro vertical (protótipo) e validar a escrita e os efeitos.
- [ ] Registrar o modelo de dados e prever a migração dos saves, se novos campos forem necessários.

**Pronto quando:** evento testável com escolhas significativas, estado persistido sem corromper o save anterior e retorno seguro à navegação.

### P2 — 3.4: Atlas e orientação

- [ ] Revisar radar/mapa, descoberta de ilhas e sinalização de perigos.
- [ ] Distinguir rotas, áreas conhecidas e zonas de risco usando a iconografia do universo.
- [ ] Testar clareza no controle e em dispositivos de toque antes de adicionar navegação nova.

### P2 — 3.5: Áudio, efeitos e atmosfera

- [ ] Organizar trilhas por contexto: porto, navegação, combate, boss e eventos.
- [ ] Definir transições suaves e volumes separados, sem quebrar a importação atual de FLAC/MP3.
- [ ] Usar efeitos com parcimônia, oferecendo redução de movimento e preservando FPS.

### P2 — 3.6: Acessibilidade e robustez

- [ ] Consolidar guia de controle em todos os menus (Xbox, teclado, toque).
- [ ] Verificar navegação sem mouse e foco em cada overlay.
- [ ] Testar PWA instalada, cache, reconexão offline e preservação de saves.
- [ ] Acrescentar testes de desempenho para máquinas e celulares modestos.

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

Concluir a validação e a publicação do **HUD 3.2**. Em seguida, avançar para o desenho de **eventos políticos/narrativos 3.3**, que exigirá decisões explícitas de lore, consequências e persistência.

O roadmap não é uma promessa de datas; a ordem pode mudar conforme testes, bugs e feedback dos jogadores.
