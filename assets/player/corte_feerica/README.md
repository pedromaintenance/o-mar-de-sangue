# Corte Feérica — 20 evoluções do navio do jogador

**Estado:** pacote de arte integrado ao repositório, **ainda não ativado no jogo**.

## Arquivos preservados

- `mar_de_sangue_navio_corte_feerica_20_evolucoes.png` — spritesheet RGBA **1460 × 1560**; cinco colunas, quatro linhas, 20 células de **260 × 360** e lacunas transparentes de 40 px.
- `mar_de_sangue_navio_corte_feerica_manifest.json` — especificações fornecidas pelo criador, inclusive ordem da progressão, âncoras e retângulos.
- `evolucoes/navio_corte_feerica_nivel_01.png` até `nivel_20.png` — 20 sprites individuais originais; idênticos em pixels às células do atlas.
- `referencia_final/Navio_Feerico_Sombrio_da_Colheita_final_original.png` — referência original aprovada para o nível 20, sem reduzir a resolução da fonte.

## Orientação e uso futuro

Proa para **baixo**, popa para cima, vista superior; do nível 1 ao 20, leitura da esquerda para a direita e de cima para baixo. A facção se chama **Corte Feérica / Shadow Fey**. A adoção desta aparência deverá acontecer **somente após a implementação da escolha/aliança de facção**; o sprite atual `assets/player/mar_de_sangue_navio_proa_baixo_20_evolucoes.png` continua sendo o navio padrão.

A largura total da spritesheet inclui lacunas verticais e horizontais; **não** configurar o Phaser como uma tira horizontal de 20 quadros. Futuramente usar `frameWidth:260`, `frameHeight:360`, `margin:0`, `spacing:40` quando compatível com o atlas de 5 × 4, ou carregar os PNGs individuais. Conferir a geometria do loader antes de ativar. Não mudar física, direção ou save ao adicionar este pacote.

Teste de integridade: `node tests/corte-feerica-assets.test.cjs`.
