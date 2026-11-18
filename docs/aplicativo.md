# Aplicativo CityWatch — documentação preservada

Este documento conserva o desenvolvimento mobile. A entrada acadêmica principal está no [README da entrega](../README.md). Algumas seções são registros históricos; os guias específicos mais recentes descrevem o comportamento atual.

# CityWatch

MVP mobile de participação comunitária da Global Solution da FIAP. A tela inicial usa a cidade escolhida no perfil e apresenta exemplos fictícios de clima, eventos e ocorrências. O tema claro ou escuro acompanha a aparência do dispositivo.

O núcleo acadêmico é o módulo Python em `backend/`, com menu textual, dados CSV e uma API FastAPI. Para demonstrar os requisitos da FIAP, inicie o menu com `python3 -m backend.main` ou rode a API e abra **Relatar → Abrir ocorrências acadêmicas** no app. [Instruções do núcleo Python](../backend/README.md).

## Executar no simulador iOS

Use Node.js 24 LTS, npm e Xcode com um runtime de iOS instalado. O projeto usa Expo SDK 58, React Native 0.88, TypeScript e Expo Router.

1. Confira o Xcode ativo e os runtimes disponíveis.

   ```sh
   xcode-select -p
   xcodebuild -checkFirstLaunchStatus
   xcrun simctl list runtimes
   xcrun simctl list devices available
   ```

   Se o Xcode solicitar a licença, execute `sudo xcodebuild -license` no Terminal, revise os termos e aceite se concordar. Se a configuração inicial estiver pendente, abra o Xcode e conclua as telas de instalação. Para instalar um runtime de iOS, use **Xcode → Settings → Components**.

2. Na pasta do projeto, instale as dependências e inicie o app.

   ```sh
   npm ci
   npm run ios
   ```

3. Abra o Expo Go se o simulador pedir confirmação. Em Xcode 27, o simulador é exibido no Device Hub. Sem sessão de atividade salva, a abertura oferece o planejamento com P.I.T. sobre a Home desfocada. Use **Ignorar por agora** para entrar diretamente. Role a tela para ver os registros de demonstração. Para abrir sem o botão flutuante de desenvolvimento do Expo Go, execute `EXPO_NO_DEV_MENU=1 npm run ios`. [Opções da CLI do Expo](https://docs.expo.dev/more/expo-cli/).

## Roteiro para a demonstração

1. Na abertura do P.I.T., escolha uma das seis atividades e informe a duração entre 1 e 480 minutos. Use **Iniciar sessão** para fechar a sobreposição e voltar ao Início.
2. Abra **Gerenciar** para prolongar por 15 minutos, trocar atividade ou finalizar. O fim do prazo mostra primeiro um aviso dentro do aplicativo. O app verifica o horário ao retornar do segundo plano.
3. Ignore a abertura para explorar a Home com fotografia, atalhos e carrossel **Alertas da cidade**. O próximo alerta aparece parcialmente.
4. Abra um alerta para consultar os dados e o histórico da API Python. São registros acadêmicos simulados, sem verificação independente e sem horário da ocorrência informado.
5. Toque em **Comunidade** na barra inferior para rolar ao carrossel **Acontece em [cidade]**. Cada página apresenta um evento simulado em um cartão 9:16. Use as bolinhas ou deslize horizontalmente para trocar.
6. **Início** retorna ao topo e **Relatar** abre diretamente o cadastro acadêmico.
7. A busca e o GPS estão na seção **Perto de você** e no mapa completo. Os relatos da conta Supabase continuam acessíveis no perfil.

O mapa e os alertas consultam a API Python. As posições dos registros acadêmicos são fictícias e estáveis por identificador. A localização do usuário no minimapa é arredondada para duas casas decimais, consultada somente pela ação **Minha localização** no mapa completo.

## Testar o mapa e a localização

- Na tela **Início**, toque em **Abrir mapa completo** na seção **Perto de você** para abrir o mapa completo. Toque em **Para onde você quer ir?** para buscar pontos do catálogo local, como **MASP** em São Paulo e **Pão de Açúcar** no Rio de Janeiro. Para outras cidades, São Paulo continua disponível como mapa de referência. Selecione o resultado para centralizar o mapa nele.
- Com o simulador ligado, defina uma coordenada de teste. Depois toque em **Minha localização** na tela **Mapa** e escolha **Permitir Uma Vez** para verificar o marcador.

  ```sh
  xcrun simctl location booted set -23.5620,-46.6580
  ```

- Para testar a recusa, escolha **Não Permitir** no aviso do iOS. A tela mostra como recuperar o acesso. Para repetir o cenário no Expo Go, execute `xcrun simctl privacy booted reset location host.exp.Exponent`.
- Para encerrar a simulação de localização, execute `xcrun simctl location booted clear`.

O app solicita a localização em primeiro plano apenas ao tocar em **Minha localização** e mantém a coordenada consultada em memória durante a execução. No simulador, o aviso de permissão pertence ao Expo Go. Uma build própria usa a mensagem em português configurada pelo CityWatch.

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
