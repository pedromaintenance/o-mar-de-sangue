# O Mar de Sangue — Pixel Art v1.5

**PWA offline, independente do editor Phaser.** Abra por GitHub Pages ou servidor local.

## Conteúdo da v1.5
- 10 sprites navais gerados das folhas aprovadas, dos quais 4 formam a progressão visual do jogador.
- 6 sprites abissais: Kraken, Dagon, Tentáculo, Cortejo dos Afogados, Enguia e Horror de Coral.
- 16 quadros PNG de animação: clarão naval, fumaça, impacto na água, destroços/tesouro.
- Navio muda para velas nobres e reforço de canhões por progresso (total de níveis das melhorias de casco, blindagem, velas, canhões, bateria e esporão). Ao ficar muito danificado, muda o casco; ao consertar, retorna à aparência normal.
- Colisões, matemática de disparo, multitoque e Xbox mantidos da v1.4.

## Publicação
1. Extraia os arquivos diretamente na raiz do seu repositório GitHub Pages.
2. Mantenha as pastas `assets` e `icons`.
3. Instale/reabra depois de uma atualização online para renovar o Service Worker v1.5.

## Testes mínimos no celular
- [ ] Jornada normal, coleta de ouro e danos
- [ ] Analógico + canhão com dois dedos
- [ ] Recompra no estaleiro e mudança de casco (três estágios)
- [ ] Kraken e Dagon em missão de chefe
- [ ] Segunda viagem na mesma sessão
- [ ] Reabrir em modo avião após primeiro carregamento online

**Nota técnica:** os novos sprites têm arte embutida; overlays vetoriais de upgrades foram removidos. A progressão mecânica NÃO foi alterada.
