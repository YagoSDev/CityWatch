# CityWatch acadêmico em Python

O sistema cadastra, organiza e acompanha ocorrências comunitárias simuladas. Para a entrega acadêmica, execute `python src/sistema.py` na raiz: usa CSVs e memória, com JSON opcional, sem banco ou pacotes externos. Veja o [README principal](../README.md).

O menu descrito abaixo é a alternativa com persistência SQLite usada também pela API FastAPI. As duas entradas reutilizam o mesmo serviço e regras Python.

## Executar o menu

A partir da raiz do repositório, use Python 3.11 ou superior. O menu usa apenas a biblioteca padrão.

```sh
python3 -m backend.main
```

Na primeira abertura, o sistema importa os CSVs para `backend/dados/citywatch.sqlite3`, que é ignorado pelo Git. As próximas execuções leem o banco. Cadastro, status e histórico persistem juntos em uma transação SQLite. Os CSVs são a carga inicial e permanecem disponíveis para repetir a demonstração. Para mostrar a base original em outro banco, escolha um caminho novo.

```sh
python3 -m backend.main --db /tmp/citywatch-demo-nova.sqlite3
```

## Campos e arquivos

| Arquivo | Colunas em ordem |
| --- | --- |
| `dados/ocorrencias.csv` | `id,categoria,descricao,bairro,data,status` |
| `dados/historico.csv` | `ocorrencia_id,status_anterior,status_novo,data,observacao` |

Os arquivos são UTF-8, separados por vírgula e têm cabeçalho. As datas usam `AAAA-MM-DD`. As 13 linhas de ocorrências incluem 12 válidas e a linha deliberadamente inconsistente `OC-013`, que tem descrição vazia. Os 10 eventos históricos simulam mudanças de status. Os bairros são genéricos.

No cadastro, identificador, categoria, descrição e bairro são obrigatórios. A data é registrada e pode ser omitida para usar o dia atual. O status inicial é **aberta**. Após normalização, o ID aceita até 32 letras de A a Z, números, hífens ou sublinhados. As categorias aceitas são **iluminação**, **acessibilidade**, **limpeza** e **conservação**. Os status aceitos são **aberta**, **em análise** e **concluída**. Categoria, status e identificador aceitam variações de maiúsculas e minúsculas. Categoria e status também aceitam formas sem acento.

Alterar o status exige ID existente e novo status válido. Informe uma observação quando útil. A data da alteração usa o dia atual se omitida e deve ser igual ou posterior à última data da ocorrência. Registros inconsistentes nos CSVs geram avisos pesquisáveis no menu e na API.

## Estruturas em uso

| Estrutura | Uso |
| --- | --- |
| Lista de ocorrências | Guarda os registros usados na listagem, nas inserções e nos filtros. |
| Fila FIFO com `deque` | Contém ocorrências abertas na ordem de entrada. A triagem usa `popleft()` e move a primeira para **em análise**. Reabrir uma ocorrência a coloca no fim. |
| Pilha LIFO com `list` | Novas alterações entram com `append()`. A leitura usa `pop()` numa cópia e apresenta a última alteração registrada primeiro. |
| Dicionário por ID | Usado na busca, na verificação de duplicatas e na recuperação de cada ocorrência da fila. |
| Hierarquia bairro → categoria → lista | Usada na opção 9 e no endpoint `/bairros`. |
| Matriz 4 × 3 | Cada linha representa uma categoria e cada coluna um status. As somas alimentam o relatório. |

O SQLite armazena a lista e os eventos como um snapshot transacional, adequado ao volume da demonstração. O serviço reconstrói índices, fila, hierarquia e matriz a partir do estado atual. O comando de triagem atualiza o status e o histórico na mesma transação.

## Lógica e validação

- `IF / ELIF / ELSE` em `registrar_status` rejeita data anterior, rejeita status repetido ou grava a mudança, respectivamente.
- `AND` na listagem exige que o filtro por categoria e o filtro por status sejam atendidos.
- `OR` na validação aponta tanto valor ausente quanto texto só com espaços.
- `NOT` na triagem encerra a operação quando a fila está vazia.

A expressão abaixo inclui um item quando ele passa pelos dois filtros. Cada comparação é opcional. Se o filtro é `None`, a condição desse campo já é verdadeira.

```python
(categoria is None or item.categoria == categoria) and (
    status is None or item.status == status
)
```

Com categoria `limpeza` e status `em análise`, a base original retorna `OC-007`. Buscar `OC-013` retorna “Ocorrência não encontrada”. Na opção **10**, vê-se o motivo da rejeição.

