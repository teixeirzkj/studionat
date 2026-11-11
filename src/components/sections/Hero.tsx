import { MapPin } from 'lucide-react'
import { BookingButton } from '@/components/BookingButton'
import { Button } from '@/components/ui/Button'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { Container } from '@/components/ui/Section'
import { site } from '@/config/site'

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-linear-to-b from-blush to-white pt-28 pb-16 sm:pt-36 sm:pb-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.24em] text-brand-dark uppercase">
            <MapPin className="size-3.5" /> {site.address.city} · {site.address.state}
          </p>
          <h1 className="text-5xl leading-[1.05] font-medium text-balance sm:text-6xl lg:text-7xl">
            Sua beleza, realçada com <em className="text-brand-dark">delicadeza</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-soft">
            Design de sobrancelhas, epilação, micropigmentação e cuidados pensados para você se sentir bem — em um
            atendimento individual, com hora marcada.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <BookingButton placement="hero" size="lg">
              Agende seu horário
            </BookingButton>
            <Button href="#servicos" variant="secondary" size="lg">
              Conheça nossos serviços
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="aspect-[4/5] overflow-hidden rounded-t-full rounded-b-3xl shadow-soft">
            <ImageSlot src={site.images.hero} alt={`Ambiente do ${site.name}`} priority />
          </div>
          <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-4 shadow-soft sm:-left-8">
            <p className="font-serif text-xl text-ink italic">{site.name}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{site.specialties.slice(0, 2).join(' · ')}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
