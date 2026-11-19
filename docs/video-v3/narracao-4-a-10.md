# CityWatch — nova narração dos blocos 4 a 10

Grave sete arquivos separados, nomeados `04.m4a` até `10.m4a`. Leia apenas o texto de cada bloco, sem ler os títulos. Deixe dois segundos de silêncio antes e depois. Se errar, repita a frase inteira ou grave outra tomada do bloco. Não tente correr para caber no tempo: a montagem será ajustada à fala.

A abertura animada real do aplicativo entra no início do vídeo completo, antes da apresentação em câmera. Nos blocos abaixo, cada ação deve ser mostrada do começo ao resultado. A captura está sendo refeita para essa ordem; a publicação só deve entrar no corte final após confirmação real do backend.

## 4 — Abrindo e explorando o aplicativo

Ao abrir o CityWatch, o P.I.T. dá as boas-vindas e chegamos à tela inicial. No mapa, posso consultar o que está perto de mim. Agora abro os filtros, seleciono ocorrências e toco em um marcador para ver seus detalhes. Os relatos usados nesta demonstração são simulados.

## 5 — Registrando um problema

Para registrar um problema, toco em Relatar. Escolho o tipo, descrevo o que encontrei e informo o local. A foto é opcional. Depois de revisar, publico o relato. A confirmação mostra o código gerado e o status inicial, aberta. Isso confirma o registro no servidor do projeto; não significa que a prefeitura foi notificada.

## 6 — Acompanhando com Python

Esse registro é processado pelo Python, conectado ao aplicativo pela API FastAPI. Na área acadêmica, mostro a consulta por identificador e os filtros por categoria e status. Depois acompanho uma ocorrência passando de aberta para em análise e concluída, com as mudanças no histórico. Pelo menu Python, também demonstro que campos vazios, identificadores repetidos e status desconhecidos são rejeitados.

## 7 — Como os dados são organizados

A lista armazena as ocorrências e o dicionário permite encontrá-las pelo identificador. A fila FIFO entrega primeiro a demanda mais antiga ainda não examinada. A pilha LIFO apresenta primeiro a atualização mais recente. Também organizamos os registros por bairro e categoria, e cruzamos categorias e status em uma matriz. No código, IF, ELIF e ELSE tratam as decisões. AND, OR e NOT validam campos, combinam filtros e verificam se a fila está vazia.

## 8 — Entendendo os indicadores

Agora uso a base inicial dos CSVs, sem o cadastro de teste anterior. São doze ocorrências, três por categoria: vinte e cinco por cento para cada uma. Cinco estão abertas e quatro em análise. Portanto, nove estão pendentes, ou setenta e cinco por cento. As três concluídas levaram quatro, seis e seis dias. A soma, dividida por três, resulta em cinco vírgula trinta e três dias. Essa amostra simulada mostra que a maioria ainda precisa de acompanhamento.

## 9 — Por que voltar ao aplicativo

Além de consultar problemas, posso participar da vida da cidade. Na Comunidade, abro um evento, vejo as informações e salvo como favorito. Ele passa a aparecer na Agenda. O P.I.T. também permite escolher uma atividade e acompanhar sua duração. Os eventos e as recompensas apresentados aqui são demonstrativos.

## 10 — Verificação e próximos passos

Os testes verificam cadastro, consultas, filtros, histórico, estruturas e indicadores. A documentação explica a execução local e declara o uso de inteligência artificial. Widgets, avisos distribuídos e respostas oficiais de prefeituras ainda são evoluções propostas. Rotas para desastres dependeriam de fontes verificadas e orientações oficiais. O mapa atual não garante trajetos seguros.
