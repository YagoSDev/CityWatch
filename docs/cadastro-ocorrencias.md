# Cadastro cidadão de ocorrências

O botão **Relatar** abre `/nova-ocorrencia`. O formulário cidadão usa a API Python local, independentemente do Supabase. A tela anterior de relatos da conta continua acessível pelo perfil. Os recursos acadêmicos ficam em `/ocorrencias`, com acesso identificado como **Demonstração acadêmica e administrativa**.

## Interface e comportamento

- Cabeçalho nativo `#E9004B`, título CityWatch explícito e centralizado e botão Voltar branco, respeitando os insets do iPhone. Fundo e campos acompanham o tema do dispositivo.
- Tipos visuais, descrição com contador de até 300 caracteres Unicode, evidência opcional e GPS ou local manual obrigatório. O campo Bairro foi removido; “Como encontrar o problema?” é opcional e não apaga as coordenadas.
- Até cinco etiquetas em seletor expansível com chips removíveis.
- Publicação bloqueada durante operações em andamento. ID e status só aparecem após resposta bem-sucedida da API. Timeout de 45 segundos permite tentar novamente com a mesma chave, mantendo o rascunho.
- Ao publicar, o backend gera o ID, o status `aberta` e `publicado_em` em UTC. O app apresenta o timestamp no fuso local do aparelho. Nenhum campo de data é enviado pelo cidadão.
- O retorno não confirma encaminhamento à prefeitura. Os novos registros aparecem na Home como **Relato cidadão**, sem alegação de verificação. Os CSVs permanecem identificados como simulados. O mapa continua demonstrativo e só posiciona registros simulados; não cria posições fictícias para relatos cidadãos.

## Mapeamento acadêmico

| ID do tipo visível | Rótulo | Categoria acadêmica exata |
| --- | --- | --- |
| `acidente` | Acidente | `acessibilidade` |
| `perigo` | Perigo | `conservação` |
| `danos_urbanos` | Danos urbanos | `conservação` |
| `limpeza` | Limpeza | `limpeza` |
| `alagamento` | Alagamento | `conservação` |
| `outros` | Outros | `conservação` |
| `iluminacao` | Iluminação | `iluminação` |
| `acessibilidade` | Acessibilidade | `acessibilidade` |

Esta é uma classificação curricular para compatibilidade, não uma triagem oficial de emergências. O campo `tipo` é salvo separadamente: acidente e alagamento não são apagados ou convertidos irreversivelmente para o rótulo amplo. Descrição, referência e etiquetas também são preservadas. As quatro categorias e os códigos existentes não foram renomeados.

## Etiquetas padronizadas

Não foi localizada uma biblioteca anterior de palavras-chave nos arquivos ou textos anexados disponíveis. Este catálogo inicial está em `src/features/occurrence-draft.ts` e é validado também em `backend/relatos.py`. Caso exista outra lista previamente acordada, sua equivalência ainda precisa ser conferida.

| Grupo | IDs aceitos |
| --- | --- |
| Trânsito | `transito_acidente`, `transito_obstrucao`, `transito_sinalizacao` |
| Segurança | `seguranca_risco`, `seguranca_area_atencao` |
| Clima | `clima_alagamento`, `clima_chuva` |
| Serviços urbanos | `urbano_iluminacao`, `urbano_lixo`, `urbano_calcada`, `urbano_buraco` |
| Acessibilidade | `acesso_rampa`, `acesso_piso_tatil`, `acesso_passagem` |

O backend rejeita IDs desconhecidos, duplicados e mais de cinco etiquetas, inclusive quando o cliente não respeita o limite.

## Evidências e privacidade

Uma foto de câmera ou um arquivo da galeria (imagem/vídeo), até **8 MiB**, nos formatos JPEG, PNG, HEIC/HEIF, MP4 ou MOV. A câmera captura apenas foto. O seletor solicita permissões ao ser acionado, permite cancelar, substituir e remover o arquivo; o rascunho anterior permanece quando a seleção é cancelada ou inválida. Imagem tem prévia; vídeo usa `expo-video`, com controles e sem reprodução automática.

