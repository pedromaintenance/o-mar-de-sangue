# O Mar de Sangue 3.6j — Cache de redesenho do clima

**Estado:** implementação na branch; CI pendente. Melhoria gráfica conservadora, sem redução de qualidade.

## Observação de código

Na revisão de `SeaWeather.js`, o renderer redesenhava a barra da maldição e limpava as camadas de céu/remoinho **a cada atualização**, mesmo quando os valores, eventos e elementos exibidos não mudavam. Também reaplicava `setAlpha`, `setFillStyle` e `setText` repetidamente. Isso gera chamadas evitáveis à camada gráfica. Esta revisão é uma otimização por inspeção de código; **não há ainda benchmark real comprovando ganho em FPS**.

## Mudança

- **Neblina e sobreposição:** `seaMist.setAlpha` e `seaOverlay.setFillStyle` só são aplicados na primeira renderização ou quando `seaEvent` muda.
- **Chuva e névoa:** a animação permanece na cadência original (a cada ~0,12 s) em `storm` e `fog`. Em clima sem essas camadas, o gráfico é limpo **uma vez** ao abandonar chuva/névoa, sem chamadas `clear()` redundantes.
- **Remoinho:** o desenho e seu movimento permanecem por quadro enquanto o remoinho está ativo. Quando some, é limpo apenas uma vez. As forças, o dano e a duração do remoinho não mudaram.
- **Aviso do clima:** `setText` só é chamado quando a descrição de evento/maldição exibida muda.
- **Barra da maldição:** repintura somente se a largura em pixels ou a cor dos limiares de 40%/75% mudar. A largura é representada em pixels inteiros, sem mudanças nas variáveis reais de maldição.
- Todo cache é **exclusivo da cena** e reinicializado em `SEA_WEATHER.init`. Transições de clima invalidam as partes necessárias.

## O que deliberadamente NÃO muda

`SEA_WEATHER.update`, `applyForces`, `enemyCurrent`, `SEA_WEATHER.choose`, aleatoriedade da chuva, combate, missões, tempo da tempestade, maldição real, física, IA, áudio, hitboxes, HUD principal, progresso e `SeaProfile` v4. As texturas da água, partículas e limite de efeitos continuam os mesmos; o renderizador de clima mantém sua intensidade.

O serviço PWA usa cache **v50** para disponibilizar a mudança offline. Não existe ajuste automático de qualidade, detecção de aparelhos nem redução de efeitos.

## QA

- [x] Novo `tests/weather-redraw-cache-3-6j.test.cjs`: clima constante sem chamadas redundantes; invalidações em tempestade/névoa; gotas e remoinho continuam desenhados; estado físico intacto.
- [x] `tests/mare-negra-hud-visual.test.cjs`: mede chamadas reais de `Graphics.clear`, `setAlpha`, `setFillStyle`, `setText` numa viagem Phaser em desktop e Android emulado, verificando saída/entrada de tempestade.
- [x] `tests/soundscape-3-5.test.cjs`, HUD, controles, saves, PWA e demais regressões continuam obrigatórios.
- [ ] CI `port-smoke` e `port-visual` verdes antes do merge.
- [ ] Teste físico do Pages/PWA: observar transições de tempestade/névoa/remoinho e comparar dois relatórios FPS de durações semelhantes no mesmo dispositivo.

## Próxima etapa

A próxima otimização de partículas ou desenho procedural do mar deve ser guiada por dados coletados no aparelho real. Sem eles, o foco é eliminar trabalhos comprovadamente redundantes **sem sacrificar fidelidade**. Comparações de FPS ainda usam métricas aproximadas do `Game.update`, não medição de GPU.
