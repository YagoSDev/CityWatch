# Etapa 2 — Agenda e calendário interativo

Implementada após validar a etapa do mapa, em 18/11/2026. Preservados mapa, Comunidade, backend Python e funcionalidades acadêmicas.

## Entrega funcional

- Home: atalho discreto “Acontece em [cidade]” para Comunidade, seguido de Agenda com subtítulo “Seus próximos compromissos na cidade.”, mês/ano e **no máximo dois próximos itens**. Cabeçalho/ícone abre a tela completa. Nenhuma grade mensal na Home.
- `/agenda`: calendário mensal em sete colunas DOM–SÁB, setas entre meses/anos, dia atual com contorno discreto, seleção suave e pequeno quadrado rosa nos dias com acontecimentos. Tocar novamente no dia remove a seleção.
- Lista cronológica abaixo, com categoria, data, horário disponível, local, favorito e inclusão na Agenda CityWatch. Dias vazios e filtros sem resultados têm mensagem própria.
- Hoje/Esta semana/Este mês/Próximos combinam com Somente salvos. Navegar pelo mês muda para o período mensal; selecionar dia restringe a lista à data. Os marcadores da grade respeitam Somente salvos.
- Os mesmos registros da Comunidade alimentam a Agenda, deduplicados por ID. Eventos cancelados/encerrados continuam identificados na tela completa; a prévia só oferece os próximos ativos.
- Datas inválidas não criam marcadores. Favoritos ou itens adicionados sem data aparecem em Próximos, com informação ausente preservada; não é inventado horário.
- Detalhes de feriado em `/detalhe-agenda` apresentam data civil, abrangência, validade, origem e botão para fonte oficial. Datas de dia inteiro preservam o dia civil do local.
- Modos claro/escuro e Safe Area mantidos. O calendário foi implementado em React Native, sem pacote adicional.

## Favoritar, Agenda e calendário do aparelho

1. **Favoritar** marca interesse na Comunidade e entra automaticamente na Agenda. Remover o favorito retira de Somente salvos, mantendo o evento na lista pública.
2. **Salvar na Agenda CityWatch**, nos detalhes do evento, é um estado independente do coração. Continua em Somente salvos mesmo se retirar o favorito. Para remover completamente da lista pessoal, retire ambos os estados. Retirar um não apaga o outro.
3. **Adicionar ao calendário do dispositivo** abre o editor nativo para revisão. Isso não lê compromissos pessoais e é uma ação separada das duas anteriores.

Favoritos mantêm a chave existente `citywatch:community:saved-events`. Inclusões na Agenda usam `citywatch:agenda:event-ids`. Ambas são persistidas localmente pelo provider compartilhado, com trava contra gravações concorrentes e mensagens de erro.

