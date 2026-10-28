# Sobreviventes — 20 evoluções do navio do jogador

**Estado:** sprites do alinhamento com os Sobreviventes preparados e versionados, **sem ativação no gameplay**.

## Arte original e organização

- `mar_de_sangue_navio_sobreviventes_20_evolucoes.png`: atlas RGBA fornecido pelo criador, 1460 × 1560 px, 5 colunas × 4 linhas.
- `mar_de_sangue_navio_sobreviventes_manifest.json`: manifesto original, preservado byte a byte.
- `evolucoes/navio_sobreviventes_nivel_01.png` a `nivel_20.png`: 20 PNGs RGBA de 260 × 360 px extraídos **sem modificação dos pixels** das células correspondentes do atlas.

**Geometria:** margens de 0 px, lacunas transparentes de 40 px entre células; ler da esquerda para a direita e de cima para baixo, do nível 1 ao 20. A proa fica para **baixo**, a popa para cima, câmera superior. Os PNGs individuais são exportações sem perda das células.

**Estética:** facção **Sobreviventes**, tema Deméter (vida, colheita, proteção e resistência). Conforme o manifesto, somente a evolução 20 inclui água azul; a arte é mantida exatamente como fornecida.

**Referência externa:** o campo `level_20_reference` menciona `a_highly_detailed_fantasy_pixel_art_isometric_sty.png`. Esse arquivo de referência **não foi enviado** neste pacote e, por isso, não foi criado artificialmente nem incluído na pasta.

## Uso futuro no Phaser

Não substituir o navio padrão `assets/player/mar_de_sangue_navio_proa_baixo_20_evolucoes.png` neste marco. As novas aparências só deverão ser habilitadas com o sistema de alianças/facções, em trabalho posterior. Evitar alterar física, saves, giro, colisões ou upgrades ao preparar estes recursos.

Atenção: o atlas é uma matriz **5 × 4**, não uma faixa horizontal de 20 sprites. Para carregar como spritesheet, respeitar as células 260 × 360 e o espaçamento horizontal e vertical de 40 px (ou carregar os PNGs individuais).

## Verificações

`node tests/sobreviventes-assets.test.cjs`: valida arquivos originais por SHA, dimensões e manifesto. Os recortes foram comparados pixel a pixel com o atlas antes da publicação.