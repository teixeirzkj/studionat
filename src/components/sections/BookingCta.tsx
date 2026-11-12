import { BookingButton } from '@/components/BookingButton'
import { Reveal } from '@/components/ui/Reveal'
import { Container } from '@/components/ui/Section'

const steps = [
  { title: 'Escolha o procedimento', text: 'Veja os serviços e selecione o que você deseja.' },
  { title: 'Solicite o seu horário', text: 'Escolha o dia e o horário que preferir e envie o pedido.' },
  { title: 'Receba a confirmação', text: 'O estúdio confirma o agendamento com você pelo WhatsApp.' },
]

/**
 * Seção de agendamento. Na Etapa 2 este bloco passa a conter o fluxo online
 * completo (procedimento → data → horário → dados → confirmação).
 */
export function BookingCta() {
  return (
    <section id="agendamento" className="bg-brand-dark py-12 text-white sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-[0.65rem] font-semibold tracking-[0.28em] text-petal uppercase sm:mb-3 sm:text-xs">Agendamento</p>
          <h2 className="text-[1.7rem] leading-tight font-medium text-balance sm:text-5xl">Reserve um momento só para você</h2>
        </Reveal>

        <ol className="mx-auto mt-7 grid max-w-4xl gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, i) => (
            <li key={step.title} className="text-center">
              <span aria-hidden="true" className="font-serif text-3xl text-petal italic sm:text-5xl">
                {i + 1}
              </span>
              <h3 className="mt-1 text-xl font-medium sm:mt-2 sm:text-2xl">{step.title}</h3>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-white/80 sm:mt-2 sm:text-sm">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 text-center sm:mt-12">
          <BookingButton placement="secao-agendamento" size="lg" className="bg-white !text-brand-dark hover:bg-blush">
            Agende seu horário
          </BookingButton>
        </div>
      </Container>
    </section>
  )
}
