# O Mar de Sangue — pipeline visual e bestiário

**Branch planejada:** `develop/bestiario-abissal-v10` (base: main 67918b1).  **Pixel art:** medieval sombria, perspectiva de topo, paleta carmesim/bronze/verde feérico.

## Objetivo desta iteração
Unificar a arte dos colecionáveis, HUD e melhorias, preservar colisões e o sistema de progressão, e acrescentar encontros sobrenaturais genuínos. Usar os conceitos já aprovados como fontes para sprites individuais e versões otimizadas.

## Fases / definição de pronto
- [x] F0 — Inspecionar bugs documentados nas capturas (colecionáveis gigantes, placeholders antigos, overlays vetoriais de upgrades). Confirmar codebase e acesso ao GitHub.
- [x] F1 — Preparar assets novos (11 PNGs): seis criaturas/ameaças menores e cinco imagens de chefes/efeitos/navios; recortar camadas sobrepostas, limpar transparência e documentar proveniência.
- [x] F2 — Escala e uniformidade: preservar correções v09, carregar console/overlays no Preloader e calibrar o tamanho do navio, itens e ilhas; retirar a lógica antiga de vela vetorial.
- [x] F3 — Encontros: integrar Kraken, Dagon/Arauto de Daegon, enguia, cortejo afogado, horror de coral, caranguejo e templo-tartaruga; ataques mágicos, telegráficos e invocação de reforços.
- [x] F4 — Campanha: bosses nos níveis 5/10/15/20 em rodízio, com progressão de dificuldade, aparições no sandbox nas ondas 5/10/15/20. Preservar saves, estaleiro infinito e abalroamento.
- [x] F5 — QA técnico: sintaxe, resolução das texturas, integração no Chromium com todas as imagens carregadas. Verificar que não há assets externos. Corrigir cache offline incluindo Phaser.
- [ ] F6 — PR e merge após verificar ao menos uma jornada completa e sequência de boss/porto sem travamentos. **Nunca afirmar teste real em Android; isso exige ensaio no dispositivo.**

## Decisões de lore
- **Kraken** é uma criatura marinha colossal autônoma.
- **Dagon/Arauto de Daegon** é uma interpretação jogável criada para este jogo, associada aos cultos submarinos; não declarar o desenho como descrição canônica do culto.
- Os **afogados, enguias e horrores de coral** são criações desta adaptação.

## Regras do pipeline
Cada sprint deve conter sprites individuais PNG RGBA, origens na documentação, indicação de escala em relação ao casco, integração funcional e capturas QA. A branch vem primeiro; a main só recebe depois da validação. A versão anterior deve permanecer recuperável por tag/commit.
