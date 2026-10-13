# O Mar de Sangue — PLANO DE PRODUÇÃO DE ASSETS

**Branch de trabalho:** `develop/assets-pixel-art`  
**Direção aprovada:** pixel art medieval sombria, **top-down**, legível em celular.  
**Regra:** jamais publicar direto na `main`. Cada fase é implementada, verificada, documentada e comitada nesta branch. Rever o plano com resultados antes da fase seguinte.

## Objetivo
Substituir artes procedurais provisórias da PWA por assets PNG consistentes e originais, mantendo:
- navegação e colisões/abalroamento;
- disparos laterais;
- estaleiro infinito e salvamento existente;
- missões e sandbox;
- recursos 100% locais no GitHub Pages/PWA.

## Bíblia visual — v1
- **Câmera:** vista superior real (proa na parte superior do sprite).
- **Paleta:** sangue profundo (#480c19 / #751222); espuma óssea (#e4cbbb); madeira (#6a4233); bronze envelhecido (#b88a4e); Corte Shadow Fey (#302338 / #8f5e86); névoa feérica (#83aaa8).
- **Silhuetas:** humanos da Costa Sul = proa de madeira, velas claras, construção pragmática; Corte = cascos escuros, velas ameixa e ornamentos élficos; aríetes = proas blindadas.
- **Lore:** Mar de Sangue é corrompido; Portomonte é refúgio da bênção de Deméter; ilhas de Daegon e povos kuo-toa representam culto hostil; Tortles e Tabaxis possuem tradições monásticas costeiras.
- **Técnica:** sprites PNG RGBA, fontes de alta resolução preservadas, jogo usa NEAREST/pixelArt; grade de 16/32 px como referência de escala; tiles realmente repetíveis (testar bordas).
- **Atenção:** as duas folhas de arte geradas são **conceitos de produção**, não PNGs prontos para tiles infinitos. Os navios estão sobrepostos à divisão 2×3 e o mar gerado não é seamless por padrão.

## Processo iterativo
1. [x] **F0 — Base e direção:** localizar repo, confirmar acesso, criar branch e salvar este plano. **Concluído.**
2. [x] **F1 — Extração e QC dos navios:** cortar sprites isolados (jogador, Corte leve, galeão, aríete, moeda, baú), padronizar transparência/escala e conferir PNGs; enviar assets e planilha/manifesto. **Concluído e comitado (ba74b172).**
3. [ ] **F2 — Mar e ilhas:** gerar tiles periódicos (não repetir diretamente conceitos com costuras), espuma/névoa alpha, recife, ruína e altar Daegon; comparar repetição 3×3; documentar limitações. **Parcial: tiles preparados e verificados; limpeza de ilhas e teste visual no jogo pendentes.** 
4. [ ] **F3 — Integração no Phaser:** trocar chaves de textura e referências no `Game.js`, garantir preloader e física inalterados; checar sprites, scale, mipmap/nearest, HUD, assets em modo offline. 
5. [ ] **F4 — Refinamento e animação:** esteiras/ondas, tiro lateral, clarão, impactos, destroços, danos de casco e feedback visual; reavaliar tamanho e desempenho no celular. 
6. [ ] **F5 — Regressão e entrega:** validar sintaxe, assets, navegação, modo missões/sandbox, upgrades/save, Service Worker, viewport e carga offline; abrir PR da branch para `main`. **Merge só depois de testes e aprovação.**

## Critérios mínimos por fase
- Sprite isolado: fundo realmente transparente e sem outros sprites; proa coerente com orientação do navio; alfa nas bordas sem halo preto.
- Tiles: as quatro bordas se encontram sem linhas óbvias ao repetir 3×3.
- Performance: sprites PNG enxutos, sem necessidade de rede na execução.
- Regressão: mecânicas existentes não podem ser substituídas por atalhos visuais.
- Registro: `docs/ASSET-REVIEW.md` recebe observações, próximos passos e resultados reais; nunca declarar teste no celular sem executá-lo.

## Log de execução
- 2026-10-13 — F0: GitHub `pedromaintenance/o-mar-de-sangue` conectado; branch isolada criada; fontes de arte iniciais localizadas. Próximo: F1.

- 2026-10-13 — F1: seis sprites recortados e orientados; PNG e QC em `assets/pixel/sprites/` e `docs/sprite-review.png`. F2 parcial: três tiles com bordas opostas idênticas, três ilhas com máscara automática em revisão. Commit `ba74b172`. **Próximo não executado:** F2.1 revisar visualmente e limpar a máscara das ilhas; F3 integrar arte com toggle A/B sem afetar colisões, radar ou salvamento.
