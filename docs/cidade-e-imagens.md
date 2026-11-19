# Cidade atual, imagens por tema e avatar

Atualização local em 19/11/2026. Não foi publicada no GitHub, que permanece privado. O backend Python e os CSVs acadêmicos foram preservados.

## Cidade utilizada na descoberta

Home, Comunidade, mapa e Agenda passam a compartilhar `useCurrentCity`:

1. Com localização já autorizada e município reconhecido pelo geocodificador, utilizam a cidade detectada.
2. Sem autorização, sem posição válida ou com falha de geocodificação, utilizam a cidade salva no perfil e indicam a origem.
3. Não alteram silenciosamente a residência salva no perfil.

A identificação usa município e UF retornados pela geocodificação reversa do aparelho. Não publica coordenadas do usuário nem usa endereço residencial nos eventos. O cache fica apenas em memória, com áreas aproximadas, validade de 30 minutos, deduplicação de consultas concorrentes e tentativa posterior após falhas. A leitura de GPS continua limitada ao primeiro plano nas telas já previstas; nenhuma tarefa de fundo foi adicionada.

Ao mudar de município, o mapa reinicia no enquadramento correspondente, sem reaproveitar a câmera de São Paulo. Para Cosmópolis, existe referência municipal aproximada do IBGE. Para outra cidade reconhecida pelo GPS, o mapa utiliza o ponto autorizado como referência. Sem referência disponível, mostra visão ampla do Brasil, sem atribuir São Paulo a outra cidade.

## Catálogo demonstrativo local

Cidades sem catálogo próprio recebem novos exemplos simulados a partir dos temas de demonstração. Os novos registros têm IDs por município/UF, locais genéricos explicitamente fictícios e descrição informando que não há evento/organizador/endereço confirmado. São removidos endereço, coordenadas, verificação de local e links de São Paulo.

Eventos existentes não são movidos ou renomeados como se acontecessem em outra cidade. Favoritos mantêm os IDs de municípios diferentes no armazenamento, mesmo quando o catálogo corrente muda. A Agenda utiliza a mesma cidade; não reaplica feriados municipais de São Paulo a Cosmópolis. A cobertura de feriados locais pode ser incompleta.

## Fotografias e avatar

- 14 imagens novas por tema em `assets/events/`, geradas pela ferramenta integrada de imagens. Prompts em `assets/events/novas-imagens-prompts.json`; documentação em `assets/events/README.md`.
- Os 11 eventos do catálogo principal usam imagens distintas. Eventos nos destaques não se repetem na lista inferior da Comunidade. Um mesmo evento mantém sua imagem nos detalhes e na Agenda.
- As ilustrações do mapa agora variam entre clima, manutenção urbana, café, feira, saúde, participação e as quatro categorias acadêmicas. São identificadas como ilustrativas/IA, sem afirmar que documentam fatos locais.
- Cosmópolis tem fotografia real do centro, cedida ao domínio público pelo autor Carlosar. É uma imagem de arquivo de 2007; ano e crédito aparecem no cabeçalho. Fonte e licença: `assets/cities/README.md`.
- Outras cidades sem foto própria usam o fundo gráfico de fallback; não recebem a foto da Ponte Estaiada ou do Pão de Açúcar.
- A imagem enviada pelo usuário foi copiada para `assets/profile/demo-avatar.png`. É usada como avatar ilustrativo quando não há uma foto personalizada salva. Uma foto escolhida pelo usuário continua tendo prioridade; a imagem não representa verificação de identidade.

## Verificação executada

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `node --experimental-strip-types --test tests/*.test.ts`: **74 aprovados**, incluindo oito novos testes de município, cache, fallback, eventos locais, favoritos, imagens distintas e feriados.
- `.venv/bin/python -m unittest discover -s backend/tests`: **38 aprovados**. Total: **112 testes**.
- iPhone 18 Pro / iOS 27.2: localização simulada do dispositivo alterada para referência municipal de Cosmópolis; geocodificação real do sistema atualizou a Home e a Comunidade automaticamente. Avatar e fotografias conferidos visualmente.
- Favoritado um evento local, conferida sua presença na Agenda em Próximos, retornado à Comunidade e desfeito o favorito de teste.
- A sessão antiga de corrida usada nos testes anteriores foi finalizada no simulador. O iPhone 17 não teve sua sessão alterada nesta etapa.
- Home deixada aberta em Cosmópolis no simulador para revisão; a localização ali é uma simulação de desenvolvimento, não prova da localização física de uma pessoa.
- Evidências: `docs/evidencias/cosmopolis-home.png` e `cosmopolis-eventos.png`.

O autor informou que os passos já funcionam no iPhone físico. Esta etapa validou cidade e imagens no simulador; a identificação automática no aparelho físico depende da permissão e da resposta do geocodificador local. Falhas de rede/serviço mantêm o fallback documentado.

## Principais arquivos

`src/features/municipality.ts`, `current-city.ts`, `foreground-location.tsx`, `city.ts`, `events.tsx`, `events-model.ts`, `events-data.ts`, `event-images.ts`, `discovery.tsx`, `discovery-data.ts`, `discovery-model.ts`, `agenda.ts`; Home, Comunidade, carrossel, mapa, Agenda, cartões/detalhes de eventos e avatar; `tests/municipality.test.ts`; assets e créditos mencionados acima.
