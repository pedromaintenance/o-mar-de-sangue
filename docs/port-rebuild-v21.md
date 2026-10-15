# Porto 2.1 — reconstrução integral da interface

## Problema anterior

Os menus reutilizavam uma cena vertical de 480×800 dentro de um canvas
horizontal de 1280×720, com zoom 0,86 e duas asas decorativas.
Isso criava colunas estreitas, textos congestionados e espaços desperdiçados.
A interface gótica posterior acrescentou gráficos, mas não resolveu o layout.

## Nova arquitetura

- **PortUI.js**: único menu funcional do porto (principal, estaleiro,
  manual, reset e resultados). Usa DOM sem framework, bibliotecas ou CDN.
- **PortUI.css**: CSS Grid fluido para desktop, tablet e celular.
- **Game.js / SeaPort**: inicia música, monta o DOM e responde ao gamepad.
  Removemos da classe SeaPort as rotinas que desenhavam o porto por coordenadas.
- Ao começar o combate, o DOM desmonta no evento SHUTDOWN e o Phaser reaparece.
  Ao voltar ao porto, a interface consulta o estado salvo novamente.
- Os PNGs originais dos navios em assets/v15 são exibidos sem quantização
  ou redimensionamento das texturas-fonte.
- SeaGothic.js fica arquivado no repositório, mas não carrega mais.
- SeaMenus.js continua cuidando da pausa NO COMBATE. SeaIslands.js continua
  cuidando dos encontros nas ilhas. Essas interfaces serão uma etapa separada.

## Funções preservadas

- Missão na etapa correta; sandbox com recorde de onda.
- Estaleiro com 14 melhorias e preços derivados do SeaProfile original.
- Manual, confirmação de reset, resultados e métricas da expedição.
- Áudio: volume, mudo, importação de músicas e carregamento automático FLAC.
- Mouse, toque, teclado Tab/setas/Enter/Escape e Xbox A/B/D-pad.
- Save em carcaca.mar-de-sangue.v4 e todas as regras de combate intactas.

## Layout

- Desktop largo: três colunas, ocupando a tela útil.
- Tablet: duas colunas; quadro lateral direito fica oculto.
- Celular: área central em largura total; rolagem natural e botões grandes.
- Tela pequena: ações em uma coluna; sem zoom artificial da interface Phaser.
- Controles DOM são focáveis, com disabled para compras indisponíveis.
- Respeita prefers-reduced-motion.

## Verificação

Testes: node tests/port-ui-rebuild.test.cjs.
CI GitHub Actions: .github/workflows/port-ui.yml.

A verificação de código não substitui visual QA. Depois da publicação,
conferir 1280×720, 1600×900 e 390×844, menu/estaleiro/manual/reset/resultados,
reentrada do combate, navegação Xbox, PWA instalada e carregamento FLAC.

Se a montagem do DOM falhar, surge apenas uma tela emergencial para iniciar
missão/sandbox. Os menus procedurais antigos NÃO são desenhados atrás do DOM.
