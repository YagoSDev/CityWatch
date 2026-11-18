# Home com mapa central e Agenda

Entrega de 18/11/2026. A Home foi reorganizada em fotografia da cidade → Perto de você → Agenda. Foram removidos da Home os cartões grandes de Segurança/Eventos/Recompensas e os blocos repetidos de alertas, eventos, promoções e recompensas. Seus recursos continuam na Comunidade, nos detalhes, no Perfil e em Recursos da comunidade. O acesso à demonstração acadêmica e ao P.I.T. permanece no fim da Home. Nenhum arquivo do backend Python foi alterado nesta etapa.

## Funcionalidades disponíveis

- Mapa resumido de 330 pontos de altura, campo “Para onde você quer ir?”, localização sob demanda e botão de mapa completo.
- Mapa completo com busca por conteúdo e pelos pontos de referência já cadastrados na cidade. A busca de destinos é local; não afirma oferecer geocodificação universal ou cálculo de rotas.
- Oito tipos de conteúdo com cores, ícones e legenda próprios. Publicidade tem marcador quadrado, categoria e identificação textual; outros conteúdos usam marcadores circulares.
- Ao tocar no marcador, aparece um cartão abaixo do mapa com imagem ilustrativa, título, categoria, local, data/hora disponível, status, origem e ação de detalhes. Ocorrências e eventos abrem suas páginas existentes; outros exemplos abrem `/detalhe-mapa`.
- Filtros combináveis por tipo, categoria, distância, período e status. O painel tem edição provisória: Cancelar descarta; Aplicar compartilha o resultado entre Home e mapa completo. Os filtros duram a sessão do aplicativo; não são gravados em disco.
- Lista opcional dos itens dentro da região visível da câmera. Alterar o enquadramento atualiza essa lista; o número acima do mapa conta todos os marcadores filtrados, inclusive os fora da câmera.
- Estados de carregamento, dados parciais, erro com nova tentativa e ausência de resultados. A indisponibilidade da API Python não é ocultada por relatos falsamente apresentados como reais.
- A Agenda reúne eventos da cidade e favoritos da Comunidade, sem duplicação. Há Hoje, Esta semana, Este mês, Próximos e somente salvos. Tocar abre os detalhes; feriados abrem sua fonte oficial.
- As datas desconhecidas continuam desconhecidas. Favoritos sem data aparecem em Próximos; eventos cancelados, encerrados ou de publicidade não entram na Agenda. Compromissos pessoais do calendário do aparelho não são lidos.
- Modos claro e escuro e três itens inferiores mantidos: Início, Relatar, Comunidade.

## Semântica dos filtros

| Filtro | Regra |
| --- | --- |
| Tipos | Seleção múltipla; pelo menos um para aplicar. Padrão: Ocorrências, Alertas e Eventos, sem publicidade |
| Categorias | União das categorias selecionadas; sem seleção equivale a todas |
| Distância | Haversine, em quilômetros: 1, 3, 5, 10 ou sem limite municipal. Origem no GPS autorizado; antes dele, centro de referência da cidade, informado na interface |
| Agora | O instante atual deve pertencer ao intervalo conhecido do registro; sem término, usa-se apenas a data inicial |
| Hoje/Semana/Mês | Interseção com o dia, semana de segunda a domingo ou mês do dispositivo. Data ausente não satisfaz um período definido |
| Recentes | Data inicial/publicação nas últimas 24 horas, sem incluir datas futuras |
| Confirmados | Somente registros com `verified: true`; nenhum exemplo fictício foi marcado como confirmado |
| Em andamento/Encerrados | Estado normalizado do registro. Cancelados são identificados como cancelados |

O relógio é atualizado a cada minuto com a tela em foco e ao retornar do segundo plano. As datas dos exemplos são fixas, não deslocadas para parecer notícias atuais. Os tipos/categorias são combinados por AND entre grupos e OR dentro de cada seleção múltipla.

São desenhados no máximo 40 itens filtrados por montagem para limitar a carga da interface. O catálogo atual de São Paulo contém até 30 itens, portanto cabe integralmente nesse limite. Antes de ampliar a base, acrescentar paginação/agregação espacial e aviso de truncamento.

## Fontes e simulações