A integração existente com `expo-calendar ~58.0.8` foi preservada: acesso somente de escrita no iOS, pedido de permissão apenas após a ação, recusa quando datas/horários completos faltam, identificação DEMONSTRAÇÃO em registros fictícios e fallback honesto no Expo Go. Segue a [documentação oficial do Expo Calendar](https://docs.expo.dev/versions/latest/sdk/calendar/).

Foi acrescentado um registro local de exportações por ID e intervalo do evento. Duplo toque não abre dois editores; confirmação `saved` impede nova cópia automática. Cancelamento permite tentar de novo. Uma inclusão interrompida/sem confirmação exige revisão no calendário, sem repetição automática. O registro não lê se um compromisso foi apagado fora do app; reinstalar/limpar dados remove essa proteção local. Não há deduplicação global entre aparelhos.

## Feriados e dados simulados

Base local com validade **2026**, verificada em fontes oficiais, sem consulta repetida em cada abertura:

- Dez datas nacionais conforme [MGI](https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026).
- São Paulo: Data Magna estadual e datas municipais cadastradas (aniversário da cidade e Corpus Christi), conforme [Prefeitura](https://www2.prefeitura.sp.gov.br/web/gestao/w/calendario_2026). Total de 13 datas com as nacionais.
- Rio de Janeiro: [São Sebastião municipal](https://www.trf2.jus.br/jfrj/prazos-suspensos-feriados/2026/dia-de-sao-sebastiao) e [São Jorge estadual](https://www.trf2.jus.br/jfrj/prazos-suspensos-feriados/2026/dia-de-sao-jorge), além das nacionais.
- Outro município: nacionais conhecidas e estadual de SP/RJ quando aplicável. Nenhum feriado municipal é inferido. Para anos sem base, a tela informa a ausência de dados.

É uma base curada, não uma garantia de calendário oficial completo para todos os municípios/regimes de expediente. Pontos facultativos não são tratados automaticamente como feriados. Cada item registra abrangência, referência e ano.

Os eventos da Comunidade continuam fictícios e identificados. Favoritar/salvar um exemplo não o torna oficial. Nenhum compromisso foi criado no calendário do aparelho durante esta entrega.

## Modelo e arquivos desta etapa

`AgendaEntry` reúne ID, tipo, título/descrição/categoria, início/fim, local, cidade/estado, origem/fonte, favorito (`saved`), adicionado à Agenda (`added`), status, validade/abrangência de feriado e estado de data inválida. `eventId` mantém a ligação com a fonte original; o catálogo não é repetido nos componentes.

- `src/features/agenda-model.ts`: modelo unificado, deduplicação, datas civis, grade e filtros.
- `src/features/agenda-dates.ts`: feriados por abrangência/cidade/ano e respectivas fontes.
- `src/features/agenda.ts`: hook compartilhado de composição dos dados.
- `src/features/events.tsx`: inclusão persistente na Agenda independente dos favoritos.
- `src/components/home-agenda.tsx`: prévia compacta com dois itens.
- `src/components/agenda-card.tsx`: cartão compartilhado entre prévia e tela completa.
- `src/app/agenda.tsx`, `src/app/detalhe-agenda.tsx`: tela mensal e detalhes das datas.
- `src/app/detalhe-evento.tsx`: ação Agenda CityWatch separada da exportação nativa.
- `src/features/event-actions.ts`, `src/features/calendar-export.ts`: proteção contra cópias no calendário do aparelho.
- `src/components/community-agenda.tsx`: recursos anteriores usam a mesma seleção pessoal e oferecem acesso ao calendário.
- `src/app/(tabs)/index.tsx`, `src/app/_layout.tsx`: atalho compacto e novas rotas.
- `tests/agenda-calendar.test.ts`, `package.json`: nove testes e `npm run test:agenda`.
- `README.md` e este guia.

## Validações executadas

- Agenda: **9/9** testes novos. Meses/anos, bissexto, dia e marcadores, filtros, deduplicação, favorito versus adicionado, datas desconhecidas/inválidas, cancelados, abrangência/validade de feriados, dia inteiro, duplicação/cancelamento/concorrência de exportação.
- Suite final: **56 testes TypeScript + 27 Python = 83 aprovados**, sem falhas.
- `npm run typecheck`, `npm run lint`: aprovados.
- `npx expo export --platform ios --output-dir /tmp/citywatch-interactive-ios`: concluído. Nenhuma dependência nova ou recompilação nativa necessária nesta etapa.
- Simulador iPhone 18 Pro, iOS 27.2: abertura pela Home, novembro/dezembro, seleção de 28/11, abertura do Festival, salvamento independente do favorito, Somente salvos, Próximos, dia 01/12 sem acontecimentos e remoção do item de teste confirmados. Favorito anterior da Feira de livros preservado.
- Detalhes do feriado de 20/11 exibiram abrangência nacional, validade 2026, origem e ação de fonte.
- Inspeção visual em claro/escuro; modo claro restaurado. Home confirmou somente dois cartões de Agenda. Capturas em `/tmp/citywatch-interactive-proof/agenda.png` e `agenda-dark.png`.

Um tipo adicional de retorno do SDK (`deleted`) foi encontrado pelo TypeScript e tratado conservadoramente como resultado a revisar. O código final passou nos checks. Os avisos não bloqueantes de inferência ES modules do Node e de cores do terminal na exportação permanecem preexistentes.

## Pendências

- Gravação real e resultado de confirmação/cancelamento do editor nativo com iPhone físico: a integração já abria o editor anteriormente, mas a nova proteção foi validada por testes com adaptadores, sem gravar compromissos pessoais.
- Criação de atividades pessoais livres não foi habilitada; o usuário pode adicionar os eventos disponíveis à Agenda CityWatch. Nenhum formulário decorativo de compromisso foi apresentado como operacional.
- Mais municípios/anos e fonte real de eventos. A base atual comunica sua abrangência e ausência de dados.
- Android, outros tamanhos de iPhone e auditoria completa de VoiceOver/texto ampliado não foram certificados nesta etapa.
