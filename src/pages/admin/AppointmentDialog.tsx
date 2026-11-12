import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/icons'
import { dateOfInstant, formatLongDate, formatTime, studioToIso } from '@/lib/datetime'
import { formatPrice } from '@/lib/format'
import type { AppointmentStatus } from '@/types'
import { addPayment, errorMessage, holdExpired, isPaid, paidCents, updateAppointment, type Appointment } from './api'
import { ErrorBox, Field, inputClass, Modal, StatusBadge } from './ui'

const paymentMethods = [
  ['pix', 'Pix'],
  ['dinheiro', 'Dinheiro'],
  ['credito', 'Cartão de crédito'],
  ['debito', 'Cartão de débito'],
  ['outro', 'Outro'],
] as const

interface Props {
  appointment: Appointment
  onClose: () => void
  /** Chamado depois de qualquer alteração, para a tela de origem recarregar. */
  onChanged: () => void
}

/** Detalhes de um agendamento: confirmar, recusar, cancelar, reagendar, concluir e registrar pagamento. */
export function AppointmentDialog({ appointment: a, onClose, onChanged }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rescheduling, setRescheduling] = useState(false)
  const [date, setDate] = useState(dateOfInstant(a.starts_at))
  const [time, setTime] = useState(formatTime(a.starts_at))
  const [notes, setNotes] = useState(a.notes ?? '')
  const [amount, setAmount] = useState(a.price_cents !== null ? (a.price_cents / 100).toFixed(2).replace('.', ',') : '')
  const [method, setMethod] = useState<string>('pix')

  const run = async (action: () => Promise<void>, closeAfter = true) => {
    setBusy(true)
    setError(null)
    try {
      await action()
      onChanged()
      if (closeAfter) onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const setStatus = (status: AppointmentStatus) => run(() => updateAppointment(a.id, { status, hold_expires_at: null }))

  const reschedule = () =>
    run(async () => {
      const duration = new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()
      const startsAt = studioToIso(date, time)
      await updateAppointment(a.id, { starts_at: startsAt, ends_at: new Date(new Date(startsAt).getTime() + duration).toISOString() })
    })

  const registerPayment = () => {
    const cents = Math.round(Number(amount.replace(/\./g, '').replace(',', '.')) * 100)
    if (!Number.isFinite(cents) || cents <= 0) return setError('Informe o valor recebido.')
    run(() => addPayment(a.id, cents, method))
  }

  const active = a.status === 'pending' || a.status === 'confirmed'

  return (
    <Modal title="Agendamento" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-serif text-3xl">{a.client?.name ?? 'Cliente'}</p>
            <p className="text-sm text-ink-soft">
              {a.service_name}
              {a.price_cents !== null && ` · ${formatPrice(a.price_cents)}`}
            </p>
          </div>
          <StatusBadge status={a.status} suffix={holdExpired(a) ? ' · reserva vencida' : undefined} />
        </div>

        <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-blush p-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-ink-soft">Data</dt>
            <dd className="first-letter:uppercase">{formatLongDate(dateOfInstant(a.starts_at))}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-ink-soft">Horário</dt>
            <dd>
              {formatTime(a.starts_at)} – {formatTime(a.ends_at)} (
              {Math.round((new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000)} min)
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-ink-soft">Telefone</dt>
            <dd>
              {a.client ? (
                <a href={`https://wa.me/${a.client.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-dark underline">
                  <WhatsAppIcon className="size-4" /> +{a.client.whatsapp}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-ink-soft">Origem</dt>
            <dd>{a.source === 'site' ? 'Pedido pelo site' : 'Criado no painel'}</dd>
          </div>
        </dl>

        {error && <ErrorBox>{error}</ErrorBox>}

        {rescheduling ? (
          <div className="space-y-3 rounded-2xl border border-petal p-4">
            <p className="text-sm font-semibold">Reagendar para</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Horário">
                <input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRescheduling(false)}>
                Voltar
              </Button>
              <Button disabled={busy || !date || !time} onClick={reschedule}>
                Salvar novo horário
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            {active && (
              <Button variant="ghost" disabled={busy} onClick={() => setRescheduling(true)}>
                Reagendar
              </Button>
            )}
            {a.status === 'pending' && (
              <>
                <Button variant="secondary" disabled={busy} onClick={() => setStatus('declined')}>
                  Recusar
                </Button>
                <Button disabled={busy} onClick={() => setStatus('confirmed')}>
                  Confirmar
                </Button>
              </>
            )}
            {a.status === 'confirmed' && (
              <>
                <Button variant="ghost" disabled={busy} onClick={() => setStatus('cancelled')}>
                  Cancelar
                </Button>
                <Button variant="secondary" disabled={busy} onClick={() => setStatus('no_show')}>
                  Não compareceu
                </Button>
                <Button disabled={busy} onClick={() => setStatus('completed')}>
                  Marcar como realizado
                </Button>
              </>
            )}
          </div>
        )}

        {a.status === 'completed' && (
          <div className="rounded-2xl border border-petal p-4">
            <p className="text-sm font-semibold">Pagamento</p>
            {isPaid(a) ? (
              <p className="mt-1 text-sm text-emerald-800">
                Recebido: {formatPrice(paidCents(a))}
                {a.payments[0]?.method && ` (${paymentMethods.find(([key]) => key === a.payments[0].method)?.[1] ?? a.payments[0].method})`}
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Valor recebido (R$)">
                  <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Forma">
                  <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
                    {paymentMethods.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Button className="col-span-2" disabled={busy} onClick={registerPayment}>
                  Registrar pagamento
                </Button>
              </div>
            )}
          </div>
        )}

        <Field label="Observações internas (a cliente não vê)">
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} py-2`} />
        </Field>
        {notes !== (a.notes ?? '') && (
          <div className="flex justify-end">
            <Button variant="secondary" disabled={busy} onClick={() => run(() => updateAppointment(a.id, { notes: notes.trim() || null }), false)}>
              Salvar observações
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