## Indicadores da base original

| Indicador | Fórmula | Resultado |
| --- | --- | --- |
| Total | Contagem da lista após validação | 12 |
| Por categoria | Soma da linha na matriz | 3 em cada uma das quatro categorias |
| Percentual por categoria | Quantidade da categoria ÷ total × 100 | 25% por categoria |
| Por status | Soma da coluna na matriz | 5 abertas, 4 em análise, 3 concluídas |
| Percentual por status | Quantidade do status ÷ total × 100 | 41,67% abertas, 33,33% em análise, 25% concluídas |
| Pendências | Abertas + em análise | 9 |
| Média simulada de conclusão | Soma dos dias da abertura até a última conclusão ÷ número de concluídas com histórico válido | (4 + 6 + 6) ÷ 3 = 5,33 dias |

A média usa as datas dos IDs `OC-001`, `OC-004` e `OC-006`. Ocorrências concluídas sem histórico válido ficam fora da média. O menu e a API exibem os IDs, as datas, as durações, a matriz, os avisos e as fórmulas que originam o resultado.

Na amostra, 75% das ocorrências permanecem pendentes. As categorias têm a mesma participação no total, mas limpeza concentra duas abertas e nenhuma concluída. A média descreve três conclusões fictícias em dias corridos.

## API FastAPI e testes

A partir da raiz do repositório.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements-dev.txt
.venv/bin/python -m unittest discover -s backend/tests -v
.venv/bin/python -m uvicorn backend.api:app --host 127.0.0.1 --port 8000
```

Para rodar só os testes do núcleo com a biblioteca padrão, use `python3 -m unittest discover -s backend/tests -p 'test_ocorrencias.py' -v`. Para instalar só a API, use `backend/requirements.txt`.

A documentação interativa fica em [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). O menu usa o mesmo banco por padrão. Para escolher outro banco para a API, defina `CITYWATCH_DB` antes de iniciar o Uvicorn.

| Operação | Método e caminho |
| --- | --- |
| Listar ou filtrar | `GET /ocorrencias?categoria=limpeza&status=aberta` |
| Cadastrar | `POST /ocorrencias` |
| Buscar por ID | `GET /ocorrencias/{identificador}` |
| Atualizar | `PATCH /ocorrencias/{identificador}/status` |
| Histórico LIFO | `GET /historico` ou `GET /historico?identificador=OC-001` |
| Hierarquia | `GET /bairros` |
| Ver e examinar a fila | `GET /fila` e `POST /fila/examinar` |
| Indicadores e avisos | `GET /indicadores` e `GET /validacao` |

```sh
curl -fsS http://127.0.0.1:8000/ocorrencias/OC-003
curl -fsS http://127.0.0.1:8000/validacao
```

Na base inicial, a primeira consulta retorna `OC-003`, da categoria limpeza, no Bairro Oeste, com status aberta. A segunda retorna o aviso de descrição ausente de `OC-013`. A API usa HTTP 404 para ID inexistente, 409 para duplicata e 422 para entrada inválida, com explicação no campo `detail`.

## Aplicativo

Com a API aberta, execute `npm run ios` na raiz. No simulador iOS, entre em **Relatar → Abrir ocorrências acadêmicas** para usar o núcleo Python. O endereço padrão é `http://127.0.0.1:8000`. Para outro endereço, defina `EXPO_PUBLIC_CITYWATCH_API_URL` em `.env.local` e reinicie o Metro. A API local foi preparada para dados simulados em ambiente de demonstração.

## Cadastro cidadão integrado

Além do cadastro acadêmico existente, `POST /relatos` recebe o tipo cidadão, descrição, referência pública do local, bairro opcional, até cinco etiquetas padronizadas e, opcionalmente, GPS e uma evidência. O servidor gera ID e timestamp UTC, mantém o status inicial `aberta` e trata retries concorrentes de forma idempotente. Evidência fica em BLOB privado, com gravação atômica junto ao registro; coordenadas não entram nos modelos públicos. As datas simuladas dos CSVs não mudaram.

O novo registro participa das mesmas estruturas acadêmicas e dos indicadores. O menu textual e as rotas anteriores continuam disponíveis. Veja [mapeamento, contrato, privacidade e testes](../docs/cadastro-ocorrencias.md).

No cadastro cidadão, GPS válido também permite publicar sem endereço escrito. O bairro vem do geocodificador do app, sem campo manual no formulário; caso indisponível, a hierarquia usa “Localização por GPS”. O novo campo `referencia` é um complemento opcional para localizar o problema.
