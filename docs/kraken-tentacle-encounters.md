# Tentáculo Errante e o Kraken — encontros (27/10/2026)

## A animação
`assets/v15/beast_tentacle.png` mantém o mesmo caminho, agora RGBA 2048×682, quatro quadros de 512×682, 4 FPS. SHA-256 do original: `41ebca4be24a532b058043983824b77a7c9a483857cbddfef5f8d98e202bf6ad`. O sprite é animado tanto como criatura quanto como impacto visual do golpe.

## Missões principais
O chefe aparece pela ordem de chefes já existente. Kraken #1 é a missão 10, sem reforços de tentáculos. Kraken #2 é a missão 30, com quatro tentáculos móveis que atacam independentemente. Kraken #3 (missão 50) leva seis; depois, o limite é sete. Os tentáculos são minions: abatê-los não conclui objetivo de chefe. A vitória continua exigindo derrotar o Kraken.

## Sandbox mar aberto
Um único tentáculo errante aparece desde o começo (fora das missões de contrato), e reaparece se morrer acidentalmente antes de interagir com o jogador. O Kraken só é invocado uma vez por partida quando (a) uma bala do jogador atinge o tentáculo, (b) o jogador o atinge em colisão/abalroamento, ou (c) o tentáculo causa dano real ao navio. Aproximação e avisos de ataque não invocam o chefe. O Kraken foi retirado da rotação automática das ondas, e o spawn do Kraken no modo sandbox rejeita chamadas sem a autorização explícita da interação com o tentáculo.

## Mantido sem alteração
Dano e vida do Kraken, ataque de área do chefe, convocação de enguias na fase de fúria, IA dos outros inimigos e suas colisões, salvamentos e contratos.

## Regressão
`node tests/tentacle-kraken-events.test.cjs`, junto com testes de Kraken, Dagon, Coral, Afogados, Enguia e PWA.
