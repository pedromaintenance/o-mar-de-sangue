# 3.7a.2 — Pólvora sem Bandeira

**Estado:** publicado em 17/10/2026 após [PR #51](https://github.com/pedromaintenance/o-mar-de-sangue/pull/51), squash `baf76d7`. CI do PR e pós-merge aprovado ([run 39072990117](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39072990117)). [GitHub Pages](https://pedromaintenance.github.io/o-mar-de-sangue/) publicado ([run 39072989625](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39072989625)).

## Proposta de gameplay

A segunda expedição contratada complementa **Resgate dos Afogados** com escolhas materiais diferentes: transportar **pólvora clandestina** que já está embarcada até uma ruína da Costa Sul, escapar de uma patrulha fiscal da Corte ou lidar com os custos de sua fiscalização. O jogador pode destruir ou despistar o fiscal, evitar confronto e decidir se pretende pagar um acordo corrupto.

A Costa não é dividida em facções moralmente puras: a inspeção existe como força material da Corte, o suborno compromete o rendimento do transporte e a passagem escondida expõe o navio à maldição. **Não há reputação persistente na 3.7a.2**.

## Fluxo jogável

1. No **Porto → Contratos da Costa Sul**, selecionar **PÓLVORA SEM BANDEIRA**. O Resgate dos Afogados permanece selecionável.
2. Iniciar nova expedição (base sandbox já existente), **com a carga embarcada**. A Carta revela apenas a ruína de destino, escolhida entre as ruínas físicas existentes a mais de 800 unidades do centro do mundo.
3. Após seis segundos de navegação ativa, um fiscal da Corte aparece em um navio patrulha existente. Uma vez por expedição; não altera spawns em missões normais.
4. A **suspeita** é exibida no objetivo: próximo do fiscal ativo (até 340 unidades) sobe **17 pontos/segundo**, ou **25 pontos/segundo** a velocidades maiores que 85. Quando o fiscal está distante ou afundado, cai **11 pontos/segundo**. Todas as taxas são multiplicadas pelo `dt` limitado a 0,1 segundo.
5. Se a suspeita alcançar **100%**, a Corte confisca a carga; a expedição termina como retirada por apreensão, sem bônus. O ouro normal segue as regras de retirada já existentes.
6. Se chegar à ruína com casco íntegro e sem hostis próximos, atracar normalmente (limite de 67 de velocidade) e escolher:
   - **ENTREGAR SEM SER VISTO:** exige suspeita abaixo de **60%**, concede **190 ouro de bônus** e **+12 de maldição**. Se a suspeita estiver elevada, o modal mostra uma explicação e permite outra escolha.
   - **COMPRAR O SILÊNCIO DA CORTE:** entrega possível mesmo com suspeita alta, paga **115 ouro de bônus** e não adiciona maldição. A diferença de 75 moedas representa a propina descontada do pagamento contratado; não exige ouro no bolso.
7. Após escolher, ler o resultado e retornar ao mar. A expedição é concluída como vitória e o prêmio entra **uma única vez** via `SeaProfile.settle` existente. Na tela final aparecem tipo de entrega e bônus recebido.

## Proteções de progresso

- **Save v4 inalterado:** estado de contrato, suspeita, fiscal, escolha e waypoint existem apenas na cena da expedição, não no perfil permanente.
- Não avança etapa de missão nem concede reputação. Contratos continuam isolados do modo missão.
- Apreensão, derrota ou retirada voluntária antes da entrega não concedem o bônus.
- Só a patrulha fiscal designada aumenta suspeita; outros inimigos continuam lutando normalmente. Matar o fiscal cancela a ameaça da inspeção.
- A doca pode ser usada para entrega mesmo se a ruína já tiver sido visitada. A seleção só funciona na ilha correta, com validação de ação e bloqueio a cliques repetidos.
- O contrato reaproveita sprites, física, áudio, clima, AI e interações de atracação, incluindo teclado, Xbox e toque.
- Sem conteúdo remoto, sem novas imagens, sem arquivos de save ou histórico do jogador fora do fluxo já existente. Cache offline PWA **v55**.

## Implementação e testes

- `SeaContracts.js`: despacho do fiscal, suspeita, confisco, duas opções de entrega, recompensa e condição de vitória.
- `Game.js`: seleção de contrato, atualização somente durante a navegação ativa, relatório e liquidação do bônus.
- `SeaIslands.js`: compatibilidade da doca com ruína previamente visitada e feedback de erro quando a entrega secreta é bloqueada.
- `PortUI.js`, `PortUI.css`: quadro de dois contratos legível em telas pequenas, indicador de resultados e diferenciação da apreensão.
- `sw.js`: cache v55, preservando módulo já precacheado.
- `tests/smuggling-contract-3-7a2.test.cjs`: escolhas, taxas de fiscalização, limites, não repetição, perda e compatibilidade save v4.
- `tests/port-visual.test.cjs`: jogo real em Chromium desktop 1600×900/1280×720 e Android emulado 390×844; quadro, contrato, fiscal, rejeição de entrega secreta, suborno e resultado.
- `tests/rescue-contract-3-7a.test.cjs` e demais testes antigos permanecem obrigatórios.

## Checklist

- [x] Desenvolvimento de gameplay e integração com Porto/Atlas/ilhas.
- [x] Testes Node e Chromium adicionados aos workflows.
- [x] `port-smoke` e `port-visual` verdes na branch e no PR; screenshots e jornadas de contrabando em três viewports.
- [x] PR #51 integrado à `main`, CI pós-merge verde e GitHub Pages publicado; roadmap atualizado.
- [ ] Validar manualmente em celular físico, controles Xbox, PWA offline e viagens longas.

## Próxima entrega

**3.7a.3 — Caçada:** um alvo específico identificado por pistas, localização no Atlas sem revelar outras ilhas, alternativa entre captura e afundamento. Evitar repetir a caça genérica de fragatas. Em seguida, eventos dinâmicos (3.7b) e rotas (3.7c). Qualquer reputação persistente continua reservada à fase 4.0 e depende de migração v4→v5 aprovada.
