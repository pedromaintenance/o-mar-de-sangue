# O Mar de Sangue — Carcaça / Pixel Art Edition

Jogo de combate naval top-down, PWA offline com Phaser 4 local, missões e sandbox, abalroamento físico, tiros laterais e estaleiro com melhorias de custo exponencial.

## Publicação
Os arquivos deste diretório devem ficar na raiz de um repositório público servido pelo GitHub Pages. O manifesto, Service Worker e dependências (incluindo `phaser.min.js`) estão incluídos localmente. Abra com HTTPS e aguarde o primeiro carregamento/cache antes de tentar offline. O navegador oferece a instalação quando disponível.

## Controles
W/↑ acelerar, S/↓ desacelerar/ré, A/← e D/→ girar, Q bombordo, E estibordo, espaço ambos, Esc pausa/porto. Controles virtuais aparecem no celular.

## Direção visual
Pixel art medieval sombria, vista superior. O mar é vermelho e amaldiçoado. Portomonte evoca um refúgio e a proteção de Deméter; a Corte Sombria possui navios élficos elegantes; os recifes de Daegon trazem ruínas cultuais. Os conceitos e sprites foram produzidos para este projeto e refinados em PNGs com transparência e múltiplos quadros de efeitos. Não há assets remotos.

## Arquivos
- `Game.js`: cenas do Phaser, progressão, física naval, desenho do cenário e efeitos.
- `assets/sprites/`: navios humanos, élficos e especiais.
- `assets/tiles/`: camadas do Mar de Sangue.
- `assets/islands/`: ruínas, santuários, recifes e destroços.
- `assets/items/`: itens recolhíveis.
- `assets/fx/`: PNGs por quadro de animação.
- `manifest.webmanifest` / `sw.js`: instalação e cache PWA.

## Desenvolvimento
Branch de assets: `develop/assets-pixel-art`. Histórico e critérios: `docs/PLANO-ASSETS.md` e `docs/ASSET-REVIEW.md`. A história da Carcaça e as inspirações foram fornecidas pelo criador do projeto; a arte procedural antiga e a nova arte pertencem a diferentes versões do mesmo protótipo.

## Testes
A integração foi testada no Chromium em ambiente simulado usando Phaser local e as imagens reais; modo Missões, Sandbox, compra de upgrades, disparos laterais, inimigos e efeitos. O cache do Service Worker foi checado estaticamente; instalação real no celular precisa de avaliação no navegador publicado.
