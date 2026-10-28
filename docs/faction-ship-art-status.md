# Evoluções de navio por facção — estado auditado (28/10/2026)

| Conjunto | Atlas e arquivos no GitHub | Ativo no gameplay |
| --- | --- | --- |
| Padrão | `assets/player/mar_de_sangue_navio_proa_baixo_20_evolucoes.png` | **Sim** |
| Corte Feérica | `assets/player/corte_feerica/` — 20 níveis | **Não** |
| Sobreviventes | `assets/player/sobreviventes/` — 20 níveis | **Não** |
| Culto de Dagon | `assets/player/culto_dagon/` — imagem original, atlas, manifesto e 20 níveis | **Não** |

## Culto de Dagon: importação concluída

O usuário enviou `Evolucao_de_Navios_Eldritch_Culto_de_Dagon_original.png`, integrado ao GitHub e processado com sucesso pelo workflow `dagon-ships.yml`. O atlas normalizado possui 1460×1560 pixels, com 20 quadros RGBA 260×360 em grade 5×4 e lacunas transparentes de 40 px.

Hashes verificados contra o pacote local validado pixel a pixel:
- Fonte: `59d50d3ef2371af640b6a4f98ba60cd1b91b090daebc3f3ff31345ea65c98008`.
- Atlas: `07b5591fd7f4aa23666c376a099addae6a3c69531066ad1c41e065b44df40b3c`.

O teste `tests/culto-dagon-assets.test.cjs` protege integridade, quadros, dimensões e manifesto. **A arte está integrada ao repositório, não ao seletor de navio do jogo.**

## Lacunas para integração das três facções no gameplay

1. `Game.js` ainda carrega somente `player-ship-stages` para o jogador.
2. `SeaMenus.js` exibe prévias apenas dessa textura padrão.
3. `SeaPoliticalEvents.js` registra escolhas pontuais com `faction:'corte'|'sobreviventes'|'culto'`, mas não há adesão explícita e persistente.
4. Falta definir as condições canônicas de pacto, exclusividade, deserção e a compatibilidade desse estado com os saves atuais.
5. Falta resolvedor central de skins por facção e evolução, preload seletivo, cache offline e testes do fluxo de aliança.

## Próximo ciclo recomendado

Definir o pacto em um menu apropriado e persistir `allegiance` no `SeaProfile`, com `null` como estado sem aliança e navio padrão nos saves antigos. Só depois vincular as três spritesheets aos pactos; não inferir lealdade de um evento político avulso. Manter o nível visual calculado pela menor das 15 melhorias e preservar rotação, hitbox, IA, canhões, motor e ritmo de upgrades.
