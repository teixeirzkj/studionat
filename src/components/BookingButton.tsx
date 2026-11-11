import type { ReactNode } from 'react'
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

/** Botão de conversão principal. Único ponto de entrada do agendamento em todo o site. */
export function BookingButton({ service, placement, children = 'Agendar horário', ...buttonProps }: Props) {
  return (
    <Button
      href={bookingUrl(service)}
      onClick={() => {
        const params = { placement, ...(service ? { service: service.name } : {}) }
        track('booking_start', params)
        // Na Etapa 1 o agendamento acontece pelo WhatsApp, então também conta como clique no WhatsApp.
        track('whatsapp_click', params)
      }}
      {...buttonProps}
    >
      {children}
    </Button>
  )
}
