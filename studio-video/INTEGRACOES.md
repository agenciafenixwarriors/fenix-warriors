# Plano de integração — Fênix Video Studio → Fênix AI OS

Data da inspeção: 14/11/2026. Documento técnico, não indica conexões em funcionamento.

## Sistemas existentes confirmados

- GitHub: `agenciafenixwarriors/fenix-warriors` (branch de integração isolado).
- Vercel: `fenix-video-studio` (novo MVP, sem API do Supabase).
- Supabase ativo: Fenix Growth (`knzuhcccujtwzlhbsbss`, `sa-east-1`).
- Supabase NEXUS AI (`kfanvjddqvmfbblacbkp`) estava **inativo** na inspeção; não depender dele para a primeira versão.
- Dados no Fenix Growth, apenas contagens lidas em 14/11/2026: `fg_content_packages` 1; `fg_media_library` 28; `fg_video_jobs` 2.

## Reuso proposto, sem alterações feitas

| Entidade existente | Papel possível | Observações |
|---|---|---|
| `public.fg_content_packages` | títulos, briefing visual, roteiro de reels, CTA, legendas | Contém `user_id`, `script_reel`, `visual_brief`, `cta`, etc. Consumir somente via API autenticada/RLS |
| `public.fg_media_library` | galeria de imagens e vídeos reutilizáveis | Contém `user_id`, `media_type`, `source_url`, `metadata`; validar se os links são privados/autorizados |
| `public.fg_video_jobs` | registros de trabalhos de vídeo HeyGen existentes | **Não** reutilizar para renderizações Hyperframes sem mudança de esquema: `heygen_video_id` é NOT NULL |
| `public.content_items` | calendário e campanhas de conteúdo | Reaproveitar `script`, `hook`, `cta` e `campaign` conforme papéis e autorização |

## Integração segura em etapas

1. Autenticação no Fênix Video Studio com identidades verificadas no backend; manter **sem conexão ao banco no MVP público**.
2. Criar serviço de leitura para itens de conteúdo e mídias *do usuário autorizado*; não copiar dados em URL pública.
3. Implantar serviço de renderização Hyperframes fora de funções HTTP curtas. Fluxo: cliente autenticado → API → fila → worker com Node 22+/Chromium/FFmpeg → storage → webhook de resultado.
4. Introduzir `fg_hyperframes_jobs` (ou novo esquema privado dedicado), com `user_id`, `composition`, `status`, `output_path`, `error_code`, `credits_used`, timestamps. **Não criado**; precisa de migração revisada, RLS por usuário, grants mínimos e quotas.
5. LibreChat: construir ferramentas MCP de consulta autorizada para roteiros, resultados e ativos, primeiro em modo de leitura. Não expor service_role.
6. Camofox: usar apenas em fluxos de navegador autorizados. Não acessar BIGO/AgentOS sem confirmação de permissões e gestão segura de sessões. Não salvar cookies no repositório.
7. Aurora/Open LLM VTuber: voz e assistente de criação, sem permissão para publicar ou gastar créditos sem aprovação explícita.

## Controles de produção obrigatórios

- Checagem de permissões por função e de propriedade em cada operação.
- Storage privado com URL assinada e expiração.
- Credenciais somente no servidor; nunca em `NEXT_PUBLIC_*` ou no HTML.
- Limites de tamanho de mídia, duração, resolução e custo por job; rejeitar arquivos indevidos.
- Análise dos direitos de imagem/voz e conformidade das peças com regras da BIGO LIVE.
- Antiduplicação por chave idempotente; logs sem dados sensíveis.
- Revisar licenças do Hyperframes, GSAP, avatares, fontes e modelos antes da distribuição comercial.
- Testar em homologação com dados fictícios antes de migrar ou autorizar escrita.

## Status

- [x] Editor público experimental e composição HTML exportável.
- [x] Prova de leitura do esquema existente por connector do Supabase.
- [ ] Integração de login e perfis.
- [ ] Biblioteca remota autenticada.
- [ ] Worker de MP4 em nuvem.
- [ ] LibreChat MCP conectado e validado.
- [ ] Camofox para tarefas autorizadas.
- [ ] Aurora com voz.
- [ ] Homologação multiusuário e faturamento.

> Mantenha o PR como draft. Não implantar automação com credenciais da BIGO nem fundir a branch sem revisão técnica.
