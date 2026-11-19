# CityWatch — aplicativo React Native/Expo

Guia atualizado na **V2 (19/11/2026)**. Consulte o [histórico V1/V2](versoes.md), a [visão do produto](visao-do-produto.md) e o [núcleo acadêmico independente](../README.md).

A Home reúne cabeçalho da cidade, mapa e Agenda. Início, Relatar e Comunidade permanecem na barra inferior; o avatar abre o perfil. O tema segue o dispositivo. A localização autorizada pode definir o município do conteúdo; sem ela, vale o perfil. Exemplos e imagens ilustrativas são identificados como tais.

## Executar no simulador iOS — V2

Use Node.js 24, npm, Xcode e um runtime iOS. A base atual usa Expo SDK 58 e React Native 0.88.

```sh
npm ci
npx expo start --dev-client --lan
```

Em outro terminal, compile/abra a build nativa:

```sh
npm run ios:native -- --no-bundler
```

Prepare o ambiente Python conforme o README do backend e inicie a API em outro terminal (`.venv/bin/python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000`). O comando Expo acima inicia Metro para a build de desenvolvimento. Veja [a conexão da API](cadastro-ocorrencias.md) e `.env.example` para as variáveis públicas. Não versione credenciais ou endereços privados pessoais. A API pode ser iniciada separadamente seguindo o [README Python](../backend/README.md).

Os recursos nativos de ditado, sensores e calendário precisam de uma build compatível; Expo Go não substitui essa verificação. A versão gerada do projeto Xcode e seus builds ficam fora do pacote publicado e podem ser recriados pelas ferramentas Expo.

O sistema acadêmico funciona à parte, sem npm e sem servidor:

```sh
python3 src/sistema.py
```

## Conferir a V2

1. Veja a abertura branco/preto → rosa/branco com P.I.T. e entre na Home.
2. Abra o mapa, filtros e detalhes; solicite localização somente pela ação correspondente. Com cidade autorizada reconhecida, confira o conteúdo contextual.
3. Consulte Comunidade, favorite um evento e confira a Agenda. O catálogo é simulado.
4. Inicie uma atividade pelo P.I.T.; confira mensagem, temporizador e o contador correspondente. Passos requerem sensor e autorização, com estados claros quando indisponíveis.
5. Abra o avatar e o cadastro cidadão; verifique confirmação do servidor antes de apresentar publicação como concluída.

Guias atuais: [mapa](mapa-interativo.md), [agenda](agenda-calendario.md), [cadastro](cadastro-ocorrencias.md), [cidade e imagens](cidade-e-imagens.md), [P.I.T.](pit-presenca.md) e [atividades](pit-atividades.md).

## Registros técnicos da V1 e integrações

As seções seguintes preservam registros de desenvolvimento. Catálogo, aparência e sessões evoluíram na V2; para o comportamento atual, consulte os guias acima. Permissões e serviços dependem da plataforma e da configuração utilizada.

## Testar em um iPhone físico

