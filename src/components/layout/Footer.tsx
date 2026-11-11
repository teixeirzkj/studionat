import { Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Section'
import { InstagramIcon, WhatsAppIcon } from '@/components/ui/icons'
import { fullAddress, mapsUrl, site } from '@/config/site'
import { track } from '@/lib/analytics'
import { whatsappUrl } from '@/lib/booking'
import { weekdayNames } from '@/lib/format'

const linkClass = 'transition hover:text-white'

export function Footer() {
  return (
    <footer id="contato" className="bg-ink text-white/75">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[0.6rem] font-semibold tracking-[0.42em] text-petal uppercase">Studio</p>
          <p className="font-serif text-3xl text-white italic">{site.shortName}</p>
          <p className="mt-4 text-sm leading-relaxed">{site.specialties.join(' · ')}</p>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-semibold tracking-[0.2em] text-white uppercase">Contato</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click', { placement: 'rodape' })}
                className={`inline-flex items-center gap-2 ${linkClass}`}
              >
                <WhatsAppIcon className="size-4" /> {site.whatsapp.display}
              </a>
            </li>
            <li>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${linkClass}`}>
                <InstagramIcon className="size-4" /> {site.instagram.handle}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-semibold tracking-[0.2em] text-white uppercase">Endereço</h2>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex gap-2 text-sm leading-relaxed ${linkClass}`}>
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{fullAddress}</span>
          </a>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-xs font-semibold tracking-[0.2em] text-white uppercase">Horários</h2>
          {site.hours.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
              {site.hours.map((h) => (
                <li key={h.weekday} className="flex justify-between gap-4">
                  <span>{weekdayNames[h.weekday]}</span>
                  <span>
                    {h.opensAt} – {h.closesAt}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="inline-flex gap-2 text-sm leading-relaxed">
              <Clock className="mt-0.5 size-4 shrink-0" />
              Atendimento com hora marcada. Consulte a disponibilidade pelo WhatsApp.
            </p>
          )}
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
          </p>
          <Link to="/privacidade" className={linkClass}>
            Política de privacidade
          </Link>
        </Container>
      </div>
    </footer>
  )
}