A API recebe o arquivo como base64 em JSON e verifica MIME, tamanho real decodificado e assinatura do contêiner. Esta validação não equivale a analisar todo o vídeo, moderar conteúdo ou detectar rostos. O aviso no formulário orienta a evitar dados pessoais e imagens fortes e permite publicar sem evidências em situações de risco.

Evidências ficam em BLOBs na tabela SQLite `evidencias`, na mesma transação que o cadastro. Não há rota pública para baixar esses arquivos. Um indicador `possui_anexo` confirma o recebimento no detalhe; sua visualização administrativa posterior ainda não foi implementada. O arquivo pode conter metadados internos e áudio de vídeo; não é publicado por esta API.

GPS é uma leitura única, somente após tocar **Usar localização atual** e obter permissão em primeiro plano. Guarda latitude, longitude, precisão disponível e timestamp da leitura. O usuário vê a leitura e pode descartá-la. O endereço é resolvido automaticamente com o geocodificador do sistema, sem número residencial. Se o serviço não responder em seis segundos, o GPS continua válido para publicar com o rótulo “Localização por GPS”. A referência adicional é opcional e preserva as coordenadas. Corrigir o local manualmente descarta a leitura anterior para evitar associação incorreta. Nenhum monitoramento contínuo ou permissão de localização em segundo plano foi adicionado.

As coordenadas ficam somente nos metadados privados do snapshot SQLite. Não aparecem em `/ocorrencias`, `/bairros`, `/fila`, `/indicadores` ou no modelo público. O app alerta para não publicar endereço residencial na referência textual. Este servidor local acadêmico não oferece autenticação administrativa para acessar evidências ou coordenadas; não deve ser exposto como serviço público de produção sem esse controle.

## Voz

Na versão nativa, o botão usa um módulo nativo **opcional** de `expo-speech-recognition`, configurado para `pt-BR`, resultado final para revisão, sem gravação persistente. No Expo Go, o botão “Usar ditado do teclado” foca a descrição e orienta a usar o microfone do teclado do iPhone; não tenta iniciar o módulo ausente. Serviço local indisponível ou permissão negada mantém a digitação. `expo-speech` não foi usado, pois sintetiza voz em vez de transcrevê-la.

