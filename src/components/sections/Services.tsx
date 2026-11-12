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

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-petal/70 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      {/* Se algum serviço da categoria tem foto, todos os cards reservam o espaço (os sem foto mostram o fundo da marca), para a grade ficar alinhada. */}
      {withImage && (
        <div className="aspect-[4/3] overflow-hidden">
          <ImageSlot src={service.imageUrl} alt={service.name} className="transition duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl leading-snug font-medium">{service.name}</h3>
        {service.description && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{service.description}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className={price ? 'font-serif text-2xl text-brand-dark' : 'text-sm text-ink-soft'}>
            {price ?? 'Consulte o valor'}
          </span>
          {duration && (
            <span className="inline-flex items-center gap-1.5 pb-1 text-sm text-ink-soft">
              <Clock className="size-4" /> {duration}
            </span>
          )}
        </div>

        <BookingButton service={service} placement="card-servico" variant="secondary" className="mt-5 w-full">
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
        <div role="status" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <span className="sr-only">Carregando serviços…</span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl bg-white/70" />
          ))}
        </div>
      )}

      {categories.length > 1 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Categorias de serviços">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === category}
              onClick={() => setSelected(c)}
              className={cn(
                'min-h-11 cursor-pointer rounded-full px-5 text-sm transition',
                c === category ? 'bg-brand-dark text-white shadow-soft' : 'bg-white text-brand-dark hover:bg-petal',
              )}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {visible.map((service) => (
          <li key={service.id}>
            <ServiceCard service={service} withImage={withImage} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
