import type { ReactNode } from 'react'
import { useBooking } from '@/components/booking/BookingContext'
import { Button } from '@/components/ui/Button'
import { bookingUrl } from '@/lib/booking'
import { track } from '@/lib/analytics'
import type { Service } from '@/types'

interface Props {
  service?: Service
  /** Onde o botão está na página — vai junto no evento, para medir qual CTA converte. */
  placement: string
  children?: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
  className?: string
}

/**
 * Botão de conversão principal — único ponto de entrada do agendamento.
 * Com o banco conectado abre o agendamento online; sem ele, leva ao WhatsApp
 * do estúdio com a mensagem preenchida.
 */
export function BookingButton({ service, placement, children = 'Agendar horário', ...buttonProps }: Props) {
  const booking = useBooking()

  if (booking.online) {
    return (
      <Button onClick={() => booking.open({ service, placement })} {...buttonProps}>
        {children}
      </Button>
    )
  }

  return (
    <Button
      href={bookingUrl(service)}
      onClick={() => {
        const params = { placement, ...(service ? { service: service.name } : {}) }
        track('booking_start', params)
        track('whatsapp_click', params)
      }}
      {...buttonProps}
    >
      {children}
    </Button>
  )
}
