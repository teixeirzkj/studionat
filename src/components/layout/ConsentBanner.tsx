import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { getConsent, isTrackingConfigured, setConsent, type Consent } from '@/lib/analytics'

/**
 * Aviso de cookies (LGPD). Só aparece quando existe rastreamento configurado
 * (VITE_META_PIXEL_ID) e a visitante ainda não escolheu.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(() => isTrackingConfigured && getConsent() === null)
  if (!visible) return null

  const choose = (consent: Consent) => {
    setConsent(consent)
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-petal bg-white p-5 shadow-soft sm:bottom-6"
    >
      <p className="text-sm leading-relaxed text-ink-soft">
        Usamos cookies para medir o resultado dos nossos anúncios. Você pode aceitar ou recusar — o site funciona
        normalmente nos dois casos. Saiba mais na{' '}
        <Link to="/privacidade" className="text-brand-dark underline">
          política de privacidade
        </Link>
        .
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => choose('denied')}>
          Recusar
        </Button>
        <Button onClick={() => choose('granted')}>Aceitar</Button>
      </div>
    </div>
  )
}
