# Olhos de Dagon — combate e sandbox (27/10/2026)

## Arte
`assets/abyss/dagon_eye.png` substituído pelos bytes originais do criador: RGBA 2048×682, quatro quadros de 512×682. SHA-256: `e2da0569020b4a54bd38626723488ad7ce23a0dcef102b4b992ce689ab22cd0a`.

## Animação e combate
Quadro 0: submerso/invisível. Quadro 1: surgir ou sumir. Quadros 2 e 3: pulsação visível; só dispara nessa janela. A direção física é separada da orientação do sprite (0° permanente). Projéteis têm `dagonEyeCurse=25`; acerto efetivo aumenta a Maldição em 25 pontos percentuais, até 100%. Colisão direta também aumenta a maldição em 25. Olhos invisíveis não recebem disparos nem colidem com o navio.

## Encontros
Dagon invoca três olhos ao entrar em combate, tanto nas missões quanto no encontro sandbox. Não há Dagon em ondas automáticas do sandbox. Um olho sentinela aparece livremente no mar; o primeiro disparo do jogador que o acerte ou o abalroamento invoca Dagon. Um disparo do próprio olho que realmente cause dano também o invoca. Derrotar Dagon limpa os olhos restantes; o sentinela reaparece após intervalo para permitir novo encontro. O mecanismo do Kraken/tentáculo não foi alterado.

## Regressão
`node tests/dagon-eyes.test.cjs`
`node tests/dagon-four-frame.test.cjs`
`node tests/tentacle-kraken-events.test.cjs`
