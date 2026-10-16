# Porto 3.0 — A Maré Negra | Identidade visual oficial

A **Maré Negra** foi aprovada como identidade visual padrão do Porto
de *O Mar de Sangue*. O estilo clássico continua disponível para comparação
ou reversão, sem alteração das regras ou do progresso.

## Links

- **Maré Negra (padrão):** https://pedromaintenance.github.io/o-mar-de-sangue/
- **Clássico (alternativo):** https://pedromaintenance.github.io/o-mar-de-sangue/?theme=classic
- **Link anterior da prévia (compatível):** https://pedromaintenance.github.io/o-mar-de-sangue/?theme=abyss

A seleção é feita pela URL, não é gravada no perfil do jogador
e não toca no progresso existente.

## Arquitetura e restrições

- O arquivo `PortThemeAbyss.css` implementa apenas a identidade visual.
- `index.html` aplica `html.theme-mare-negra` por padrão antes da
  leitura de CSS. Somente `?theme=classic` deixa de aplicar essa classe.
- `PortUI.css` permanece como base comum e como tema clássico;
  as regras opcionais de Maré Negra são prefixadas pela classe.
- `PortUI.js`, `Game.js`, `SeaMenus.js`, `SeaIslands.js`, compras,
  saves, eventos, navegação por controle e combate **não mudam**.
- O novo tema atua exclusivamente em `.port-ui`.
  A cena Phaser permanece com os sprites originais.
- `sw.js` inclui ambos os estilos e invalida o cache para que a
  atualização chegue a instalações PWA.

## Direção artística

Tons de ferro oxidado quase preto, madeira carbonizada e tinta envelhecida,
sangue seco para alertas, bronze antigo e marfim para textos. Todos os
painéis do menu, estaleiro, diário, resultados e confirmação de reset
compartilham essa linguagem.

## Garantias de regressão

Os testes da versão oficial exercitam em navegador Chromium nas resoluções
1600×900, 1280×720 e 390×844:

- Maré Negra está ativa na URL principal e também em `?theme=abyss`.
- Tema clássico aparece apenas em `?theme=classic`.
- Ambas as opções preservam a mesma quantidade de ações de menu.
- Layout não tem overflow horizontal.
- Foco, setas, Q/E, abas só com mouse/toque e o botão B continuam operando.
- A entrada no combate desmonta o DOM de porto e libera o canvas.

O visual padrão pode ser revertido alterando unicamente o script
de seleção de classe em `index.html`, sem restaurar arquivos de gameplay.
