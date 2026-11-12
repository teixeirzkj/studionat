import { MapPin } from 'lucide-react'
import { BookingButton } from '@/components/BookingButton'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'
import { site } from '@/config/site'

/**
 * Topo do site com a imagem ocupando a seção inteira.
 *
 * - Telas largas: imagem horizontal ancorada à direita (66% da largura), com a
 *   borda esquerda dissolvendo no rosa, para a marca na parede ficar longe do texto.
 * - Celular: imagem vertical; o texto fica no alto e a sala aparece embaixo.
 * Um degradê claro por cima da imagem garante a leitura do texto.
 */
export function Hero() {
  const { hero, heroWide } = site.images

  return (
    <section id="inicio" className="relative isolate flex min-h-[36rem] overflow-hidden bg-blush sm:min-h-[46rem] lg:min-h-[min(48rem,100svh)] lg:items-center">
      {hero && (
        <picture>
          {heroWide && <source media="(min-width: 1024px)" srcSet={heroWide} />}
          <img
            src={hero}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-bottom lg:left-auto lg:w-[66%] lg:object-left"
          />
        </picture>
      )}

      {/* Degradês de leitura: de cima para baixo no celular, da esquerda para a direita em telas largas */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-blush from-40% via-blush/85 via-60% to-transparent to-85% lg:bg-linear-to-r lg:from-blush lg:from-35% lg:via-blush/75 lg:via-46% lg:to-transparent lg:to-62%"
      />
      {/* Faixa clara no alto, para o menu continuar legível sobre a imagem */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 hidden h-36 bg-linear-to-b from-white/75 to-transparent lg:block" />

      <Container className="pt-24 pb-14 sm:pt-28 sm:pb-16 lg:py-32">
        <div className="max-w-xl">
          <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.24em] text-brand-dark uppercase sm:mb-5 sm:text-xs">
            <MapPin className="size-3.5" /> {site.address.city} · {site.address.state}
          </p>
          <h1 className="text-[2.1rem] leading-[1.08] font-medium text-balance sm:text-6xl sm:leading-[1.05] lg:text-7xl">
            Sua beleza, realçada com <em className="text-brand-dark">delicadeza</em>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-pretty text-ink-soft sm:mt-6 sm:text-lg">
            Design de sobrancelhas, epilação, micropigmentação e cuidados pensados para você se sentir bem — em um
            atendimento individual, com hora marcada.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:gap-3">
            <BookingButton placement="hero" size="lg" className="max-sm:min-h-11 max-sm:text-sm">
              Agende seu horário
            </BookingButton>
            <Button href="#servicos" variant="secondary" size="lg" className="max-sm:min-h-11 max-sm:text-sm">
              Conheça nossos serviços
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
