# Animações P.I.T.

Os seis estados estão implementados em src/features/pit-assets.ts. As seis animações abaixo ainda precisam ser fornecidas. O aplicativo exibe o PNG com transparência em ../static/pit.png quando uma animação está ausente, falha ou o movimento reduzido está ativo.

| Arquivo pendente | Uso |
| --- | --- |
| pit_hello.gif | Abertura |
| pit_running.gif | Atividade Correr |
| pit_working.gif | Atividade Trabalhar |
| pit_walking.gif | Atividade Passear |
| pit_alert.gif | Exercícios de alerta explicitamente simulados |
| pit_celebration.gif | Conclusão da sessão por ação do usuário |

A conclusão da sessão não concede pontos ou medalhas. Os pontos existentes continuam vinculados aos relatos da conta.

A ferramenta Runway conectada foi consultada e não oferece modelos de vídeo no plano atual. Não há FFmpeg, ImageMagick ou Pillow instalados. Mesmo com um codificador GIF, seriam necessários quadros articulados fiéis ao personagem. Os recortes do pacote não contêm essas sequências.

Os arquivos originals/flutuar.gif e originals/piscar_luzes.gif são os GIFs fornecidos anteriormente. Eles têm fundo embutido, não representam as seis ações pedidas e permanecem preservados como originais.

## Ativação e desempenho

Ao receber um GIF completo e fiel, coloque-o nesta pasta e atribua um require estático à propriedade animation do estado correspondente em pit-assets.ts. Exemplo para hello após o arquivo existir.

    animation: require('../../assets/mascot/animations/pit_hello.gif')

Verifique a transparência real, a ausência de fundo quadriculado desenhado e de halos visíveis. Prefira 256 a 384 pixels, 10 a 15 quadros por segundo e loops curtos. A renderização só existe nos momentos de interação, usa PNG quando o app perde o primeiro plano e respeita a preferência de movimento reduzido. A transição visual usa opacidade com driver nativo.

GIF tem suporte no componente Image existente e transparência de paleta. WebP animado pode oferecer melhor compressão e transparência com alpha, mas depende de decodificação compatível, como expo-image, e dos quadros originais. Lottie exige uma composição vetorial ou rig próprio do P.I.T. O PNG raster e os GIFs do pacote não fornecem essa composição. Ambos permanecem opções para quando os assets adequados estiverem disponíveis.

## PNG produzido

../static/pit.png foi criado com a ferramenta image_gen integrada, no modo de edição, a partir de pit-original.png. A presença de alpha foi conferida com sips -g hasAlpha e visualmente no fundo claro do aplicativo. Nenhum GIF articulado foi gerado.

Prompt utilizado integralmente.

> Use case: background-extraction. Edit target: the attached original CityWatch P.I.T. robot image. Create a clean true transparent PNG cutout of exactly this existing robot. Remove only the city background, floor, corner graphic and all unrelated pixels. Preserve the original motorsport helmet, compact white robot body, tracks, reflective black digital face with two pink happy eyes, no mouth, thumbs-up hand pose, lighting, pink details and original character identity. Include all robot edges with comfortable transparent padding. No checkerboard or solid color background, no extra text, no new robot or facial features. This is a static fallback asset for a React Native app, not animation.

As capacidades de imagem e formatos foram conferidas na [documentação do Expo Image](https://docs.expo.dev/versions/latest/sdk/image/), na [referência Image do React Native](https://reactnative.dev/docs/image) e no [projeto Lottie React Native](https://github.com/lottie-react-native/lottie-react-native).
