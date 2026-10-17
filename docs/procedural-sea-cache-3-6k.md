# O Mar de Sangue — 3.6k: Cache Determinístico do Mar Procedural

**Estado:** integrado à `main` em 17/10/2026 pelo [PR #47](https://github.com/pedromaintenance/o-mar-de-sangue/pull/47) (squash `c2634cc`), com CI `port-smoke` e `port-visual` verdes. Teste físico no Pages/PWA pendente.

## Diagnóstico

O renderer de `SeaPixelPolish.js` desenha os mesmos vestígios em pixel art em cada atualização do mar (aproximadamente a cada 0,12 segundo), deslocados pela câmera, tempo e estado do clima. A versão anterior recalculava a posição fixa de cada vestígio com dois hashes por quadro e recalculava o padrão de cintilação mesmo quando o índice `Math.floor(t*1.5)` não havia mudado.

Essas coordenadas são **determinísticas** e independem da posição da câmera, do clima e do save. O cache evita repetir esses cálculos sem alterar o desenho.

## Entrega

- `SEA_PIXEL.seaInit` passa a inicializar um cache exclusivo da cena, apenas em memória, que é reconstruído no início de cada expedição.
- `seaFrame` calcula uma única vez as posições determinísticas de **190** elementos no desktop ou **110** na tela compacta, além de 11 linhas decorativas de mar amaldiçoado/tempestade.
- A cintilação por pixel é recalculada apenas quando muda o índice temporal `Math.floor(t*1.5)`. Isso mantém exatamente o mesmo instante das alterações do efeito original.
- A posição final e cor de cada bloco continuam sendo calculadas com o mesmo deslocamento de câmera, frações de tempo, nível de maldição e evento meteorológico.
- Se o tamanho do viewport ou a contagem de detalhes mudarem, o cache é invalidado e reconstruído.
- O número de chamadas de desenho, ordem, cores, transparência e geometria é **idêntico à versão anterior**. O que diminui são chamadas de `hash`, e não a quantidade de detalhes visuais exibidos.
- A PWA usa o cache offline **v51** para distribuir o arquivo atualizado.

## Redução determinística de trabalho

Em cada atualização da versão anterior, o renderer chamava `hash` **3N + 22** vezes durante tempestade ou maldição (onde `N` vale 190 ou 110), ou `3N` vezes em mar sem esses detalhes. A versão nova faz esses cálculos na primeira atualização; após isso, em quadros da mesma janela de cintilação, faz **zero hashes**. Quando a janela de cintilação muda, calcula apenas `N` hashes.

Essa é uma contagem de operações poupadas, **não uma alegação de ganho de FPS**. Os relatórios da 3.6h/3.6i continuam necessários para avaliar se a melhora é perceptível em hardware real.

## Invariantes de compatibilidade

- **Sem alterações** em `Game.js`, `SeaProfile` v4, saves, hitboxes, input Xbox/toque/teclado, física, IA, geração de ilhas, música e dificuldade.
- O desenho procedural mantém as mesmas operações `Graphics.clear`, `fillStyle` e `fillRect` e as mesmas 190/110 posições possíveis.
- Tempestades, névoa e maldição conservam as mesmas cores e comportamento temporal.
- Os dados do cache não são serializados nem enviados à rede.

## QA

- [x] `tests/procedural-sea-cache-3-6k.test.cjs` conserva uma implementação de referência da 3.6j e compara **todas as chamadas de desenho e argumentos** em dez condições de clima, maldição, câmera e tempo; inclui viewport desktop e celular.
- [x] O mesmo teste verifica ausência de hashes em quadros sem mudança de cintilação, atualização de exatamente N cintilações quando o tempo muda e reinicialização do cache na próxima cena.
- [x] `tests/mare-negra-hud-visual.test.cjs`: viagem Phaser real em Chromium nos três formatos oficiais, conferindo contagem de hashes e save intacto.
- [x] CI `port-smoke` e `port-visual` verdes; merge `c2634cc`.
- [ ] Testar no Pages a animação do mar, os efeitos de clima e a navegação em Android/PWA físicos.

## Próximo marco

**3.6l — Análise de gargalos visuais em hardware real.** Com relatórios comparáveis obtidos no mesmo aparelho, avaliar orçamento de partículas e efeitos. Não reduzir os detalhes, alterar a IA ou mexer na física sem medições e validação específicas.
