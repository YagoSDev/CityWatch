# Matriz de conformidade — FIAP / CityWatch

Referência: atividade lida no FIAP ON em 18/11/2026: https://on.fiap.com.br/mod/assign/view.php?id=684538 . A tabela verifica o núcleo acadêmico; extras mobile são identificados como extensões.

| Requisito | Evidência | Situação |
| --- | --- | --- |
| 12 ocorrências com IDs únicos e quatro categorias | `data/ocorrencias.csv`, testes da carga | Atendido |
| Campos, datas simuladas e três situações | CSV e seção de dados/status no README | Atendido |
| Pelo menos oito eventos históricos | Dez linhas válidas em `data/historico.csv` | Atendido |
| Registro inconsistente identificado | OC-013, avisos da opção 10 e testes | Atendido |
| Lista | `Estruturas.ocorrencias`, cadastro/listagem/filtros | Atendido |
| Fila FIFO | `Estruturas.fila`, `popleft()`, opção 7 | Atendido |
| Pilha LIFO | `append`, leitura `pop()` em cópia, opção 6 | Atendido |
| Dicionário por ID | `por_id`, busca e duplicatas | Atendido |
| Hierarquia bairro/categoria | `por_bairro`, opção 9 | Atendido |
| Matriz categoria/status | Matriz 4 × 3, opção 8 | Atendido |
| IF/ELIF/ELSE | `registrar_status` e menu | Atendido |
| AND/OR/NOT em condições distintas | Filtro, campo obrigatório e fila vazia; README | Atendido |
| Expressão booleana comentada | Seção de regras do README | Atendido |
| Cadastro, busca, filtros e status | Serviço compartilhado e exemplos no README | Atendido |
| Mensagens claras e histórico | Menu e validações; transcrição real | Atendido |
| Totais, proporções e indicador adicional | Indicadores com fórmulas e origens | Atendido |
| Interpretação | README: 75% pendentes; média de três conclusões fictícias | Atendido |
| Python sem dependências externas obrigatórias | `python src/sistema.py`, teste com `-S` | Atendido |
| Entrada indicada no enunciado | `src/sistema.py` | Atendido |
| Organização conforme referência | src, backend, data, docs, README e testes | Atendido por adaptação do modelo |
| Identificação | Yago Souza Araujo, RM 575200, individual | Atendido |
| Contexto e público | README | Atendido |
| Acessibilidade, inclusão e privacidade | README e limites documentados | Atendido, sem alegar certificação universal |
| Declaração de IA | `docs/uso_ia.md`, assistência em código descrita honestamente | Atendido |
| GitHub público acessível | Repositório criado e verificado anteriormente; tornado privado a pedido do autor para revisão | Pendente de nova autorização para tornar público |
| Vídeo Não Listado e link no README | [CityWatch no YouTube](https://www.youtube.com/watch?v=shDn8X4PDFI); link incluído no README local | Confirmar Não Listado no YouTube Studio |
| TXT somente com dois links | Arquivo local gerado e conferido | Pronto para envio após validar a acessibilidade dos links |
| Envio FIAP ON | Nenhum upload/submissão realizado | Pendente |
| Decisão de competição | Modelo pede decisão; enunciado não detalha | A confirmar pelo autor |
| Tutor/turma e edição | Não inventados; divergência de semestre na página | A confirmar se necessário |

Os testes verificam comportamento, mas não substituem a compreensão e justificativa do autor. Antes de publicar, conferir o conteúdo do pacote e usar somente dados simulados.
