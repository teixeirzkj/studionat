import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarCheck, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/icons'
import { site } from '@/config/site'
import { categoryLabels, categoryOrder } from '@/data/content'
import { track } from '@/lib/analytics'
import {
  BookingError,
  fetchAvailableSlots,
  fetchBookingConfig,
  requestAppointment,
  type AppointmentReceipt,
  type BookingConfig,
} from '@/lib/api'
import { whatsappUrl } from '@/lib/booking'
import { addDays, dayParts, formatLongDate, formatTime, hourOf, todayInStudio, weekdayOf } from '@/lib/datetime'
import { cn, formatDuration, formatPrice } from '@/lib/format'
import type { Service } from '@/types'

type Step = 'service' | 'datetime' | 'details' | 'done'

const stepTitles: Record<Step, string> = {
  service: 'Escolha o procedimento',
  datetime: 'Escolha o dia e o horário',
  details: 'Seus dados',
  done: 'Solicitação enviada',
}

function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-sm text-ink-soft">
      <span className="size-5 animate-spin rounded-full border-2 border-petal border-t-brand-dark" />
      {label}
    </div>
  )
}

function ErrorNote({ children }: { children: string }) {
  return (
    <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </p>
  )
}

/** (74) 99922-0337 */
function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/* ------------------------------------------------------------------ */
/* Passo 1 — procedimento                                              */
/* ------------------------------------------------------------------ */
function ServiceStep({ services, onSelect }: { services: Service[]; onSelect: (s: Service) => void }) {
  const groups = categoryOrder
    .map((category) => ({ category, items: services.filter((s) => s.category === category) }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="space-y-7">
      {groups.map((group) => (
        <section key={group.category}>
          <h3 className="mb-2 font-sans text-xs font-semibold tracking-[0.2em] text-brand-dark uppercase">
            {categoryLabels[group.category]}
          </h3>
          <ul className="divide-y divide-petal/70 rounded-2xl border border-petal/70">
            {group.items.map((service) => (
              <li key={service.id}>
                <button
                  type="button"
                  onClick={() => onSelect(service)}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-blush"
                >
                  <span>
                    <span className="block font-medium">{service.name}</span>
                    <span className="text-sm text-ink-soft">{formatDuration(service.durationMinutes)}</span>
                  </span>
                  <span className="shrink-0 font-serif text-lg text-brand-dark">
                    {formatPrice(service.priceCents) ?? 'Consulte'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Passo 2 — dia e horário                                             */
/* ------------------------------------------------------------------ */
function DateTimeStep({
  service,
  config,
  date,
  onDate,
  onSlot,
  notice,
}: {
  service: Service
  config: BookingConfig
  date: string | null
  onDate: (date: string) => void
  onSlot: (slot: string) => void
  notice: string | null
}) {
  const days = useMemo(() => {
    const today = todayInStudio()
    return Array.from({ length: config.maxAdvanceDays + 1 }, (_, i) => addDays(today, i)).filter((d) =>
      config.openWeekdays.has(weekdayOf(d)),
    )
  }, [config])

  const [slots, setSlots] = useState<string[] | null>(null)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!date) return
    let cancelled = false
    setSlots(null)
    setError(false)
    fetchAvailableSlots(service.id, date)
      .then((result) => !cancelled && setSlots(result))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [service.id, date, reload])

  const periods = [
    { label: 'Manhã', items: slots?.filter((s) => hourOf(s) < 12) ?? [] },
    { label: 'Tarde', items: slots?.filter((s) => hourOf(s) >= 12 && hourOf(s) < 18) ?? [] },
    { label: 'Noite', items: slots?.filter((s) => hourOf(s) >= 18) ?? [] },
  ].filter((p) => p.items.length > 0)

  return (
    <div className="space-y-6">
      {notice && <ErrorNote>{notice}</ErrorNote>}

      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold">Dia</h3>
        <ul className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:px-7" aria-label="Dias disponíveis">
          {days.map((d) => {
            const parts = dayParts(d)
            const selected = d === date
            return (
              <li key={d} className="snap-start">
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={formatLongDate(d)}
                  onClick={() => onDate(d)}
                  className={cn(
                    'flex w-16 cursor-pointer flex-col items-center rounded-2xl border py-2.5 transition',
                    selected ? 'border-brand-dark bg-brand-dark text-white' : 'border-petal bg-white hover:bg-blush',
                  )}
                >
                  <span className="text-xs capitalize opacity-80">{parts.weekday}</span>
                  <span className="font-serif text-2xl leading-tight">{parts.day}</span>
                  <span className="text-xs opacity-80">{parts.month}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div aria-live="polite">
        <h3 className="mb-3 font-sans text-sm font-semibold">Horário</h3>
        {!date && <p className="text-sm text-ink-soft">Escolha um dia para ver os horários livres.</p>}
        {date && error && (
          <div className="space-y-3">
            <ErrorNote>Não foi possível carregar os horários. Verifique a conexão.</ErrorNote>
            <Button variant="secondary" onClick={() => setReload((n) => n + 1)}>
              Tentar novamente
            </Button>
          </div>
        )}
        {date && !error && slots === null && <Spinner label="Buscando horários livres…" />}
        {date && !error && slots?.length === 0 && (
          <p className="rounded-2xl bg-blush px-4 py-4 text-sm text-ink-soft">
            Não há horários livres em {formatLongDate(date)}. Escolha outro dia.
          </p>
        )}
        {periods.map((period) => (
          <div key={period.label} className="mb-5">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-ink-soft uppercase">{period.label}</p>
            <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {period.items.map((slot) => (
                <li key={slot}>
                  <button
                    type="button"
                    onClick={() => onSlot(slot)}
                    className="min-h-11 w-full cursor-pointer rounded-full border border-petal bg-white text-sm font-medium transition hover:border-brand-dark hover:bg-brand-dark hover:text-white"
                  >
                    {formatTime(slot)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Resumo do pedido                                                    */
/* ------------------------------------------------------------------ */
function Summary({ service, date, slot }: { service: Service; date?: string | null; slot?: string | null }) {
  return (
    <div className="rounded-2xl bg-blush px-4 py-3.5">
      <p className="font-serif text-xl">{service.name}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" /> {formatDuration(service.durationMinutes)}
        </span>
        <span>{formatPrice(service.priceCents) ?? 'Consulte o valor'}</span>
      </p>
      {date && slot && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-dark">
          <CalendarCheck className="size-4" />
          <span className="first-letter:uppercase">
            {formatLongDate(date)}, às {formatTime(slot)}
          </span>
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Assistente                                                          */
/* ------------------------------------------------------------------ */
interface Props {
  services: Service[]
  initialService?: Service
  onClose: () => void
}

export default function BookingDialog({ services, initialService, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const [step, setStep] = useState<Step>(initialService ? 'datetime' : 'service')
  const [service, setService] = useState<Service | null>(initialService ?? null)
  const [date, setDate] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [slotNotice, setSlotNotice] = useState<string | null>(null)

  const [config, setConfig] = useState<BookingConfig | null>(null)
  const [configError, setConfigError] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<AppointmentReceipt | null>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  useEffect(() => {
    fetchBookingConfig()
      .then(setConfig)
      .catch(() => setConfigError(true))
  }, [])

  // Cada passo começa do topo e com o foco no título (leitores de tela anunciam a mudança).
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
    document.getElementById(titleId)?.focus()
  }, [step, titleId])

  const back = () => {
    setFormError(null)
    if (step === 'details') setStep('datetime')
    else if (step === 'datetime') setStep('service')
  }
  const canGoBack = step === 'details' || (step === 'datetime' && services.length > 1)

  const phoneDigits = phone.replace(/\D/g, '')
  const nameValid = name.trim().length >= 2
  const phoneValid = phoneDigits.length === 10 || phoneDigits.length === 11

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!service || !slot || submitting) return
    if (!nameValid) return setFormError('Informe o seu nome.')
    if (!phoneValid) return setFormError('Informe o WhatsApp com DDD, por exemplo (74) 99999-9999.')
    if (!consent) return setFormError('Para confirmarmos o seu horário, precisamos da sua autorização para enviar mensagens.')

    setSubmitting(true)
    setFormError(null)
    try {
      const result = await requestAppointment({
        serviceId: service.id,
        startsAt: slot,
        name: name.trim(),
        whatsapp: phoneDigits,
        whatsappOptIn: consent,
      })
      setReceipt(result)
      setStep('done')
      track('booking_complete', { service: service.name, value: (service.priceCents ?? 0) / 100, currency: 'BRL' })
    } catch (error) {
      const bookingError = error instanceof BookingError ? error : new BookingError('UNKNOWN')
      if (bookingError.code === 'SLOT_UNAVAILABLE') {
        // O horário foi tomado enquanto a pessoa preenchia: volta para escolher outro.
        setSlot(null)
        setSlotNotice(bookingError.message)
        setStep('datetime')
      } else {
        setFormError(bookingError.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-white p-0 text-ink backdrop:bg-ink/70 sm:m-auto sm:h-auto sm:max-h-[min(46rem,92dvh)] sm:w-[34rem] sm:rounded-3xl"
    >
      <div className="flex h-dvh flex-col sm:h-auto sm:max-h-[min(46rem,92dvh)]">
        <header className="flex items-center gap-2 border-b border-petal/70 px-3 py-3 sm:px-5">
          {canGoBack ? (
            <button
              type="button"
              onClick={back}
              aria-label="Voltar"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-blush"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <span className="size-11 shrink-0" />
          )}
          <h2 id={titleId} tabIndex={-1} className="flex-1 text-center text-2xl font-medium outline-none">
            {stepTitles[step]}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Fechar agendamento"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-blush"
          >
            <X className="size-5" />
          </button>
        </header>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {step === 'service' && (
            <ServiceStep
              services={services}
              onSelect={(selected) => {
                setService(selected)
                setSlot(null)
                setStep('datetime')
              }}
            />
          )}

          {step === 'datetime' && service && (
            <div className="space-y-6">
              <Summary service={service} />
              {configError && <ErrorNote>Não foi possível carregar a agenda. Feche e tente novamente.</ErrorNote>}
              {!config && !configError && <Spinner label="Carregando a agenda…" />}
              {config && (
                <DateTimeStep
                  service={service}
                  config={config}
                  date={date}
                  notice={slotNotice}
                  onDate={(d) => {
                    setDate(d)
                    setSlotNotice(null)
                  }}
                  onSlot={(s) => {
                    setSlot(s)
                    setSlotNotice(null)
                    setStep('details')
                  }}
                />
              )}
            </div>
          )}

          {step === 'details' && service && (
            <form onSubmit={submit} noValidate className="space-y-5">
              <Summary service={service} date={date} slot={slot} />

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Nome</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-petal bg-white px-4 text-base outline-none focus:border-brand-dark"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">WhatsApp</span>
                <input
                  type="tel"
                  name="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  placeholder="(74) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  className="min-h-12 w-full rounded-2xl border border-petal bg-white px-4 text-base outline-none focus:border-brand-dark"
                />
              </label>

              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-brand-dark"
                />
                <span>
                  Autorizo o {site.name} a me enviar mensagens pelo WhatsApp sobre este agendamento. Veja a{' '}
                  <a href="/privacidade" target="_blank" rel="noopener" className="text-brand-dark underline">
                    política de privacidade
                  </a>
                  .
                </span>
              </label>

              {formError && <ErrorNote>{formError}</ErrorNote>}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Enviando…' : 'Solicitar agendamento'}
              </Button>
              <p className="text-center text-xs text-ink-soft">
                O horário fica reservado para você enquanto o estúdio analisa o pedido.
              </p>
            </form>
          )}

          {step === 'done' && service && receipt && (
            <div className="space-y-5 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-blush text-brand-dark">
                <CalendarCheck className="size-8" />
              </span>
              <p className="leading-relaxed text-ink-soft">
                Recebemos o seu pedido. Ele ainda <strong className="text-ink">não está confirmado</strong>: o estúdio
                vai analisar e confirmar com você pelo WhatsApp.
              </p>
              <div className="text-left">
                <Summary service={service} date={date} slot={receipt.starts_at} />
              </div>
              <Button
                href={whatsappUrl(
                  `Olá! Acabei de solicitar pelo site um horário para ${receipt.service_name} em ${date ? formatLongDate(date) : ''} às ${formatTime(receipt.starts_at)}. Meu nome é ${name.trim()}.`,
                )}
                variant="secondary"
                className="w-full"
                onClick={() => track('whatsapp_click', { placement: 'agendamento-concluido' })}
              >
                <WhatsAppIcon className="size-5" /> Avisar o estúdio pelo WhatsApp
              </Button>
              <Button className="w-full" onClick={() => dialogRef.current?.close()}>
                Concluir
              </Button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
