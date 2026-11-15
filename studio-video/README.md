# Fênix Video Studio — MVP (módulo isolado)

Editor responsivo de composições de vídeo para a Agência e Família Fênix Warriors. **Não altera o aplicativo em produção nem conecta a credenciais, bancos ou contas de terceiros.**

## Uso simples (sem instalar programas)

1. Escolha um modelo e edite o texto.
2. Escolha a narração: sem áudio, voz automática em português brasileiro (Piper/VITS), gravar a própria voz no microfone ou enviar um arquivo de áudio.
3. Toque em **Gravar vídeo pronto**. O navegador cria a composição usando Canvas + MediaRecorder, mistura a narração via Web Audio e disponibiliza o arquivo para visualização e download.

- O vídeo resultante é **MP4 se o dispositivo disponibilizar codificação MP4 via MediaRecorder**, ou **WEBM** caso contrário; nunca mudar apenas a extensão sem transcodificar.
- Gravação em 720x1280 (vertical), 720x720 (quadrado), ou 1280x720 (horizontal), 24 FPS, duração automática adaptada à narração, máximo ~75 s.
- A voz automática usa o pacote `@diffusionstudio/vits-web@1.0.3` via módulo ESM hospedado em CDN. O modelo Piper PT-BR é baixado pelo navegador na primeira geração, podendo consumir memória/tempo e falhar em alguns celulares.
- Na falha de síntese, o app orienta a gravar ou enviar um áudio; **não finge que uma voz apenas reproduzida foi incluída no vídeo**.
- O áudio do microfone é gravado com consentimento e permanece no navegador.
- O fluxo avançado Hyperframes continua disponível em uma seção recolhida, sem ser necessário para usuários comuns.
- A gravação em tempo real exige que a aba permaneça aberta e visível; não há ainda fila de renderização em nuvem.

## O que já funciona
- Modelos de recrutamento, evento/PK, metas e oferta comercial.
- Campos de edição, prévia animada, formatos 9:16, 1:1, 16:9 e temas marfim/dourado ou preto/vermelho.
- Carregamento local de foto e logomarca (PNG, JPG, WebP; limite 5 MB).
- Exportação de dados JSON e composição HTML compatível com estrutura do Hyperframes.
- Acessibilidade básica e visual móvel. Nenhum arquivo é enviado ao servidor.

## Exportar para MP4 com Hyperframes

Precisa de Node.js >=22 e FFmpeg. No terminal:

```bash
npx hyperframes init fenix-video --non-interactive --example blank
cd fenix-video
# Substitua o index.html deste projeto pelo arquivo gerado no editor.
npx hyperframes lint
npx hyperframes check
npx hyperframes render --output video-fenix.mp4
```

A renderização MP4 no servidor ainda **não está conectada** ao botão do site. A exportação de HTML é um projeto para Hyperframes, não um vídeo já renderizado. Scripts do Hyperframes usam GSAP via CDN em ambiente com acesso à internet.

## Segurança e limitações
- A plataforma está sem autenticação, adequada apenas para prototipação de informações públicas. Não publique fotos/áudios privados nela enquanto não houver controle de acesso.
- Não armazene dados sigilosos em composições ou JSON exportado.
- Use exclusivamente fotos e marcas com autorização dos titulares.
- Imagens inseridas no HTML por data URI ampliam o arquivo final.
- Filtros de segurança BIGO e renderizador escalável ainda precisam de implementação e validação.
- Não existe integração real com Supabase, AgentOS, LibreChat ou Camofox nesta versão.
- O emoji é apenas marcador visual da marca; substitua pela logomarca oficial. O usuário já pode importar a logomarca no editor.\n- A geração local não foi homologada em todos os celulares; validar Android/iOS e o provedor de TTS antes de uso amplo.\n- Código de bibliotecas, pesos de modelo e vozes possuem licenças independentes: revisar antes de uso comercial.

## Próximos módulos
1. Serviço protegido de renderização, fila, limites e quotas por usuário.
2. Login por papéis e biblioteca de projetos privada.
3. Templates parametrizados alimentados por dados autorizados do Supabase.
4. Orquestração de criação de peças com LibreChat/MCP.
5. Rotinas Camofox somente para fluxos permitidos e com credenciais seguras.

Código experimental mantido isolado em `studio-video/`.