# Fumaça de destruição das ilhas — animação de quatro quadros

## Origem verificada

O usuário forneceu um PNG **2288 × 682 RGBA**, feito de quatro quadros **512 × 682**, intercalados por três espaços **transparentes de 80 px**. O recorte dos quatro quadros corresponde exatamente, pixel a pixel, ao PNG original **2048 × 682**. O hash SHA-256 do novo arquivo é `4312c1099d88def9bc6a9ff765de17df9de7bf2f8b9fe7014472cf477cda8fbe`. O blob Git deve ser `d611b164a2b72626f1145ed5e1a9f3e668938026`.

**Caminho:** `assets/islands/island_destruction_smoke.png`.

**Key Phaser:** `island-destruction-smoke`.

**Loader:** `this.load.spritesheet('island-destruction-smoke','assets/islands/island_destruction_smoke.png',{frameWidth:512,frameHeight:682,spacing:80,endFrame:3})`.

**Quadros:** x = `[0,592,1184,1776]`. Sem margem externa, sem transformações de cor ou escala na fonte. Cada frame contém o efeito completo de fumaça e brasas.

## Gatilho de integração no gameplay

`SEA_ISLANDS.showDestructionSmoke(s,island)` cria uma animação em cima da ilha, com **frameRate 3**, `yoyo:true`, `repeat:-1`. A altura visual corresponde à altura gráfica padrão da ilha, `(island.radius * 2.8)` pixels (escala calculada usando **682**, altura de UM frame); profundidade 3, de forma que navios e HUD permanecem à frente. Não há giro.

Uma escolha de ilha pode acionar o efeito ao declarar **`destroysIsland:true`**. A seleção existente permanece inalterada; **nenhuma escolha de destruição foi inventada nesta alteração**. Quando as decisões do laboratório forem adotadas no gameplay, acrescente essa propriedade somente às escolhas que realmente destroem uma ilha ou templo. Esta imagem **não modifica colisões, visitas, mapa, save, facção ou a economia**.

A instância é guardada em `island.destructionSmoke` para evitar duplicação quando invocada novamente. A fumaça persiste até o encerramento da cena. O asset já integra o preload e precache PWA **v97**; a animação só aparece se o gatilho for executado.

## Integridade e testes

- `tests/island-destruction-smoke.test.cjs`: valida hash, PNG RGBA, dimensões, espaços, key, animação, escala, trigger e PWA.
- Envio binário via `.agents/skills/github-binary-assets/SKILL.md` (Drive Base64 → Git blob → tree/commit).
- A imagem original permaneceu intocada, sem redimensionar, repintar, refazer quadros ou introduzir novas artes.
