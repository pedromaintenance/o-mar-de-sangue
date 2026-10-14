# Trilha sonora oficial — FLAC

Arquivos publicados e reconhecidos automaticamente em O Mar de Sangue v1.8.1:

| Arquivo | Uso |
|---|---|
| `Beneath The Crimson Tide.flac` | Porto, calmaria e navegação |
| `Beneath The Black Tide.flac` | Tempestade, redemoinho, chefe e maldição elevada |

Ambos ficam hospedados em `assets/audio/`. O carregador usa o caminho exato (com espaços corretamente codificados na URL) e **não requer upload nem importação por parte dos visitantes**.

Os navegadores modernos reproduzem FLAC nativamente. O jogo baixa os arquivos, valida o formato e tenta salvá-los no IndexedDB; após a primeira reprodução, os áudios também ficam disponíveis offline quando o armazenamento permite. A reprodução começa no primeiro toque/clique/tecla, respeitando as regras de autoplay.

A opção **♫ TROCAR TRILHAS** permite importar FLAC ou MP3 manualmente, inclusive nos navegadores sem suporte a FLAC. Não é necessária nenhuma conversão para quem usa Chrome, Firefox, Edge ou Safari atualizados.

Para substituir os áudios futuramente mantendo os mesmos nomes, atualize `hostedVersion` em `SeaWeather.js` e a versão de cache em `sw.js`, para invalidar os arquivos locais antigos.

> Publique apenas gravações cuja distribuição pública esteja autorizada.
