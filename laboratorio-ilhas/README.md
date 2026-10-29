# Arquipélago dos Condenados — laboratório de gameplay

Esta é a **página permanente** para analisar e simular os encontros costeiros de *O Mar de Sangue*.

**URL prevista no Pages:** `https://pedromaintenance.github.io/o-mar-de-sangue/laboratorio-ilhas/`

## Fonte única e sincronização

- `index.html`: apenas a interface e as operações de simulação. **Não contém a tabela de eventos embutida.**
- `catalog.json`: proposta atual de balanceamento (19 cenários, 95 escolhas, cinco por evento). **Para mudar percentuais, títulos, textos e consequências, editar somente este arquivo.** O site carrega o JSON a cada visita, com URL anti-cache.
- `../SeaIslands.js` e `../SeaPoliticalEvents.js`: fontes do **jogo de verdade**, lidas com cache-busting em cada acesso à aba "Jogo atual". Mudanças no gameplay são exibidas nessa aba após a publicação do Pages; não há duplicação manual dessa lista.

A publicação do Pages acompanha os commits em `main`. Em uma alteração no catálogo, atualizar `catalog.json` e recarregar a mesma URL. **Não gerar novo HTML.**

## Limites e segurança

1. A simulação é isolada e **não escreve em saves**, não gasta ouro real, não altera a versão publicada do jogo.
2. Os cinco serviços são **propostas**; o jogo ainda usa as escolhas dos arquivos JavaScript de produção.
3. Os medidores de alinhamento representam um *conceito* de progressão, não um sistema de reputação persistente existente.
4. Os eventos de contrato continuam protegidos no gameplay até uma implementação explícita.
5. O Pages é estático e público: não contém segredos, tokens ou qualquer mecanismo de escrita autenticada no GitHub. A edição do catálogo ocorre pelo repositório.

Se o usuário realmente precisar de uma URL Pages em **outro projeto/repositório**, é necessário criar e configurar um segundo repositório, além da rota permanente acima. Aqui a rota foi isolada do jogo sem modificar a home.
