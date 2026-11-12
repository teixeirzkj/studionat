import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/icons'
import { dateOfInstant, formatLongDate, formatTime } from '@/lib/datetime'
import { cn, formatPrice } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { AppointmentStatus } from '@/types'

interface Row {
  id: string
  service_name: string
  price_cents: number | null
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  hold_expires_at: string | null
  client: { name: string; whatsapp: string } | null
}

const statusLabel: Partial<Record<AppointmentStatus, string>> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
}

function AppointmentCard({ row, busy, onChange }: { row: Row; busy: boolean; onChange: (status: AppointmentStatus) => void }) {
  const holdExpired = row.status === 'pending' && row.hold_expires_at !== null && new Date(row.hold_expires_at) < new Date()

  return (
    <li className="rounded-3xl bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-dark first-letter:uppercase">
            {formatLongDate(dateOfInstant(row.starts_at))} · {formatTime(row.starts_at)}–{formatTime(row.ends_at)}
          </p>
          <p className="mt-1 font-serif text-2xl">{row.client?.name ?? 'Cliente'}</p>
          <p className="text-sm text-ink-soft">
            {row.service_name}
            {row.price_cents !== null && ` · ${formatPrice(row.price_cents)}`}
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            row.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800',
          )}
        >
          {statusLabel[row.status]}
          {holdExpired && ' · reserva vencida'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {row.client && (
          <Button href={`https://wa.me/${row.client.whatsapp}`} variant="ghost">
            <WhatsAppIcon className="size-4" /> WhatsApp
          </Button>
        )}
        <span className="flex-1" />
        {row.status === 'pending' ? (
          <>
            <Button variant="secondary" disabled={busy} onClick={() => onChange('declined')}>
              Recusar
            </Button>
            <Button disabled={busy} onClick={() => onChange('confirmed')}>
              Confirmar
            </Button>
          </>
        ) : (
          <Button variant="secondary" disabled={busy} onClick={() => onChange('cancelled')}>
            Cancelar
          </Button>
        )}
      </div>
    </li>
  )
}

/** Solicitações pendentes e próximos atendimentos — base do painel da Etapa 4. */
export function Requests() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error: loadError } = await supabase
      .from('appointments')
      .select('id, service_name, price_cents, starts_at, ends_at, status, hold_expires_at, client:clients(name, whatsapp)')
      .in('status', ['pending', 'confirmed'])
      .gte('ends_at', new Date().toISOString())
      .order('starts_at')
    if (loadError) return setError('Não foi possível carregar os agendamentos.')
    setRows(data as unknown as Row[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const change = async (row: Row, status: AppointmentStatus) => {
    if (!supabase) return
    setBusyId(row.id)
    setError(null)
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status, hold_expires_at: null })
      .eq('id', row.id)
    setBusyId(null)
    if (updateError) {
      setError(
        updateError.message.includes('appointments_no_overlap')
          ? 'Esse horário já está ocupado por outro agendamento.'
          : 'Não foi possível atualizar o agendamento.',
      )
    }
    load()
  }

  const pending = rows?.filter((r) => r.status === 'pending') ?? []
  const confirmed = rows?.filter((r) => r.status === 'confirmed') ?? []

  return (
    <div className="space-y-10">
      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {rows === null && !error && <p role="status" className="text-ink-soft">Carregando…</p>}

      {rows !== null && (
        <>
          <section>
            <h2 className="mb-4 text-3xl font-medium">Solicitações pendentes ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-ink-soft">Nenhuma solicitação aguardando resposta.</p>
            ) : (
              <ul className="space-y-4">
                {pending.map((row) => (
                  <AppointmentCard key={row.id} row={row} busy={busyId === row.id} onChange={(s) => change(row, s)} />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-3xl font-medium">Próximos atendimentos ({confirmed.length})</h2>
            {confirmed.length === 0 ? (
              <p className="text-ink-soft">Nenhum atendimento confirmado.</p>
            ) : (
              <ul className="space-y-4">
                {confirmed.map((row) => (
                  <AppointmentCard key={row.id} row={row} busy={busyId === row.id} onChange={(s) => change(row, s)} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
