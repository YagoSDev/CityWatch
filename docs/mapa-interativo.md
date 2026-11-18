# Etapa 1 — Mapa completo e interativo

Implementado e validado separadamente da Agenda em 18/11/2026. O backend Python não foi alterado. Os registros sem GPS continuam válidos na base acadêmica.

## Entrega

- Home com prévia de **220 pontos lógicos**, retangular e adaptada à largura disponível, mantendo fotografia e avatar.
- Tocar na prévia ou em seu marcador abre `/mapa`. A prévia evita gestos de mapa que prendam a rolagem da Home.
- Tela completa: mapa ocupa o espaço da tela, busca e controles flutuantes no topo, legenda e painel inferior para seleção/lista. Safe Area e Voltar preservados.
- Câmeras guardadas por cidade na sessão. Ao reabrir o mapa completo, a posição salva é reaproveitada.
- Atualizações de GPS só com permissão existente e com Home/mapa em primeiro plano. Entrar na tela verifica a autorização sem pedir permissão; o pedido continua contextual em Minha localização. A observação é removida ao sair dessas telas ou ao colocar o app em segundo plano.
- Uma interação manual pausa o seguimento da câmera. “Voltar à minha localização” retoma. Não há histórico de trajetos nem envio da posição ao backend.
- Sem GPS/permissão, a interface continua utilizável pela cidade de referência e informa o estado alternativo. Para cidades sem base, a referência visual São Paulo é identificada.
- Agrupamento próprio por células da câmera reduz a sobreposição. Tocar no grupo reenquadra seus pontos e abre a lista; publicidade nunca é agrupada junto com riscos/alertas. Não há mais o truncamento anterior em 40 itens.
- O cartão inferior contém descrição, categoria, título, ilustração, local, data/hora disponível, fonte, verificação e navegação aos detalhes. Datas acadêmicas sem horário são apresentadas como “horário não informado”, não como meia-noite real.
- Painel de filtros inferior expansível, Aplicar, Cancelar, Limpar e Restaurar padrão. Preferências mantidas na sessão.
- Tipos existentes preservados; categorias agora incluem Iluminação, Acessibilidade, Limpeza e Conservação separadamente, além de Trânsito, Segurança, Clima, Cultura, Esportes, Solidariedade, Animais, Educação, Saúde e Comércio.
- Acrescentados Próximos eventos e verificação Oficial/Confirmado/Relato não verificado/Simulado. Sem fonte oficial disponível, o filtro Oficial fica vazio; não há promoção artificial da confiabilidade de um exemplo.
- Destinos: busca local **demonstrativa identificada**, limitada aos pontos já cadastrados. Nenhuma API de lugares está configurada e nenhum endereço é inventado. Não há promessa de rota segura ou navegação curva a curva.

## Fontes e privacidade

`DiscoveryItem` é o modelo normalizado de apresentação: fonte/verificação foram acrescentadas sem mudar o modelo acadêmico Python. Os dados são os mesmos da implementação anterior: ocorrências acadêmicas, catálogo demonstrativo da Comunidade e sete exemplos de conteúdos urbanos/comerciais. Posições fictícias continuam identificadas. A API pública dos relatos cidadãos omite GPS privado; esses relatos não recebem coordenadas inventadas.

O filtro Confirmados antigo também permanece disponível para compatibilidade; a nova seleção Verificação oferece o controle explícito solicitado. A origem Simulado prevalece sobre qualquer flag de confirmação incorreta. Publicidade mantém identificação textual e formato quadrado, além da cor e ícone.

Bibliotecas reaproveitadas: `react-native-maps 1.29.11`, `expo-location ~58.0.22`, Expo Router, Expo Symbols e Safe Area. **Nenhuma dependência nova.** Atualização em primeiro plano segue a [API oficial do Expo Location](https://docs.expo.dev/versions/latest/sdk/location/).

## Arquivos alterados/criados

- `src/app/mapa.tsx`: tela inteira, substituindo o contêiner rolável anterior.
- `src/components/discovery-map.tsx`: prévia, tela completa, painel, câmera, busca e lista.
- `src/components/city-map.tsx`: agrupamento, gestos, câmera inicial e marcadores.
- `src/components/discovery-filters.tsx`: painel inferior expansível e novas opções.
- `src/components/discovery-card.tsx`: descrição, fonte, verificação e horário ausente.
- `src/features/discovery-model.ts`: categorias, verificação, período futuro, agrupamento e metadados.
- `src/features/discovery-data.ts`: fontes dos exemplos e nomes das categorias atualizados.
- `src/features/discovery.tsx`: câmeras por cidade e filtros compartilhados.
- `src/features/foreground-location.tsx`, `src/features/foreground-watch.ts`: ciclo de observação em primeiro plano, autorização existente e descarte de callbacks tardios.
- `tests/map-interactive.test.ts`, `package.json`: sete testes e comando `npm run test:map`.
- `README.md` e este guia.

## Testes e resultados

- TypeScript e lint aprovados após corrigir referências usadas em helpers de renderização e chaves dos controles de listas.
- `npm run test:map`: **7/7**. Agrupamento sem perda de itens, publicidade isolada, verificação, categorias acadêmicas, permissão negada, GPS desligado, observação removida ao sair e início assíncrono cancelado.
- Em conjunto com `test:discovery`: **16/16** testes de mapa/integração/Agenda básica.
- Simulador iPhone 18 Pro, iOS 27.2, versão nativa existente: abertura, filtros, agrupamentos visíveis, seleção, painel e navegação para a ocorrência OC-002 confirmados; retorno à Home confirmado. GPS já autorizado forneceu posição ao mapa. A negativa de permissão e GPS desativado foram testados com adaptadores automatizados, não repetidos manualmente nas configurações nativas.
- Exportação iOS final compartilhada com a segunda etapa: `/tmp/citywatch-interactive-ios`.
- Captura: `/tmp/citywatch-interactive-proof/mapa.png`.

## Pendências e limites

- API externa de lugares/endereço e fontes reais de conteúdos oficiais/comerciais.
- Precisão de campo, permissões e pausa por gesto em iPhone físico; Android e outros tamanhos não certificados nesta etapa. Ciclo de parada em segundo plano validado por testes do controlador, não por instrumentação nativa de consumo de GPS.
- O agrupamento é uma redução por grade da câmera, não um índice geográfico para milhares de pontos; ampliar a fonte requer avaliar paginação espacial/desempenho.
- Nenhuma ocorrência real usa posição fictícia. Relatos privados continuam fora da plotagem até existir contrato de coordenadas públicas autorizado.
