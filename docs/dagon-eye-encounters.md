# Olhos de Dagon — combate e sandbox (28/10/2026)

## Arte
O arquivo `assets/abyss/dagon_eye.png` contém a spritesheet RGBA original de 2048×559 (4 quadros de 512×559). SHA-256: `a3228c1e81ca45d4fdf67e2472db9887f078d2b39d045f2c19f65a1f819493c4`.

## Distinção das entidades
- **Arauto de Dagon**: identificador legado `dagon` e spritesheet `assets/v15/dagon_emerging.png`. Sua mecânica anterior permanece: invoca três Olhos, investe e chama Afogados/Coral por fases. O Olho sentinela do sandbox invoca **o Arauto**, não Dagon, Senhor das Profundezas.
- **Dagon, Senhor das Profundezas**: identificador `dagon_senhor` e spritesheet `assets/abyss/dagon.png`. Tem encontro e ataques próprios; invoca Olhos apenas nas suas fases de vida.
- **Olho de Dagon**: criatura menor `olho_dagon`, também presente como reforço de ambas as entidades.

## Animação e maldição dos Olhos
Quadro 0: submerso/invisível; quadro 1: transição; quadros 2 e 3: pulsação visível e disparos. Orientação visual em 0°, sem acompanhar o rumo físico. Ataque de Olho causa +25 de maldição quando o projétil realmente inflige dano; colisão direta inflige +25. Quadros ocultos não recebem projéteis ou colisões.

## Ciclos de encontro
No sandbox sem contratos, um Olho sentinela vagante desperta o **Arauto** por ataque recebido ou acerto de sua magia. Ao derrotar o Arauto, os Olhos remanescentes desaparecem e um novo sentinela retorna após intervalo. O Kraken mantém o ciclo independente tentáculo → Kraken. O Senhor aparece separadamente na missão 40 (depois 140, 240...) e nas ondas 20, 80, 140... do sandbox, sem sorteio comum.

## Regressão
`node tests/dagon-eyes.test.cjs`
`node tests/dagon-four-frame.test.cjs`
`node tests/dagon-lord-encounter.test.cjs`