1. **Ocorrências:** leitura da API Python existente. Os 12 registros acadêmicos usam posições determinísticas fictícias. Não são casos reais na cidade do perfil. As categorias acadêmicas continuam intactas; somente a visualização as agrupa em Segurança (iluminação), Saúde (limpeza) e Social (acessibilidade/conservação).
2. **Relatos cidadãos:** a resposta pública não inclui coordenadas privadas. Eles continuam na consulta e nos detalhes, mas não recebem uma posição inventada no mapa. A interface informa quantos registros foram omitidos por essa razão.
3. **Eventos:** mesmo serviço e favoritos da Comunidade. Coordenadas verificadas do local são reaproveitadas quando disponíveis. Os demais eventos simulados recebem posição explicitamente fictícia. Confirmar o lugar não confirma a realização do evento.
4. **Demais conteúdos:** sete exemplos locais fixos por cidade suportada: dois alertas, uma promoção, uma notícia, um parceiro, um serviço público e uma recompensa. Todos fictícios, sem serviço de emergência, oferta, atendimento ou resgate real. Imagens existentes são reaproveitadas como ilustrações; nenhum asset novo foi gerado.
5. **Feriados/datas especiais:** seleção estática e não exaustiva de 2026, verificada em fontes públicas: aniversário de São Paulo, Data Magna estadual, Consciência Negra e Natal em São Paulo; São Sebastião no Rio. O aniversário é também uma data especial da cidade. Fontes acessíveis em cada cartão: [Prefeitura de São Paulo](https://www2.prefeitura.sp.gov.br/web/gestao/w/calendario_2026) e [Justiça Federal do Rio de Janeiro](https://www.trf2.jus.br/jfrj/prazos-suspensos-feriados/2026/dia-de-sao-sebastiao). Não são inferidos feriados para outros anos ou municípios.

As cidades com base cartográfica demonstrativa continuam São Paulo e Rio de Janeiro. Para uma cidade não cadastrada, o mapa informa a ausência da base; não atribui os exemplos de São Paulo a ela. O centro visual de fallback é São Paulo e permanece identificado como fallback na experiência.

A localização reutiliza o provider existente: uma leitura em primeiro plano por toque, com permissão do sistema, sem acompanhamento contínuo. Coordenadas servem apenas ao mapa/distância em memória; esta etapa não as envia ao backend nem as publica em relatos.

## Arquivos criados e alterados nesta etapa

| Arquivo | Mudança |
| --- | --- |
| `src/app/(tabs)/index.tsx` | Home simplificada, preservando fotografia, avatar, P.I.T. e atalhos administrativos discretos |
| `src/app/mapa.tsx` | Tela expandida baseada no componente compartilhado |
| `src/app/detalhe-mapa.tsx` | Descrição dos conteúdos demonstrativos sem página preexistente |
| `src/app/_layout.tsx` | Provider de filtros e registro da nova rota |
| `src/components/city-map.tsx` | Marcadores tipados, ícones, publicidade distinta e retorno da região visível; props anteriores preservadas |
| `src/components/discovery-map.tsx` | Mapa resumido/completo, busca, câmera, localização, legenda, seleção e lista |
| `src/components/discovery-filters.tsx` | Painel de filtros aplicáveis/canceláveis |
| `src/components/discovery-card.tsx` | Resumo do marcador e navegação aos detalhes |
| `src/components/home-agenda.tsx` | Agenda da Home integrada ao provider de favoritos |
| `src/features/discovery-model.ts` | Tipos, distância, períodos, filtros e adaptação das fontes |
| `src/features/discovery-data.ts` | Conteúdos fictícios adicionais |
| `src/features/discovery.tsx` | Fonte compartilhada e filtros em memória |
| `src/features/agenda-model.ts`, `src/features/agenda-dates.ts` | Composição da Agenda, deduplicação e feriados com fonte |
| `src/features/use-now.ts` | Atualização do relógio em primeiro plano |
| `tests/discovery.test.ts`, `package.json` | Nove testes e script `test:discovery` |
| `README.md`, `docs/home-mapa-agenda.md` | Documentação da entrega |

## Testes executados

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado, sem erros ou avisos de lint.
- `npm run test:discovery`: **9/9**, cobrindo tipos/categorias/busca, Haversine, períodos, status, região visível, cidades/coordenadas, privacidade dos relatos e favoritos/Agenda sem data.
- Regressão: eventos **8/8**, sessões P.I.T. **8/8**, cadastro **11/11**, conexão **4/4**, Python **27/27**. Total **67 testes aprovados**.
- `npx expo export --platform ios --output-dir /tmp/citywatch-map-ios`: exportação concluída.
- Simulador iPhone 18 Pro, iOS 27.2, versão nativa existente com Metro: filtros, mapa, detalhes, pesquisa, localização, favoritos/Agenda e navegação verificados. Esta etapa não exigiu recompilar dependências nativas nem acrescentou pacotes.
- Inspeção visual em claro e escuro; aparência clara restaurada. Capturas em `/tmp/citywatch-map-proof/`.

No teste manual, Pets reduziu o mapa a um evento, o marcador abriu o resumo da Feira de Adoção e os detalhes. Um favorito temporário apareceu na Agenda e foi removido no fim do teste, preservando os favoritos anteriores. A busca por Ibirapuera encontrou o destino local; GPS centralizou a câmera. Confirmados produziu lista vazia, sem fingir verificação. Promoções isoladas exibiram a identificação PUBLICIDADE e a página sem oferta real. A lista visível mudou ao reenquadrar a câmera.

O lint detectou uma chamada direta de `Date.now` durante renderização; ela foi substituída pelo hook de relógio antes da aprovação final. O Node emite apenas o aviso preexistente de inferência de ES modules nos testes; a exportação emite aviso de variáveis de cor do terminal. Nenhum erro bloqueante permaneceu.

## Pendências

- Fontes reais de notícias, alertas, parceiros, serviços, ofertas e recompensas; a infraestrutura atual permanece explicitamente demonstrativa.
- Calendário completo de feriados e datas especiais, outras cidades e atualização para anos futuros. Para anos sem base, nenhum feriado é inventado.
- Busca externa de endereços e rotas não foram acrescentadas; preservada a pesquisa local existente.
- Exibição pública de relatos cidadãos depende de contrato de coordenadas públicas aproximadas, com consentimento e regras de privacidade. As coordenadas privadas atuais não são reutilizadas.
- Testar GPS/permissões em iPhone físico, Android, outros tamanhos de dispositivo e acessibilidade ampliada. O simulador confirma a integração técnica, sem certificar precisão de campo.