Conecte e desbloqueie o iPhone e confira se ele aparece no Device Hub do Xcode. Caso o aparelho solicite, habilite o modo de desenvolvedor. Para compilar e instalar uma build de depuração, use `npx expo run:ios --device`, selecione o iPhone e configure a assinatura do app no Xcode quando solicitada. [Compilação local com Expo](https://docs.expo.dev/guides/local-app-development/) · [Modo de desenvolvedor no iOS](https://docs.expo.dev/guides/ios-developer-mode/).

## Verificações locais

```sh
npm run typecheck
npm run lint
npx expo install --check
npx expo export --platform ios
```

A exportação verifica se o Metro consegue gerar o bundle para iOS. A validação visual é feita separadamente no simulador.

## Conta e relatos no Supabase

1. Abra o projeto Supabase que vai receber o CityWatch. No painel **Connect**, copie a URL e a chave **Publishable** (`sb_publishable_…`).
2. Crie o arquivo local com `cp .env.example .env.local` e preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Variáveis `EXPO_PUBLIC_` são incluídas no app. Use somente a chave publicável.
3. Aplique a [migração de ocorrências](../supabase/migrations/20261116000100_create_reports.sql) no **SQL Editor** do projeto ou pelo fluxo de migrações da CLI. Ela cria a tabela e restringe a leitura e a criação de registros à conta do autor.
4. Em **Authentication**, habilite o provedor de e-mail, mantenha a confirmação por e-mail ativa e configure uma senha mínima de oito caracteres. Configure o envio e uma URL do site apropriada para o destino após a confirmação. [Configuração de autenticação por senha](https://supabase.com/docs/guides/auth/passwords).
5. Reinicie o Metro com `npm run ios`. Em **Início → avatar → Entrar ou criar conta**, crie uma conta de teste, confirme o e-mail e entre. Em **Relatar**, registre uma ocorrência fictícia e confira **Minhas ocorrências**. Entre com outra conta de teste para verificar que a lista só mostra os relatos dela.

**Minhas ocorrências** mostra os 20 registros mais recentes da conta. O formulário usa um local público informado em texto.

Para testar a confirmação com o serviço de e-mail padrão do Supabase, use o endereço de um membro da organização. Para entregar e-mails a outros endereços, configure um servidor SMTP próprio no Supabase. [Envio de e-mail no Supabase Auth](https://supabase.com/docs/guides/auth/auth-smtp).

Se o e-mail de cadastro não chegar, use **Reenviar confirmação** na tela **Conta**. O botão aparece após o cadastro ou ao tentar entrar com um e-mail ainda não confirmado. [Reenvio de e-mail de confirmação](https://supabase.com/docs/reference/javascript/auth-resend).

## Testar Comunidade

- Toque em um card do feed no **Início** ou em **Comunidade → Eventos** para abrir um evento fictício. Use **Salvar evento** e **Ver eventos salvos** para verificar a lista mantida neste aparelho.
- Em **Comunidade → Recompensas**, entre com uma conta de teste para ver os pontos. Cada ocorrência salva na conta vale 10 pontos, incluindo ocorrências anteriores aos 20 registros exibidos na tela Relatar.
- Abra **Comunidade → Painel institucional** para ver totais fictícios por categoria e situação.

## Testar alertas simulados

Abra **Alertas** pelo **Início** ou pela aba **Comunidade**. Toque em **Simular chuva intensa** ou **Simular alagamento** e confira o rótulo **Simulação em andamento** e o setor fictício. Use **Encerrar simulação** para voltar à escolha de cenário. O exercício roda na tela do app, sem envio de notificações e sem depender da conexão com o Supabase.

## Perfil e fotografia

O avatar da tela inicial abre o perfil. Em **Editar perfil**, é possível escolher uma foto da fototeca e atualizar o nome, a cidade, a UF e a biografia. O app guarda essas informações no dispositivo, separando o perfil de demonstração dos perfis de contas conectadas. A seção **Privacidade** abre os ajustes do sistema.

Os pontos e o histórico de relatos de uma conta conectada usam os dados existentes no Supabase. O nível, as medalhas, o ranking e os cupons são demonstrativos. Sem sessão, o app também exibe saldo e histórico fictícios, identificados na tela.

As fotos do cabeçalho fazem parte do app e são selecionadas pela combinação da cidade com a UF. Outras cidades recebem um fundo gráfico com seu nome. O degradê acompanha o tema do dispositivo.

- [Ponte Estaiada – São Paulo](https://commons.wikimedia.org/wiki/File:Ponte_Estaiada_-_S%C3%A3o_Paulo.jpg), de Bruno M., sob [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- [Pão de Açúcar – Rio de Janeiro](https://commons.wikimedia.org/wiki/File:P%C3%A3o_de_A%C3%A7%C3%BAcar_-_2026_Rio_de_Janeiro.jpg), de Zo Queiroz, sob [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

- [Parque Ibirapuera – São Paulo](https://commons.wikimedia.org/wiki/File:Ibirapuera_park.jpg), de Wilfredor, sob [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). O carrossel usa a foto do local para ilustrar um evento simulado.

As verificações atuais estão em [validação da entrega](validacao_entrega.md).

## P.I.T. e sessões de atividade

O P.I.T. aparece em uma sobreposição sobre a Home escurecida e desfocada. O mascote fica fora do layout permanente do Início. O botão discreto **P.I.T.** abre novamente o planejamento. Uma sessão ativa apresenta seu estado e o acesso a **Gerenciar**.

Atividades disponíveis são Trabalhar, Correr, Passear, Estudar, Dirigir e Outro. A duração e a atividade ficam salvas localmente. O término usa o horário absoluto, inclusive após retorno do segundo plano ou reabertura do aplicativo. Finalizar apaga a sessão ativa e apresenta uma conclusão solicitada pelo usuário. O fim automático do prazo apenas mostra um aviso dentro do app.

As sessões não solicitam microfone ou GPS, não monitoram saída de casa e não enviam notificações do sistema. Em Dirigir, a interface orienta configurar antes de começar a direção.

### Assets e limites atuais

Foi produzido um PNG estático com transparência pelo editor de imagem integrado, preservando o P.I.T. fornecido. Ele é usado nos seis estados enquanto os GIFs articulados estão pendentes. Os dois GIFs anteriores foram preservados em assets/mascot/animations/originals/, com seus nomes e fundos originais. Eles não estão ativados no novo fluxo.

A ferramenta de vídeo conectada não disponibiliza modelos no plano atual. Os recortes do pacote não contêm quadros articulados suficientes para as seis ações. Nenhum dos seis GIFs solicitados foi gerado ou apresentado como pronto.

O inventário, os formatos avaliados e o prompt do PNG estão em [assets/mascot/animations/README.md](../assets/mascot/animations/README.md).

### Arquivos desta etapa

- src/app/(tabs)/index.tsx apresenta o novo conteúdo da Home.
- src/app/(tabs)/_layout.tsx e src/app/_layout.tsx mantêm a barra fixa e o estado de sessão compartilhado.
- src/components/occurrence-preview.tsx e src/components/community-carousel.tsx implementam os dois carrosséis.
- src/components/pit-experience.tsx implementa a sobreposição e o aviso discreto.
- src/components/city-watch-mascot.tsx e src/features/pit-assets.ts selecionam estado visual, PNG de fallback e futuras animações.
- src/features/activity.tsx e src/features/activity-session.ts controlam persistência, duração e gerenciamento.
- src/components/community-alerts.tsx usa o estado de atenção em exercícios explicitamente simulados.
- src/app/detalhe-ocorrencia.tsx informa a ausência de verificação e horário na base.
- tests/activity-session.test.ts verifica limites, término, prolongamento e restauração.
- package.json e package-lock.json incluem expo-blur e as atualizações de correção compatíveis do Expo, Expo Router e Expo FileSystem.

Para executar os testes de sessão com Node.js 24, use npm run test:activity.

## Cadastro cidadão de ocorrências

O botão **Relatar** abre o novo formulário com tipos visuais, descrição de até 300 caracteres, evidência opcional, localização revisável e até cinco etiquetas. A publicação usa `POST /relatos` no backend Python, que gera o ID, o status inicial e o horário UTC. Consulta, Fila, Histórico e Indicadores continuam na área **Demonstração acadêmica e administrativa**, acessível no fim do formulário. Os relatos da conta Supabase continuam acessíveis pelo Perfil.

Consulte [o guia do cadastro](cadastro-ocorrencias.md) para mapeamento das quatro categorias acadêmicas, catálogo de etiquetas, privacidade, contrato da API, arquivos alterados e limites dos testes de mídia e voz. O Expo Go usa digitação; o módulo opcional de transcrição exige uma versão nativa. Execute `npm run test:occurrences` para os testes do formulário.


Para desenvolver com iPhone na mesma rede Wi-Fi, use `npm run dev`: ele inicia o Python e o Expo juntos. A API local acompanha o endereço usado para abrir o Expo, evitando falha quando o IP do Mac muda. GPS preenche o local automaticamente e dispensa endereço escrito; o complemento “Como encontrar o problema?” é opcional. No Expo Go, use o ditado do teclado. O projeto nativo com reconhecimento de fala está em `ios/CityWatch.xcworkspace`; compile com `npm run ios:native -- --device`.

## Comunidade e eventos

A aba Comunidade tem tela própria, categorias, pesquisa, filtros de futuros/favoritos, destaques paginados e lista. Os detalhes oferecem programação, favoritos persistentes, compartilhamento nativo e links/mapas cadastrados. A agenda abre um editor nativo para revisão na versão compilada do app; no Expo Go, informa a indisponibilidade.

O catálogo centralizado contém 13 eventos claramente simulados. O backend Python e o cadastro acadêmico foram preservados. Execute `npm run test:events` para os oito testes de eventos. Consulte [a entrega da Comunidade](comunidade-eventos.md) para arquivos alterados, integrações verificadas, testes e pendências, e [as imagens geradas](../assets/events/README.md) para arquivos, modo e prompts finais.

## Home com mapa e Agenda

A Home agora concentra a descoberta em **Perto de você**, seguida da **Agenda**. O mapa resumido e a tela completa compartilham filtros por tipo, categoria, distância, tempo e status. Marcadores oferecem resumo e detalhes; publicidade é identificada e fica fora da seleção padrão. A Agenda acompanha os favoritos da Comunidade e uma seleção de feriados de 2026 com fontes oficiais.

Execute `npm run test:discovery` para os nove testes de mapa e Agenda. Consulte [o guia desta etapa](home-mapa-agenda.md) para os arquivos alterados, semântica dos filtros, dados simulados, verificações no iOS e pendências. O backend Python e as estruturas acadêmicas foram preservados.

## Mapa completo e calendário mensal — etapas separadas

O [mapa interativo](mapa-interativo.md) agora usa prévia de 220 pontos na Home, tela completa com painel inferior, agrupamento de marcadores e GPS apenas em primeiro plano. Categorias acadêmicas e verificação têm filtros próprios. Execute `npm run test:map`.

A [Agenda mensal](agenda-calendario.md) tem tela exclusiva com sete colunas, seleção de dias, filtros e favoritos compartilhados. Na Home aparecem no máximo dois próximos itens. “Salvar na Agenda CityWatch” é separado de favoritar e de adicionar ao calendário do aparelho. Execute `npm run test:agenda`. Os dois guias registram arquivos, bibliotecas, testes reais e pendências; eles atualizam o comportamento descrito na primeira versão de Home/mapa/Agenda.

## Home compacta — organização atual

A [correção final da Home](home-compacta.md) mantém fotografia, um único cartão de mapa, carrossel horizontal “Acontece em [cidade]” e mini calendário mensal. Filtros e listas ficam nas telas completas. Esta organização substitui as prévias anteriores de mapa com controles e Agenda com cartões; as funcionalidades das telas completas continuam disponíveis.
