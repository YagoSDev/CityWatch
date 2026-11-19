# CityWatch — refilmagem V3, ação e resultado

A montagem V2 foi rejeitada pelo autor: cortes de voz ruins, imagens sem correspondência suficiente com a fala e demonstração insuficiente do app. Ela fica preservada como versão anterior; não usar como entrega final.

## Critérios desta refilmagem

- Abertura real do aplicativo no começo do vídeo, com animação e chegada à Home.
- Um arquivo de narração por bloco; sem acelerar a voz para impor duração e sem emendar palavras ou cortar fonemas.
- Cada interação precisa mostrar estado inicial, toque/preenchimento, resposta e tempo de leitura.
- Capturar apenas a tela do iPhone; exibir maior no vídeo, sem uma coluna enorme de texto competindo com a ação.
- Capturas de Python com fonte ampliada e uma operação por cena. Prints e GIFs são evidências de ações reais.
- Deixar três segundos de margem antes/depois das ações, para sincronização posterior com as novas vozes.
- Não fechar o vídeo enquanto as novas gravações 4–10 não estiverem disponíveis.
- Ilustrações opcionais somente depois que a operação real estiver clara. Elas não substituem a demonstração.

## Cenários

| Etapa | Ação visível | Resultado obrigatório |
|---|---|---|
| Abertura | Executar o CityWatch | Branco → rosa → P.I.T. → Home |
| 4 | Home → mapa → filtros → marcador | Conteúdo filtrado e detalhe do item |
| 5 | Relatar → preencher tipo, descrição e local → publicar | Confirmação real, código e aberta |
| 6 | Área acadêmica → busca/filtros → atualizar status → histórico | Mesmo identificador acompanhado; em análise e concluída |
| 6, complemento | Menu textual: campos vazios, ID repetido e status inválido | Erros de domínio legíveis, sem traceback |
| 7 | Fila em execução, histórico e agrupamento; código ampliado | FIFO, LIFO, lista, dicionário, hierarquia e matriz vinculados às ações |
| 8 | Cenário independente com base original dos CSVs | 12 válidas, 1 rejeitada; categorias, status, 9 pendências e média 5,33 dias |
| 9 | Comunidade → evento → favorito → Agenda → P.I.T. | Favorito refletido na Agenda e atividade com contador |
| 10 | Testes e documentação | Resultados reais e limites do protótipo, sem promessas operacionais |

## Isolamento

Foi preparado um servidor isolado em 8001 e um Metro em 8082, mas as capturas de cadastro e acompanhamento acabaram conectadas ao servidor habitual 8000. O único registro criado para o vídeo foi `CW-1CF4F0D617514343`, identificado como SIMULAÇÃO DE VÍDEO. Seu cadastro e as duas mudanças de status foram confirmados no backend. Foram preservados backups locais e removidos apenas esse registro de teste e seus dois eventos, retornando a base habitual aos 12 registros e 10 eventos anteriores. Nenhum registro anterior foi excluído. Os testes do menu/FIFO usam bancos temporários independentes. Os indicadores foram gravados na base inicial e a mudança de cenário está indicada na narração e na tela. O simulador voltou ao ambiente habitual 8081/8000. Os logs detalham o ajuste de isolamento.

## Arquivos

Capturas, brutos e logs novos: `entrega/midia-v3-refilmagem/` (ignorado pelo Git). Roteiro falado: `docs/video-v3/narracao-4-a-10.md`. Os arquivos anteriores não são sobrescritos.
