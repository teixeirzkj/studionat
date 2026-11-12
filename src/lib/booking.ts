import { site } from '@/config/site'
import type { Service } from '@/types'

export function whatsappUrl(message: string = site.whatsapp.defaultMessage) {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`
}

/**
 * Destino dos botões "Agendar" quando o agendamento online não está
 * disponível (banco não conectado): WhatsApp do estúdio com a mensagem
 * já preenchida. Com o banco conectado, o BookingButton abre o assistente.
 */
export function bookingUrl(service?: Pick<Service, 'name'>) {
  return whatsappUrl(
    service
      ? `Olá! Gostaria de agendar um horário para ${service.name}.`
      : site.whatsapp.defaultMessage,
  )
}
