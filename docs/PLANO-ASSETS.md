# O Mar de Sangue — Plano Mestre: Pixel Art, Animação e Polimento

**Padrão visual:** pixel art medieval sombria, perspectiva top-down, navios/ilhas/monstros da Carcaça com silhuetas próprias. **Entrega:** PWA independente no GitHub Pages, sem CDN. **Preservar:** controles touch multitoque, teclado e Xbox, save v4, economia, abalroamento, missões e sandbox.

## Fases concluídas
- [x] **v1.0 — Bestiário abissal:** 11 assets do mar, Kraken, Dagon, criaturas e barcos sobrenaturais (PR #2).
- [x] **v1.1 — Controles mobile:** analógico, dois/três dedos independentes e console redesenhado (PR #3).
- [x] **v1.2 — Controle Xbox:** analógico, gatilhos, menu e reconexão pelo navegador (PR #4).
- [x] **v1.3 — Base de animação/polimento:** 20 quadros pixel art de espuma, brilho, fumaça, explosão e aura + halo; navios com rastro/balanço, bestiário com pulsação, efeitos nas magias, coleta animada, HUD de casco/recarga e redução de animações permanentes de objetos distantes. Proteção nos 3 segundos iniciais (PR #5, merge `2dc3e196`). Relatório: [POLIMENTO-V13.md](POLIMENTO-V13.md).

## Replanejamento após v1.3
O jogo ganhou animação de **movimento e efeitos** nas categorias jogáveis, mas ainda faltam spritesheets completos quadro a quadro de cada personagem. É incorreto tratar a v1.3 como “tudo animado”. A limpeza de tweens permanentes reduz trabalho, mas o teste automático de duas viagens consecutivas segue travando o Chromium headless (limitação observada também antes da v1.3).

### Próximo lote — executar em branch separada
1. [ ] **P0 — Perfil de desempenho:** instrumentar contagem de sprites, tweens, timers, memória e FPS; investigar reinício de cenas e eliminar recursos transitórios deixados para trás. Testar longa duração e duas viagens sucessivas num navegador convencional.
2. [ ] **P1 — Spritesheets de navios:** quatro a oito quadros de vela/bandeira, dois níveis de dano (intacto/danificado), faísca de canhão por bordo e sequência de afundamento; posicionar as camadas de upgrades no mesmo plano do convés. Manter proporções físicas independentes do sprite.
3. [ ] **P2 — Spritesheets sobrenaturais:** frames únicos para enguias, cortejo dos afogados, coral vivo, caranguejo, tartaruga, Kraken e Dagon; telegráfos e fases de chefe animadas.
4. [ ] **P3 — UX e combate:** identificar recargas, feedback de alcance e coleta, ajustar brilho/visibilidade em celular e acessibilidade; rever intensidade de tremor e partículas.
5. [ ] **P4 — QA PWA:** Chrome Android físico (dois/três toques), Chrome/Edge com Xbox, modo avião, abertura/fechamento, duas viagens seguidas, onda 10/15, compra de upgrades, armazenamento persistido.
6. [ ] **P5 — Publicação:** commit, PR, checks, merge apenas depois da regressão possível; registrar eventuais ressalvas.

## Regras de qualidade
- Não alterar física de abalroamento para compensar sprite maior/menor.
- Tocar em apenas um sistema de cada vez, executar QA isolado e comparar capturas.
- Efeitos fora da tela devem pausar; animações devem ter limites de quantidade.
- Todos os arquivos usados pelo carregador devem estar disponíveis offline no Service Worker.
- Todo pacote inclui fontes, arte e documentação; o novo ciclo deve atualizar este plano quando terminar.
- Teste headless **não equivale** a validação em Android ou Xbox físico.
