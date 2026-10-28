# Evoluções de navio por facção — estado auditado (28/10/2026)

| Conjunto | Fonte | Atlas/20 PNGs no GitHub | Ativo no jogo |
| --- | --- | --- | --- |
| Padrão | `assets/player/mar_de_sangue_navio_proa_baixo_20_evolucoes.png` | Sim (atlas) | **Sim** |
| Corte Feérica | `assets/player/corte_feerica/` | Sim | **Não** |
| Sobreviventes | `assets/player/sobreviventes/` | Sim | **Não** |
| Culto de Dagon | `assets/player/culto_dagon/` | Importação automatizada preparada; fonte ainda precisa ser adicionada | **Não** |

## Achados

- `Game.js` carrega atualmente somente `player-ship-stages` no `preload` do jogador e usa essa textura em `create`.
- `SeaMenus.js` também usa `player-ship-stages` em suas prévias.
- As decisões em `SeaPoliticalEvents.js` trazem `faction:'sobreviventes'|'corte'|'culto'`, mas não criam uma filiação permanente. O próprio módulo reserva o nome "reputação" para sistema futuro.
- Não existe ainda uma regra canônica para aderir, trair, trocar ou manter uma facção no save, nem um seletor de navio condicionado a essa aliança.
- O atlas original do Culto tem 1213x1296 com espaçamento irregular, incompatível com a grade regular do Phaser. O importador transforma essa folha em atlas regular 1460x1560 por recorte e margem transparente, sem modificar os pixels da arte.
- Não adicionar o novo PNG ao `sw.js` antes de o arquivo realmente existir: o cache usa `cache.addAll` e falharia na instalação se um dos URLs estivesse ausente.

## Ordem recomendada de integração funcional

1. Enviar o PNG fonte original `Evolucao_de_Navios_Eldritch_Culto_de_Dagon_original.png` para `assets/player/culto_dagon/`. O workflow cria atlas, 20 sprites e manifesto automaticamente.
2. Definir os critérios de adesão, exclusividade e mudança de facção. Registrar `allegiance` no `SeaProfile` de modo compatível com saves antigos (padrão até adesão).
3. Criar um único resolvedor de textura do navio do jogador (padrão, Corte, Sobreviventes, Culto); aplicar na cena e nos previews dos menus, sem alterar física, upgrades nem rotação.
4. Adicionar os três atlas de facção ao preload e ao cache PWA, com testes de regressão para cada um dos 20 níveis, todas as facções, persistência e fallback.
5. Só aplicar a aparência da facção quando o pacto explícito for concluído. Não usar escolhas políticas pontuais como um gatilho de troca de sprite.

O pacote de origem e seus recortes foram preparado fora do repositório no atendimento que criou este documento. A ausência do PNG no GitHub impede a ativação automática do novo sprite até seu upload.
