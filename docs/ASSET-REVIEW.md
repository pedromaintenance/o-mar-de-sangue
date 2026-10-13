# Revisão dos assets — F1 / F2

**Status:** F1 extração de sprites concluída tecnicamente; F2 tiles de mar preparados, revisão visual pendente; F3 integração Phaser NÃO realizada.

## O que funcionou
- 4 navios (jogador, sloop da Corte, galeão da Corte e aríete) recortados, com proas orientadas para cima.
- 2 tesouros (moeda e baú), ambos RGBA.
- 3 tiles de mar PNG 256×256; bordas opostas idênticas (diferença máxima zero).
- 3 ilhas iniciais (recife, ruína, Daegon) com alfa.
- Revisão em `docs/sprite-review.png`.

## Achados que mudam o plano
1. A folha original não tinha grades respeitadas pelos sprites. Os cortes precisaram usar retângulos manuais.
2. As ilhas geradas têm o mar vermelho pintado atrás. A máscara automática recupera a ilha, mas pode deixar espuma costeira irregular. **Bloquear entrada em main até revisão visual in-game.**
3. Os tiles são repetíveis pelo critério de borda, mas a continuidade estética em zoom precisa ser avaliada no Phaser e no celular.
4. A arte original era rica demais para 32×32. Preservar sprites do navio em aprox. 100×150, e usar NEAREST; não forçar microtiles em todos os objetos.

## Replanejamento imediato
- F2.1: montar comparação 3×3 e limpar manualmente as ilhas; separar tilebase/espuma/névoa com alpha.
- F3: carregar as texturas usando chaves sem sobrescrever o original, adicionar seletor de pack para teste A/B, rodar QA real do navegador antes de abrir PR.
- F4: criar sprite de vela rasgada, emissão lateral de canhão e sequências de impacto.

**Regra de publicação:** toda atividade em `develop/assets-pixel-art`; manter `main` estável. Não afirmar testes de jogo que ainda não foram realizados.
