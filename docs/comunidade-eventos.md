# Comunidade e detalhes de eventos

Implementado em 18/11/2026 no projeto Expo existente. A Comunidade é uma aba independente; Início e Relatar continuam disponíveis na barra fixa. O backend Python, suas estruturas acadêmicas, CSVs, consultas e cadastro de ocorrências não foram alterados nesta etapa.

## Comportamento disponível

- Cabeçalho rosa com avatar do perfil, cidade e Safe Area; cores acompanham o modo claro/escuro do dispositivo.
- Categorias Todos, Cultura, Esportes, Solidariedade, Animais, Meio ambiente, Educação, Saúde e Promoções.
- Pesquisa sem distinção de acentos por título, categoria, resumo, local ou bairro. Os resultados respeitam cidade/estado do perfil.
- Filtros expansíveis de futuros e favoritos. Futuros exclui registros sem data de início, cancelados e encerrados.
- Destaques paginados com um cartão inteiro por vez, indicadores acionáveis e nenhuma troca automática. Lista complementar com miniaturas.
- Favoritos compartilhados entre Home, Comunidade e detalhes, persistidos no dispositivo. A chave `citywatch:community:saved-events` e os IDs anteriores foram preservados.
- Detalhes com fotografia, informações disponíveis, descrição, programação expansível, estado do evento, links, compartilhamento, mapa e agenda.
- Estados de carregamento, erro com nova tentativa e lista vazia com limpeza dos filtros. Falhas na persistência de favoritos são apresentadas ao usuário.
- Os recursos anteriores de segurança, alertas, recompensas e painel institucional continuam em `/recursos-comunidade` e nos atalhos existentes.

## Dados e integrações

Ainda não há tabela de eventos nas migrações Supabase existentes. `loadCommunityEvents()` centraliza a fonte local: 13 eventos fictícios (11 de São Paulo e 2 do Rio de Janeiro), com identificação em cartões, detalhes, compartilhamento e calendário. Não há inscrições ou organizadores oficiais confirmados. O registro promocional é identificado como publicidade demonstrativa, sem oferta real.

Datas ISO incluem o deslocamento UTC e o campo `fuso` define a apresentação. Dados ausentes aparecem como não informados; nenhum horário é completado automaticamente. A programação do festival é simulada. As datas do catálogo são exemplos fixos e, conforme o tempo passa, os eventos terminam e deixam o filtro de futuros.

As imagens novas são ilustrativas e geradas por IA: não documentam acontecimentos reais. Prompts, arquivos e modo de geração estão em [assets/events/README.md](../assets/events/README.md). As fotografias de parque/cidade já existentes continuam como ilustrações dos demais registros.

Links externos exigem HTTPS, sem credenciais e com rejeição de esquemas perigosos e alguns endereços locais. Só são apresentados os links cadastrados. As páginas usadas são informações sobre espaços, sem afirmar que confirmam os eventos fictícios:

