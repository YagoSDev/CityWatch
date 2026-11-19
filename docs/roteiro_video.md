# Roteiro do vídeo CityWatch — visão e demonstração acadêmica

**Autor:** Yago Souza Araujo — RM 575200. **Duração-alvo:** 4min50s, sujeita ao ensaio. Orientação informada pelo autor na live: aproximadamente 3–5 minutos. Os tempos incluem as telas, não devem ser somados a uma apresentação separada. Prepare cortes de digitação mantendo resultados legíveis.

Base conceitual: [visão do produto](visao-do-produto.md). A narração abaixo usa “proposta” e “evolução” nos recursos ainda não operacionais. Não dizer que widgets, notificações em tempo real ou encaminhamento à prefeitura já funcionam.

## 0:00–0:40 — Ideia e contexto

**Tela:** Home do app e identificação do autor/RM.

**Fala sugerida:**

“Olá, sou Yago Souza Araujo, RM 575200. Este é o CityWatch, uma proposta para aproximar as pessoas das informações da sua cidade por meio da própria comunidade. Imagine encontrar uma árvore caída no caminho: registrar a situação pode ajudar outras pessoas a conhecer o problema. A ideia reúne informação urbana, participação comunitária e transparência. Para a Global Solution, implementei um núcleo Python que organiza ocorrências e permite acompanhar seu andamento. O aplicativo React Native se conecta a esse núcleo por uma API FastAPI.”

## 0:40–1:10 — Dados e execução independente

**Tela:** Os dois CSVs; comando `python3 src/sistema.py`; opções 8 e 10. Guardar o trecho do relatório inicial para a explicação dos indicadores.

**Fala sugerida:**

“O núcleo funciona pelo terminal, sem internet ou serviços externos. Estes CSVs contêm doze ocorrências válidas de iluminação, acessibilidade, limpeza e conservação, com três status, e dez eventos históricos. Os locais e as datas são simulados. Acrescentei um registro com descrição vazia: o sistema rejeita essa linha e informa a inconsistência sem interromper a leitura dos dados válidos.”

## 1:10–2:10 — Operações e erros tratados

**Tela:** Opções 2 e 3: listar e buscar OC-007; opção 4: limpeza/em análise. Cadastrar DEMO-014; tentar repetir o ID e usar descrição vazia em outro cadastro; atualizar DEMO-014 para em análise e depois concluída; consultar histórico; rejeitar status `resolvida`. Mostrar cortes da execução real, não saídas fabricadas.

**Fala sugerida:**

“Aqui listo as ocorrências, busco pelo identificador e combino filtros de categoria e status. Agora cadastro uma demanda fictícia e acompanho suas atualizações. O histórico preserva cada alteração. Identificadores duplicados, campos obrigatórios vazios e status desconhecidos produzem mensagens de erro e não são gravados. No produto, esse acompanhamento serve de base para dar visibilidade às demandas. Encaminhamento oficial e respostas de uma prefeitura dependem de uma integração institucional futura.”

## 2:10–3:00 — Estruturas e lógica

**Tela:** `backend/estruturas.py`, opções 7 e 9, histórico e matriz. Mostrar fila antes/depois de examinar a primeira demanda; histórico das duas atualizações. Destacar condição booleana e ramificações de atualização.

**Fala sugerida:**

“A lista armazena os registros e o dicionário permite buscar por ID. A fila FIFO examina primeiro a demanda mais antiga, enquanto a pilha LIFO apresenta a atualização mais recente primeiro. A hierarquia organiza bairro, categoria e ocorrências. A matriz cruza as quatro categorias com os três status e alimenta os indicadores. Uso IF, ELIF e ELSE para decidir entre erro ou atualização. NOT e OR detectam campos vazios; AND e OR combinam os filtros; NOT também trata a fila vazia.”

## 3:00–3:40 — Indicadores e interpretação

**Tela:** Trecho do relatório da base inicial, antes das alterações, com contagens, percentuais, matriz, origens e fórmulas. Não misturar valores iniciais com a sessão já modificada.

**Fala sugerida:**

“Na carga inicial, são doze ocorrências: três por categoria, ou vinte e cinco por cento cada. Há cinco abertas, quatro em análise e três concluídas: quarenta e um vírgula sessenta e sete, trinta e três vírgula trinta e três e vinte e cinco por cento. Somando abertas e em análise, são nove pendências, setenta e cinco por cento. A média de conclusão é quatro mais seis mais seis dias, dividido por três: cinco vírgula trinta e três dias. Esses números descrevem a amostra fictícia, não o desempenho real de uma cidade.”

