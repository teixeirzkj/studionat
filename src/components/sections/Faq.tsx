import { ChevronDown } from 'lucide-react'
import { Section, SectionHeading } from '@/components/ui/Section'
import type { FaqItem } from '@/types'

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Section id="faq">
      <SectionHeading eyebrow="Dúvidas frequentes" title="Tudo o que você precisa saber" />
      <div className="mx-auto max-w-3xl divide-y divide-petal border-y border-petal">
        {items.map((item) => (
          // <details> nativo: acessível por teclado e leitores de tela sem JavaScript.
          <details key={item.question} className="group">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-serif text-xl [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown className="size-5 shrink-0 text-brand-dark transition group-open:rotate-180" />
            </summary>
            <p className="pr-9 pb-6 leading-relaxed text-ink-soft">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
