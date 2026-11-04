# V114 — Configurações do Porto

## Escopo
Concentrar em uma página os comandos que estavam no cabeçalho, rodapé e abaixo dos seis cartões principais.

- **Áudio:** música, efeitos, silenciar, importar trilhas e status de carregamento.
- **Interface:** leitura ampliada (preferência local ao navegador).
- **Desempenho:** indicador FPS, exportar relatório e comparar arquivos JSON.
- **Dados e progresso:** baixar save v4, restaurar arquivo, desfazer a última restauração e reiniciar progresso mediante confirmação.

## Navegação
- Novo botão **⚙ CONFIGURAÇÕES** no cabeçalho do Porto e das páginas internas. O botão **VOLTAR AO PORTO** permanece em telas secundárias.
- A página de configurações tem Voltar e suporta Esc/Backspace/B.
- O rodapé e o final do menu principal não contêm mais controles administrativos.
- A página de configurações permite scroll quando necessário; a tela inicial mantém o padrão responsivo V113.

## Garantias
- Nenhum dado migrado. Save v4, preferências independentes de som e leitura, restauração em duas etapas, comparação FPS e importação de trilhas mantidos.
- Nenhuma alteração no canvas Phaser, física, regras de combate ou evolução.
- Arquivo `PortSettings.css` isolado, cache PWA V114 e testes de regressão.

Rollback: reverter PR.