- [Espaços culturais da Prefeitura de São Paulo](https://prefeitura.sp.gov.br/web/cultura/w/centros-culturais).
- [Parque Ibirapuera — Prefeitura](https://prefeitura.sp.gov.br/web/meio_ambiente/w/parques/regiao_sul/14062).
- [Visite o Centro Cultural São Paulo](https://centrocultural.sp.gov.br/visite/).

O mapa abre somente coordenadas/endereço marcados como verificados; um lugar real não confirma a realização do evento. O festival em praça fictícia não tem botão de mapa. Não é solicitada localização do cidadão para consultar esses locais.

O compartilhamento utiliza a folha nativa e inclui “DEMONSTRAÇÃO · Evento fictício”. A ação de participação só aparece com um link de inscrição seguro cadastrado; nenhum registro demonstrativo oferece inscrição real.

## Agenda nativa

Foi instalado `expo-calendar ~58.0.8`, compatível com o SDK 58 existente. Segue a [documentação oficial do Expo Calendar](https://docs.expo.dev/versions/latest/sdk/calendar/). O código utiliza `CalendarNext` e `addEventWithForm`, permitindo revisão antes de salvar. No iOS solicita acesso somente para adicionar, sem ler compromissos.

O título recebe `[DEMONSTRAÇÃO]` e as datas/horas são exatamente as do registro. Eventos sem início/fim completos ou cancelados/encerrados não podem ser adicionados. Negação de permissão e ausência de agenda produzem mensagens claras. Só se informa sucesso quando o editor retorna `saved`.

No Expo Go, o SDK 58 não oferece esse módulo; o aplicativo informa a limitação e mantém favoritos e compartilhamento disponíveis. Para agenda, use a versão nativa:

```sh
npm run dev
npm run ios:native -- --device
```

Para iPhone físico, a compilação nativa também depende da assinatura Apple configurada no Xcode. Não é necessário modificar o backend Python.

## Arquivos desta etapa

| Arquivos | Responsabilidade |
| --- | --- |
| `src/app/(tabs)/comunidade.tsx`, `src/components/community-screen.tsx` | Aba, pesquisa, segmentos, filtros, destaques, lista e estados |
| `src/app/detalhe-evento.tsx`, `src/components/event-card.tsx` | Detalhes e cartões com botões de favorito acessíveis |
| `src/features/events-model.ts` | Modelo tipado, filtros, status, validação de links, datas, payloads de mapa/agenda/compartilhamento |
| `src/features/events-data.ts`, `src/features/event-images.ts` | Serviço e catálogo de demonstração, imagens locais |
| `src/features/events.tsx`, `src/features/event-actions.ts` | Provider, persistência e integrações nativas |
| `src/app/(tabs)/_layout.tsx`, `src/app/_layout.tsx` | Três abas reais, provider e rota de detalhes |
| `src/app/(tabs)/index.tsx`, `src/components/community-carousel.tsx` | Atalhos da Home para Comunidade e detalhes |
| `src/features/demo.ts`, `src/components/community-agenda.tsx` | Adaptação da Home ao catálogo e aos favoritos compartilhados |
| `src/app/recursos-comunidade.tsx` | Preservação dos recursos comunitários anteriores |
| `assets/events/*.jpg`, `assets/events/README.md` | Três novas ilustrações e procedência |
| `tests/events.test.ts` | Oito testes de domínio dos eventos |
| `app.json`, `ios/CityWatch/Info.plist`, `package.json`, `package-lock.json` | Dependência e configuração de permissão da agenda |
| `README.md`, `docs/comunidade-eventos.md` | Execução e entrega |

## Validação executada

- TypeScript (`npm run typecheck`) e lint (`npm run lint`): aprovados.
- Eventos: 8 testes aprovados; sessões P.I.T.: 8; cadastro: 11; conexão: 4; backend Python: 27. Total: **58 testes automatizados aprovados**.
- O backend foi validado com `.venv/bin/python -m unittest discover -s backend/tests -v`. Uma tentativa com o Python global falhou por ausência de FastAPI nesse interpretador; a execução no ambiente virtual já existente passou integralmente.
- Exportação iOS (`npx expo export --platform ios`): gerada em `/tmp/citywatch-community-ios`.
- Compilação e instalação nativa no simulador iPhone 18 Pro, iOS 27.2: **0 erros, 2 avisos** das dependências/etapas de build existentes.
- Simulador: navegação exclusiva Comunidade, abrir/voltar dos detalhes, acesso ao cadastro preservado, categorias, pesquisa sem resultados, limpar filtros, filtro de futuros/favoritos, paginação manual e programação expansível verificados.
- Favorito sobre o cartão não abre detalhes; persistência confirmada após encerrar/reabrir o app. O favorito criado no teste foi removido ao final.
- Compartilhamento nativo aberto com a identificação de demonstração; nenhum conteúdo foi enviado.
- Apple Maps aberto no Parque Ibirapuera. Link externo abriu o Safari no domínio da Prefeitura; não foi verificado o carregamento completo da página dentro desse teste.
- Agenda: permissão nativa e editor preenchido verificados com `[DEMONSTRAÇÃO] Festival Cultural SP`, 28/11/2026, 10h–22h. **Nenhum compromisso foi salvo**; a gravação e o retorno de confirmação não foram testados. O editor foi descartado encerrando o aplicativo.
- Inspeção visual em claro e escuro; modo claro original restaurado ao final.

Foram corrigidos durante a validação o recorte excessivo das imagens grandes, o botão de favorito inacessível dentro de outra área clicável e a quebra inadequada do rótulo Solidariedade. Não houve erro bloqueante nos testes finais.

Capturas locais da verificação: `/tmp/citywatch-community-proof/` (Comunidade, detalhes, editor de agenda, compartilhamento e mapa).

## Pendências e limites

- Conectar uma fonte de eventos verificados quando existir banco/serviço apropriado. O catálogo atual é demonstrativo por escolha explícita, sem simular integração Supabase.
- Testar a gravação final de um compromisso escolhido pelo usuário em iPhone físico com build nativo. No Expo Go a agenda permanece indisponível.
- Fluxos de permissão negada e falhas nativas possuem tratamento, mas não foram todos reproduzidos manualmente. Android, VoiceOver completo, texto ampliado e outros tamanhos de iPhone não foram certificados nesta etapa.
- Inscrição/participação depende de URLs reais de organizadores; não há cadastro de participação fictício.
