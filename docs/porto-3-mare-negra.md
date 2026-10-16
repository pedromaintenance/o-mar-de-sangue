# Porto 3.0 — A Maré Negra (prévia isolada)

O Mar de Sangue passa a oferecer uma **nova direção artística experimental**
que não substitui a aparência clássica até aprovação da equipe.

## Como comparar

- **Clássico:** https://pedromaintenance.github.io/o-mar-de-sangue/
- **Maré Negra:** https://pedromaintenance.github.io/o-mar-de-sangue/?theme=abyss

A seleção é feita pela URL, sem modificar `SeaProfile`, saves, regras,
navegação, callbacks, hitboxes ou o motor de jogo.

## Limites de implementação

- `PortThemeAbyss.css` é o único arquivo de estilo com mudanças estéticas.
- `index.html` lê somente o parâmetro `?theme=abyss` e acrescenta a classe
  `html.theme-mare-negra`, antes do CSS ser carregado.
- `PortUI.css` e `PortUI.js` são mantidos **inalterados**.
- `Game.js`, `SeaMenus.js`, `SeaIslands.js` e as regras de progresso
  também permanecem intactos.
- O tema atua somente dentro da interface do porto (`.port-ui`).
  O canvas Phaser reaparece normalmente durante o combate.
- Imagens originais de navios/mares existentes no repositório são reutilizadas.
  Nenhuma textura/sprite é quantizada ou sobrescrita.
- `sw.js` atualiza a versão do cache e inclui o novo CSS para a PWA.

## Direção visual

Ferro oxidado quase preto, madeiras carbonizadas e tinta envelhecida; vermelho
usado como sinal de perigo, não como cor dominante dos cartões; contraste de
texto em marfim fosco e bronze velho. Sem redesenhar botões, preços, navegação,
categorias ou fichas. A melhoria cobre menu, estaleiro, manual, resultado e reset.

## QA obrigatória

CI de navegador real nas resoluções 1600×900, 1280×720 e 390×844,
cobrindo clássico e tema escuro:

- A página clássica não recebe a classe nem a aparência alternativa.
- O tema `?theme=abyss` altera os estilos sem remover ações.
- Nenhum overflow horizontal nos três tamanhos.
- Setas e foco visual permanecem funcionais.
- Abas do estaleiro continuam mouse/toque somente; Q/E e LB/RB mantém trocas.
- O controle B volta ao porto.
- Iniciar missão desmonta o DOM e libera o canvas Phaser.
- Screenshots geradas para ambos os menus e estaleiro.

**Regra de publicação:** por enquanto, publicar somente com opt-in pelo link.
Só mudar o tema padrão após avaliação visual real pelo usuário.
