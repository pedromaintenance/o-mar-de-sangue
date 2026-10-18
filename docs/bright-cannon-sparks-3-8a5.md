# 3.8a.5 — Faísca de Ignição Legível (correção do borrão escuro)

**Estado:** publicado em 18/10/2026 pelo [PR #57](https://github.com/pedromaintenance/o-mar-de-sangue/pull/57), squash `f6924ab`. [Pages aprovado](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39176430237); testes da main aprovados ([run 39176430439](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39176430439)).

## Sintoma

Após a 3.8a.3 o jogador relatou que o sprite de preparação aparecia como **um borrão preto**, mesmo com o brilho presente na arte original de referência. Foi fornecido novamente o atlas original: uma imagem RGBA de **1536×1024**, dividida em seis células 512×512, das quais cinco são quadros de preparação.

## Diagnóstico

Havia **dois problemas combinados**:

1. **Arquivo de produção corrompido.** O PNG reduzido da 3.8a.3 tinha a assinatura/dimensões esperadas, mas a tentativa de decodificá-lo integralmente com Pillow falhou com `OSError: unrecognized data stream contents` no `IDAT`. A suite 3.8a.3 validava apenas cabeçalho/dimensões, portanto não detectava pixels inválidos. O rebuild temporário que tentou abrir o PNG da main confirmou a falha.
2. **Contraste e composição inadequados.** A preparação usava um sprite de 96px multiplicado por ~0,4, opacidade 0,54–0,8 e mistura padrão (normal). O elemento que sobressaía à pequena escala era a fumaça marrom-escura; a ignição branca/laranja ficava quase invisível sobre o Mar de Sangue.

## Implementação

- **Substituição real do arquivo `assets/fx/cannon_charge_sparks.png`:** PNG **RGBA8 válido** 480×96, cinco quadros de 96×96, reconstruídos em estilo de faíscas pixeladas quentes conforme a referência enviada. Somente pontos luminosos, rastros dourados e um halo laranja muito translúcido; nenhum volume opaco de fumaça escura.
- A imagem final está em ~**2,2 KB**, comprovadamente decodificável, com arquivo Git SHA `8fdc79d83d79f32482bcd224cac413ce70f3a510`. A construção é reproduzível em `tools/rebuild_cannon_sparks.py`, com Pillow usado apenas em desenvolvimento. O workflow temporário de reconstrução foi removido após verificar o binário.
- `SeaCannonChargeFx.js`: dois sprites persistentes, presos ao casco em `x=±55`, agora utilizam **`Phaser.BlendModes.ADD`** para iluminar em vez de escurecer. Escala base ~0,82 e opacidade 0,87–0,98. A progressão por estágio mantém cinco intensidades e oculta cada lado assim que cancela ou dispara.
- `sw.js`: cache offline **v61**, forçando atualização do asset anterior mesmo em instalações antigas.
- **Sem alteração** em `Game.js`, save v4, preparação de dois segundos, sistema soltar-para-rearmar, penalidade de velocidade, recuo, dano, controles, monstrários, contratos, limite FX 48 ou alocação de partículas. O efeito continua limitado a **dois sprites reutilizados**.

## Defesa contra regressão

- [x] `tests/cannon-sparks-luminous-3-8a5.test.cjs` **decodifica todo o PNG em Node**, valida CRC de cada chunk, `zlib.inflate` dos dados `IDAT`, filtros de todas as linhas e pixels finais. Cada um dos cinco quadros deve ter núcleo luminoso, vasta área transparente e **zero pixels opacos escuros**.
- [x] `tests/cannon-charge-sparks-3-8a3.test.cjs` passou a verificar também o modo aditivo e um tamanho visual mínimo.
- [x] `tests/mare-negra-hud-visual.test.cjs` verifica a textura, o blend aditivo, a opacidade e a escala na cena Phaser real em **1600×900**, **1280×720** e **390×844**, mantendo a regressão de carga/cancelamento/recuo.
- [x] `port-smoke` e `port-visual` aprovados no PR e na main após merge ([run 39176430439](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39176430439)).
- [x] [Pages publicado](https://pedromaintenance.github.io/o-mar-de-sangue/) ([run 39176430237](https://github.com/pedromaintenance/o-mar-de-sangue/actions/runs/39176430237)); roadmap atualizado.
- [ ] Validar subjetivamente em Chrome desktop, celular físico e PWA instalada; faíscas devem ser pequenas, nítidas, alaranjadas e nunca obscurecer o casco.

## Teste manual recomendado

Durante uma viagem, segure **Q** por um segundo. Uma pequena faísca dourada deve aparecer no bordo esquerdo; **E** prepara o direito, **ESPAÇO** prepara ambos. Se soltar antes de completar a carga, a luz some imediatamente e não há tiro. Mantendo após disparar, não volta outra ignição enquanto não soltar. O PNG deve estar visível mesmo com o mar escuro/vermelho no fundo.
