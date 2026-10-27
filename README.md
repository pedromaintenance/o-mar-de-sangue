# O Mar de Sangue

## Auditoria de assets (pré-alfa)

Acesse a [galeria de auditoria](https://pedromaintenance.github.io/o-mar-de-sangue/asset-audit.html) para consultar imagens, sprites, efeitos, ícones e áudio referenciado no jogo. O catálogo compara a árvore pública do repositório com referências encontradas nos scripts e a lista de pré-cache da PWA; permite filtrar, inspecionar dimensões, verificar possível ausência e exportar JSON/CSV.

**Importante:** “sem referência literal” não significa necessariamente “não utilizado” (o jogo pode gerar caminhos dinamicamente). Caso a API de arquivos do GitHub falhe, o catálogo opera em modo parcial usando o pré-cache e o código de carregamento. A auditoria é somente leitura e **não exclui assets**.

PWA offline de combate naval na Carcaça. Consulte [ROADMAP.md](ROADMAP.md) para prioridades, entregas e critérios de conclusão.

A identidade oficial é **Porto 3.0 — A Maré Negra**. O layout clássico
continua acessível com `?theme=classic`.

Notas de versões anteriores: `docs/RELEASE-V151.md`.


## Chefe naval — A Devoradora de Juramentos
A arquinau cultista de Daegon usa exclusivamente `assets/abyss/cult_barge.png`.
Spritesheet 2048×646, quatro quadros horizontais de 512×646, proa para baixo.
Ela estreia como chefe da missão 25 (a cada 50 missões), e no sandbox como
chefe da onda 15 (a cada 30 ondas). Tem cinco projéteis por salva, um
círculo ritual de sangue telegrafado e convoca dois reforços quando a
integridade cai abaixo de 48%. Não entra no sorteio dos inimigos comuns.
Os encontros existentes com Kraken/Dagon não são alterados.
