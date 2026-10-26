# Auditoria visual — Enguia animada e proa do Aríete

**Fase:** pré-alfa · ajuste de assets e renderização · 26/10/2026.

## Enguia das Profundezas
- **Substituição integral:** remover `assets/v15/beast_eel.png` e o fallback `assets/abyss/abyss_eel.png` do repositório e do pré-cache da PWA.
- **Novo asset:** `assets/v15/beast_eel_swim.webp` — a spritesheet enviada pelo autor, convertida para WebP com canal alfa. **Resolução original 2048 × 565**, quatro quadros de **512 × 565**, não reduzidos.
- **Carregamento:** `this.load.spritesheet('eel-swim', ..., {frameWidth:512,frameHeight:565,endFrame:3})`.
- **Animação:** ciclo de quadros 0–3 a aproximadamente 5,5 quadros/s, defasagem entre instâncias. A animação afeta apenas a textura visual; não altera colisão, dano, velocidade, orientação física ou salvamento.
- **Regra artística:** a cabeça da enguia fica **embaixo em cada frame**. O motor interpreta `heading=0` como direção para cima. A renderização adiciona 180° ao ângulo da criatura, garantindo que sua cabeça ataque na direção real da navegação.

## Aríete do Abismo
- O `assets/v15/ship_ram.png` tem a **proa desenhada para baixo**, enquanto o motor interpreta a frente como acima.
- O sprite `v15-ram` recebe o mesmo ajuste **visual** de +180°; `foe-ram`, se usado como fallback, preserva sua orientação original (a proa desse arquivo já está em cima).
- Movimento, IA, colisões e bônus de abalroamento continuam orientados por `e.heading` sem alteração.

## Testes
- `tests/eel-sprite-orientation.test.cjs`: novo arquivo, frame atlas, resíduos antigos, orientação visual, cache atualizado e isolamento da física.
- `tests/eel-sprite-visual.test.cjs`: Phaser real, em desktop e celular paisagem. Verifica origem `2048×565`, quadro `512×565`, pelo menos três frames diferentes durante o ciclo, rotação de `π` em `heading=0` e `3π/2` em `heading=π/2`, sem modificar o heading físico.
- `port-smoke`, `port-visual` e PWA seguem válidos; **QA físico em Android/Xbox permanece pendente**.

## Observações para a revisão dos assets
- O WebP tem compressão visual, mas **não redução de dimensões**; o PNG enviado permanece preservado como arquivo fonte fora do repositório.
- A galeria de auditoria passa a exibir o WebP novo; os arquivos PNG aposentados deixam de aparecer na árvore e no cache.
