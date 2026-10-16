# Atlas 3.4 — Carta dos Náufragos

## Entrega funcional

O Atlas apresenta **somente informações já descobertas na expedição** e é uma nova vista modal do mapa físico existente, não um mapa de viagem rápida.

**Controles**

| Ação | Desktop | Xbox | Celular/toque |
| --- | --- | --- | --- |
| Abrir Atlas | `M` ou clicar na carta/radar | **View** (botão central esquerdo, índice padrão 8) | Tocar na carta/radar |
| Fechar Atlas | `M`, `Esc` ou `P`; clicar na carta | **B**, **View** ou **Menu/Start** | Tocar no painel para retornar |
| Pilotar/atirar enquanto aberto | Bloqueado | Bloqueado | Bloqueado |
| Navegar pelos marcos conhecidos | Setas | Direcional | Toque nos símbolos |
| Marcar/desmarcar destino | Enter ou clique no símbolo | A | Tocar no símbolo |

O botão View é *convencional* no mapeamento padrão da Gamepad API; não existe garantia de que todo controle exponha esse botão. A pausa original continua em Menu/Start. A verificação em controle físico permanece recomendada.

## Informações exibidas

- A carta usa as coordenadas reais `Game.W` e `Game.H` e mapeia a posição e o rumo atual do jogador sem mover o navio.
- A orientação norte é fixa e independe do giro da câmera.
- Ilhas entram em `chartDiscovered` apenas quando ficam no raio de percepção baseado no radar já existente (mais o raio físico da ilha).
- Ilhas visitadas ficam menos saturadas, mesmo que sejam de culto ou refúgio.
- O local do encontro **Três Bandeiras na Maré** usa um marcador distinto, **apenas depois de descoberto**, mantendo o mistério do evento.
- Cores ajudam a diferenciar naufrágios, ruínas, santuários e altares. A legenda evita depender exclusivamente da cor.
- O mapa não revela inimigos nem tesouros não descobertos, não cria destinos automáticos e não modifica o alcance de detecção.

## Restrições técnicas

- Implementado em `SeaAtlas.js`, carregado antes de `Game.js` e incluído no cache da PWA.
- O estado `chartDiscovered` é temporário na cena Game; sai com o encerramento da expedição. **Não foi alterado o Save v4** nem os cálculos de campanha.
- `SeaAtlas.js` não acessa `SeaProfile` ou o armazenamento do navegador.
- O Atlas só abre quando não há pausa, atracação, naufrágio, término ou outro modal ativo.
- Ao abrir, chama `touchReset()`; enquanto aberto, o update da navegação retorna antes de mover o navio, e `fire()` e `touchStart()` rejeitam comandos.
- O clique no radar é roteado pela mesma função de ponteiros do botão Pausa; nenhuma hitbox de combate foi removida ou deslocada.
- Ao fechar, a cena permanece em navegação normal, com o mapa destruído. O evento de encerramento da cena destrói os objetos Phaser associados.
- O mapa **não gera sprites nem redesenha objetos físicos do mundo**; só apresenta marcadores na interface.

## Testes e cenários de QA

- [x] Contrato Node cobre descobertas, contagem de visitas, exclusão de local oculto, regras de modal e ausência de gravações.
- [ ] Chromium: 1600×900, 1280×720 e 390×844 emulando Android, capturas do Atlas e do encontro político descoberto.
- [ ] Browser: M, Esc, gamepad B e toque na carta, sem disparos/deriva do navio durante o Atlas.
- [ ] CI verde, PR publicado e inspeção na versão Pages.
- [ ] Teste manual recomendado com controle Xbox real e PWA instalada.

## 3.4b — Rumos da Carta (implementado, validação em curso)

A carta agora aceita **um waypoint manual por expedição**, restrito aos marcos descobertos. Ao abrir a carta, o primeiro marco conhecido recebe foco. Setas/Enter, direcional/A ou clique/toque sobre o símbolo selecionam o destino; a mesma seleção desmarca. Toque fora dos símbolos continua fechando o modal.

A bússola é geográfica: **0° norte, 90° leste, 180° sul e 270° oeste**. A distância é dada em **unidades do mundo** (não milhas náuticas). O indicador de correção refere-se à proa do navio: positivo a estibordo, negativo a bombordo. A carta desenha uma linha direta, que **não é rota segura, piloto automático nem fast travel**.

O destino continua visível como indicação no radar/HUD quando o Atlas fecha. Se estiver além do alcance do radar, a marca fica na **borda** indicando só direção, não proximidade. Seleção e foco são estados transitórios da cena (`chartWaypointId`, `atlasFocusedId`, `atlasPoints`): não há mudança em `SeaProfile` v4, persistência, progressão, combate ou custos.

**QA:** testes Node cobrindo a restrição de descoberta, rumos cardeais, foco, marcação/desmarcação, retorno ao jogo e reset por expedição; testes de navegador com screenshots em 1600×900, 1280×720 e Android 390×844, HUD e save intacto. A revisão do CI, o teste físico no Xbox/PWA e a verificação do Pages permanecem pendentes até execução.

## Próximos passos posteriores — Atlas (não implementados)

1. Refinar cartas com escala gráfica, identificação contextual dos locais e alertas de obstáculos sem interferir na pilotagem manual.
2. **Rotas e domínio de facções** podem aparecer apenas após introdução do sistema de reputação 3.3b; não inventar domínio de ilhas não estabelecido pela lore.
3. Implementar descoberta persistente só depois de definir versão de save, migração, vínculo entre mapas e política de reset de campanha.
4. Melhorar símbolos e texturas com assets autorais sem transformar o mapa num painel pesado em dispositivos móveis.
