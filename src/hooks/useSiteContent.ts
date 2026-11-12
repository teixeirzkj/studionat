import { useEffect, useState } from 'react'
import { site } from '@/config/site'
import { faq, gallery as fallbackGallery, services as fallbackServices, testimonials as fallbackTestimonials } from '@/data/content'
import { fetchBusinessHours, fetchGallery, fetchServices, fetchTestimonials } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { BusinessHours, GalleryItem, Service, Testimonial } from '@/types'

/**
 * Fonte única de conteúdo da landing page.
 *
 * Com o Supabase conectado, serviços, expediente, galeria e depoimentos vêm do
 * banco — é o que a proprietária administra no painel. Sem conexão, ou se
 * alguma busca falhar, aquela parte usa o conteúdo local de `src/data/content.ts`
 * e `src/config/site.ts`, para o site nunca ficar vazio.
 */
export function useSiteContent() {
  const [services, setServices] = useState<Service[]>(isSupabaseConfigured ? [] : fallbackServices)
  const [hours, setHours] = useState<BusinessHours[]>(site.hours)
  const [gallery, setGallery] = useState<GalleryItem[]>(fallbackGallery)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    const apply = <T,>(setter: (value: T) => void) => (value: T) => {
      if (!cancelled) setter(value)
    }

    fetchServices()
      .then((rows) => apply(setServices)(rows.length > 0 ? rows : fallbackServices))
      .catch(() => apply(setServices)(fallbackServices))
      .finally(() => apply(setLoading)(false))
    fetchBusinessHours().then(apply(setHours)).catch(() => {})
    fetchGallery().then(apply(setGallery)).catch(() => {})
    fetchTestimonials().then(apply(setTestimonials)).catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return { services, hours, gallery, testimonials, faq, loading }
}
