import { ImageSlot } from '@/components/ui/ImageSlot'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { InstagramIcon } from '@/components/ui/icons'
import { site } from '@/config/site'

/**
 * Texto institucional neutro: não afirma tempo de mercado, formações nem números.
 * A história da profissional deve ser escrita/aprovada por ela (editável no painel na Etapa 4).
 */
const differentiators = [
  { title: 'Atendimento individual', text: 'Cada horário é reservado só para você, sem pressa.' },
  { title: 'Resultado natural', text: 'Técnicas que respeitam os seus traços e o seu estilo.' },
  { title: 'Cuidado em cada etapa', text: 'Orientações claras antes e depois do procedimento.' },
]

export function About() {
  return (
    <Section id="sobre">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-sm pb-10 lg:max-w-md">
          {site.images.studio ? (
            <>
              <div className="aspect-[4/5] overflow-hidden rounded-3xl shadow-soft">
                <ImageSlot src={site.images.studio} alt="Ambiente do estúdio em tons de rosa" />
              </div>
              {/* Retrato da proprietária sobreposto ao canto da foto do ambiente */}
              {site.images.owner && (
                <div className="absolute right-[-0.75rem] bottom-0 size-36 overflow-hidden rounded-3xl border-4 border-white shadow-soft sm:right-[-1.5rem] sm:size-44">
                  <ImageSlot src={site.images.owner} alt="Natalli Anjos, proprietária do estúdio" />
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square overflow-hidden rounded-3xl shadow-soft">
              <ImageSlot src={site.images.owner} alt="Natalli Anjos, proprietária do estúdio" />
            </div>
          )}
        </Reveal>

        <Reveal delay={120}>
          <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-brand-dark uppercase">Sobre o estúdio</p>
          <h2 className="text-4xl leading-tight font-medium text-balance sm:text-5xl">
            Um espaço para cuidar de você com calma
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
            O {site.name} fica no centro de {site.address.city} e reúne, em um só lugar, os cuidados que fazem
            diferença no dia a dia: design de sobrancelhas, epilação com cera e com linha e micropigmentação.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Especialidades">
            {site.specialties.map((s) => (
              <li key={s} className="rounded-full bg-blush px-4 py-1.5 text-sm text-brand-dark">
                {s}
              </li>
            ))}
          </ul>

          <dl className="mt-9 space-y-5 border-t border-petal pt-8">
            {differentiators.map((d) => (
              <div key={d.title} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="font-serif text-xl text-ink">{d.title}</dt>
                <dd className="text-sm leading-relaxed text-ink-soft sm:text-base">{d.text}</dd>
              </div>
            ))}
          </dl>

          {site.certifications.length > 0 && (
            <div className="mt-8">
              <h3 className="font-serif text-xl">Formação e certificações</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {site.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-dark underline-offset-4 hover:underline"
          >
            <InstagramIcon className="size-4" /> Acompanhe o dia a dia em {site.instagram.handle}
          </a>
        </Reveal>
      </div>
    </Section>
  )
}
