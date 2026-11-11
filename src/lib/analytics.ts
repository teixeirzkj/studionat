/**
 * Camada de rastreamento preparada para Meta Ads.
 *
 * - Sem VITE_META_PIXEL_ID: nada é carregado e nenhum evento sai do navegador.
 * - Com o ID: o Pixel só é carregado DEPOIS que a visitante aceita no aviso de
 *   cookies (LGPD). A escolha fica salva em localStorage.
 */

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown; callMethod?: (...a: unknown[]) => void }

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim() || null
const CONSENT_KEY = 'sna:consent'

export type Consent = 'granted' | 'denied'

/** O aviso de cookies só faz sentido quando existe algum rastreamento configurado. */
export const isTrackingConfigured = PIXEL_ID !== null

export function getConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function setConsent(consent: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, consent)
  } catch {
    // armazenamento indisponível: vale apenas para esta visita
  }
  if (consent === 'granted') loadPixel()
}

let pixelLoaded = false

function loadPixel() {
  if (!PIXEL_ID || pixelLoaded) return
  pixelLoaded = true

  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue!.push(args)
  }
  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.push = fbq
  window.fbq = fbq
  window._fbq = fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  fbq('init', PIXEL_ID)
  fbq('track', 'PageView')
}

/** Chamar uma vez na inicialização: respeita uma escolha já feita anteriormente. */
export function initAnalytics() {
  if (getConsent() === 'granted') loadPixel()
}

/** Eventos de conversão do site → evento padrão do Meta correspondente. */
const metaEvents = {
  whatsapp_click: 'Contact',
  booking_start: 'InitiateCheckout',
  booking_complete: 'Schedule',
} as const

export type TrackEvent = keyof typeof metaEvents

export function track(event: TrackEvent, params: Record<string, string | number> = {}) {
  if (import.meta.env.DEV) console.debug('[track]', event, params)
  if (pixelLoaded && window.fbq) window.fbq('track', metaEvents[event], params)
}
