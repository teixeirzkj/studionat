import { useState } from 'react'
import { addDays, dateOfInstant, formatShortDate, formatTime, startOfDayIso, todayInStudio } from '@/lib/datetime'
import { cn, formatPrice } from '@/lib/format'
import type { AppointmentStatus } from '@/types'
import { holdExpired, isPaid, listAppointments, useLoad, type Appointment } from './api'
import { AppointmentDialog } from './AppointmentDialog'
import { Card, Empty, ErrorBox, Field, inputClass, Loading, PageHeader, StatusBadge } from './ui'

const filters: { key: string; label: string; statuses: AppointmentStatus[] | null }[] = [
  { key: 'all', label: 'Todos', statuses: null },
  { key: 'pending', label: 'Pendentes', statuses: ['pending'] },
  { key: 'confirmed', label: 'Confirmados', statuses: ['confirmed'] },
  { key: 'completed', label: 'Realizados', statuses: ['completed'] },
  { key: 'lost', label: 'Cancelados e faltas', statuses: ['cancelled', 'declined', 'no_show', 'expired'] },
]

/** Lista de agendamentos com filtro por período, status e busca por cliente. */
export function Appointments() {
  const today = todayInStudio()
  const [from, setFrom] = useState(addDays(today, -30))
  const [to, setTo] = useState(addDays(today, 60))
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Appointment | null>(null)

  const valid = Boolean(from && to && from <= to)
  const { data, error, reload } = useLoad(
    () => (valid ? listAppointments(startOfDayIso(from), startOfDayIso(addDays(to, 1))) : Promise.resolve([])),
    [from, to],
  )

  const statuses = filters.find((f) => f.key === filter)?.statuses
  const term = query.trim().toLowerCase()
  const rows = (data ?? []).filter(
    (a) =>
      (!statuses || statuses.includes(a.status)) &&
      (!term || a.client?.name.toLowerCase().includes(term) || a.service_name.toLowerCase().includes(term)),
  )
  const count = (keys: AppointmentStatus[] | null) => (data ?? []).filter((a) => !keys || keys.includes(a.status)).length

  return (
    <>
      <PageHeader title="Agendamentos" description="Todos os pedidos e atendimentos do período." />

      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[10rem_10rem_1fr]">
          <Field label="De">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Até">
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Buscar" className="col-span-2 sm:col-span-1">
            <input type="search" placeholder="Cliente ou serviço" value={query} onChange={(e) => setQuery(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div role="group" aria-label="Filtrar por situação" className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'min-h-9 cursor-pointer rounded-full px-4 text-sm transition',
                filter === f.key ? 'bg-brand-dark text-white' : 'bg-blush text-ink-soft hover:text-ink',
              )}
            >
              {f.label} <span className="opacity-70">{count(f.statuses)}</span>
            </button>
          ))}
        </div>
      </Card>

      {!valid && <ErrorBox>A data inicial precisa ser anterior à final.</ErrorBox>}
      {error && <ErrorBox>{error}</ErrorBox>}
      {!data && !error && <Loading />}
      {data && rows.length === 0 && valid && <Empty>Nenhum agendamento encontrado com esses filtros.</Empty>}

      {/* Celular: cartões empilhados */}
      {rows.length > 0 && (
        <ul className="space-y-2 sm:hidden">
          {rows.map((a) => {
            const day = dateOfInstant(a.starts_at)
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelected(a)}
                  className="w-full cursor-pointer rounded-2xl border border-petal/70 bg-white p-3.5 text-left"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-brand-dark">
                      {formatShortDate(day)}/{day.slice(2, 4)} · {formatTime(a.starts_at)}
                    </span>
                    <StatusBadge status={a.status} suffix={holdExpired(a) ? ' · vencida' : undefined} />
                  </span>
                  <span className="mt-1 block font-medium">{a.client?.name ?? '—'}</span>
                  <span className="flex items-end justify-between gap-2 text-sm text-ink-soft">
                    <span>{a.service_name}</span>
                    <span className="shrink-0 text-right text-ink">
                      {formatPrice(a.price_cents) ?? '—'}
                      {a.status === 'completed' && (
                        <span className={cn('ml-1.5 text-xs', isPaid(a) ? 'text-emerald-700' : 'text-amber-700')}>{isPaid(a) ? 'pago' : 'a receber'}</span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Telas maiores: tabela */}
      {rows.length > 0 && (
        <Card className="hidden overflow-x-auto p-0 sm:block">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-petal/70 text-left text-xs text-ink-soft">
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Serviço</th>
                <th className="px-4 py-3 text-right font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-petal/60">
              {rows.map((a) => {
                const day = dateOfInstant(a.starts_at)
                return (
                  <tr key={a.id} onClick={() => setSelected(a)} className="cursor-pointer hover:bg-blush">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button type="button" className="cursor-pointer text-left font-medium" aria-label={`Abrir agendamento de ${a.client?.name ?? 'cliente'}`}>
                        {formatShortDate(day)}/{day.slice(2, 4)} · {formatTime(a.starts_at)}
                      </button>
                    </td>
                    <td className="px-4 py-3">{a.client?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft">{a.service_name}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {formatPrice(a.price_cents) ?? '—'}
                      {a.status === 'completed' && (
                        <span className={cn('block text-xs', isPaid(a) ? 'text-emerald-700' : 'text-amber-700')}>{isPaid(a) ? 'pago' : 'a receber'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} suffix={holdExpired(a) ? ' · vencida' : undefined} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {selected && <AppointmentDialog appointment={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </>
  )
}