## 3:40–4:20 — Proposta do produto e modelo de negócio

**Tela:** Home, mapa, agenda, Comunidade e demonstração de parceiros/recompensas, com dados simulados identificados. Não apresentar um estabelecimento como parceiro contratado sem confirmação.

**Fala sugerida:**

“Como produto, o CityWatch conecta moradores, comércio local e, futuramente, equipes municipais. O cidadão encontra informação e participação; o estabelecimento ganha uma oportunidade de alcançar pessoas da região. Queremos manter o acesso gratuito e gerar receita com planos de divulgação, campanhas e eventos patrocinados, sempre identificados. É um modelo a validar: ainda não há preços ou faturamento comprovados. A receita precisa sustentar operação, manutenção e moderação, sem vender prioridade em alertas. Também planejamos widgets e orientação de rotas em desastres, com informações verificadas e orientações oficiais.”

## 4:20–4:50 — Evidências e conclusão

**Tela:** README, `docs/uso_ia.md`, resultados registrados e matriz de conformidade. Exibir resultados reais existentes ou executar as verificações antes da gravação.

**Fala sugerida:**

“O README reúne execução, regras, estruturas e fórmulas. A última verificação registrou noventa e quatro testes aprovados, além de TypeScript e lint. A assistência de IA está documentada. O núcleo funciona sem smartphone e usa dados genéricos, sem endereços residenciais. O resultado é uma base funcional para organizar ocorrências, com uma proposta de evolução comunitária e comercial. Os recursos futuros permanecem identificados como planejamento.”

**Nota ao autor:** só declarar revisão pessoal ou aprendizado específico que você efetivamente realizou e consegue explicar. Ensaiar e ajustar a velocidade; se ultrapassar cinco minutos, reduzir exemplos e repetições, mantendo uma explicação breve da proposta e do modelo de negócio e preservando as evidências acadêmicas.

## Dados para a demonstração

Em uma sessão em memória, cadastre:

- ID: `DEMO-014`.
- Categoria: `iluminação`.
- Descrição: `Poste apagado próximo à praça fictícia`.
- Bairro: `Bairro Norte`.
- Data simulada: `2026-10-20`.
- Atualização: `em análise`, data `2026-10-21`, observação `Exame comunitário simulado`.
- Segunda atualização para demonstrar LIFO: `concluída`, data `2026-10-22`, observação `Conclusão simulada`.
- Status inválido: `resolvida` — deve ser rejeitado.

Para a descrição obrigatória, tente um cadastro separado com descrição vazia. Para duplicidade, tente cadastrar `DEMO-014` novamente. Não conte essas tentativas rejeitadas como ocorrências válidas. Na fila, examine a primeira demanda apenas na sessão demonstrativa; alterações em memória não modificam os CSVs.

## Preparação e ensaio

1. Abrir os arquivos e o menu antes da gravação; ampliar a fonte e ocultar credenciais e notificações pessoais.
2. Ensaiar as operações, inclusive a remoção FIFO e as duas atualizações para LIFO. Reabrir o menu sem `--estado` para recuperar a base original.
3. Conferir cada linha da matriz de conformidade. O vídeo deve mostrar evidências e explicar as estruturas, a lógica e os indicadores; só passear pelo app não demonstra esses requisitos.
4. Cronometrar o ensaio. Usar cortes de tempo de digitação, mantendo entradas, resultados e explicações legíveis. Não afirmar que um resultado foi verificado se não foi executado.
5. Não demonstrar recurso mobile como operacional se depender de permissões, API ou hardware ainda não conferidos.

Uma execução reproduzível adicional está disponível em:

```sh
python3 scripts/demonstracao_academica.py
```

Esse script executa o menu real e salva `docs/evidencias/menu-demonstracao.txt`. Ele não cobre sozinho todos os passos ampliados deste roteiro, não grava o vídeo e não substitui a explicação do autor.

## Publicação e TXT

O repositório está **privado para revisão**, por decisão do autor. Não alterar essa visibilidade sem nova autorização. Antes da entrega que exige acesso público, o autor precisa autorizar a publicação.

Publicar o vídeo como **Não Listado**, verificar o link sem login e fornecê-lo para atualizar o README e gerar o TXT contendo somente os dois links reais. Conferir reprodução, visibilidade do GitHub e envio na FIAP. Nenhum envio foi realizado automaticamente.
