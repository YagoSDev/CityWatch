# CityWatch — histórico de versões

Os marcos V1 e V2 organizam a evolução do protótipo. Não são versões de loja ou tags SemVer; o pacote Expo permanece em `0.1.0`. Registros técnicos anteriores são preservados com suas datas e limitações.

## V2 — 19/11/2026 — Cidade contextual e P.I.T. interativo

### Cidade e conteúdo

- Cidade do conteúdo derivada da localização autorizada; perfil como alternativa. A residência cadastrada permanece independente.
- Normalização de município/UF, cache de consultas e proteção contra respostas atrasadas.
- Cosmópolis com fotografia histórica de origem e licença registradas. Sem foto conhecida, usar fallback sem atribuir uma paisagem falsa à cidade.
- Exemplos locais com identificadores próprios e rótulo de simulação; eventos originais não são transferidos para outra cidade.
- Ilustrações distintas para livros, plantio, arte, doações, bem-estar, comércio e outras atividades. Perfil com imagem ilustrativa e prioridade da foto salva pelo usuário.

### Mascote e atividades

- Introdução branco/preto → rosa/branco com aparição do P.I.T.; opção de ignorar e respeito a movimento reduzido.
- Ícone e marca do mascote, cartões nas telas e painel lateral contextual.
- Contagem regressiva e tempo decorrido, mensagens por atividade e contadores locais diários, com desfazer.
- Cafés no trabalho; hidratação na corrida; descobertas no passeio; blocos de foco nos estudos; pequenas conquistas em outras atividades.
- Passos opcionais para corrida/passeio desde a ativação da sessão, sem inventar medições quando o sensor não está disponível. Recuperação de intervalo no iOS depende de autorização; Android usa acompanhamento em primeiro plano.
- Fim de sessão sinalizado discretamente. Sem monitoramento de saída de casa ou GPS em segundo plano.

### Validação e limites

- 38 testes Python e 74 TypeScript aprovados; typecheck e lint aprovados.
- Navegação, mudança de cidade com GPS simulado e favoritos na Agenda conferidos no simulador iOS.
- O autor relatou funcionamento de passos no iPhone; isso não certifica todos os aparelhos. Arraste do painel lateral e demais recursos físicos continuam precisando de conferência manual.
- Seis GIFs específicos não foram gerados; PNG estático é o fallback atual. Nenhuma recompensa financeira é produzida pelos contadores.

Detalhes e evidências: [cidade e imagens](cidade-e-imagens.md), [P.I.T. na interface](pit-presenca.md), [atividades](pit-atividades.md), [validação](validacao_entrega.md).

## V1 — Até 18/11/2026 — Base acadêmica e experiência comunitária

- Núcleo Python com menu textual local, CSVs, persistência JSON opcional e API FastAPI com SQLite.
- Lista, FIFO, LIFO, dicionário por ID, hierarquia bairro/categoria e matriz categoria/status usados nas operações.
- Cadastro, busca, filtros, atualização, histórico, indicadores, mensagens de erro e isolamento do CSV inconsistente.
- 12 registros válidos, um inconsistente e 10 eventos históricos; fórmulas e interpretação documentadas.
- App Expo/React Native com identidade rosa, tema automático, mapa, filtros, cadastro cidadão e perfil.
- Comunidade com eventos simulados, detalhes, favoritos, compartilhamento e Agenda; integração nativa de calendário conforme disponibilidade.
- Integração Supabase opcional, sem dependência do serviço para o núcleo acadêmico.
- Preparação revisada da entrega e 94 testes aprovados naquela etapa (38 Python + 56 TypeScript).

## Próximos marcos — ainda sem versão ou prazo

- Widgets e distribuição de avisos em tempo real, respeitando permissões e limites das plataformas.
- Moderação, confirmação de relatos, votação e respostas municipais autenticadas, mediante integrações efetivas.
- Validação comercial de parceiros e patrocínios claramente identificados; cupons e recompensas reais dependem dessa estrutura.
- Rotas em situações de desastre com fontes oficiais verificadas, sem garantia de trajeto seguro.
- Animações fiéis do P.I.T., testes físicos ampliados e distribuição assinada do aplicativo.

A edição local do vídeo V3.1 está concluída. O vídeo está disponível no YouTube. A visibilidade do vídeo foi confirmada pelo autor e o GitHub foi aberto para avaliação. O envio à FIAP fica a cargo do autor. [CityWatch no YouTube](https://www.youtube.com/watch?v=shDn8X4PDFI).
