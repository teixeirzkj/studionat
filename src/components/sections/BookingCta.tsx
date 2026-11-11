import { BookingButton } from '@/components/BookingButton'
import { Reveal } from '@/components/ui/Reveal'
import { Container } from '@/components/ui/Section'

const steps = [
  { title: 'Escolha o procedimento', text: 'Veja os serviços e selecione o que você deseja.' },
  { title: 'Solicite o seu horário', text: 'Envie o pedido com o dia e o período de sua preferência.' },
  { title: 'Receba a confirmação', text: 'O estúdio confirma o agendamento com você pelo WhatsApp.' },
]

/**
 * Seção de agendamento. Na Etapa 2 este bloco passa a conter o fluxo online
 * completo (procedimento → data → horário → dados → confirmação).
 */
export function BookingCta() {
  return (
    <section id="agendamento" className="bg-brand-dark py-20 text-white sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-petal uppercase">Agendamento</p>
          <h2 className="text-4xl leading-tight font-medium text-balance sm:text-5xl">Reserve um momento só para você</h2>
        </Reveal>

        <ol className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="text-center">
              <span aria-hidden="true" className="font-serif text-5xl text-petal italic">
                {i + 1}
              </span>
              <h3 className="mt-2 text-2xl font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <BookingButton placement="secao-agendamento" size="lg" className="bg-white !text-brand-dark hover:bg-blush">
            Agende seu horário
          </BookingButton>
        </div>
      </Container>
    </section>
  )
}
