# Arquitetura do CityWatch

```mermaid
flowchart LR
    subgraph Mobile["Aplicativo React Native e Expo"]
        UI["Expo Router · src/app e src/components"]
        Client["Clientes e estado · src/features"]
        Local[("AsyncStorage · favoritos e preferências")]
        UI --> Client --> Local
    end
    subgraph Academic["Execução acadêmica independente"]
        Entry["python src/sistema.py"]
        Menu["backend/main.py · menu"]
        File["armazenamento_arquivo.py · memória"]
        JSON[("JSON local opcional · --estado")]
        Entry --> Menu
        File --> JSON
    end
    subgraph Python["Núcleo Python"]
        Service["ocorrencias.py · serviço compartilhado"]
        Rules["validacoes.py · estruturas.py · indicadores.py"]
        Service --> Rules
    end
    subgraph Extensions["Extensões opcionais"]
        API["backend/api.py · FastAPI"]
        Citizen["relatos.py · cadastro cidadão"]
        SQL[("SQLite local · API")]
        Supa[("Supabase · conta e relatos privados")]
        API --> Citizen --> SQL
    end
    CSV[("CSV simulados · data e backend/dados")]
    Menu --> Service --> File
    CSV --> File
    Client -->|HTTP local| API --> Service
    Service -->|Modo API| SQL
    CSV -->|Carga inicial da API| SQL
    Client -->|Quando configurado| Supa
    subgraph Future["Planejado"]
        Plans["Widgets, alertas distribuídos, votação e rotas para desastres"]
    end
    UI -. evolução .-> Plans
    style Plans stroke-dasharray: 5 5
```

O menu injeta o armazenamento em memória ou JSON no mesmo serviço usado pela API com SQLite. Os dois caminhos são independentes na execução. A API também recebe os relatos cidadãos e os incorpora ao núcleo acadêmico. O Supabase atende ao fluxo separado de conta e relatos privados do mobile quando configurado. Mapas, GPS em primeiro plano, ditado, passos e calendário usam recursos do dispositivo conforme a build e as permissões.

Detalhes em [backend](../../backend/README.md), [aplicativo](../aplicativo.md) e [guia de cadastro](../cadastro-ocorrencias.md).
