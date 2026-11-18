# Correção final da Home — mapa, eventos e calendário

A Home passa a seguir: fotografia da cidade → Perto de você → Acontece em [cidade] → Agenda. Mantida rolagem vertical e navegação fixa Início/Relatar/Comunidade. Banco, backend Python e telas completas foram preservados.

## Alterações

- **Mapa:** um cartão inteiro clicável, proporção 16:8,5, cantos arredondados e indicação discreta Abrir mapa. Mostra no máximo oito itens localizados, priorizados pela distância do GPS autorizado ou do centro da cidade. A posição do usuário só vem do provider autorizado; exemplos não são usados como GPS real.
- Filtros, busca, localização, legenda, lista e detalhes ficam no mapa completo. Os controles extensos não aparecem na Home. A observação em primeiro plano e a pausa de acompanhamento durante exploração manual continuam na implementação existente.
- **Eventos:** seção visual restaurada, usando `EventsProvider`, os mesmos registros e `EventCard` da Comunidade. Até seis eventos ativos, com destaques primeiro; um cartão por página, formato horizontal aproximadamente 16:9, degradê, categoria, título, descrição breve, data, local e indicadores manuais. Sem avanço automático e sem prévia do próximo cartão.
- Evento e ilustração simulados permanecem identificados. Tocar abre os detalhes existentes; os favoritos continuam compartilhados.
- **Agenda:** somente o mini calendário mensal, com sete colunas, data local atual, contorno discreto de hoje e pequenos marcadores rosa. O cartão inteiro abre `/agenda`; não há lista de eventos/feriados ou expansão dentro da Home. A tela completa conserva a seleção de dias, filtros e lista cronológica.
- **Falhas:** a Home apresenta apenas “Dados não atualizados · tentar novamente” ou aviso equivalente da Agenda. Instruções técnicas permanecem na experiência completa. A consulta de ocorrências conserva a última resposta bem-sucedida em memória durante a sessão para não apagar os dados quando uma atualização falha. Não é cache persistente nem garantia de acesso após encerrar o aplicativo.
- Atalhos existentes para P.I.T., outros recursos e demonstração acadêmica continuam discretos no fim da Home.

## Arquivos

- `src/app/(tabs)/index.tsx`: ordem das seções e restauração do carrossel.
- `src/components/discovery-map.tsx`: cartão único, limite de marcadores e falha compacta na Home; mapa completo preservado.
- `src/components/community-carousel.tsx`: fonte compartilhada e paginação horizontal.
- `src/components/event-card.tsx`: variante compacta reutilizada, preservando o visual da Comunidade.
- `src/components/home-agenda.tsx`: mini calendário clicável, sem lista.
- `src/features/nearby-occurrences.ts`: retenção da última resposta válida em memória.
- `README.md` e este documento.

## Verificação

- Suite: **56 testes TypeScript + 27 Python = 83 aprovados**.
- TypeScript, lint e verificação de whitespace aprovados. Um import sem uso foi removido após a primeira execução de lint.
- Exportação iOS concluída em `/tmp/citywatch-home-final-ios`.
- Simulador iPhone 18 Pro, iOS 27.2: Home atualizada, segunda página do carrossel selecionada, abertura dos detalhes da Corrida Solidária, abertura da Agenda pelo mini calendário e abertura/retorno do mapa completo conferidos. O seletor de bolinhas permaneceu na página escolhida ao voltar.
- Durante a verificação o simulador ainda usava o endereço antigo do servidor de desenvolvimento. A conexão foi reaberta no IP atual do Mac; Python `/health` e Metro `/status` responderam corretamente. Não foi alterado nenhum endereço de produção.
- Captura da Home: `/tmp/citywatch-home-final-proof/home.png`.

A retenção de dados em caso de falha foi implementada, mas uma queda real do servidor não foi induzida nesta conferência. Os testes de conexão existentes continuam aprovados. Precisão do GPS físico, modo escuro desta nova composição e aparelhos menores não foram certificados novamente; os componentes continuam usando o tema e as dimensões responsivas existentes. Nenhum pacote ou imagem nova foi acrescentado.

As pendências acadêmicas de GitHub, vídeo, TXT e declaração consolidada de IA permanecem para a etapa de entrega, conforme solicitado.
