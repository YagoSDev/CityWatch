# CityWatch hoje e próximos passos

O CityWatch ajuda moradores a compartilhar o que acontece perto deles. Se uma árvore cair na rua, quem passar pelo local pode registrar o problema com uma descrição, a localização e uma foto, quando for seguro. Quem vem depois pode consultar o relato no mapa e acompanhar seu andamento.

## O que já existe

- **Mapa e relatos:** filtros, detalhes das ocorrências e formulário integrado à API Python. A base acadêmica é simulada.
- **Comunidade e Agenda:** eventos demonstrativos, favoritos e calendário.
- **P.I.T.:** painel de atividades, temporizador e contadores. Os passos dependem do sensor e da permissão do aparelho.
- **Núcleo Python:** cadastro, consultas, triagem, histórico e indicadores. O menu roda com CSVs, sem precisar do aplicativo, de internet ou de conta.

Ranking, medalhas e cupons ainda aparecem como demonstrações. O [histórico de versões](versoes.md) registra o que mudou na implementação.

## O que queremos construir

| Ideia | O que precisa para funcionar |
| --- | --- |
| **Alertas por região e widgets** | Serviço para distribuir avisos, critérios para confirmar relatos, preferências por área e testes de permissões e atualização no iOS e Android. |
| **Votação e confirmação de ocorrências** | Contas, regras para contribuições, prevenção de votos duplicados, moderação e um jeito de corrigir ou contestar informações. |
| **Acompanhamento pela prefeitura** | Acordo com o município, canal oficial com protocolo e contas verificadas para publicar respostas e evidências de reparo. |
| **Mapa em situações de desastre** | Dados atualizados da Defesa Civil e dos órgãos de trânsito sobre riscos, bloqueios e pontos de apoio. As orientações oficiais têm prioridade. Quando faltarem dados, o mapa deve indicar essa limitação. |
| **Cupons e recompensas reais** | Parceiros locais, regras de resgate, controle de validade e critérios de pontuação que valorizem contribuições úteis e verificadas. |
| **Desafios e eventos com o P.I.T.** | Regras para desafios, adesão voluntária, testes de sensores em aparelhos reais e respeito às permissões. As animações do mascote precisam de quadros próprios para cada ação. |

Um primeiro piloto pode começar em uma região pequena. A prioridade é testar se os moradores conseguem encontrar, registrar e confirmar ocorrências úteis. Isso dá uma base para decidir quando vale adicionar notificações, recompensas e integrações com órgãos públicos.

## Como manter o projeto

A proposta é manter o acesso essencial gratuito e testar divulgação identificada para o comércio local, cupons e patrocínio de eventos, como corridas solidárias e feiras de adoção. Antes de oferecer planos, é preciso validar o interesse dos parceiros e estimar os custos de mapas, infraestrutura, suporte e moderação. Os espaços patrocinados devem ficar separados dos avisos de segurança e da triagem de ocorrências.
