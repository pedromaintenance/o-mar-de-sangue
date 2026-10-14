# O Mar de Sangue — Showroom gótico da interface

## Prévia com comparação imediata

**Visual clássico (padrão):** https://pedromaintenance.github.io/o-mar-de-sangue/

**Showcase gótico:** https://pedromaintenance.github.io/o-mar-de-sangue/?gothic=1

A versão nova utiliza os **PNG originais do próprio jogo** (`v15-flagship`, `sea-foam` etc.) com peças desenhadas na tela pelo Phaser. Ela é uma **interpretação funcional** da direção de arte aprovada, *não* a folha de conceito inteira dividida em nove sprites. **Não há quantização destrutiva, recompactação dos sprites nem substituição de imagens originais.**

## Integração

- `SeaGothic.js` implementa bordas de bronze com rebites, madeira escura, motivos de caveiras, correntes, mar vermelho, tentáculos e uma cena principal com navio, além de painéis para todas as telas do porto.
- `Game.js` acrescenta o pano de fundo do porto e placa de título **somente** com `?gothic=1`.
- `SeaMenus.js` incorpora botões góticos que preservam hitboxes, textos dinâmicos, foco do gamepad, cliques e toque. Os painéis do porto e pausa também são decorados.
- `SeaIslands.js` usa o estilo nos modais de encontros, mantendo a mecânica existente.
- `sw.js` pré-armazena o novo módulo e modifica a versão do cache; não remove PNGs existentes.

## Regras e limites

- Esta é **uma prévia de identidade**, não um pacote completo de novos sprites raster exportados do conceito.
- A flag fica DESLIGADA se o parâmetro `gothic=1` não estiver presente.
- Em qualquer tela, remover `?gothic=1` da URL recupera a v1.9.3 visual.
- **Todo o combate, o mar durante partidas, física, colisões, progressão, saves e FLAC continuam inalterados.**
- Os controles de toque, teclado e gamepad continuam pertencendo aos elementos interativos existentes. A arte nova é decorativa e não capta input.

## Checklist visual pós-publicação

Testar em **480×800 celular** e **1280×720 desktop**:
- título, navio e menu principal sem sobreposição;
- botão normal e selecionado com legibilidade;
- estaleiro com textos longos e aba ativa;
- manual, resultado e modal de reinício;
- pausa em combate, inclusive navegação gamepad;
- atracação, escolhas e cancelamento;
- música, atualização PWA e save mantidos.

**O showroom pode ser retirado sem mexer nas regras do jogo:** remover a referência `SeaGothic.js` e as seis chamadas em pontos de renderização, ou simplesmente remover o parâmetro de ativação. Ativar por padrão só depois de aprovação real no navegador.
