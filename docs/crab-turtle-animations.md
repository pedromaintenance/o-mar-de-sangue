# Guardião Caranguejo e Templo Tartaruga — animações originais (2026-10-29)

Integração feita conforme `.agents/skills/github-binary-assets/SKILL.md`, usando cópia binária dos uploads originais por Google Drive, Git Blob verificado por SHA e commit na árvore do repositório.

| Criatura | Asset no repositório | Spritesheet | Quadros | SHA-256 original |
|---|---|---|---|---|
| Guardião Caranguejo (`caranguejo`) | `assets/abyss/shell_guardian.png` | 2048×646 RGBA | 4 × 512×646 | `d38b8ab1a04551035b9a144f05f2283ea53b9b347c9d9c2365c8cf8165301d7b` |
| Templo Tartaruga (`tartaruga`) | `assets/abyss/temple_turtle.png` | 2048×682 RGBA | 4 × 512×682 | `80649705063ad4ae5b175861f93e7e7ae8a4de701ad5ac8db99596ac7e856936` |

## Animação
- Phaser carrega os quatro quadros nativamente via `this.load.spritesheet` usando as chaves já existentes `foe-shell` e `foe-turtle`.
- Spawn inicia em frame 0, e cada inimigo mantém seu próprio estado de frame.
- Ciclo `0,1,2,3,2,1`: caranguejo a cada 190ms, tartaruga a cada 230ms. A fase visual própria de cada inimigo evita sincronia artificial.
- Escala calcula a **altura de um quadro**, não da imagem inteira. O sprite mantém sua rotação visual em 0° como outros monstros com orientação fixa.
- Nenhuma mudança em IA, colisões, tamanho de casco, dano, invocações, cooldown, onda, missão, tamanho de save ou transparência.
- Os mesmos caminhos originais foram substituídos; o PWA atualiza para v105.
- Teste de integridade reproduz SHA256 do arquivo e exercita o trecho real da animação com setFrame, além de validações de orientação e pré-cache.

Playtest físico Android, desktop e Xbox ainda é recomendado para aprovar visualmente a cadência.
