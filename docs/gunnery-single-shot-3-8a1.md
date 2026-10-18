# 3.8a.1 — Uma salva por acionamento (correção de disparo automático)

**Problema reportado em 17/10/2026:** na 3.8a.0, manter pressionado Q/E/ESPAÇO, o gatilho do Xbox ou o botão de toque disparava novamente assim que terminava a nova preparação. Em níveis altos de `Serventes Treinados`, o intervalo entre disparos se aproximava do limite de recarga de 90 ms, criando o efeito indesejado de **metralhadora**.

## Regra corrigida

O ciclo válido de **cada bordo** é:

1. Pressionar e **segurar** o comando para iniciar a preparação (2 s no nível zero, decrescendo exponencialmente segundo `SeaGunnery.chargeMs`).
2. Ao concluir a preparação e satisfazer a recarga, disparar **uma única salva**.
3. Travar o bordo depois da salva. Manter pressionado por qualquer duração **não produz outros disparos**.
4. **Soltar completamente** todos os comandos desse bordo (incluindo dedos, teclado e Xbox simultâneos) para rearmar. Só uma nova pressão pode iniciar a preparação seguinte.

**Espaço / dois gatilhos:** cada lado mantém seu próprio bloqueio; uma pressão de ESPAÇO pode disparar uma salva de bombordo e outra de estibordo, mas não pode iniciar uma segunda série sem soltura.

**Interrupções:** ao soltar antes da carga completa, perde-se o progresso parcial; pausa, atlas, doca e perda de foco também cancelam a preparação, sem acumular carga oculta.

A melhoria `Serventes Treinados` continua diminuindo o **tempo de preparação**, não o número de tiros gerados por acionamento. O limite de recarga antiga permanece como trava adicional. O recuo, FX, inimigos e comportamento físico dos monstros mantêm as regras da 3.8a.0.

## Escopo e compatibilidade

- `Game.js`: `cannonNeedsRelease.port/starboard` explicitamente controlado no mesmo loop de inputs que gera a carga, sem eventos instantâneos de tiro.
- `PortUI.js`: instruções de teclado e Xbox passam a explicar a soltura para rearmar. Mensagens iniciais desktop/mobile seguem o mesmo contrato.
- `sw.js`: **v57** para obrigar PWA instalada a atualizar o código; nenhuma imagem ou som novo.
- Sem mudanças no esquema de **save v4**, no custo de upgrades, no estaleiro, na dificuldade da IA ou nos efeitos de recoil.

## Critérios de aceite

- [x] Regressão Node nova `tests/gunnery-single-shot-3-8a1.test.cjs`: segurar por 15 segundos gera apenas uma salva; soltar e pressionar permite exatamente mais uma.
- [x] Cobertura de ESPAÇO/ambos os bordos, dois dedos no mesmo botão, mistura teclado+gatilho Xbox, níveis de cadência extremos, interrupção por pausa e toques curtos que não acumulam carga.
- [x] Regressão de 3.8a.0 adaptada ao estado de rearme, preservando a preparação de 2 s e as regras de monstros.
- [x] Verificação Chromium: disparar uma vez, manter segurado por mais dez segundos de simulação, soltar e rearmar; desktop e Android emulado.
- [x] CI `port-smoke` e `port-visual` verdes no PR e pós-merge ([run 39086251515](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39086251515)).
- [x] [PR #53](https://github.com/pedromaintenance/o-mar-de-sangue/pull/53) integrado na `main` (squash `62a2532`); [GitHub Pages](https://pedromaintenance.github.io/o-mar-de-sangue/) publicado ([run 39086251234](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39086251234)), roadmap atualizado.
- [ ] Teste físico de toque, Xbox e teclado; balancear o recuo depois da confirmação desta correção.

**Comportamento esperado no teste manual:** segure Q por dois segundos, observe **um** disparo e o contador zerar. Se continuar segurando por mais dez segundos, não haverá outra salva. Solte Q e segure por mais dois segundos para disparar novamente. Repita com ESPAÇO e no celular.
