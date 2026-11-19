# CityWatch — visão do produto

Visão organizada a partir da explicação de Yago Souza Araujo em 19/11/2026. Este documento descreve a proposta e distingue sua evolução do protótipo acadêmico. Não representa comprovação de resultados, parceria com prefeituras ou disponibilidade de todos os recursos.

Histórico de implementação: [V1 e V2](versoes.md).

## Proposta

O CityWatch nasce para aproximar as pessoas do que acontece em sua cidade. A proposta é reduzir o intervalo entre um acontecimento e o conhecimento da comunidade, permitindo que os próprios moradores compartilhem informações sobre situações que encontram em seu cotidiano. A informação comunitária complementa o trabalho de veículos de comunicação e órgãos públicos; não há medição que comprove maior velocidade do CityWatch em relação a esses serviços.

Imagine uma árvore caída em uma rua: uma pessoa que passa pelo local pode registrar o problema com uma descrição, localização e, se for seguro, uma fotografia. O objetivo é permitir que outras pessoas consultem a ocorrência no mapa e se preparem para a situação. O relato deve mostrar seu estágio de verificação e acompanhamento. Um registro comunitário não é automaticamente uma informação confirmada.

A visão futura inclui avisos oportunos e widgets com informações próximas ao usuário. Widgets, notificações na tela bloqueada e distribuição em tempo real ainda precisam ser desenvolvidos e avaliados nas plataformas; a atualização depende de permissões, conectividade e limites do sistema operacional. Não fazem parte da entrega operacional atual.

## Comunidade e participação

A proposta reúne informação urbana e participação comunitária:

- Ocorrências e alertas consultáveis no mapa, com filtros, localização e detalhes.
- Agenda, favoritos e eventos comunitários, culturais, esportivos, sociais e de adoção de animais.
- Perfil, contribuições, pontuação, níveis, conquistas e ranking local.
- Recompensas, cupons e promoções de parceiros.
- Atividades acompanhadas pelo mascote P.I.T., como correr, passear, estudar ou trabalhar.
- Evolução para desafios e eventos de atividade física, sem confundir o temporizador atual com medição de treino ou monitoramento de saúde.
- Acompanhamento de demandas urbanas com histórico e indicadores.

A pontuação deve valorizar contribuições úteis e verificadas. Quantidade de postagens e popularidade não devem, sozinhas, decidir a confiabilidade de um relato ou incentivar exposição a riscos.

## Evolução futura: rotas de segurança em desastres

A visão inclui apoiar deslocamentos em situações de enchentes, deslizamentos, quedas de árvores e bloqueios de vias. A proposta é apresentar áreas de risco, interdições, pontos de apoio e rotas alternativas, usando informações atualizadas e verificadas, preferencialmente de fontes oficiais, como a Defesa Civil.

Relatos comunitários podem complementar a identificação de problemas, mas não bastam para declarar um trajeto seguro. A interface deverá indicar a origem e o horário da informação, possíveis desatualizações e a prioridade das orientações oficiais. Sem dados suficientes, não recomendar uma rota como segura. Este recurso é uma ideia futura: o mapa atual não oferece roteamento de emergência nem garante segurança de trajetos.

## Proposta de valor e modelo de negócio

O CityWatch é pensado como um empreendimento que conecta três públicos:

- **Cidadãos:** acesso gratuito a informação comunitária, acompanhamento de ocorrências, agenda e oportunidades locais.
- **Estabelecimentos e organizadores:** divulgação para pessoas da região, descoberta de eventos e campanhas, cupons e aproximação com a comunidade.
- **Gestão pública, mediante parceria:** canal de acompanhamento e resposta a demandas, com histórico e evidências, sem promessa de integração já existente.

A proposta comercial é gerar valor para o comércio local enquanto sustenta o serviço oferecido aos moradores. As hipóteses iniciais de receita são planos de divulgação para parceiros, espaços patrocinados identificados e campanhas ou eventos patrocinados. Promoções e cupons podem compor essas ofertas. Esses formatos são possibilidades a validar, não serviços comerciais já contratados. Preços, adesão, faturamento e lucro não foram definidos nem comprovados.

Antes de publicar como produto, será necessário validar se os parceiros têm interesse e se a receita consegue cobrir infraestrutura, mapas e serviços utilizados, notificações, manutenção, suporte e moderação. O crescimento da comunidade, o interesse dos parceiros e o uso de cupons podem ajudar a avaliar o modelo, sem afirmar resultados ainda não medidos.

O critério é manter o acesso essencial gratuito e separar publicidade de informação comunitária: patrocínio não compra confirmação de um relato, prioridade de atendimento público nem destaque em uma orientação de segurança. O plano descrito não depende de vender dados pessoais dos moradores.

As parcerias também podem apoiar corridas solidárias, arrecadações, campanhas e feiras de adoção. Ações beneficentes devem ter finalidade e beneficiários claros; o apoio comercial não deve ser confundido com o destino das doações.

## Transparência no acompanhamento urbano

Moradores poderiam registrar problemas em equipamentos e espaços públicos, como um bebedouro danificado ou água com aspecto incomum. A descrição relata uma observação e não afirma uma causa ou diagnóstico sem verificação.

A evolução desejada permite que a comunidade sinalize que também foi afetada e acompanhe respostas públicas. Com parceria institucional, autenticação e canais oficiais, equipes municipais poderiam atualizar o andamento e anexar evidências de reparo. O histórico preservaria o relato inicial, a resposta e a resolução comunicada, permitindo acompanhamento e contestação.

O benefício pretendido é melhorar a prestação de contas e a confiança por meio de evidências, independentemente de gestão ou partido. A apresentação deve chamar isso de participação e transparência pública. Transformar um relato em solicitação oficial exige integração e confirmação de recebimento: sem protocolo, o CityWatch não deve afirmar que a prefeitura foi notificada.

## Situação do protótipo

| Parte | Situação que pode ser apresentada |
| --- | --- |
| Núcleo Python com CSVs, operações, seis estruturas, validações, histórico e indicadores | Implementado e testado; base acadêmica simulada |
| Interface Expo/React Native e API FastAPI | Código implementado; demonstrar a integração com o servidor e dispositivo conferidos na gravação |
| Mapa, filtros, agenda, favoritos e detalhes comunitários | Interfaces e comportamentos implementados; conteúdo de demonstração identificado |
| Ranking, medalhas, cupons e respostas institucionais | Não apresentar como operação comercial ou institucional real; há áreas demonstrativas e integrações parciais |
| Pontos ligados à conta | Existe cálculo por relatos na integração Supabase; depende da conta e conexão, e não constitui ranking validado de qualidade |
| P.I.T. e atividade | V2 com introdução, painel, sessões, temporizador, contadores e passos opcionais conforme dispositivo/permissão; fallback PNG, seis GIFs específicos ainda não disponíveis |
| Rotas de segurança em desastres, fitness completo, votação pública, encaminhamento automático, widgets e avisos distribuídos em tempo real | Evoluções propostas; não afirmar que estão operacionais |

O núcleo acadêmico permanece independente de internet, Supabase e aplicativo. A visão maior contextualiza a Global Solution, mas não substitui a demonstração dos requisitos Python.
