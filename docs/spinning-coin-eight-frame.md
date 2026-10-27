# Moeda Pirata — animação de oito quadros (27/10/2026)

A moeda coletável **treasure-coin** agora usa a animação em rotação de oito quadros da arte fornecida, no mesmo caminho `assets/items/treasure_coin.png`.

## Normalização da spritesheet
O PNG recebido tinha **2048×682 px**, com oito ilustrações, mas **espaçamentos irregulares entre as moedas**. Cortar o arquivo original em oito células de 256×682 quebraria moedas na borda. Para preservar as ilustrações sem redesenho, os oito objetos foram extraídos por seus limites de transparência, centralizados em células de **272×272 px** e reagrupados num PNG RGBA **2176×272 px**.

- SHA-256 da fonte original: `7ad93cf9ee4a4056d9fe1933cd5364cd8f82e46539c5faed717c0fe040344f0a`
- SHA-256 do PNG normalizado usado no jogo: `935e0631c0a9644e52ea4cf73823529aabd0e96b46492f10dc20e720961e15b3`
- Regra: somente re-enquadramento de pixels; baixa transparência residual (<8/255) foi descartada para remover ruído solto.

## Integração
Phaser carrega oito quadros de 272×272, com quadro inicial 0. Moedas coletáveis animam em **10 FPS**, fora de fase entre si; o tamanho visual foi ajustado para escala 0.16, mantendo a leitura do HUD e do cenário. Permanecem inalterados a flutuação dos tesouros, o brilho, os valores de ouro, a coleta magnética, a recompensa, os baús e as caixas.

Cache PWA: v78. Regressão: `node tests/spinning-coin-eight-frame.test.cjs`.
