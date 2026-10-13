# O Mar de Sangue — notas de lançamento Pixel Art & Bestiário Abissal v1.0

**Publicação do código:** PR #2 integrado à `main`, commit `4f022e5`.

## Ajustes solicitados nos prints
- Colecionáveis: moeda com escala 0,34, caixa 0,42, baú 0,50 (16–20 pixels de largura nos cenários testados); destroços ambientais com escala reduzida.
- Coerência de arte: PNGs locais de navios, cenário, ilhas, tesouros, efeitos e novo painel de comandos.
- Upgrade visual: velas, blindagem, baterias e esporão em PNG, sem vela vetorial antiga; corrigidos os preloads das camadas e do console.
- PWA: inclui `phaser.min.js` e todas as imagens realmente carregadas pelo Phaser no precache; não requer CDN.

## Conteúdo novo
- Novos inimigos: enguia abissal, cortejo afogado, horror de coral, guardião caranguejo, templo-tartaruga, nau cultista e fortaleza abissal.
- Kraken: golpe de tentáculo com aviso e enguias de reforço após perder metade da vida.
- Dagon, Arauto de Daegon: ataque de área e invocações em duas fases.
- Missões de chefe: 5 Almirante, 10 Kraken, 15 Dagon, 20 Fortaleza; sandbox usa o mesmo ciclo a cada cinco ondas.
- Estrutura do save v4, estaleiro infinito e física de abalroamento preservados.

## QA confirmado
- `node --check` em `Game.js` e `sw.js`.
- 50 imagens de preload existem localmente; o Service Worker lista 58 recursos fundamentais, incluindo Phaser.
- Chromium com arquivos interceptados localmente: cena de menu e cenas isoladas de Kraken e Dagon sem erros JS; Dagon invoca reforços; onda 10 do sandbox gera Kraken; upgrades apresentam as quatro texturas; colecionáveis de 16–20 px.
- O review de assets está em `docs/spritesheet-abyss-review.jpg`.

## Pendente
O teste automatizado da **segunda viagem na mesma sessão** não completou por sobrecarga do navegador de QA: a segunda cena registrou conclusão de inicialização, mas o harness não confirmou interação posterior. Validar essa continuidade em navegador real e não confundir com teste concluído. Não foi realizado teste real de instalação/offline em Android.
