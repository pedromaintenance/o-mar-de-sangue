# Direção de arte — pixel art do Mar de Sangue

## Hotfix v1.9.3 — fidelidade visual restaurada

**A experiência do jogador deixou de usar os sprites experimentais da v1.9.2.**
Eles permaneceram no repositório somente como **arquivo técnico / experimento rejeitado**.
O HTML, o precache do service worker e as cenas voltaram ao pipeline visual da v1.9.1;
as texturas `pixel-*` criadas por `SeaRasterAssets.js` **não são carregadas em jogo**.

### Causa do problema

O pacote experimental reduziu pinturas detalhadas dos atlas a:
- título de **112 × 52 px** (exibido a cerca de **407 × 188 px**);
- ilhas e ornamentos de **40 × 40 px** (substituindo sprites de 256 px);
- botões de **48 × 22 px**, redimensionados para larguras superiores a 400 px;
- apenas 15 cores opacas por sprite e um índice adicional marcado como transparente.

O renderizador Phaser com NEAREST foi correto para pixel art, mas **não pode restaurar detalhes
já destruídos por redução e quantização**. Em sprites com regiões escuras,
o índice convertido indevidamente para transparência abriu lacunas na imagem.
A revisão verificou apenas se os arquivos decodificavam e se os botões respondiam,
**não se a qualidade visual permanecia aceitável**. Isso foi um erro de validação.

### Diretrizes para a próxima implementação

1. Usar os atlas originais de alta resolução como fonte e salvar **PNGs RGBA individuais**,
   conservando resolução suficiente para cada tamanho exibido. Não substituir sprites
   de 256 px por miniaturas de 40 px quando o jogo os amplia.
2. Recortar elementos separadamente, com canal alfa de verdade. Nunca transformar
   a primeira cor de uma imagem opaca em transparência automaticamente.
3. Evitar quantização agressiva de 15 cores para texturas ricas. Se paletizar,
   comparar a imagem produzida lado a lado com o original na resolução de exibição.
4. Para botões que variam de largura, produzir molduras reais de nove fatias,
   preservando cantos e separando explicitamente áreas elásticas.
5. Testar visualmente **menu principal, estaleiro, pausa, resultados, ilhas, mar
   em movimento e controles mobile/desktop** em navegador, antes de integrar.
6. Manter a arte original versionada, não substituí-la apenas por um atlas compactado.

## Arquivos de arquivo (não utilizados no runtime da v1.9.3)

- `SeaRasterAssets.js`
- `SeaRasterDataA.js`
- `SeaRasterDataB.js`

As artes existentes em `assets/islands`, `assets/tiles` e `assets/sprites`
continuam como fontes ativas da versão restaurada.
