# Capturas e demonstrações do CityWatch

As seis capturas mostram a tela do app no iPhone 18 Pro simulado, com as proporções preservadas. Os arquivos em `gifs/` são recortes de gravações reais da refilmagem V3. Relatos, eventos e posições acadêmicas são simulados. A foto de Cosmópolis é de arquivo, com [origem e licença documentadas](../cidade-e-imagens.md). Ilustrações dos eventos aparecem rotuladas na interface.

| Captura | Origem |
| --- | --- |
| [Início](screenshots/inicio.png) | Quadro da tomada de mapa da V3, com Cosmópolis definida por GPS simulado |
| [Mapa](screenshots/mapa.png) | Captura nova no simulador, com marcadores, filtros e legenda |
| [Cadastro](screenshots/cadastro.png) | Captura nova no simulador, antes de preencher dados |
| [Detalhe da ocorrência](screenshots/detalhe-ocorrencia.png) | Captura reaproveitada da V3, ocorrência fictícia OC-011 |
| [Agenda](screenshots/agenda.png) | Quadro da tomada de Comunidade e Agenda da V3 |
| [P.I.T.](screenshots/pit.png) | Captura reaproveitada da V3, temporizador e contador de café |

| GIF | Tomada original da V3 | O que aparece |
| --- | --- | --- |
| [Mapa](gifs/mapa-ocorrencia.gif) | `04-mapa-acao-resultado.mov` | Seleção de ocorrência no mapa, cartão e detalhes |
| [Agenda](gifs/agenda-evento.gif) | `09-comunidade-agenda-refeito.mov` | Agenda mensal, filtro de salvos e abertura dos detalhes do evento pelo cartão |
| [P.I.T.](gifs/pit-atividade.gif) | `09b-pit-atividade-contador.mov` | Escolha da atividade e tela de duração |

Os GIFs removem esperas da gravação e não contêm áudio. O [relatório V3.1](../relatorio-demonstracao-v3-1.md) reúne evidências de outras etapas. Os arquivos brutos ficam na pasta de edição local.

## Reproduzir no iOS

Prepare a build e a API seguindo o [guia do aplicativo](../aplicativo.md). Use dados simulados, um perfil de teste e notificações silenciadas. Para gravar, use **File → Record Screen** no Simulator ou `xcrun simctl io booted recordVideo tela.mov` com apenas um simulador aberto. Se houver mais de um, substitua `booted` pelo identificador da instância. Pressione Ctrl+C para encerrar a gravação pelo terminal.

1. **Mapa:** na Home abra o mapa, filtre para ocorrências, toque em um marcador ou amplie um grupo. Abra o cartão e toque em **Ver detalhes**.
2. **Agenda:** na Home abra a Agenda, selecione um dia marcado, abra o evento e mantenha o detalhe na tela. Para reproduzir a tomada existente, favorite um evento na Comunidade e use **Somente salvos** na Agenda antes de abrir o cartão.
3. **P.I.T.:** abra **Planejar com P.I.T.**, escolha uma atividade, escolha a duração e inicie. Mostre o temporizador e, em Trabalho, registre um café.

Recorte de 3 a 8 segundos de ação e exporte mantendo a proporção. Confira legibilidade, estado inicial/final e ausência de informações pessoais antes de substituir uma evidência.
