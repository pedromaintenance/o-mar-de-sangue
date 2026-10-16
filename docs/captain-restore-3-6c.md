# O Mar de Sangue 3.6c — Restauração segura do Capitão

**Estado:** implementação e testes submetidos à revisão CI. Sem migração ou alteração do esquema `SeaProfile` v4.

## Fluxo do jogador

No Porto, `↑ RESTAURAR SAVE .JSON` permite escolher um arquivo criado por **GUARDAR SAVE .JSON** da versão 3.6b. O navegador lê esse arquivo localmente, sem upload à rede.

1. **Escolha do arquivo.** Apenas texto JSON limitado a 256 KB. O conteúdo precisa conter exatamente `format: mar-de-sangue-captain-backup`, `schema: 4`, `exportedAt` ISO e um `profile` v4 com os campos canônicos.
2. **Validação antes de gravar.** Todos os números devem ser inteiros não negativos dentro de limites seguros; missão ≥1; somente `mission` ou `sandbox`; cada uma das 14 melhorias esperadas deve estar presente, sem extras, com nível entre 0 e 999999. Campos inesperados, JSON inválido e backups v3/v5 são recusados sem tocar no progresso.
3. **Comparação.** A tela mostra lado a lado ouro, missão, expedições, vitórias, melhor onda e soma de níveis de melhorias atuais e importados. A proposta inicial dá foco em **CANCELAR**.
4. **Duas confirmações distintas.** Primeiro **CONTINUAR RESTAURAÇÃO**; depois **SIM, RESTAURAR SAVE**. `Escape`, `Backspace`, menu ou Cancelar preservam o progresso.
5. **Cópia de segurança automática.** Antes de escrever o save importado, o jogo registra no mesmo navegador uma cópia recuperável da situação anterior, na chave `carcaca.mar-de-sangue.restore-rollback.v1`. Se essa gravação falhar, o save atual não é substituído. Em falhas de gravação seguintes, há tentativa de reversão.
6. **Desfazer.** Enquanto o snapshot estiver disponível, surge no Porto **↶ DESFAZER RESTAURAÇÃO**. Ele abre o mesmo comparador e exige as mesmas duas confirmações. Desfazer gera novo snapshot do estado substituído, permitindo reversão da operação.

A substituição **não** altera preferências de som, músicas de IndexedDB, PWA, conquistas temporárias de viagens nem arquivos fora do save v4. A restauração acontece somente no Porto, não durante combate.

## Precauções e limitações

- Os backups exportados são JSON sem criptografia. Guarde-os em local confiável.
- O snapshot pré-restauração é **local**, não substitui a exportação em arquivo, e pode desaparecer se o navegador limpar armazenamento. Apenas **um snapshot** é retido; uma nova restauração o substitui.
- Rejeitar backups de esquema v5 é intencional; ainda não existe migração oficial da reputação persistente 3.3b.
- Não há sincronização entre dispositivos nem importação de dados arbitrários. Arquivos antigos incompatíveis devem ser migrados em etapa própria.
- A gravação local é separada do armazenamento de áudio. A opção de apagar o progresso no menu mantém seu comportamento anterior.
- Na PWA, a nova versão `v43-restore` adiciona `SeaSaveTransfer.js` ao precache, enquanto os demais recursos existentes permanecem disponíveis.

## QA

- [x] `tests/save-restore-3-6c.test.cjs`: formato, limites, arquivos maliciosos/inválidos, isolamento sem gravação, ordem do snapshot, undo e erros de armazenamento.
- [x] `tests/port-visual.test.cjs`: importar JSON verdadeiro no Chromium em 1600×900, 1280×720 e Android 390×844; prévia sem escrita; cancelar; JSON inválido; confirmação em duas etapas; verificar progresso restaurado e desfazer; screenshots.
- [x] Contrato Node existente atualizado para a dependência adicional.
- [x] GitHub Actions observa o módulo novo e executa teste Node além dos testes de navegador já existentes.
- [ ] **Aguardar CI verde antes de integrar à main.**
- [ ] Teste no Pages/PWA instalada e arquivo exportado em outro navegador.

## Próxima melhoria

Priorizar [proposta de reputação 3.3b](reputation-3-3b-design.md): definir decisões, limiares, ganhos e perdas independentes e migração v4→v5 documentada e testada. A restauração 3.6c cobre intencionalmente somente backups v4.
