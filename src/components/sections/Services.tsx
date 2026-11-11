import { Clock } from 'lucide-react'
import { BookingButton } from '@/components/BookingButton'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { Reveal } from '@/components/ui/Reveal'
import { Section, SectionHeading } from '@/components/ui/Section'
import { formatDuration, formatPrice } from '@/lib/format'
import type { Service } from '@/types'

function ServiceCard({ service }: { service: Service }) {
  const price = formatPrice(service.priceCents)
  const duration = formatDuration(service.durationMinutes)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-petal/70 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="aspect-[4/3] overflow-hidden">
        <ImageSlot
          src={service.imageUrl}
          alt={service.name}
          className="transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl font-medium">{service.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{service.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-petal/70 pt-4 text-sm">
          <span className={price ? 'font-serif text-xl text-ink' : 'text-ink-soft'}>{price ?? 'Consulte o valor'}</span>
          {duration && (
            <span className="inline-flex items-center gap-1.5 text-ink-soft">
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

export function Services({ services }: { services: Service[] }) {
  const active = services.filter((s) => s.active)

  return (
    <Section id="servicos" tinted>
      <SectionHeading
        eyebrow="Serviços"
        title="Procedimentos feitos com técnica e carinho"
        description="Escolha o cuidado que você procura e solicite o seu horário em poucos toques."
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {active.map((service, i) => (
          <li key={service.id}>
            <Reveal delay={(i % 3) * 90} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
