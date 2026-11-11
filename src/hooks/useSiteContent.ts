import { faq, gallery, services, testimonials } from '@/data/content'

/**
 * Fonte única de conteúdo da landing page.
 *
 * ETAPA 1 (atual): devolve o conteúdo estático de `src/data/content.ts`.
 * ETAPA 3/5: passa a buscar serviços, galeria e depoimentos no Supabase
 * (com estado de carregamento), mantendo este mesmo formato de retorno —
 * as seções não precisam mudar.
 */
export function useSiteContent() {
  return { services, gallery, testimonials, faq, loading: false as boolean }
}
