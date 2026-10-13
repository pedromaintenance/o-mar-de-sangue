# O Mar de Sangue — plano de produção de pixel art e bestiário

**Direção:** pixel art medieval sombria, top-down, legível em celular. **Desenvolvimento:** `develop/bestiario-abissal-v10`. **Integrado à main:** PR #2, commit `4f022e5`, em 13/10/2026.

## Fluxo e fases
- [x] F0 — Inspecionar as capturas e confirmar acesso, código e branch.
- [x] F1 — Recortar e preparar 11 PNGs originais: navios cultistas, criaturas e chefes Kraken/Dagon, com transparência limpa e tamanhos apropriados.
- [x] F2 — Manter colecionáveis reduzidos; substituir o console antigo; eliminar desenhos vetoriais residuais dos upgrades; **corrigir os preloads ausentes** do console e das camadas de upgrade.
- [x] F3 — Integrar criaturas sobrenaturais e ataques distintos: tentáculos telegráficos, magia da maré, afogados invocados e fauna hostil.
- [x] F4 — Rodízio de chefes a cada 5 missões/ondas e preservação de abatimento por canhões/abalroamento, salvamento v4 e estaleiro infinito.
- [x] F5 — Testes isolados no Chromium: inicialização, Kraken, Dagon com reforços, sandbox onda 10 e camadas de upgrades; sintaxe JS e integridade dos caminhos offline.
- [x] F6 — Commit em branch, PR #2 e merge conferido na `main`.
- [ ] F7 — Aceitação em celular real: carregar duas viagens consecutivas, instalar PWA, navegar offline e verificar desempenho sob ondas altas.

## O que os testes não provaram
O teste automatizado de viagens consecutivas mostrou que a segunda cena de jogo completou a inicialização, porém o renderer Chromium headless congestionou antes de confirmar a partida. Isso **não** equivale a um teste de jogabilidade contínua bem-sucedido. O commit foi integrado com esta limitação explicitamente documentada. Não foi realizado teste em Android físico.

## Próxima etapa
Recolher evidências do uso real, ajustar transição/consumo de memória se necessário e só então passar a novas animações e padrões de chefes. Cada nova iteração deve nascer em uma branch própria, manter os assets locais e atualizar este plano antes do merge.

## Nota de ambientação
**Kraken** é uma ameaça marítima colossal. **Dagon, Arauto de Daegon** é a representação criada para este jogo e não constitui declaração de cânone sobre Daegon. Afogados, enguias e terrores de coral aqui representados são adaptações originais.
