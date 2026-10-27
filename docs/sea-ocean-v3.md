# Mar de Sangue — Oceano V3

A água agora vem dos pacotes **`mar_de_sangue_agua_v3_escura_chunks_1024`** e **`mar_de_sangue_v3_atlases`**, fornecidos pelo projeto.

## Contrato visual

- Quatro texturas intercambiáveis de **1024 × 1024 px**.
- **8 quadros**, 160 ms por quadro, com índice sincronizado nas quatro superfícies.
- Atlas por chunk de **4096 × 2048** (4 colunas × 2 linhas).
- Os PNGs originais estão preservados nos ZIPs-fonte. Para carregamento no navegador, são publicados **WebP qualidade 94**, sem redimensionar a geometria, com SHA-256 fixado em `tests/sea-ocean-v3.test.cjs`.
- Os pixels de borda dos originais são compatíveis; a compressão WebP pode introduzir desvios de cor inferiores à arte original. O filtro NEAREST evita contaminação de frames adjacentes no atlas. As imagens não são espaçadas, giradas nem escaladas.

## Integração

- `SeaOceanV3.js` cria uma malha reciclável ancorada nas coordenadas do mundo. A ordem de chunks é determinística, independente da câmera, da fase e da sessão.
- Em dispositivos sem toque com WebGL e textura máxima de pelo menos 4096, carrega **4 atlas animados**; todos usam o mesmo quadro, a cada 160 ms.
- Em celular, Canvas ou GPU mais limitada, usa **4 WebP estáticos** e mantém o movimento das camadas sutis de espuma/névoa. Isso economiza memória gráfica e preserva resposta dos controles.
- Carregamento com fallback: se faltar um dos quatro arquivos, o jogo usa as texturas antigas, sem afetar movimentação, IA, colisões, inimigos e salvamentos.
- `sw.js` precacheia somente os WebP estáticos e o código; os atlas maiores entram no cache em tempo de execução quando de fato carregados.

## QA

Rodar `node tests/sea-ocean-v3.test.cjs` e o contrato de cache existente. Verificar no navegador desktop e mobile: ausência de emendas, 8 quadros na mesma fase, ondulação sutil, navio em escala original, ilhas e criaturas sobre a água, transição de câmera e jogo offline após carregar uma vez. O teste automatizado não substitui inspeção visual em dispositivo físico.