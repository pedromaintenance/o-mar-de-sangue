# Evoluções de navios por facção — estado V100

A partir da V100, os **quatro atlas estão disponíveis no gameplay**. O navio muda de identidade visual somente após o juramento explícito no Conselho das Três Bandeiras em Portomonte. A reputação isoladamente não concede filiação.

| Linhagem | Textura Phaser | Stages | Condição |
| --- | --- | --- | --- |
| Neutra | `player-ship-stages` | 20 | Sem juramento |
| Sobreviventes | `player-ship-survivors` | 20 | Juramento aos Sobreviventes |
| Corte Feérica | `player-ship-court` | 20 | Juramento à Corte |
| Culto de Dagon | `player-ship-dagon` | 20 | Juramento ao Culto |

**Todos** os atlas usam 1460×1560, grade 5×4, quadros 260×360 e espaçamento de 40 pixels. A proa aponta para baixo no atlas e o jogo mantém a rotação local PI; navegação, colisões, física e os 15 upgrades continuam iguais.

O estado do pacto está no perfil como `faction={allegiance,proofs,lockUntil,history}`. A facção é exclusiva e voluntária. 40 de reputação e uma prova específica liberam o juramento; deserção custa 20 de confiança e uma viagem independente. Arte exibida no Conselho é recortada dos atlas reais, que já são precacheados no PWA V100.

**Regressões:** `tests/faction-council-v100.test.cjs`, `tests/faction-council-visual.test.cjs` (Chrome), testes de integridade de cada facção e os de evolução do casco.

**Fase seguinte:** consequências táticas por aliança, decisões específicas da facção e reações políticas da IA. A V100 **não** concede bônus de combate cumulativos simplesmente por mudar a bandeira.
