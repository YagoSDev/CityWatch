# P.I.T. — abertura e presença na navegação

Implementação local em 19/11/2026. O backend Python e suas regras acadêmicas não foram alterados. O repositório continua privado; estas alterações não foram publicadas nesta etapa.

## Experiência

- Abertura conectada ao layout raiz: fundo branco com CityWatch em preto, transição para rosa e texto branco, seguida da entrada do P.I.T. com opacidade, escala e deslocamento.
- A apresentação ocorre por montagem do app, pode ser pulada e pode ser repetida em **aba lateral P.I.T. → Rever apresentação do P.I.T.**
- O companheiro fica fora do Stack, acompanhando a tela durante navegação/rolagem. A implementação permite arrastar verticalmente, encaixar em uma lateral e puxar para o centro para abrir o painel. Também pode ser aberto por toque.
- Painel com orientação contextual, mapa, agenda, relato e acesso às sessões já existentes. A mudança de um modal para o outro espera o encerramento da apresentação nativa do iOS.
- Cartões com o personagem na Home, no cadastro, na Comunidade e no perfil. O cartão da Comunidade fica após a lista de eventos.
- A escolha de atividade não abre mais automaticamente logo depois da introdução; continua disponível pelo companheiro, pelos cartões e pelo atalho existente na Home.
- A aba é ocultada com teclado aberto, durante o diálogo de atividade e nas telas de conta/edição de perfil. Pode ser recolhida para a rota atual.
- Cores do painel/cartões seguem o tema do aparelho. Movimento reduzido evita escala/deslocamento da abertura e o encaixe com mola; a mudança de cor é instantânea.
- Nenhuma permissão de GPS, câmera ou microfone é solicitada pelo companheiro.

## Arquivos

- `src/components/welcome.tsx`: abertura.
- `src/components/pit-companion.tsx`: aba e painel.
- `src/components/pit-card.tsx`: cartões reutilizáveis.
- `src/features/pit-context.ts`: contexto e limites do arraste.
- `src/app/_layout.tsx`: integração e repetição da apresentação.
- `src/app/(tabs)/index.tsx`, `src/components/community-screen.tsx`, `src/app/nova-ocorrencia.tsx`, `src/app/perfil.tsx`: presença nas páginas.
- `src/features/activity.tsx`: abertura da escolha de atividade por ação do usuário.
- `tests/pit-companion.test.ts`: contextos e limites em quatro dimensões de tela.

## Verificação real

- TypeScript e lint aprovados na implementação; a conferência final está no registro da execução desta etapa.
- 58 testes TypeScript aprovados (56 anteriores e dois novos).
- 38 testes Python aprovados, sem alteração do backend.
- App carregado nos simuladores iPhone 18 Pro e iPhone 17, ambos iOS 27.2.
- Conferidos no iPhone 18 Pro: Home, troca para Comunidade, abertura do cadastro, orientação contextual do painel, acesso à escolha de atividades e repetição da introdução.
- A introdução foi capturada em vídeo de teste e os quadros foram inspecionados: `docs/evidencias/pit-abertura-branca.png` e `pit-abertura-rosa.png`.
- Os gestos de arrastar/puxar foram implementados; as tentativas de automação no Device Hub não confirmaram seu deslocamento visual. Confirmar manualmente no iPhone antes de gravar esse gesto no vídeo. Os limites numéricos do arraste passaram nos testes.
- Ainda falta conferir em aparelho físico, VoiceOver, preferência de movimento reduzido ativada e aparência escura em execução. Há tratamento no código, mas não se trata de certificação de acessibilidade.

## Assets e limites

Usado o PNG transparente aprovado em `assets/mascot/static/pit.png`. O movimento desta etapa é a animação da apresentação do personagem, não seis novos GIFs articulados. Os estados existentes preservam o fallback estático; os seis GIFs específicos continuam pendentes. O painel contém orientações e atalhos, não uma conversa com IA nem monitoramento de segurança.
