# 3.7a.1 — Contratos da Costa Sul: Resgate dos Afogados

**Estado:** primeira entrega jogável da fase 3.7, em validação no PR. Novos contratos e reputação ainda não implementados.

## Objetivo de design

Introduzir uma expedição que se vence **sem destruir oponente nem recolher determinado número de moedas**. O jogador escolhe um contrato no Porto e deve realizar um trajeto real entre dois lugares existentes no arquipélago, sobrevivendo ao combate.

Este contrato utiliza o **modo sandbox já existente** como base de navegação e de combate, mas suspende a progressão de ondas infinitas enquanto o resgate está ativo. Não constitui um terceiro modo de perfil, não avança os estágios de campanha e não altera o save v4.

## Fluxo do jogador

1. No Porto, acessar **CONTRATOS DA COSTA SUL** e aceitar **RESGATE DOS AFOGADOS**.
2. Começar uma nova expedição. A Carta dos Náufragos já contém as coordenadas da **primeira localização**: um naufrágio que não seja o encontro político Três Bandeiras.
3. Navegar até o naufrágio; desembarcar usando atracação normal (aproximação lenta e sem hostis próximos). Escolher **RECOLHER OS NÁUFRAGOS**. A mensagem confirma que os sobreviventes estão a bordo.
4. Apenas após esse resgate a Carta passa a revelar o destino final: um **Santuário de Deméter**. O waypoint muda para o santuário.
5. Atracar no santuário e escolher **DESEMBARCAR SOBREVIVENTES**. Ler o resultado e retornar ao mar; a expedição então termina como vitória, com prêmio único de 125 ouro.
6. O resumo no Porto indica contrato concluído e valor do prêmio. O progresso de missões não avança; uma próxima viagem pode ser iniciada normalmente.

As localizações são escolhidas **deterministicamente** entre ilhas já existentes, sem alterar o mapa fixo, geração, distribuição de inimigos ou eventos políticos. O santuário continua acessível para a entrega mesmo se já foi visitado no início da viagem.

## Regras materiais

- Recompensa nominal: **125 ouro**, acrescentados às recompensas da expedição **somente após a entrega e conclusão da viagem**; a recompensa se beneficia das regras existentes de cofre na consolidação.
- O contrato é opcional. Sair pelo Diário antes da entrega não dá o bônus; afundar também não. O ouro comum segue retenção já existente (75% na retirada, 40% na derrota).
- A entrega e o resgate são ações únicas. Repetição de clique, retorno ao santuário ou navegação de menus não multiplicam o pagamento.
- A rota inicial e a rota de entrega são reveladas pelo contrato; outras ilhas permanecem sob a descoberta habitual do Atlas. A direção é orientação, não piloto automático.
- Para dar tempo ao percurso, a expedição do contrato **não recebe as ondas regulares de 52 segundos**; continuam os inimigos já ativos, com reposição reduzida quando caem abaixo de três.
- O jogador pode visitar outras ilhas e negociar com a Corte/culto, mas a reputação não persiste. O estado político temporário segue o contrato original.
- Ao fechar a entrega, a cena chama `finish(true)` apenas uma vez; todos os saves continuam passando exclusivamente pelo `SeaProfile.settle` existente.

## Arquitetura

- `SeaContracts.js`: ofertas fixas, seleção de localidades, duas fases, waypoint, proteção contra repetição e estado **transitório de cena**.
- `PortUI.js`, `PortUI.css`: botão de contratos, página informativa, aceitação e resumo de conclusão.
- `Game.js`: recebe `contract:'rescue'` somente com `mode:'sandbox'`, injeta o estado depois de criar ilhas e Atlas, usa objetivo específico e concede bônus ao liquidar a viagem.
- `SeaIslands.js`: mesma UI modal e mesma condição de atracação; opções de resgate/entrega especiais apenas nas ilhas contratadas; sem alterar os outros 3-choice encounters.
- `index.html` e `sw.js`: módulo carregado antes do Porto/Game e precache offline **v54**.
- `tests/rescue-contract-3-7a.test.cjs`: seleção de localidades, sem spoiler, transporte, entrega, proteção de replay e isolamento do save.
- `tests/port-visual.test.cjs`: integração no Phaser real, três viewports, percurso e recebimento da recompensa com screenshots.

## QA e riscos

- [x] Implementação isolada e sem novos campos no save v4.
- [x] Teste de contrato Node incluído no CI.
- [x] Teste visual Chromium integrado à suíte já existente.
- [ ] Aguardar `port-smoke` e `port-visual` do PR.
- [ ] Integrar à `main` após CI verde, confirmar publicação no GitHub Pages e atualizar estado do roadmap.
- [ ] Validar manualmente no Xbox, teclado, Android físico e PWA offline.

### Limites intencionais

- O primeiro contrato é de **resgate** apenas. Contrabando, caçada e outros eventos dinâmicos ficam no roadmap.
- Não há passageiros representados por sprites, consumo de comida, tripulação ou gestão logística.
- Não há reputação nem novos atributos permanentes; futura reputação requer projeto e migração v4 → v5 próprios.
- A rota da viagem não é procedural nova; o contrato se sobrepõe ao arquipélago atualmente estático.

## Testes manuais recomendados

A partir do Porto, iniciar o contrato, abrir a Carta (M / View / toque), seguir o waypoint, atracar no naufrágio com F/A/toque, recolher os náufragos, acompanhar o novo waypoint até Deméter e entregar. Conferir **125 ouro de prêmio** na tela final. Em outra viagem, retirar-se antes de entregar e confirmar prêmio zero. Verificar missões e upgrades anteriores preservados.
