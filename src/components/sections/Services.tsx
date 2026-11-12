import { useState } from 'react'
import { Clock } from 'lucide-react'
import { BookingButton } from '@/components/BookingButton'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { Section, SectionHeading } from '@/components/ui/Section'
import { categoryLabels, categoryOrder } from '@/data/content'
import { cn, formatDuration, formatPrice } from '@/lib/format'
import type { Service, ServiceCategory } from '@/types'

function ServiceCard({ service, withImage }: { service: Service; withImage: boolean }) {
  const price = formatPrice(service.priceCents)
  const duration = formatDuration(service.durationMinutes)

  // No celular os cards ficam compactos (3 por linha); a partir de 640px voltam ao tamanho cheio.
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-petal/70 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft sm:rounded-3xl">
      {/* Se algum serviço da categoria tem foto, todos os cards reservam o espaço (os sem foto mostram o fundo da marca), para a grade ficar alinhada. */}
      {withImage && (
        <div className="aspect-square overflow-hidden sm:aspect-[4/3]">
          <ImageSlot src={service.imageUrl} alt={service.name} className="transition duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-2 sm:p-6">
        <h3 className="font-sans text-[0.72rem] leading-tight font-semibold sm:font-serif sm:text-2xl sm:leading-snug sm:font-medium">{service.name}</h3>
        {service.description && <p className="mt-2 hidden text-sm leading-relaxed text-ink-soft sm:block">{service.description}</p>}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 pt-2 sm:gap-3 sm:pt-5">
          <span className={price ? 'font-serif text-base text-brand-dark sm:text-2xl' : 'text-xs text-ink-soft sm:text-sm'}>
            {price ?? 'Consulte'}
          </span>
          {duration && (
            <span className="inline-flex items-center gap-1 text-[0.65rem] text-ink-soft sm:gap-1.5 sm:pb-1 sm:text-sm">
              <Clock className="size-3 sm:size-4" /> {duration}
            </span>
          )}
        </div>

        <BookingButton
          service={service}
          placement="card-servico"
          variant="secondary"
          className="mt-2 w-full max-sm:min-h-9 max-sm:px-1 max-sm:text-xs sm:mt-5"
        >
          Agendar
        </BookingButton>
      </div>
    </article>
  )
}

export function Services({ services, loading = false }: { services: Service[]; loading?: boolean }) {
  const active = services.filter((s) => s.active)
  const categories = categoryOrder.filter((c) => active.some((s) => s.category === c))
  const [selected, setSelected] = useState<ServiceCategory | null>(null)
  const category = selected && categories.includes(selected) ? selected : categories[0]
  const visible = active.filter((s) => s.category === category)
  const withImage = visible.some((s) => s.imageUrl)

  return (
    <Section id="servicos" tinted>
      <SectionHeading
        eyebrow="Serviços"
        title="Procedimentos feitos com técnica e carinho"
        description="Escolha o cuidado que você procura e solicite o seu horário em poucos toques."
      />

      {loading && (
        <div role="status" className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          <span className="sr-only">Carregando serviços…</span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl bg-white/70" />
          ))}
        </div>
      )}

      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap justify-center gap-2 sm:mb-10" role="group" aria-label="Categorias de serviços">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === category}
              onClick={() => setSelected(c)}
              className={cn(
                'min-h-10 cursor-pointer rounded-full px-3.5 text-xs transition sm:min-h-11 sm:px-5 sm:text-sm',
                c === category ? 'bg-brand-dark text-white shadow-soft' : 'bg-white text-brand-dark hover:bg-petal',
              )}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3" aria-live="polite">
        {visible.map((service) => (
          <li key={service.id}>
            <ServiceCard service={service} withImage={withImage} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
