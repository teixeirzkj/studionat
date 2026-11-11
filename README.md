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
    booking.ts          Destino dos botões "Agendar" (único ponto a trocar na Etapa 2)
    analytics.ts        Eventos de conversão + Meta Pixel com consentimento
    supabase.ts         Cliente Supabase (null enquanto não configurado)
  hooks/useSiteContent  Fonte única de conteúdo da landing
  components/
    ui/                 Button, Section, Reveal, ImageSlot, ícones
    layout/             Header, Footer, WhatsApp flutuante, aviso de cookies
    sections/           Hero, Sobre, Serviços, Galeria, Depoimentos, Agendamento, FAQ
  pages/                Landing, Política de privacidade, /admin (reservado), 404
```

## Informações que ainda precisam ser preenchidas

Nada foi inventado: o que não está publicado nas referências do estúdio ficou vazio e o site se adapta.

| O quê | Onde | Enquanto estiver vazio |
| --- | --- | --- |
| Preço e duração de cada serviço | `src/data/content.ts` | Card mostra "Consulte o valor" |
| Fotos (logo, hero, proprietária, serviços) | `public/images/` + `src/config/site.ts` | Fundo decorativo da marca |
| Horários de funcionamento | `src/config/site.ts` → `hours` | "Atendimento com hora marcada" |
| Formações e certificações | `src/config/site.ts` → `certifications` | Bloco não aparece |
| Fotos da galeria (autorizadas) | `src/data/content.ts` → `gallery` | Convite para o Instagram |
| Depoimentos reais | `src/data/content.ts` → `testimonials` | Seção não aparece |
| Textos do FAQ e da política de privacidade | `content.ts` / `pages/PrivacyPolicy.tsx` | Rascunhos neutros, revisar |

## Roteiro

- [x] **Etapa 1** — Estrutura, identidade visual e landing page
- [ ] **Etapa 2** — Fluxo de agendamento online
- [ ] **Etapa 3** — Banco de dados (Supabase), autenticação e RLS
- [ ] **Etapa 4** — Painel administrativo e calendário
- [ ] **Etapa 5** — Integração site ↔ agenda ↔ banco
- [ ] **Etapa 6** — Automações de WhatsApp
- [ ] **Etapa 7** — Testes, segurança e publicação final

## Credenciais externas necessárias

| Variável | Para quê | Etapa |
| --- | --- | --- |
| `VITE_SITE_URL` | Canonical / Open Graph | quando houver domínio |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Banco, login e armazenamento | 3 |
| `VITE_META_PIXEL_ID` | Meta Pixel (só carrega após consentimento) | anúncios |
| Token do WhatsApp Business Platform | Notificações automáticas (fica só no backend) | 6 |
