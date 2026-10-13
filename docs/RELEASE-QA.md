# QA e notas — O Mar de Sangue (Abissal v1.0)

## Bugs reportados nos prints
- [x] Ouro/moedas/baús/caixas e destroços: escalas de colecionáveis da v09 mantidas (moeda 0,34, caixa 0,42, baú 0,50; destroços ambientais ~0,42).
- [x] Arte heterogênea: porto, ilhas, navios, botão de controle e efeitos usam assets locais em PNG; sprites de criaturas novos.
- [x] Upgrades: camadas PNG de casco, velas, canhões e esporão, sem figuras antigas; **corrigido carregamento ausente das quatro texturas e do console na cena SeaBoot**.
- [x] Serviço offline: `phaser.min.js` passa a ser pré-cacheado explicitamente; cache versionado.

## Melhorias de mecânica
- Kraken: golpe de tentáculo com área telegráfica e enguias de reforço abaixo de 51% HP.
- Dagon, Arauto de Daegon: olho mágico de área e duas fases de invocação.
- Criaturas menores: IA reusa navegação, colisões e canhões do motor existente, mas usa padrões de ataques apropriados.
- Chefes de missão: 5 Almirante, 10 Kraken, 15 Dagon, 20 Fortaleza Abissal, repetindo a cada 20 etapas.
- Sandbox: o mesmo rodízio surge a cada cinco ondas, sem limite artificial de melhoria.
- Ao começar qualquer nova missão: limpa referências temporárias de efeitos, avisos, pausa e contadores de chefes.

## Execução de testes
Os dados de regressão do navegador estão em `docs/qa-browser.json`; capturas de teste em `docs/browser-*.png`.

## Limitações
Este pacote não afirma verificação em dispositivo Android físico. Cache do Service Worker é verificado por manifesto e verificação de caminhos; o fluxo de instalação real deve ser observado no navegador publicado.
