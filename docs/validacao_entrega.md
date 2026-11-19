# Validação real da preparação acadêmica

Histórico iniciado em 18/11/2026. Nenhum banco ou evidência privada do aplicativo foi modificado pelos testes.

## Verificações já executadas

- `.venv/bin/python -m unittest discover -s backend/tests -v`: **38 testes aprovados**: 27 anteriores, oito do modo acadêmico e três da preparação de entrega.
- Os oito novos verificam igualdade dos CSVs, indicadores/inconsistências, regras compartilhadas, FIFO/LIFO, persistência JSON sem alteração parcial, JSON corrompido preservado, entrada fora da pasta com `python -S` e ausência de importação de SQLite/FastAPI/Supabase.
- `python3 scripts/demonstracao_academica.py`: cadastro, consulta, filtros, status, histórico, erro de status desconhecido, fila, hierarquia e indicadores executados pelo menu de verdade. Transcrição em `docs/evidencias/menu-demonstracao.txt`.
- A demonstração em memória não usa o banco SQLite do app e não altera os CSVs.

## O que esses resultados não provam

Não confirmam a compreensão humana do autor, publicação no GitHub/YouTube ou envio na plataforma. Não certificam GPS físico, todos os recursos mobile ou execução multiprocesso do JSON. A edição local do vídeo foi concluída posteriormente. O URL foi fornecido após a revisão inicial.

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `node --experimental-strip-types --test tests/*.test.ts`: **56 testes aprovados**, zero falhas. Total: **94 testes** Python e TypeScript.
- O teste de exportação cria um pacote limpo e executa seu menu com `python -S`, fora do repositório, sem dependências instaladas. Verifica também a exclusão de credenciais, bancos e dependências.

O pacote contém o código Expo e sua configuração; a pasta nativa iOS gerada e os artefatos de compilação ficam fora da exportação. O projeto iOS existente foi preservado localmente.

## Publicação inicial verificada — 18/11/2026 (histórico)

- Repositório: https://github.com/YagoSDev/citywatch-fiap
- A consulta HTTPS sem credenciais retornou `private: false`.
- Um clone novo com o gerenciador de credenciais desativado foi concluído com sucesso.
- Executado `python3 -S .../src/sistema.py` a partir de `/tmp`, com as opções 8 e 0: 12 registros válidos, 10 eventos, um aviso e média de 5,33 dias, sem erro.
- A publicação usa uma cópia revisada dos arquivos, sem enviar o histórico Git local ou alterar o repositório de trabalho existente.


## V2 — atualização de 19/11/2026

- `.venv/bin/python -m unittest discover -s backend/tests`: **38 aprovados**.
- `node --experimental-strip-types --test tests/*.test.ts`: **74 aprovados**.
- Total na V2: **112 testes aprovados**, sem falhas; `npm run typecheck` e `npm run lint` aprovados.
- Verificações em simulador: abertura e cartões do P.I.T., sessões e contadores, indisponibilidade honesta de passos, Cosmópolis por GPS simulado, fotografia/avatares, Comunidade e favorito refletido na Agenda. Consulte os guias V2 para evidências e limites.
- Passos no iPhone: funcionamento relatado pelo autor; não é medição feita pelo assistente. Arraste lateral e permissões/sensores em outros aparelhos ainda exigem teste físico.
- Situação atual do GitHub: **privado para revisão por decisão do autor**. A verificação pública acima é histórica e não significa que o avaliador tenha acesso agora. Torná-lo público depende de autorização posterior.

A V2 é uma atualização do mesmo projeto; não removeu as operações acadêmicas ou substituiu a base simulada.


## Revisão de portfólio — 19/11/2026

Ambiente local: Python 3.13.12, Node.js 24.19.0 e iPhone 18 Pro simulado com iOS 27.2.

| Comando | Resultado |
| --- | --- |
| `.venv/bin/python -m unittest discover -s backend/tests -v` | 38 aprovados, incluindo a exportação limpa |
| `node --experimental-strip-types --test tests/*.test.ts` | 74 aprovados, zero falhas e zero ignorados. Avisos do Node sobre tipo de módulo |
| `npm run typecheck` | Código de saída 0 |
| `npm run lint` | Código de saída 0 |
| `python3 scripts/demonstracao_academica.py` | Menu real executado, com a transcrição em [menu-demonstracao.txt](evidencias/menu-demonstracao.txt) |

**112 aprovados** nesta revisão. O total histórico de **94** era composto por 38 Python e 56 TypeScript. Entre os registros de validação, a contagem TypeScript passou a 58 na [presença do P.I.T.](pit-presenca.md), 66 nas [atividades e passos](pit-atividades.md) e 74 em [cidade e imagens](cidade-e-imagens.md). A diferença é de 18 testes TypeScript, com o total Python igual.

O menu preservou a amostra inicial dos CSVs: 12 válidas, 10 eventos, OC-013 rejeitada, 9 pendentes e média de 5,33 dias. Os exemplos são fictícios. A revisão abriu a build já instalada no simulador e capturou o mapa e o cadastro. As demais evidências vêm de gravações anteriores do app. Esta rodada não avaliou Android, ditado e sensores em dispositivo físico, entrega de e-mail ou atendimento municipal. [Origem das capturas](evidencias/CAPTURA.md).

A consulta pública ao [repositório](https://github.com/YagoSDev/citywatch-fiap) retornou 404 nesta revisão, compatível com a visibilidade privada registrada. A edição V3.1 de 4min59s está disponível localmente. O título do vídeo foi confirmado sem login por oEmbed. [CityWatch no YouTube](https://www.youtube.com/watch?v=shDn8X4PDFI). O TXT local contém as duas URLs. A visibilidade Não Listado, a publicação da revisão no GitHub, a abertura pública e o envio à FIAP seguem pendentes. [Situação da entrega](../entrega/PENDENCIAS.md).

A revisão de preparação também verificou o parser Mermaid para os dois fluxogramas e os links relativos dos documentos. A renderização final na página do GitHub depende da versão enviada ao repositório. Confira o pacote de revisão pelo script `scripts/preparar_entrega.py`, que usa uma lista de arquivos permitidos. A revisão procurou padrões comuns de credenciais nos arquivos candidatos e conferiu a exclusão de arquivos de configuração privados, bancos e gravações pessoais. Essa checagem se aplica ao workspace atual e ao pacote, sem inspeção do histórico remoto privado.
