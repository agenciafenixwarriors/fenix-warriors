# Fênix Video Studio — MVP (módulo isolado)

Editor responsivo de composições de vídeo para a Agência e Família Fênix Warriors. **Não altera o aplicativo em produção nem conecta a credenciais, bancos ou contas de terceiros.**

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
- A plataforma está sem autenticação, adequada apenas para prototipação de informações públicas.
- Não armazene dados sigilosos em composições ou JSON exportado.
- Use exclusivamente fotos e marcas com autorização dos titulares.
- Imagens inseridas no HTML por data URI ampliam o arquivo final.
- Filtros de segurança BIGO e renderizador escalável ainda precisam de implementação e validação.
- Não existe integração real com Supabase, AgentOS, LibreChat ou Camofox nesta versão.
- O emoji é apenas marcador visual da marca; substitua pela logomarca oficial.

## Próximos módulos
1. Serviço protegido de renderização, fila, limites e quotas por usuário.
2. Login por papéis e biblioteca de projetos privada.
3. Templates parametrizados alimentados por dados autorizados do Supabase.
4. Orquestração de criação de peças com LibreChat/MCP.
5. Rotinas Camofox somente para fluxos permitidos e com credenciais seguras.

Código experimental mantido isolado em `studio-video/`.