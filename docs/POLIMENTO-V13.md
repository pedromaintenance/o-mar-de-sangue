# O Mar de Sangue v1.3 — Polimento visual e animações

## Escopo implementado
- Novos quadros PNG locais: espuma/rastro, brilho de tesouro, fumaça, explosão, aura feérica (4 quadros cada) e halo de santuário.
- Balanço do casco/velas e overlays de melhorias num único contêiner visual, sem alterar o corpo usado pela física.
- Esteira animada de movimento e rastro para embarcações; criaturas pulsantes/espectrais.
- Kraken e Dagon têm pulsação, aura, aviso visual e novos efeitos nas magias; navios inimigos mantêm silhuetas independentes.
- Itens recebem brilho e bobbing controlado; coletá-los cria uma estrela. Moedas, baús e caixas permanecem pequenos.
- Ilhas têm halos animados por proximidade. Destroços animados e inativos fora da vizinhança do jogador.
- Impactos e canhões recebem animações adicionais de fumaça/explosão. Projéteis causam flash breve na embarcação.
- HUD recebe três barras discretas: casco, recarga bombordo, recarga estibordo.
- Removidos muitos tweens infinitos de 50 itens + vários marcos; atualização visual centralizada e limitada em área.
- Pacote offline inclui todos os novos quadros de animação. Controles e salvamento v4 preservados.

## Escopo fora desta entrega
- Deformação quadro a quadro de cada membro de todos os monstros e veleiros (requer folhas de animação de personagem dedicadas, ainda não produzidas).
- Áudio original, acessibilidade avançada e campanha extra não entraram neste ciclo.

## QA
- Node: `Game.js` e `sw.js` passam na verificação de sintaxe. 71 texturas carregadas por `SeaBoot` existem e constam no cache do PWA; 83 recursos essenciais listados.
- Chromium headless com assets locais: menu, missão, Kraken, progressão de sandbox até onda 10 e invocação do Kraken, quatro overlays de upgrades e controle multitoque por duas entradas sem erros JavaScript e sem 404 nos testes isolados.
- Imagens de evidência em `docs/v13-mission.png` e `docs/v13-kraken.png` (cenários isolados, não comprovam gameplay prolongado).
- Regresso de controle físico Xbox e instalação Android em aparelho real não foram realizados neste ambiente.
- **Restrição conhecida:** Chromium headless travou no teste de viagem 1 → porto → viagem 2, inclusive com renderer desabilitado; não foi possível obter aprovação completa da transição em teste automatizado. Há registro da mesma limitação nas versões anteriores.
- Ajuste de jogabilidade: 3 s de proteção inicial contra dano para permitir assumir o controle antes de combate imediato; o empurrão/colisão permanece físico.
