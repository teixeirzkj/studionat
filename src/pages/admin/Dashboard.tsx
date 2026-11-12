import { useState } from 'react'
import { CalendarCheck, CalendarDays, CalendarRange, CalendarX, Hourglass, Sun, Wallet } from 'lucide-react'
import {
  addDays,
  addMonths,
  dateOfInstant,
  formatLongDate,
  formatMonth,
  formatTime,
  monthStart,
  startOfDayIso,
  todayInStudio,
  weekStart,
} from '@/lib/datetime'
import { formatPrice } from '@/lib/format'
import { AGENDA_STATUSES, holdExpired, listAppointments, listPendingAppointments, useLoad, type Appointment } from './api'
import { AppointmentDialog } from './AppointmentDialog'
import { BarChart, Card, Empty, ErrorBox, Loading, PageHeader, Stat, StatusBadge } from './ui'

function AppointmentRow({ appointment: a, onOpen }: { appointment: Appointment; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-left transition hover:bg-blush"
      >
        <span>
          <span className="block font-medium">{a.client?.name ?? 'Cliente'}</span>
          <span className="text-sm text-ink-soft">{a.service_name}</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-ink-soft first-letter:uppercase sm:text-right">
            {formatLongDate(dateOfInstant(a.starts_at))}, {formatTime(a.starts_at)}
          </span>
          <StatusBadge status={a.status} suffix={holdExpired(a) ? ' · vencida' : undefined} />
        </span>
      </button>
    </li>
  )
}

export function Dashboard() {
  const today = todayInStudio()
  const month = monthStart(today)
  const nextMonth = addMonths(today, 1)
  const week = weekStart(today)
  const from = week < month ? week : month

  const range = useLoad(() => listAppointments(startOfDayIso(from), startOfDayIso(addMonths(today, 2))), [today])
  const pendingLoad = useLoad(listPendingAppointments, [])
  const [selected, setSelected] = useState<Appointment | null>(null)

  const reload = () => {
    range.reload()
    pendingLoad.reload()
  }

  if (range.error || pendingLoad.error) return <ErrorBox>{range.error ?? pendingLoad.error}</ErrorBox>
  if (!range.data || !pendingLoad.data) return <Loading />

  const all = range.data
  const dayOf = (a: Appointment) => dateOfInstant(a.starts_at)
  const onAgenda = all.filter((a) => AGENDA_STATUSES.includes(a.status))
  const inMonth = (a: Appointment) => dayOf(a) >= month && dayOf(a) < nextMonth

  const todayCount = onAgenda.filter((a) => dayOf(a) === today).length
  const weekCount = onAgenda.filter((a) => dayOf(a) >= week && dayOf(a) < addDays(week, 7)).length
  const monthCount = onAgenda.filter(inMonth).length
  const cancelled = all.filter((a) => inMonth(a) && (a.status === 'cancelled' || a.status === 'no_show')).length
  const now = new Date().toISOString()
  const upcoming = all.filter((a) => a.status === 'confirmed' && a.ends_at >= now)
  // Estimativa: soma dos preços de agendamentos confirmados e realizados no mês. Não é valor recebido.
  const estimated = all
    .filter((a) => inMonth(a) && (a.status === 'confirmed' || a.status === 'completed'))
    .reduce((sum, a) => sum + (a.price_cents ?? 0), 0)

  const daysInMonth = Math.round((Date.parse(nextMonth) - Date.parse(month)) / 86400000)
  const perDay = Array.from({ length: daysInMonth }, (_, i) => {
    const day = addDays(month, i)
    return { label: String(i + 1), value: onAgenda.filter((a) => dayOf(a) === day).length }
  })

  return (
    <>
      <PageHeader title="Dashboard" description={`Hoje é ${formatLongDate(today)}.`} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Hoje" value={todayCount} hint="agendamentos" icon={Sun} />
        <Stat label="Esta semana" value={weekCount} hint="agendamentos" icon={CalendarRange} />
        <Stat label="Este mês" value={monthCount} hint="agendamentos" icon={CalendarDays} />
        <Stat label="Pendentes" value={pendingLoad.data.length} hint="aguardando resposta" icon={Hourglass} tone="amber" />
        <Stat label="Confirmados" value={upcoming.length} hint="próximos atendimentos" icon={CalendarCheck} tone="emerald" />
        <Stat label="Cancelamentos" value={cancelled} hint="no mês, com faltas" icon={CalendarX} tone="slate" />
        <div className="col-span-2">
          <Stat
            label="Faturamento estimado do mês"
            value={formatPrice(estimated)}
            hint="Confirmados + realizados. Valores efetivamente recebidos ficam em Financeiro."
            icon={Wallet}
          />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-medium">Solicitações pendentes</h2>
        {pendingLoad.data.length === 0 ? (
          <Empty>Nenhuma solicitação aguardando resposta.</Empty>
        ) : (
          <Card className="p-0">
            <ul className="divide-y divide-petal/70">
              {pendingLoad.data.map((a) => (
                <AppointmentRow key={a.id} appointment={a} onOpen={() => setSelected(a)} />
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-medium">Próximos atendimentos</h2>
        {upcoming.length === 0 ? (
          <Empty>Nenhum atendimento confirmado.</Empty>
        ) : (
          <Card className="p-0">
            <ul className="divide-y divide-petal/70">
              {upcoming.slice(0, 8).map((a) => (
                <AppointmentRow key={a.id} appointment={a} onOpen={() => setSelected(a)} />
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-medium">Agendamentos por dia — {formatMonth(today)}</h2>
        <Card className="overflow-x-auto">
          <BarChart data={perDay} format={(v) => `${v} agendamento${v === 1 ? '' : 's'}`} />
        </Card>
      </section>

      {selected && <AppointmentDialog appointment={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </>
  )
}
