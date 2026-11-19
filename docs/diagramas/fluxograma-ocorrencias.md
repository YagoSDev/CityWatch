# Fluxo de ocorrências

```mermaid
flowchart TD
    A([Início]) --> B["Carregar CSV e registrar avisos de inconsistência"]
    B --> M{Operação escolhida}
    M --> C["Cadastrar ocorrência"]
    C --> V["Validar campos, categoria, data e ID único"]
    V --> D{Dados válidos?}
    D -->|Não| E["Exibir erro sem gravar"] --> M
    D -->|Sim| R["Gravar ocorrência aberta na lista"]
    R --> I["Ao montar Estruturas: indexar por ID e agrupar por bairro e categoria"]
    I --> F["Abertas na fila FIFO por ordem de entrada"]
    F --> M
    M --> Q["Buscar por ID no dicionário"]
    M --> L["Listar e filtrar por categoria e status"]
    M --> H["Consultar hierarquia bairro → categoria → ocorrências"]
    Q --> M
    L --> M
    H --> M
    M --> S["Atualizar status por ID"]
    M --> X["Examinar próxima aberta via popleft"]
    X -->|Fila vazia| M
    X -->|Há demanda| S
    S --> T{Mudança válida?}
    T -->|Não| E
    T -->|Sim| U["Gravar status e acrescentar evento ao histórico"]
    U --> M
    M --> P["Consultar histórico: pop em cópia da pilha LIFO"] --> M
    M --> K["Montar matriz categoria × status e calcular totais, proporções e pendências"]
    K --> Y["Usar o histórico válido das concluídas para a média de dias"] --> M
    M --> Z([Encerrar])
```

A triagem altera a ocorrência mais antiga da fila para **em análise**. Nas operações seguintes, a fila é montada com as ocorrências abertas. Uma reabertura recebe uma nova posição no fim da fila. Os status representam acompanhamento simulado. A confirmação do sistema comprova o registro no CityWatch.

Fontes: [menu](../../backend/main.py), [serviço](../../backend/ocorrencias.py), [estruturas](../../backend/estruturas.py) e [indicadores](../../backend/indicadores.py).