O [projeto da biblioteca](https://github.com/jamsch/expo-speech-recognition) requer uma versão nativa de desenvolvimento; o Expo Go não contém esse módulo. Configurações de microfone e reconhecimento constam em `app.json`; serão aplicadas na próxima compilação nativa. Nenhum áudio de ditado é enviado à API CityWatch.

O patch `patches/expo-speech-recognition+58.0.1.patch`, aplicado por `postinstall`, obriga o iOS a respeitar `requiresOnDeviceRecognition` mesmo quando falta o modelo local do idioma, evitando que a biblioteca omita essa exigência e permita fallback de rede. Se o modelo local não estiver disponível, a transcrição deverá falhar e a digitação continuará disponível. O patch foi compilado na versão nativa para simulador; a confirmação de transcrição e privacidade de áudio em hardware ainda exige teste no iPhone físico. O Expo Go não executa esse código nativo.

Para preparar uma versão nativa de desenvolvimento no Mac com Xcode, após `npm install`, use `npx expo run:ios`. A distribuição dessa versão para iPhone físico depende da configuração de assinatura Apple. Não é necessário compilar para testar cadastro digitado no Expo Go.

## Contrato da API

`POST /relatos` retorna HTTP 201 e o registro público. Campos extras são rejeitados, impedindo que o cliente defina ID, status ou timestamp de publicação.

```json
{
  "chave": "UUID-estavel-por-tentativa-de-publicacao",
  "tipo": "limpeza",
  "descricao": "Resíduos obstruindo a passagem da praça fictícia.",
  "localidade": "Entrada da praça fictícia",
  "bairro": "Bairro Teste",
  "etiquetas": ["urbano_lixo", "acesso_passagem"],
  "localizacao": null,
  "anexo": null
}
```

Opcionalmente, `localizacao` contém `latitude`, `longitude`, `precisao` e `capturada_em` com fuso; `anexo` contém `mime` e `base64`. O backend aceita a mesma chave e payload novamente sem duplicar o registro, incluindo chamadas concorrentes. Reutilização de chave com dados diferentes é rejeitada. A chave dura enquanto esse rascunho está montado no app; não há recuperação persistente de rascunhos após fechar o aplicativo.

## Preservação acadêmica

`backend/dados/ocorrencias.csv` e `historico.csv` não foram alterados. Permanecem os 12 registros válidos, o registro inconsistente para validação e o histórico exigido. Os timestamps fictícios dos CSVs continuam intactos para os indicadores. O endpoint acadêmico `POST /ocorrencias` e o menu textual mantêm ID/data manuais para exercícios.

Cadastros cidadãos são acrescentados à mesma lista funcional e participam de fila FIFO, dicionário por ID, hierarquia bairro/categoria, consultas, filtros e matriz dos indicadores. Atualizações de status continuam gerando a pilha LIFO. Os indicadores calculados sobre uma base que recebeu relatos cidadãos passam a incluir esses registros; o conjunto puro de demonstração continua reproduzível com um banco temporário.

## Verificação e limites reais

Comandos:

```sh
.venv/bin/python -m unittest discover -s backend/tests -v
npm run test:occurrences
npm run test:activity
npm run typecheck
npm run lint
npx expo export --platform ios --output-dir /tmp/citywatch-cadastro-ios
```

Testes novos verificam cadastro cidadão, obrigatoriedade, tamanho, tipos e categorias, UTC, idempotência concorrente, persistência de imagem real e coordenadas, não exposição pública dos metadados, etiquetas, anexos inválidos e limites. Os testes TypeScript usam adaptadores para simular permissões concedidas/negadas, cancelamento de mídia, GPS e eventos de início do ditado. Testes com mocks não comprovam hardware.

No iPhone 18 Pro com iOS 27.2 no simulador foram verificados: entrada pelo botão Relatar, cabeçalho branco sobre rosa, temas claro/escuro, seleção de tipo e etiqueta, digitação, validação obrigatória, fallback de voz no Expo Go, abertura da galeria nativa, publicação sem evidência confirmada pelo Python, detalhes e acesso à área acadêmica.

A publicação de interface utilizou `/tmp/citywatch-cadastro-ui.sqlite3`, isolado do banco existente, e o relato foi explicitamente descrito como **TESTE SIMULADO**. O banco original foi preservado. Capturas de verificação estão em `/tmp/citywatch-cadastro-proof/`.

**Ainda não confirmado de ponta a ponta:** seleção e reprodução de vídeo e seleção/remoção/substituição de foto no seletor nativo, que não expôs controles utilizáveis à automação desta sessão. Upload/persistência de imagem foram verificados pela API; não equivalem à captura física. Câmera, precisão e permissões de GPS real, microfone/transcrição e ausência de tráfego de áudio do módulo compilado precisam ser testados no iPhone físico com uma versão nativa de desenvolvimento. A reprodução de vídeo não foi declarada testada.

## Arquivos desta implementação

- Interface: `src/app/nova-ocorrencia.tsx`, `src/components/evidence-video.tsx`, `src/features/occurrence-draft.ts`, `src/features/occurrence-voice.ts`.
- Integração/navegação: `src/features/academic-api.ts`, `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/index.tsx`, `src/app/(tabs)/relatar.tsx`, `src/app/ocorrencias.tsx`, `src/app/detalhe-ocorrencia.tsx`, `src/components/occurrence-preview.tsx`, `src/components/city-map.tsx`.
- Python: `backend/relatos.py`, `backend/api.py`, `backend/armazenamento.py`, `backend/modelos.py`.
- Configuração e testes: `app.json`, `package.json`, `package-lock.json`, `patches/expo-speech-recognition+58.0.1.patch`, `tests/occurrence-draft.test.ts`, `backend/tests/test_relatos.py`.
- Documentação: este arquivo, `README.md`, `backend/README.md`.

Resultado da primeira implementação: **26 testes Python, 9 testes de formulário e 8 testes de sessão aprovados**. A revisão de GPS e conexão abaixo amplia essa cobertura. TypeScript e lint sem erros. Exportação iOS gerada. O cabeçalho foi conferido também após entrar e voltar da área acadêmica, com título e ícone brancos visíveis.


## Correções de GPS, ditado e conexão

- `captureLocation` valida os números recebidos e mantém a precisão disponível; `Location.Accuracy.High` solicita a melhor leitura que o sistema permitir, respeitando a autorização aproximada do iOS. Não se pede precisão completa temporária nem se cria rastreamento.
- `localidade` agora é opcional em `POST /relatos` quando há GPS válido. O backend também valida esse caso; não depende apenas da validação do app. `referencia` (até 200 caracteres) preserva o complemento opcional no detalhe da ocorrência. A hierarquia acadêmica continua usando o bairro resolvido automaticamente ou o grupo “Localização por GPS”.
- A API local em desenvolvimento acompanha o host usado para abrir o Expo. Um IP antigo de rede privada ou localhost em `.env.local` deixa de prender o iPhone a outro endereço. URLs remotas HTTPS explícitas continuam sendo respeitadas. `src/features/api-connection.ts` diferencia falha de rede, timeout, erro de validação e rota ausente de servidor antigo.
- `npm run dev` inicia/reutiliza o servidor Python na porta 8000 e abre Expo Go em LAN. O Mac deve permanecer ligado e na mesma rede Wi-Fi do iPhone; essa configuração local não hospeda a API na internet. Para usar um backend público posteriormente, configure `EXPO_PUBLIC_CITYWATCH_API_URL` com seu endereço HTTPS.
- O projeto nativo foi gerado em `ios/`, com identificador `com.citywatch.mobile` e `expo-dev-client`. A configuração de `microphonePermission: false` do seletor de imagens estava retirando a descrição de permissão exigida pela voz. Ela foi corrigida; `Info.plist` agora contém `NSMicrophoneUsageDescription` e `NSSpeechRecognitionUsageDescription`.
- `npm run ios:native -- --device` compila o app nativo e permite escolher um simulador ou iPhone conectado. O script inclui o caminho do CocoaPods instalado no usuário e carrega `logger` para compatibilidade com o Ruby deste Mac. Instalação em iPhone físico exige assinatura Apple configurada no Xcode.

Na revisão foram aprovados **27 testes Python, 11 de formulário e 4 de conexão**. O simulador capturou uma posição injetada de teste, informou ±5 m e preencheu o endereço por geocodificação. Uma requisição real pela LAN publicou e consultou um relato com GPS aproximado (±1800 m), sem endereço, bairro ou complemento digitados, usando banco temporário. Isso comprova o transporte e a aceitação do GPS, sem comprovar a precisão de hardware do iPhone físico. O foco e as instruções do ditado pelo teclado foram conferidos; reconhecimento de fala real não foi declarado validado.


A compilação nativa de depuração para o iPhone 18 Pro no simulador foi concluída com **0 erros e 2 avisos**, e o app `com.citywatch.mobile` foi instalado e aberto. O módulo `ExpoSpeechRecognition` foi detectado pelo app. O simulador não ofereceu reconhecimento local disponível; a tentativa retornou o fallback e não foi registrada como transcrição bem-sucedida. O botão agora também verifica a disponibilidade do serviço/modelo, além da presença do módulo, e oferece ditado pelo teclado quando não houver suporte local. A gravação/transcrição real segue dependendo de teste no iPhone físico com a versão nativa assinada.

Após os testes, `npm run dev -- --clear` iniciou com sucesso o backend original e o Expo em LAN. Os 12 registros do banco original foram preservados. Resultado completo das verificações: **27 Python + 11 formulário + 4 conexão + 8 sessões = 50 testes aprovados**, TypeScript e lint sem erros e exportação iOS concluída.

Arquivos adicionais desta revisão: `src/features/api-connection.ts`, `tests/api-connection.test.ts`, `scripts/dev.mjs`, `scripts/ios-native.mjs` e o projeto nativo gerado em `ios/`. As dependências de CocoaPods/artefatos de compilação são ignoradas pelo Git. Nenhum iPhone físico apareceu no inventário de dispositivos do Xcode durante a verificação, por isso a instalação assinada e o teste de voz no aparelho não foram executados.
