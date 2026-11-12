# Studio Natalli Anjos

Site e sistema de agendamento do Studio Natalli Anjos (Miguel Calmon - BA).

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · Supabase (auth, Postgres, storage).

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de produção em dist/
```

Copie `.env.example` para `.env.local` para configurar as integrações. Sem nenhuma variável o site funciona normalmente: os botões de agendamento abrem o WhatsApp do estúdio e nenhum rastreamento é carregado.

## Estrutura

```
src/
  config/site.ts        Dados do estúdio (contato, endereço, horários, fotos)
  data/content.ts       Serviços, FAQ, galeria e depoimentos (conteúdo inicial)
  types/                Tipos de domínio — espelham as tabelas do banco
  lib/
    api.ts              Leitura de serviços e funções de agendamento (chave pública)
    booking.ts          Links de WhatsApp (usados quando o banco não está conectado)
    datetime.ts         Datas e horas sempre no fuso do estúdio
    analytics.ts        Eventos de conversão + Meta Pixel com consentimento
    supabase.ts         Cliente Supabase (null enquanto não configurado)
  hooks/useSiteContent  Fonte única de conteúdo da landing
  components/
    ui/                 Button, Section, Reveal, ImageSlot, ícones
    layout/             Header, Footer, WhatsApp flutuante, aviso de cookies
    sections/           Hero, Sobre, Serviços, Galeria, Depoimentos, Agendamento, FAQ
    booking/            Assistente de agendamento (procedimento → dia e horário → dados)
  pages/                Landing, Política de privacidade, 404
  pages/admin/          Login, sessão e tela de solicitações
supabase/
  migrations/           Esquema, carga inicial e armazenamento
  setup.sql             Os três arquivos juntos, para colar no SQL Editor
```

## Informações que ainda precisam ser preenchidas

Serviços, preços, durações, expediente e a foto de perfil foram copiados da página pública de agendamento do estúdio (online.maapp.com.br/studionatallianjos) em 11/11/2026. Nada foi inventado: o que não está publicado ficou vazio e o site se adapta.

| O quê | Onde | Enquanto estiver vazio |
| --- | --- | --- |
| Fotos (logo, hero, serviços) | `public/images/` + `src/config/site.ts` | Fundo decorativo da marca |
| Formações e certificações | `src/config/site.ts` → `certifications` | Bloco não aparece |
| Fotos da galeria (autorizadas) | `src/data/content.ts` → `gallery` | Convite para o Instagram |
| Depoimentos reais | `src/data/content.ts` → `testimonials` | Seção não aparece |
| Textos do FAQ e da política de privacidade | `content.ts` / `pages/PrivacyPolicy.tsx` | Rascunhos neutros, revisar |

## Banco de dados (Supabase)

O esquema fica em `supabase/migrations/` (tabelas, Row Level Security e funções de agendamento). `supabase/setup.sql` é a junção dos três arquivos, para colar de uma vez.

1. **Criar o banco:** no painel do Supabase, abra *SQL Editor*, cole o conteúdo de `supabase/setup.sql` e clique em *Run*.
2. **Conectar o site:** em `.env.local` (e nas variáveis de ambiente da Vercel) preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com a chave publicável (`sb_publishable_…`). Nunca use a chave secreta no site.
3. **Criar a administradora:** em *Authentication → Users → Add user*, crie o usuário com e-mail e senha. Depois, no *SQL Editor*:

   ```sql
   insert into public.admin_users (user_id, name)
   select id, 'Natalli' from auth.users where email = 'EMAIL_DA_ADMINISTRADORA';
   ```

4. **Fechar o cadastro público:** em *Authentication → Sign In / Providers*, desative *Allow new users to sign up*. (Mesmo aberto, uma conta nova não enxerga nada: só quem está em `admin_users` tem acesso.)

Como o agendamento se protege:

- O site nunca grava direto nas tabelas. Ele chama `get_available_slots` e `request_appointment`, que validam tudo no servidor.
- Dois agendamentos ativos não podem se sobrepor: a tabela tem uma restrição de exclusão, então o próprio banco recusa o segundo, mesmo com pedidos simultâneos.
- Um pedido pendente segura o horário por `pending_hold_minutes` (padrão: 120). Depois disso o horário volta a ficar livre.
- Limites contra abuso: 3 pedidos pendentes por WhatsApp e 30 pedidos do site por hora (ajustáveis na tabela `settings`).

## Roteiro

- [x] **Etapa 1** — Estrutura, identidade visual e landing page
- [x] **Etapa 2** — Fluxo de agendamento online
- [x] **Etapa 3** — Banco de dados (Supabase), autenticação e RLS
- [ ] **Etapa 4** — Painel administrativo e calendário (hoje: login e tela de solicitações)
- [ ] **Etapa 5** — Integração site ↔ agenda ↔ banco (hoje: serviços e agendamento; faltam galeria, depoimentos e horários do rodapé)
- [ ] **Etapa 6** — Automações de WhatsApp
- [ ] **Etapa 7** — Testes, segurança e publicação final

## Credenciais externas necessárias

| Variável | Para quê | Etapa |
| --- | --- | --- |
| `VITE_SITE_URL` | Canonical / Open Graph | quando houver domínio |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Banco, login e armazenamento | 3 |
| `VITE_META_PIXEL_ID` | Meta Pixel (só carrega após consentimento) | anúncios |
| Token do WhatsApp Business Platform | Notificações automáticas (fica só no backend) | 6 |
