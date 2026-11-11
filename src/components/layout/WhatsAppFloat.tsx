import { WhatsAppIcon } from '@/components/ui/icons'
import { track } from '@/lib/analytics'
import { whatsappUrl } from '@/lib/booking'

/** Atalho fixo para o WhatsApp — importante para quem chega pelo celular vindo de anúncios. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com o estúdio pelo WhatsApp"
      onClick={() => track('whatsapp_click', { placement: 'flutuante' })}
      className="fixed right-4 bottom-4 z-30 grid size-14 place-items-center rounded-full bg-[#1f8f4e] text-white shadow-lg transition hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
