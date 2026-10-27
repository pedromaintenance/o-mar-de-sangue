# Navio do jogador — progressão visual em 20 estágios

Fonte canônica: sprite sheet RGBA fornecido pelo criador, **1460 × 1560 px**,
4 linhas × 5 colunas, quadros de **260 × 360 px** e intervalos de **40 px**.
O arquivo e o manifest são preservados sem alterar os pixels.

## Regra de evolução

O índice visual do navio é `clamp(min(nível de cada uma das 15 melhorias), 1, 20)`.
Nível 0 (save novo) exibe o primeiro estágio; todas as melhorias em nível 20 ou
superior garantem o 20º estágio. Comprar uma melhoria já avançada nunca antecipa
o barco: é a **última melhoria atrasada** que desbloqueia a próxima aparência.
A mecânica e o preço das melhorias continuam ilimitados e independentes.

## Direção da proa

O sprite bruto tem **proa para baixo** e popa para cima. O navio surge apontando
para baixo na tela (`heading = π`). O objeto visual usa compensação local de
`π` para alinhar a proa da imagem ao vetor de avanço que a física já utilizava
(`heading = 0` significa norte). Colisão, leme, canhões e velocidade não mudam.

## Substituição

Todos os quatro overlays de melhoria e o antigo sprite ativo do player saíram
do preload, renderizador e precache; os arquivos legados ativos foram excluídos.
Os sprites de inimigos e experimentos históricos não foram alterados.

Teste de contrato: `node --test tests/player-ship-20-stages.test.cjs`.
