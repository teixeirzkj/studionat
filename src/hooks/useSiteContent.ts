import { useEffect, useState } from 'react'
import { faq, gallery, services as fallbackServices, testimonials } from '@/data/content'
import { fetchServices } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { Service } from '@/types'

/**
 * Fonte única de conteúdo da landing page.
 *
 * Com o Supabase conectado, os serviços vêm do banco (o que a proprietária
 * cadastra no painel). Sem conexão — ou se a busca falhar — o site usa o
 * conteúdo de `src/data/content.ts`, para nunca ficar sem serviços na tela.
 *
 * Galeria e depoimentos passam a vir do banco junto com o painel (Etapa 4).
 */
export function useSiteContent() {
  const [services, setServices] = useState<Service[]>(isSupabaseConfigured ? [] : fallbackServices)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    fetchServices()
      .then((rows) => !cancelled && setServices(rows.length > 0 ? rows : fallbackServices))
      .catch(() => !cancelled && setServices(fallbackServices))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return { services, gallery, testimonials, faq, loading }
}
