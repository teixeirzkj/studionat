import { Reveal } from '@/components/ui/Reveal'
import { Section, SectionHeading } from '@/components/ui/Section'
import type { Testimonial } from '@/types'

/** Só aparece quando existem depoimentos reais cadastrados — o site nunca exibe avaliações inventadas. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null

  return (
    <Section id="depoimentos" tinted>
      <SectionHeading eyebrow="Depoimentos" title="O que as clientes dizem" />
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <li key={t.id}>
            <Reveal delay={(i % 3) * 90} className="h-full">
              <figure className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-soft">
                <span aria-hidden="true" className="font-serif text-6xl leading-none text-petal">
                  “
                </span>
                <blockquote className="-mt-3 flex-1 leading-relaxed text-ink-soft">{t.comment}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.photoUrl ? (
                    <img src={t.photoUrl} alt="" loading="lazy" className="size-11 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-blush font-serif text-lg text-brand-dark">
                      {t.clientName.charAt(0)}
                    </span>
                  )}
                  <span className="font-medium text-ink">{t.clientName}</span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
