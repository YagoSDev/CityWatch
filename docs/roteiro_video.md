# CityWatch — roteiro de apresentação FIAP

Duração alvo de 3 a 5 minutos. A edição local V3.1 tem 4min59s. Este roteiro orienta a revisão da edição e, se necessário, uma nova captura com o terminal. Consulte as [cenas da refilmagem](video-v3/plano-de-captura.md), o [relatório V3.1](relatorio-demonstracao-v3-1.md) e a [validação mais recente](validacao_entrega.md).

| Tempo sugerido | Mostrar | Fala sugerida |
| --- | --- | --- |
| 0:00–0:40 | Abertura e Home, depois autor em câmera | “Uma pessoa encontra uma árvore caída no caminho. Se ela puder registrar onde aconteceu, quem vier depois consegue consultar o relato e repensar o trajeto. Essa é a proposta do CityWatch: usar a colaboração dos moradores para organizar informações locais.” |
| 0:40–1:15 | Mapa, detalhe, Comunidade, Agenda e P.I.T. | “No protótipo, o morador pode consultar exemplos no mapa e acompanhar eventos. A Agenda e o P.I.T. dão outros motivos para voltar ao app. O catálogo é demonstrativo. Divulgação de parceiros e campanhas locais são propostas para sustentar o serviço gratuito.” |
| 1:15–2:15 | Terminal executando `python3 src/sistema.py`: cadastro, busca, filtros, status e histórico | “O núcleo Python roda sozinho com dados simulados. Vou registrar um poste apagado, encontrar a ocorrência pelo ID e filtrar por categoria e status. Depois, mudo o status e consulto o histórico. Se eu tentar um ID repetido ou status desconhecido, o sistema rejeita o registro ou a atualização.” |
| 2:15–3:15 | Fila antes/depois, histórico com duas mudanças, hierarquia e código | “A lista guarda as ocorrências. O dicionário localiza pelo ID. A fila FIFO examina primeiro a demanda mais antiga. A pilha LIFO mostra primeiro a atualização mais recente. Podemos agrupar por bairro e categoria. O filtro combina categoria e status com AND, aceita filtros opcionais com OR e as validações usam NOT para verificar campos ausentes ou fila vazia. IF, ELIF e ELSE separam os casos da alteração de status.” |
| 3:15–4:05 | Indicadores e avisos na sessão inicial | “Na base inicial, temos 12 ocorrências válidas, 10 atualizações e um registro rejeitado. A matriz cruza quatro categorias com três situações. Há nove pendências, ou 75%. Nas três conclusões com histórico válido, a média de quatro, seis e seis dias dá 5,33 dias. Esses números descrevem somente a amostra fictícia.” |
| 4:05–4:40 | Arquitetura, comandos e relatório de validação | “O aplicativo usa React Native e Expo. A FastAPI expõe as regras Python, com SQLite na API. O menu usa CSV, sem servidor. Nesta revisão passaram 38 testes Python e 74 TypeScript, além do typecheck e lint. Alertas distribuídos e encaminhamento oficial são propostas futuras.” |
| 4:40–4:59 | Autor em câmera e uma cartela final | “O que queremos é que a informação de quem passou por um lugar ajude quem vem depois. E que acompanhar as demandas da cidade vire um hábito. Esse é o CityWatch. Sua cidade, nossa comunidade.” |

## Sequência reproduzível no terminal

Inicie uma sessão acadêmica **sem `--estado`**, que mantém as alterações apenas em memória:

```sh
python3 src/sistema.py
```

1. Grave a **opção 8** antes de alterar qualquer registro: total 12, pendências 9 e média 5,33 dias. Grave também a **opção 10**, com OC-013 rejeitado.
2. **Opção 2:** lista. **Opção 3:** busque `OC-007`. **Opção 4:** categoria `limpeza` e status `em análise`.
3. **Opção 1:** cadastre os valores da tabela abaixo. Repita o ID em outra tentativa para mostrar duplicidade. Em uma tentativa separada, use ID `DEMO-015` e descrição vazia para mostrar campo obrigatório.
4. **Opção 5:** atualize DEMO-014 para `em análise` e depois `concluída`, com as datas abaixo. **Opção 6:** busque seu histórico; a conclusão aparece antes da análise.
5. **Opção 5:** tente o status `resolvida` para DEMO-014; deve ser rejeitado. Se o menu abortar uma operação após validação, retorne à opção inicial; não continue colando campos da operação cancelada.
6. **Opção 7:** filme a fila e examine sua primeira demanda, confirmando conforme o menu. Reabra a opção para mostrar a remoção da cabeça. **Opção 9:** mostre a hierarquia.
7. Saia com **0**. Para recuperar a carga inicial, abra outra sessão sem `--estado`. Não use no bloco de indicadores os números de uma sessão já alterada.

| Campo | Cadastro | Atualização 1 | Atualização 2 |
| --- | --- | --- | --- |
| ID | DEMO-014 | DEMO-014 | DEMO-014 |
| Categoria | iluminação | — | — |
| Descrição | Poste apagado próximo à praça fictícia | — | — |
| Bairro | Bairro Norte | — | — |
| Data simulada | 2026-10-20 | 2026-10-21 | 2026-10-22 |
| Status | aberta, automático | em análise | concluída |
| Observação | — | Exame comunitário simulado | Conclusão simulada |

Há uma demonstração parcial reproduzível em `python3 scripts/demonstracao_academica.py`. Ela executa o menu real e gera uma transcrição, mas não substitui os clipes completos de FIFO, duas atualizações, duplicidade e campo vazio descritos aqui.

## Checklist de cenas e publicação

- [ ] Conferir identificação, áudio, legibilidade e duração.
- [ ] Mostrar app real com ocorrências e eventos rotulados como simulados.
- [ ] Mostrar uma sessão real no terminal, incluindo erros esperados, fila e histórico.
- [ ] Mostrar a matriz, fórmulas e a leitura dos indicadores com a base inicial.
- [ ] Conferir a edição local contra o roteiro. Se precisar comprovar execução pelo terminal na tela, inserir os trechos reais correspondentes.
- [ ] Conferir que as telas e comandos não contêm credenciais, contas pessoais ou localização residencial.
- [x] URL do vídeo recebido e título confirmado. [CityWatch no YouTube](https://www.youtube.com/watch?v=shDn8X4PDFI).
- [x] Visibilidade do vídeo confirmada pelo autor.
- [x] Atualizar o README local e preparar o TXT de dois links. [Situação da entrega](../entrega/PENDENCIAS.md).
