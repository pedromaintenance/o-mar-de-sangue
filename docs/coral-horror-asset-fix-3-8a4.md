# 3.8a.4 — Horror de Coral: remoção da faixa de pixels soltos

**Estado:** correção de asset na branch, aguardando aprovação completa do CI, integração e publicação.

## Relato e diagnóstico

Em 18/10/2026, uma captura da Missão 7 mostrou o **Horror de Coral** com uma faixa azulada/avermelhada desconectada do corpo, parecendo uma parte do monstro cortada e projetada à distância.

A análise das imagens reais do repositório identificou duas artes diferentes:

- `assets/abyss/coral_horror.png` — sprite antigo, sem a faixa, **não** é a imagem usada na missão atual.
- `assets/v15/beast_coral.png` — arte detalhada atualmente selecionada pelo `Game.spawnEnemy` (`v15-coral`); tinha **323×330 px**, dos quais **28 linhas superiores** eram fragmentos de atlas desconectados acima do corpo do monstro. Quando o sprite girava durante a luta, a faixa parecia um elemento separado flutuando pelo mar.

**Causa:** pixels intrusivos dentro do próprio PNG utilizado como sprite único. Não era erro na `setOrigin`, no tamanho dos frames do Phaser ou na colisão.

## Correção aplicada ao arquivo binário

A correção **modificou o PNG original do jogo**, sem reimaginar o monstro, sem substituir a arte por um sprite inferior e sem alterar qualquer outra imagem:

- `assets/v15/beast_coral.png`: recorte físico das primeiras **28 linhas**, passando de **323×330** para **323×302 pixels**, preservando a transparência e todos os pixels retidos do monstro.
- `tools/repair_coral_png.py`: script de reparo reproduzível, usando apenas a biblioteca padrão Python (`zlib` e CRC de PNG), para documentar exatamente como os dados foram preservados. Como o primeiro scanline retido dependia da linha removida, foi corretamente reconstruído com filtro PNG 0; os demais scanlines foram conservados.
- `Game.js`: **nenhuma alteração necessária**: a cena continua escolhendo `v15-coral` por padrão e usando `sourceH` da textura para ajustar o tamanho visual à definição da criatura (raio 76). O sprite continua aproximadamente na mesma altura em tela, com as mesmas hitboxes e ataques.
- `sw.js`: cache da PWA alterado para **v60**, garantindo que usuários com o PNG antigo em cache recebam a versão corrigida.

A automação temporária utilizada para reparar o binário na feature branch foi removida após o reparo; apenas o script reprodutível e a textura já corrigida seguem para `main`.

## Critérios de qualidade e testes

- [x] Conferência visual do PNG antigo e do PNG reparado: desaparece a faixa superior, mas cabeça, corais vermelhos, garras, corpo e tentáculos permanecem.
- [x] `tests/coral-asset-3-8a4.test.cjs`: valida dimensões **323×302**, PNG RGBA8 não entrelaçado, assinatura e CRCs, scanlines descomprimidos, presença de pixels da criatura, uso de `v15-coral` em `Game.js` e inclusão no cache offline.
- [x] `tests/mare-negra-hud-visual.test.cjs`: instancia o Horror de Coral na cena real do jogo e verifica textura, tamanho visual equivalente, raio físico 76, e salva uma captura por viewport (1600×900, 1280×720, 390×844).
- [ ] Aprovar `port-smoke` e `port-visual` no PR e na `main` pós-merge.
- [ ] Confirmar publicação no GitHub Pages e registrar links dos pipelines no roadmap.
- [ ] Testar em dispositivo físico e confirmar ausência da faixa ao girar/avançar contra o navio.

## Proteções

Nenhuma mudança em quantidade de inimigos, vida, dano, agressividade de monstros, animações de recuo/faíscas, economia, save v4, atlas, controle ou eventos políticos. A correção é **estritamente de qualidade do sprite**.

### Teste manual

Abra o jogo, avance até encontros com **Horror de Coral** ou continue sua campanha (Missão 7) e observe uma criatura enquanto ela se desloca e gira. Não deve haver barras, diagonais ou fragmentos desconectados pairando próximos ao corpo. Para aplicativos instalados, feche e reabra a PWA para permitir a atualização v60.
