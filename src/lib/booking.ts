import { site } from '@/config/site'
import type { Service } from '@/types'

export function whatsappUrl(message: string = site.whatsapp.defaultMessage) {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`
}

/**
 * Destino dos botões "Agendar".
 *
 * ETAPA 1 (atual): abre o WhatsApp do estúdio com a mensagem já preenchida.
 * ETAPA 2: este é o único ponto a trocar para abrir o fluxo de agendamento
 * online (procedimento → data → horário → dados → confirmação).
 */
export function bookingUrl(service?: Pick<Service, 'name'>) {
  return whatsappUrl(
    service
      ? `Olá! Gostaria de agendar um horário para ${service.name}.`
      : site.whatsapp.defaultMessage,
  )
}
