# O Mar de Sangue — v1.5.1 | Frota e Bestiário em pixel art

**Build para publicação no GitHub Pages.** Esta entrega parte da versão v1.5, com a correção de escala v1.5.1 consolidada e revisão das proporções para evitar multiplicadores cumulativos.

## O que mudou
- Novos sprites independentes da frota, monstros, Kraken e Dagon, retirados dos concepts aprovados.
- 16 quadros de efeitos adicionais em `assets/v15/`, para disparos, fumaça, respingos e impactos.
- Ilhas, console de leme e canhões, upgrades, multitoque e controle Xbox preservados.
- **Escala relativa ao jogo v1.3 publicado:** navio do jogador `hullRadius` 34 → 68 e altura nominal 76,5 → 153 px; inimigos raio dobrado e altura nominal `2,25 × raio`; colecionáveis com `2×` a escala anterior (`coin .34 → .68`, `crate .42 → .84`, `chest .5 → 1.0`). Assim PNGs de tamanhos diferentes mantêm a proporção física.
- Corrigida a tentativa anterior que **quadruplicava** algumas criaturas da v1.5 (`×2` adicional em escala já calculada com raio dobrado); este release não aplica esse aumento extra.
- Projéteis, reflexos e disparos preservados na escala ampliada.
- `sw.js` versão nova para que o PWA instalado receba recursos atualizados.

## Compatibilidade
- Hospedagem estática GitHub Pages, caminhos relativos; nenhum CDN.
- Saves existentes preservados (`SeaProfile` não foi modificado).
- Controles de teclado, Xbox e toque preservados.

## Garantias e testes
- Sintaxe de Game.js/sw.js validada com Node.
- Referências de preloader e manifesto conferidas; cache inclui Phaser e todas as imagens.
- A validação de interação em Android físico continua dependente do uso real após publicação.

## Instalação
- Os arquivos ficam **na raiz** do repositório Pages (`index.html` no topo), sem pastas extras.
- Abra o site conectado e recarregue para instalar o cache atualizado. Depois feche e reabra o PWA.
