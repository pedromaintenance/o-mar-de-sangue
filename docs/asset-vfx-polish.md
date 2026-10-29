# Polimento visual V98 — efeitos mapeados do Arquivo dos Assets

## Escopo implantado

Inventário de referência: `asset-audit.html` reúne assets reais, caminhos e evidências de uso. A nova seção **Curadoria de efeitos em gameplay** organiza cinco combinações visuais. A integração utiliza sprites já existentes, sem transferir novos binários.

| Situação | Arquivos já existentes | Ação |
| --- | --- | --- |
| Monstro atingido | `assets/fx/violet_0..3.png` | `SEA_COMBAT.hitEnemy` usa energia violeta em lugar dos estilhaços |
| Navio atingido | `assets/fx/splinters_0..3.png` | Mantém estilhaços de madeira |
| Navio afundando | Fumaça, estilhaços e `v15-wrecked` | Acrescenta estilhaços de madeira próximos, preservando casco abandonado |
| Monstro afundando | `assets/fx/violet_0..3.png` | Dissolução abissal; **exceto enguia, nenhum monstro gira nem durante a morte** |
| Bala perdida | `assets/fx/foam_0..3.png` | Um efeito discreto em cada 3 projéteis que expiram na água, com culling de distância e limite de FX |
| Altar de Dagon | `assets/fx/shrine_glow.png`, `violet_0..3.png` | Pulso violeta discreto e desencontrado quando próximo |
| Santuário de Deméter | `assets/fx/shrine_glow.png`, `gold_0..3.png` | Pulso dourado discreto quando próximo |
| Escolha de ilha | `gold_0..3.png`, `violet_0..3.png` | Acento ao sair do menu; seleção e valores de gameplay preservados |
| Ilha destruída | `assets/islands/island_destruction_smoke.png` | Mantém gatilho `destroysIsland:true` preparado; nenhuma escolha antiga é considerada destruição automaticamente |

## Restrições

- Não modifica dano, recursos, IA, contratos, reputação, regras políticas, saves, controles, deslocamento ou colisão.
- Reutiliza `effectsActive/effectsLimit` e culling. Evita emissão de partículas por frame.
- Efeitos de ilha respeitam a distância de 780 pixels; mortes adicionais, 980 pixels; balas perdidas, 900 pixels.
- A rotação visual dos monstros é fixa em zero inclusive no sink tween; navios e enguia continuam podendo girar.
- Os textos de curadoria **não alegam que as cinco escolhas de cada ilha já estão implantadas**; o laboratório permanece separado.
- Novo `CACHE_NAME` v98 força atualização dos scripts e do Arquivo de Assets no PWA.

## Verificação

`node --test tests/asset-vfx-polish.test.cjs` valida mapeamento, sintaxe, limites, gatilho de destruição, rotação de afundamento, variação dos efeitos de impacto, curadoria e cache. Executar em conjunto com os testes existentes de combate, ilha e PWA.

A inspeção visual em uma partida (desktop + mobile) ainda é recomendada após a publicação, especialmente em combates com bateria de canhões elevada.
