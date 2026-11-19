# P.I.T. — atividades interativas e identidade

Implementação local de 19/11/2026. Mantidos o backend Python e os requisitos acadêmicos. Repositório privado; não houve publicação nesta etapa.

## Comportamento

O cartão da Home passa a acompanhar a sessão iniciada em **P.I.T. → atividade → duração → Iniciar sessão**. O painel de gerenciamento utiliza o mesmo cartão.

| Atividade | Interação |
| --- | --- |
| Trabalhar | Mensagem de trabalho e contador manual de cafés do dia; texto muda após cada registro |
| Correr | Mensagem de corrida, passos opcionais do sensor e registro manual de copos de água |
| Passear | Mensagem de exploração, passos opcionais e contador manual de descobertas |
| Estudar | Mensagem de concentração e contador manual de blocos de foco concluídos |
| Dirigir | Cartão passivo com tempo e orientação para consultar apenas estacionado; não há contador de toques |
| Outro | Mensagem própria e contador manual de pequenas conquistas |

O cronômetro exibe tempo restante, tempo em atividade e progresso, em segundos. É calculado por timestamps: retornar do segundo plano não reinicia o relógio. A atualização em segundo plano é suspensa; o tempo é recalculado ao voltar. Ao terminar, o relógio para e permanece o aviso discreto existente; não abre uma tela cheia automaticamente.

Os contadores manuais ficam em `citywatch:activity-counters:v1` no AsyncStorage. São compartilhados entre sessões no mesmo aparelho, reiniciam por data local e permitem desfazer um registro, sem valores negativos. Alteração na tela só é confirmada depois da gravação. Erros de leitura/gravação são apresentados; contadores não geram pontos ou recompensas nem medem automaticamente consumo de café, água ou produtividade.

## Passos

- Biblioteca: `expo-sensors`, versão compatível com o SDK instalado, instalada com `npx expo install expo-sensors`.
- Ativação somente pelo botão **Ativar contagem de passos**, durante corrida ou passeio.
- Verifica disponibilidade antes de solicitar permissão. Sem suporte, mostra indisponibilidade e mantém o cronômetro; não inventa passos.
- Contagem desde a ativação na sessão, não total histórico do dia. Desativar e ativar novamente inicia outro recorte.
- Usa o sensor de movimento, sem GPS, áudio ou envio ao backend.
- Observação nativa removida ao sair do primeiro plano, encerrar/trocar a atividade ou desativar. No iOS, uma consulta ao histórico do sensor recupera o intervalo autorizado ao retornar. No Android, a observação cobre o período em primeiro plano.
- A ativação é voluntária por sessão e não é restaurada automaticamente após reiniciar o processo do app.
- Leitura real em caminhada/corrida exige iPhone físico com sensor e permissão. O simulador não comprova passos reais.

Referência primária: https://docs.expo.dev/versions/latest/sdk/pedometer/

## Logo e ícone

Arquivo: `assets/brand/pit-app-icon.png`, 1024 × 1024, opaco RGB. Configurado em `app.json` e no catálogo iOS. `CityLogo` usa a mesma identidade nos cabeçalhos da Home, Comunidade e cadastro. Origem, modo de geração e prompt estão em `assets/brand/README.md`.

Um novo binário iOS é necessário para o módulo nativo e para o ícone; atualizar somente o JavaScript não instala um módulo nativo ausente.

## Arquivos principais

- `src/features/activity-engagement.ts`: cronômetro, mensagens e contadores por dia.
- `src/features/activity-steps.ts`: ciclo de vida e ativação voluntária do sensor.
- `src/features/pedometer-access.ts`: disponibilidade, permissão e validação da leitura.
- `src/features/activity.tsx`: persistência e integração das sessões.
- `src/components/activity-dashboard.tsx`, `activity-timer.tsx`, `pit-card.tsx`, `pit-experience.tsx`: cartões e gerenciamento.
- `src/components/city-logo.tsx`, `city-brand.tsx`, `community-screen.tsx`, `src/app/_layout.tsx`: identidade visual.
- `app.json`, `package.json`, `package-lock.json`, catálogo nativo iOS, Info.plist e arquivos de integração dos Pods: ícone e sensor.
- `tests/activity-engagement.test.ts`: oito novos testes.

## Verificação desta etapa

- TypeScript e lint aprovados na conferência final.
- 66 testes TypeScript aprovados, incluindo cronômetro após segundo plano, virada do dia, restauração, desfazer, limite, dados corrompidos, mensagens, ausência de contador na direção e disponibilidade/permissão de passos.
- Compilação iOS nativa aprovada: zero erros e dois avisos de scripts de compilação.
- 38 testes Python aprovados, totalizando 104 testes nesta etapa.
- Instalado no iPhone 18 Pro simulado. Conferidos início de trabalho, cronômetro em segundos e registro de um café com troca de mensagem.
- Ainda não certifica contagem física de passos, consumo de bateria, HealthKit, distribuição na App Store ou compatibilidade Android em execução.

## Conferência visual complementar concluída

Após o autor fechar o menu Controls, foram conferidos no iPhone 18 Pro simulado: desfazer o café de teste (total voltou a zero e mensagem original reapareceu), trocar de trabalho para corrida, iniciar a nova sessão, atualizar cronômetro em segundos e ativar o botão de passos. O módulo nativo respondeu que o sensor está indisponível no simulador; a interface manteve o traço no total, apresentou a explicação e continuou o cronômetro. Não foram inventados passos nem solicitada permissão de sensor indisponível. Evidência: `docs/evidencias/pit-passos-simulador.png`.

O cartão de corrida foi deixado aberto para revisão. Contagem real de passos e permissão em sensor disponível continuam pendentes de teste físico.
