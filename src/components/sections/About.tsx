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
      <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-[13.5rem] pb-7 sm:max-w-sm sm:pb-10 lg:max-w-md">
          {site.images.studio ? (
            <>
              <div className="aspect-[4/5] overflow-hidden rounded-3xl shadow-soft">
                <ImageSlot src={site.images.studio} alt="Ambiente do estúdio em tons de rosa" />
              </div>
              {/* Retrato da proprietária sobreposto ao canto da foto do ambiente */}
              {site.images.owner && (
                <div className="absolute right-[-1.25rem] bottom-0 size-24 overflow-hidden rounded-2xl border-[3px] border-white shadow-soft sm:right-[-1.5rem] sm:size-44 sm:rounded-3xl sm:border-4">
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
          <p className="mb-2 text-[0.65rem] font-semibold tracking-[0.28em] text-brand-dark uppercase sm:mb-3 sm:text-xs">Sobre o estúdio</p>
          <h2 className="text-[1.7rem] leading-tight font-medium text-balance sm:text-5xl">
            Um espaço para cuidar de você com calma
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:mt-6 sm:text-lg">
            O {site.name} fica no centro de {site.address.city} e reúne, em um só lugar, os cuidados que fazem
            diferença no dia a dia: design de sobrancelhas, epilação com cera e com linha e micropigmentação.
          </p>

          <ul className="mt-4 flex flex-wrap gap-1.5 sm:mt-6 sm:gap-2" aria-label="Especialidades">
            {site.specialties.map((s) => (
              <li key={s} className="rounded-full bg-blush px-3 py-1 text-xs text-brand-dark sm:px-4 sm:py-1.5 sm:text-sm">
                {s}
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3.5 border-t border-petal pt-5 sm:mt-9 sm:space-y-5 sm:pt-8">
            {differentiators.map((d) => (
              <div key={d.title} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="font-serif text-lg text-ink sm:text-xl">{d.title}</dt>
                <dd className="text-[0.8rem] leading-relaxed text-ink-soft sm:text-base">{d.text}</dd>
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
            className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-brand-dark underline-offset-4 hover:underline sm:mt-8 sm:text-sm"
          >
            <InstagramIcon className="size-4" /> Acompanhe o dia a dia em {site.instagram.handle}
          </a>
        </Reveal>
      </div>
    </Section>
  )
}
