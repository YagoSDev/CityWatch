# Validação real da preparação acadêmica

Data: 18/11/2026. Nenhum banco ou evidência privada do aplicativo foi modificado pelos testes.

## Verificações já executadas

- `.venv/bin/python -m unittest discover -s backend/tests -v`: **38 testes aprovados**: 27 anteriores, oito do modo acadêmico e três da preparação de entrega.
- Os oito novos verificam igualdade dos CSVs, indicadores/inconsistências, regras compartilhadas, FIFO/LIFO, persistência JSON sem alteração parcial, JSON corrompido preservado, entrada fora da pasta com `python -S` e ausência de importação de SQLite/FastAPI/Supabase.
- `python3 scripts/demonstracao_academica.py`: cadastro, consulta, filtros, status, histórico, erro de status desconhecido, fila, hierarquia e indicadores executados pelo menu de verdade. Transcrição em `docs/evidencias/menu-demonstracao.txt`.
- A demonstração em memória não usa o banco SQLite do app e não altera os CSVs.

## O que esses resultados não provam

Não confirmam a compreensão humana do autor, publicação no GitHub/YouTube ou envio na plataforma. Não certificam GPS físico, todos os recursos mobile ou execução multiprocesso do JSON. O vídeo foi explicitamente deixado para o autor.

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `node --experimental-strip-types --test tests/*.test.ts`: **56 testes aprovados**, zero falhas. Total: **94 testes** Python e TypeScript.
- O teste de exportação cria um pacote limpo e executa seu menu com `python -S`, fora do repositório, sem dependências instaladas. Verifica também a exclusão de credenciais, bancos e dependências.

O pacote contém o código Expo e sua configuração; a pasta nativa iOS gerada e os artefatos de compilação ficam fora da exportação. O projeto iOS existente foi preservado localmente.
