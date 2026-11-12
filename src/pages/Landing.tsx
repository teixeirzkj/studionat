import { BookingProvider } from '@/components/booking/BookingContext'
import { ConsentBanner } from '@/components/layout/ConsentBanner'
import { Footer } from '@/components/layout/Footer'
import { Header, type NavItem } from '@/components/layout/Header'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'
import { About } from '@/components/sections/About'
import { BookingCta } from '@/components/sections/BookingCta'
import { Faq } from '@/components/sections/Faq'
import { Gallery } from '@/components/sections/Gallery'
import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { Testimonials } from '@/components/sections/Testimonials'
import { useSiteContent } from '@/hooks/useSiteContent'

export default function Landing() {
  const { services, hours, gallery, testimonials, faq, loading } = useSiteContent()

  const nav: NavItem[] = [
    { label: 'Sobre', href: '/#sobre' },
    { label: 'Serviços', href: '/#servicos' },
    { label: 'Galeria', href: '/#galeria' },
    ...(testimonials.length > 0 ? [{ label: 'Depoimentos', href: '/#depoimentos' }] : []),
    { label: 'Dúvidas', href: '/#faq' },
    { label: 'Contato', href: '/#contato' },
  ]

  return (
    <BookingProvider services={services}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-5 focus:py-3"
      >
        Pular para o conteúdo
      </a>
      <Header nav={nav} />
      <main id="conteudo">
        <Hero />
        <About />
        <Services services={services} loading={loading} />
        <Gallery items={gallery} />
        <Testimonials items={testimonials} />
        <BookingCta />
        <Faq items={faq} />
      </main>
      <Footer hours={hours} />
      <WhatsAppFloat />
      <ConsentBanner />
    </BookingProvider>
  )
}
