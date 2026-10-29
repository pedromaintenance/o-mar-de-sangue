# Conselho das Três Bandeiras — gameplay V100

## Acordo de design

Uma bandeira é um pacto político, não um prêmio automático por atingir reputação. Há três alinhamentos independentes (0–100), mas apenas um `faction.allegiance` ativo. A estrutura do perfil registra `allegiance`, `proofs`, `lockUntil` e os 24 movimentos de história mais recentes. O mundo de Carcaça não obriga o capitão a aderir a nenhuma facção.

**Etapas:** 20 pontos permitem reconhecimento narrativo, 40 pontos mais uma prova concreta permitem prestar juramento no Conselho de Portomonte. Os alinhamentos são registrados em `SeaProfile.settle` após a viagem. A prova pode ser registrada pela escolha de ilha e pelo contrato de resgate concluído.

| Facção | Provas aceitas pelo motor |
|---|---|
| Sobreviventes | `parley_1`, `refugees_1`, `refugees_4`, `ritual_1` ou **Resgate dos Afogados** concluído |
| Corte Feérica | `parley_2`, `refugees_2`, `convoy_2` |
| Culto de Dagon | `daegon_3` ou `ritual_3` |

**Juramento:** a ação `faction:<id>` na nova página Conselho das Três Bandeiras verifica os dois requisitos e grava o perfil uma única vez. Só um juramento ativo por vez. A bandeira define o atlas da próxima viagem e a prévia do porto; não mexe nos 15 upgrades, casco, colisões, canhões nem níveis.

**Deserção:** `desert` limpa a bandeira, reduz em 20 a reputação com a facção abandonada e exige **uma expedição independente** antes de aceitar outro juramento. Não destrói o navio nem o histórico do capitão.

## Assets e orientação

O Phaser carrega quatro atlases 1460×1560, grade 5×4 (20 quadros de 260×360, espaçamento transparente de 40). `SEA_FACTIONS.texture(profile)` seleciona o atlas segundo o pacto e usa o mesmo `SEA_PLAYER_SHIP.stage(profile.levels)-1`. A cena mantém rotação local de PI e a mesma escala e hitbox. O Conselho mostra 3 recortes dos atlas originais sem baixar 60 imagens duplicadas, e o PWA V100 armazena os atlas para uso offline.

- `player-ship-stages`: independente.
- `player-ship-survivors`: Sobreviventes.
- `player-ship-court`: Corte Feérica.
- `player-ship-dagon`: Culto de Dagon.

## Integrações

- `SeaFactions.js`: regras centralizadas de juramento e provas.
- `SeaIslands.js`: preserva alinhamentos e provas da expedição e registra feitos aceitos depois da decisão.
- `Game.js`: salva prova/alinhamento no fim da expedição e carrega sprite correspondente.
- `PortUI.js`, `PortUI.css`: Conselho acessível por mouse, teclado e gamepad.
- `SeaSaveTransfer.js`: backups validam e preservam campo `faction`.
- `SeaMenus.js`: representação do navio no Diário do Capitão adota a bandeira.

**Sem novos bônus de combate ainda.** A troca do casco é identitária; reações da IA, contratos exclusivos, perseguição de desertores e benefícios de cada facção serão parte do próximo ciclo, depois de balanceamento. Não prender a filiação a escolhas avulsas nem reclassificar inimigos por score instantâneo.

## Validação

`node --test tests/faction-council-v100.test.cjs`
`node --test tests/player-ship-20-stages.test.cjs tests/pwa-cache-contract.test.cjs tests/save-restore-3-6c.test.cjs`
