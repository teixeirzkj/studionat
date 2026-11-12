import { createContext, lazy, Suspense, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { track } from '@/lib/analytics'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { Service } from '@/types'

// O assistente de agendamento só é baixado quando alguém clica em "Agendar".
const BookingDialog = lazy(() => import('./BookingDialog'))

interface BookingContextValue {
  /**
   * `true` quando o agendamento online está disponível (banco conectado).
   * Caso contrário, os botões de agendamento levam ao WhatsApp.
   */
  online: boolean
  open: (options: { service?: Service; placement: string }) => void
}

const BookingContext = createContext<BookingContextValue>({ online: false, open: () => {} })

export const useBooking = () => useContext(BookingContext)

export function BookingProvider({ services, children }: { services: Service[]; children: ReactNode }) {
  const [state, setState] = useState<{ service?: Service } | null>(null)
  // Usar apenas serviços vindos do banco: os de reserva local têm ids que o servidor não conhece.
  const online = isSupabaseConfigured && services.length > 0 && services.every((s) => /^[0-9a-f-]{36}$/.test(s.id))

  const open = useCallback<BookingContextValue['open']>(({ service, placement }) => {
    track('booking_start', { placement, ...(service ? { service: service.name } : {}) })
    setState({ service })
  }, [])

  const value = useMemo(() => ({ online, open }), [online, open])

  return (
    <BookingContext.Provider value={value}>
      {children}
      {state && (
        <Suspense fallback={null}>
          <BookingDialog services={services} initialService={state.service} onClose={() => setState(null)} />
        </Suspense>
      )}
    </BookingContext.Provider>
  )
}
