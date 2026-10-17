# O Mar de Sangue 3.6b — Cópia de Segurança do Capitão

**Situação:** integrada à `main` em 16/10/2026 pelo [PR #38](https://github.com/pedromaintenance/o-mar-de-sangue/pull/38), com smoke e Chromium aprovados. Verificação física no Pages pendente.

## Para o jogador

No Porto, o rodapé ganhou **↓ GUARDAR SAVE .JSON**, ao lado de **Reiniciar progresso**. A página de confirmação de apagamento também apresenta **GUARDAR CÓPIA DO SAVE** antes dos botões de voltar/apagar.

Clicar no botão baixa um arquivo `mar-de-sangue-save-v4-AAAA-MM-DD.json`. O arquivo contém:

- `format: "mar-de-sangue-captain-backup"`: identificação do formato;
- `schema: 4`: versão do save suportado atualmente;
- `exportedAt`: data/hora de exportação ISO 8601;
- `profile`: cópia normalizada do progresso atualmente exibido pelo jogo, incluindo ouro, melhorias, missões e registros consolidados.

A exportação é **somente leitura**: usa `SeaProfile.load()` e `Blob` + `URL.createObjectURL()` para download, mas não executa `SeaProfile.store()`, não chama `reset()` e não lê outras entradas do navegador. A pasta de destino é escolhida pelo navegador e pelo sistema operacional, conforme suas configurações.

## Limites de segurança

- **A exportação continua sendo somente leitura.** A restauração foi adicionada separadamente na [etapa 3.6c](captain-restore-3-6c.md), com escolha explícita do arquivo, comparação e duas confirmações. Simplesmente abrir o JSON não restaura progresso.
- O backup **não é criptografado**. Deve ser guardado em local seguro e compartilhado com cuidado.
- O backup **não inclui** áudio importado ou preferências do navegador: são recursos independentes armazenados em outras chaves e/ou IndexedDB.
- Não inclui a situação transitória de uma viagem em curso: recompensas só entram no perfil conforme regras de consolidação já existentes.
- Não há alteração na versão `SeaProfile` v4, economia, missões, estatísticas, hitboxes de combate, trilha ou Atlas.
- Os botões são HTML e mantêm os fluxos de mouse, toque e foco de teclado/controle. A confirmação de apagamento continua separada e exige a ação original.
- Em navegadores que bloqueiam downloads automáticos ou URLs de objeto, a interface retorna mensagem de erro e não muda o progresso.

## QA obrigatório

- [x] Contratos Node em `tests/port-ui-rebuild.test.cjs`: botão visível, arquivo JSON e nome, metadados de versão, perfil idêntico ao original, ação de reset preservada, nenhum efeito na economia.
- [x] Navegador real em `tests/port-visual.test.cjs`: interceptar download, ler JSON, comparar perfil com `SeaProfile.load()`, comparar `localStorage` antes/depois, screenshot nas resoluções 1600×900, 1280×720 e Android 390×844.
- [x] CI smoke e visual aprovados; squash merge `f1f4e60`.
- [ ] Verificar no Pages se Chrome desktop/Android geram um arquivo válido e íntegro.

## Horizonte

**3.6c (em validação):** importação/restauração de backups JSON v4 com validação estrita, comparação, confirmação dupla e snapshot anterior. Backups v5 continuam dependentes de futura migração, sem importar dados arbitrários. [Documentação da 3.6c](captain-restore-3-6c.md).

A 3.3b de reputação persistente ainda requer regras e migração v4→v5; este backup é uma rede de proteção adicional, não substitui a migração.
