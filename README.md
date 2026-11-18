# CityWatch — Neighborhood Action Dashboard

Protótipo acadêmico de cadastro e acompanhamento de ocorrências comunitárias para a Global Solution FIAP / CitizenTech. O núcleo é **Python local**, com menu textual, arquivos CSV e estruturas introdutórias. O aplicativo React Native/Expo e a API FastAPI são extensões opcionais preservadas.

## Equipe e identificação

| Campo | Informação |
| --- | --- |
| Projeto / identificação da equipe | CityWatch — trabalho individual |
| Integrante | Yago Souza Araujo |
| RM | 575200 |
| GitHub | [YagoSDev](https://github.com/YagoSDev) |
| Tutor(a) | Nome não informado; completar se exigido pela turma |
| Participação na competição | **A confirmar pelo autor.** O modelo pede essa decisão, mas o enunciado não detalha a competição |
| Vídeo de apresentação | **Pendente: o autor gravará e publicará como Não Listado** |

A atividade aberta no FIAP ON informa entrega na Fase 4, até **19/11/2026 às 23h59**. Há divergência entre o título “1º Semestre” e o corpo “2026.2”; a identificação da edição/pasta deve ser conferida na turma. Não foi inventada uma matrícula de turma ou edição para preencher essa lacuna.

## Comunidade simulada, problema e público beneficiado

O cenário reúne moradores de bairros fictícios Norte, Sul, Leste e Oeste, com praças, passagens e espaços coletivos genéricos. Relatos dispersos dificultam consultar problemas, identificar pendências e acompanhar seu andamento. O público beneficiado são moradores e pessoas que precisam de ambientes urbanos acessíveis e conservados.

O CityWatch organiza demandas de **iluminação, acessibilidade, limpeza e conservação**. Não é um serviço de emergência, não encaminha automaticamente solicitações à prefeitura e não promete execução de reparos. A amostra acadêmica não contém dados pessoais nem localizações residenciais reais.

## Executar a versão acadêmica

É necessário **Python 3.11 ou superior**. Não precisa instalar pacotes, Node, Expo, FastAPI, Supabase ou banco de dados.

```sh
python src/sistema.py
```

Em sistemas nos quais o comando se chama `python3`, use:

```sh
python3 src/sistema.py
```

A execução carrega os CSVs de `data/` e mantém as alterações em memória durante a sessão. Ao sair, a carga original permanece intacta. Para persistir as operações em um arquivo JSON local opcional:

```sh
python3 src/sistema.py --estado data/estado-local.json
```

Não compartilhe arquivos de estado com dados pessoais. O modo JSON é voltado a uma sessão local por vez, sem garantia de gravações simultâneas entre processos. O caminho dos dados pode ser escolhido com `--dados PASTA`.

O menu oferece Cadastro, Listagem, Busca, Filtros, Atualização, Histórico, Fila, Indicadores, Hierarquia e Avisos. **As regras de negócio são as mesmas do backend**, com persistência acadêmica injetada; não há uma segunda versão das regras a manter.

## Dados, campos obrigatórios e status

`data/ocorrencias.csv` possui 13 linhas: **12 ocorrências válidas e uma inválida deliberada (`OC-013`, descrição vazia)**. `data/historico.csv` contém **10 atualizações**. São cópias exatas dos CSVs acadêmicos originais em `backend/dados/`, conferidas por teste.

| Arquivo | Colunas, nesta ordem |
| --- | --- |
| `ocorrencias.csv` | `id,categoria,descricao,bairro,data,status` |
| `historico.csv` | `ocorrencia_id,status_anterior,status_novo,data,observacao` |

Formato UTF-8 com cabeçalho, separador vírgula e datas `AAAA-MM-DD`. Código único, categoria, descrição e bairro/local genérico são obrigatórios no cadastro. A data pode ser omitida para usar o dia atual; os dados da demonstração usam datas fictícias explícitas. O ID é normalizado para maiúsculas e aceita até 32 letras, números, hífen ou sublinhado. Categorias/status aceitam variações de caixa e formas sem acento.

| Status | Significado na simulação |
| --- | --- |
| aberta | Registrada e ainda aguardando exame; entra na fila FIFO |
| em análise | Examinada ou em acompanhamento simulado; sai da fila de não examinadas |
| concluída | Encerrada na simulação; não afirma que um órgão público executou reparos |

## Estruturas de dados e justificativas

| Estrutura | Aplicação e motivo |
| --- | --- |
| Lista | Guarda e percorre as ocorrências, permitindo listar, cadastrar e filtrar |
| Fila FIFO (`deque`) | Demandas não examinadas seguem ordem de registro; `popleft()` examina a mais antiga; reabertura entra no fim |
| Pilha LIFO (`list`) | Atualizações entram com `append()`; `pop()` em uma cópia apresenta a última atualização primeiro, preservando o histórico original |
| Dicionário por ID | Busca direta e identificação de duplicatas, evitando depender de percorrer a lista a cada consulta |
| Hierarquia bairro → categoria → ocorrências | Agrupa problemas da mesma localidade e facilita observar necessidades por bairro |
| Matriz 4 × 3 (lista de listas) | Cruza quatro categorias com três status; somas das linhas e colunas produzem os indicadores |

As implementações estão em [estruturas.py](backend/estruturas.py), [ocorrencias.py](backend/ocorrencias.py) e [indicadores.py](backend/indicadores.py). A persistência em arquivo é apenas o suporte de leitura/gravação; as estruturas acima executam as operações do sistema.

## Regras lógicas, validação e tratamento de erros

- `if`, `elif` e `else` em `registrar_status`: rejeitam data anterior, rejeitam repetição de status ou registram a mudança.
- `not valor or not valor.strip()` rejeita tanto campos ausentes quanto textos só com espaços. A mensagem informa o campo obrigatório.
- `if not estruturas.fila` encerra a triagem quando não há demandas; evita remover de uma fila vazia.
- O filtro combina categoria **AND** status; cada campo é opcional e usa **OR** para permitir a ausência do filtro.
- IDs duplicados são rejeitados, inclusive com variação de caixa. Status desconhecidos e datas inválidas não são gravados.
- CSV inconsistente é isolado em avisos, sem derrubar os registros válidos. Buscar `OC-013` resulta em não encontrado; a opção 10 explica a rejeição.
- A alteração é preparada em uma cópia. Uma validação rejeitada não deixa gravação parcial; o JSON é substituído somente após a escrita completa.

Expressão booleana usada na consulta:

```python
(categoria is None or item.categoria == categoria) and (
    status is None or item.status == status
)
```

Cada grupo é verdadeiro quando não foi informado filtro ou quando o valor corresponde ao registro. O `and` exige os dois grupos verdadeiros. Com `categoria="limpeza"` e `status="em análise"`, a carga original retorna `OC-007`.

## Exemplo completo de uso

Em uma sessão nova, escolha **1 Cadastrar** e informe:

```text
ID: DEMO-014
Categoria: iluminação
Descrição: Poste apagado próximo à praça fictícia
Bairro: Bairro Norte
Data: 2026-10-20
Saída: Ocorrência cadastrada.
DEMO-014 | iluminação | Bairro Norte | 2026-10-20 | aberta | Poste apagado próximo à praça fictícia
```

Na opção **3 Buscar**, digite `DEMO-014`. Em **4 Filtrar**, use `iluminação` e `aberta`: o registro aparecerá junto das demandas da mesma categoria/situação. Em **5 Atualizar**, informe:

```text
ID: DEMO-014
Novo status: em análise
Data da alteração: 2026-10-21
Observação: Exame comunitário simulado
Saída: Status atualizado.
```

A opção **6 Histórico**, filtrada por `DEMO-014`, apresenta `aberta → em análise`. A fila já não inclui esse ID. Após esse cadastro, o total será 13 válidas; não confundir com a base original de 12. A opção **0** encerra o sistema.

Exemplos de erro: cadastrar o mesmo ID novamente informa duplicata; buscar `INEXISTENTE` informa não encontrado; atualizar para `resolvida` informa status desconhecido; descrição vazia informa campo obrigatório ausente. Consulte [o roteiro reproduzível](docs/roteiro_video.md).

## Indicadores: origem, fórmulas e interpretação

Resultados da **carga inicial**, antes de cadastrar itens na demonstração:

| Indicador | Regra / fórmula | Resultado |
| --- | --- | --- |
| Total válido | `len(lista)` após validação | 12 |
| Quantidade por categoria | Soma da linha da matriz | 3 por categoria |
| Proporção por categoria | quantidade ÷ total × 100 | 25% cada |
| Quantidade por status | Soma da coluna da matriz | 5 abertas, 4 em análise, 3 concluídas |
| Proporção por status | quantidade ÷ total × 100 | 41,67%, 33,33%, 25% |
| Pendências | abertas + em análise | 9 (75%) |
| Tempo médio simulado de conclusão | soma das durações ÷ concluídas com histórico válido | (4 + 6 + 6) ÷ 3 = **5,33 dias** |

Origem da média: `OC-001` (4 dias), `OC-004` (6 dias), `OC-006` (6 dias). Concluídas sem histórico válido ficam fora da média. A opção 8 exibe origens, matriz, fórmulas e resultados. A base vazia é tratada sem divisão por zero.

**Interpretação:** 75% da amostra permanece pendente. As categorias têm participação igual, mas limpeza concentra duas demandas abertas e nenhuma concluída. As três conclusões fictícias não permitem generalizar um prazo de atendimento real; os indicadores descrevem apenas a amostra simulada.

## Acessibilidade, inclusão e privacidade

O terminal permite operar sem mapas, conta ou smartphone. O menu usa números, rótulos de status e mensagens textuais, sem depender de cores ou imagens. O formato continua sujeito às características do terminal/leitor de tela usado; não foi certificado com todos os recursos assistivos. As categorias incluem obstáculos de acessibilidade, e a descrição do problema pode ser informada sem fotografia ou GPS.

Somente códigos e localidades genéricas aparecem nos CSVs. O modo acadêmico não lê microfone, fotos ou localização. O app adicional solicita permissões contextualmente; o backend público não expõe coordenadas privadas dos relatos. Nenhum encaminhamento à prefeitura é afirmado sem confirmação.

## Organização do projeto

```text
README.md                     guia acadêmico principal
src/sistema.py                entrada acadêmica exigida
src/app/, src/components/     extensão mobile Expo preservada
backend/                     regras Python compartilhadas, menu e API opcional
data/                        CSVs simulados da entrega
docs/uso_ia.md                assistência de IA e verificação
docs/roteiro_video.md         demonstração planejada
docs/matriz_conformidade.md   checklist com evidências
tests/, backend/tests/       testes automatizados
scripts/preparar_entrega.py   empacotamento e geração do TXT quando houver vídeo
entrega/                     pacote publicável e situação da entrega
```

Adotamos as pastas pertinentes do [modelo oficial FIAP](https://github.com/equipe1ccon/FIAP-PORTFOLIO-1CCON/tree/master), que permite adaptar diretórios à natureza do projeto. `notebooks/` não é necessário para este trabalho. O projeto existente foi preservado; não foi criada uma cópia independente das regras de negócio.

## Testes e execução opcional do app

Para testar apenas o novo modo acadêmico, sem instalar pacotes:

```sh
python3 -m unittest discover -s backend/tests -p 'test_modo_academico.py' -v
```

Os demais testes de API dependem das dependências opcionais:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements-dev.txt
.venv/bin/python -m unittest discover -s backend/tests -v
```

Há testes de cadastro, busca, filtros, status, histórico, FIFO/LIFO, matriz, indicadores e inconsistências, além da integração cidadã opcional. Os resultados reais desta preparação são registrados em [validação da entrega](docs/validacao_entrega.md).

A documentação mobile anterior está preservada em [docs/aplicativo.md](docs/aplicativo.md). O app/API/SQLite/Supabase são extensões; o avaliador consegue executar o núcleo solicitado somente com o Python. O SQLite continua atendendo a API e não é importado pela entrada acadêmica.

## Uso de IA, conclusões e limitações

A assistência de IA em planejamento, código, dados, documentação e imagens está declarada em [docs/uso_ia.md](docs/uso_ia.md), com distinção entre testes executados e validação humana ainda necessária. O autor deve compreender e justificar as escolhas apresentadas.

O protótipo mostra como relatos podem ser transformados em registros consultáveis, prioridades de exame e indicadores simples. O desenvolvimento evidencia a aplicação prática de FIFO/LIFO, índices por ID, cruzamento de categorias/status e validações booleanas. Os aprendizados pessoais do autor devem ser confirmados por ele antes da apresentação; não presumimos domínio humano apenas por testes aprovados.

Limites: dados fictícios, ausência de atendimento público real, indicador temporal com três conclusões, JSON local sem uso multiprocesso, funcionalidades mobile extras fora do escopo básico e calendário/eventos demonstrativos claramente identificados.

## Links e entrega

- Repositório público do projeto: [YagoSDev/citywatch-fiap](https://github.com/YagoSDev/citywatch-fiap), publicado e verificado sem autenticação.
- Vídeo YouTube Não Listado: será fornecido pelo autor.
- Competição: a confirmar; não foi escolhida automaticamente.

O arquivo `.TXT` final só deve ser gerado quando os dois links reais estiverem disponíveis. Ele conterá **exatamente duas linhas, somente os links**, conforme o FIAP ON. [Situação da entrega](entrega/PENDENCIAS.md).

A referência de estrutura da FIAP possui atribuição CC BY 4.0; consulte [atribuição do modelo](docs/atribuicao_modelo.md). Nenhuma licença para código ou imagens de terceiros foi presumida.
