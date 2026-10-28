# Dagon, Senhor das Profundezas — encontro de chefe

**Implementação inicial:** 28/10/2026. A identidade do Senhor das Profundezas é independente do Arauto.

## Entrada e progressão

- Campanha: estreia na **missão 40**; retorna a cada 100 missões (140, 240...). Missões Kraken 10/30/50... e a Devoradora de Juramentos 25/75... são preservadas.
- Sandbox livre: reserva a **onda 20** e, depois, a cada 60 ondas (80, 140...). Não participa do sorteio comum. Quando Kraken ou Arauto estiverem despertos, a aparição do Senhor fica pendente até o encerramento desses confrontos.
- O Arauto continua sendo invocado exclusivamente pelo Olho sentinela no sandbox. O Senhor não substitui esse ciclo.
- Missão: a vitória exige derrotar especificamente o Senhor; eliminar outro chefe não completa seu objetivo.

## Mecânica exclusiva

**Fenda de Sangue:** Dagon marca o mar no ponto projetado de navegação com um círculo pulsante. O jogador recebe um aviso com 1,05 s de antecedência para sair da área. Ao fechar, a fenda causa dano (72% do ataque do chefe) e +12 de Maldição somente se atingir. Não existe dano instantâneo ao colocar a marca.

**Primeira ruptura (70% de PV):** abre dois Olhos de Dagon como reforços.

**Segunda ruptura (35% de PV):** abre outros dois Olhos e diminui em 22% o intervalo básico entre ataques.

A própria spritesheet do Senhor (2048×682; quatro quadros RGBA de 512×682) é animada a 2,5 quadros/s, em 0°, independente de rumo e colisão. O Arauto conserva seus próprios quatro quadros a 4 fps e suas duas fases antigas.

## Parâmetros iniciais — sujeitos a balanceamento
Vida 1.800, ataque 82, raio de colisão 245, deslocamento 48, intervalo básico entre ataques 2.450 ms, recompensa 1.200, antes dos multiplicadores de dificuldade existentes. Estes valores são provisórios; precisam de teste jogável em desktop e celular.

## Segurança e regressão
Nenhuma estrutura do save foi modificada. Recarregamento PWA versionado; assets originais não são convertidos nem reamostrados. Validar `node --check Game.js`, `node tests/dagon-lord-encounter.test.cjs`, `node tests/dagon-four-frame.test.cjs` e demais testes das sentinelas. Verificação física de controles e balanço em navegador ainda necessária.
