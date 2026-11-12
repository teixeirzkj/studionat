import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  addDays,
  addMonths,
  dateOfInstant,
  dayParts,
  formatLongDate,
  formatMonth,
  formatShortDate,
  formatTime,
  minutesOfDay,
  monthStart,
  startOfDayIso,
  todayInStudio,
  weekStart,
} from '@/lib/datetime'
import { cn } from '@/lib/format'
import { AGENDA_STATUSES, listAppointments, useLoad, type Appointment } from './api'
import { AppointmentDialog } from './AppointmentDialog'
import { ErrorBox, Loading, PageHeader, statusColor } from './ui'

type View = 'day' | 'week' | 'month'
const views: [View, string][] = [
  ['day', 'Dia'],
  ['week', 'Semana'],
  ['month', 'Mês'],
]

const FIRST_HOUR = 7
const LAST_HOUR = 21
const HOUR_PX = 60

/** Grade de horários usada nas visões de dia (1 coluna) e semana (7 colunas). */
function TimeGrid({
  days,
  items,
  onOpen,
  onDay,
}: {
  days: string[]
  items: Appointment[]
  onOpen: (a: Appointment) => void
  onDay: (day: string) => void
}) {
  const today = todayInStudio()
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i)
  const columns = `3rem repeat(${days.length}, minmax(${days.length > 1 ? '7.5rem' : '0'}, 1fr))`

  return (
    <div className="overflow-x-auto rounded-2xl border border-petal/70 bg-white">
      <div className="grid min-w-full" style={{ gridTemplateColumns: columns }}>
        <div className="border-b border-petal/70" />
        {days.map((day) => {
          const parts = dayParts(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => onDay(day)}
              aria-label={formatLongDate(day)}
              className={cn(
                'cursor-pointer border-b border-l border-petal/70 py-2 text-center text-sm hover:bg-blush',
                day === today && 'bg-blush font-semibold text-brand-dark',
              )}
            >
              <span className="capitalize">{parts.weekday}</span> {parts.day}
            </button>
          )
        })}

        <div className="relative" style={{ height: hours.length * HOUR_PX }}>
          {hours.map((h, i) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 text-xs text-ink-soft" style={{ top: i * HOUR_PX }}>
              {i > 0 && `${String(h).padStart(2, '0')}:00`}
            </span>
          ))}
        </div>

        {days.map((day) => (
          <div key={day} className="relative border-l border-petal/70" style={{ height: hours.length * HOUR_PX }}>
            {hours.map((h, i) => (
              <span key={h} aria-hidden="true" className="absolute inset-x-0 border-t border-petal/40" style={{ top: i * HOUR_PX }} />
            ))}
            {items
              .filter((a) => dateOfInstant(a.starts_at) === day)
              .map((a) => {
                const start = minutesOfDay(a.starts_at)
                const duration = (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000
                const top = ((start - FIRST_HOUR * 60) / 60) * HOUR_PX
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onOpen(a)}
                    title={`${formatTime(a.starts_at)}–${formatTime(a.ends_at)} · ${a.client?.name ?? ''} · ${a.service_name}`}
                    className={cn(
                      'absolute inset-x-1 cursor-pointer overflow-hidden rounded-lg border px-1.5 text-left text-xs leading-tight hover:brightness-95',
                      statusColor(a.status),
                    )}
                    style={{ top: Math.max(0, top), height: Math.max(20, (duration / 60) * HOUR_PX - 2) }}
                  >
                    <span className="font-semibold">{formatTime(a.starts_at)}</span> {a.client?.name ?? 'Cliente'}
                    <span className="block truncate opacity-80">{a.service_name}</span>
                  </button>
                )
              })}
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthGrid({ anchor, items, onDay }: { anchor: string; items: Appointment[]; onDay: (day: string) => void }) {
  const today = todayInStudio()
  const first = monthStart(anchor)
  const gridStart = weekStart(first)
  const weeks = Math.ceil((Math.round((Date.parse(addMonths(anchor, 1)) - Date.parse(gridStart)) / 86400000)) / 7)
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i))

  return (
    <div className="overflow-hidden rounded-2xl border border-petal/70 bg-white">
      <div className="grid grid-cols-7 border-b border-petal/70 text-center text-xs font-semibold text-ink-soft">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <span key={d} className="py-2">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayItems = items.filter((a) => dateOfInstant(a.starts_at) === day)
          const outside = day.slice(0, 7) !== first.slice(0, 7)
          return (
            <button
              key={day}
              type="button"
              onClick={() => onDay(day)}
              aria-label={`${formatLongDate(day)}: ${dayItems.length} agendamento(s)`}
              className={cn(
                'flex min-h-20 cursor-pointer flex-col gap-0.5 border-t border-l border-petal/50 p-1 text-left hover:bg-blush sm:min-h-28',
                outside && 'bg-stone-50 text-ink-soft/60',
              )}
            >
              <span className={cn('grid size-6 place-items-center rounded-full text-xs', day === today && 'bg-brand-dark font-semibold text-white')}>
                {Number(day.slice(8))}
              </span>
              {dayItems.slice(0, 3).map((a) => (
                <span key={a.id} className={cn('hidden truncate rounded border px-1 text-[0.68rem] sm:block', statusColor(a.status))}>
                  {formatTime(a.starts_at)} {a.client?.name}
                </span>
              ))}
              {dayItems.length > 3 && <span className="hidden text-[0.68rem] text-ink-soft sm:block">+{dayItems.length - 3}</span>}
              {dayItems.length > 0 && (
                <span className="rounded-full bg-petal px-1.5 text-[0.68rem] font-semibold text-brand-dark sm:hidden">{dayItems.length}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Agenda() {
  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState(todayInStudio())
  const [selected, setSelected] = useState<Appointment | null>(null)

  const from = view === 'day' ? anchor : view === 'week' ? weekStart(anchor) : weekStart(monthStart(anchor))
  const to = view === 'day' ? addDays(anchor, 1) : view === 'week' ? addDays(from, 7) : addDays(addMonths(anchor, 1), 7)
  const { data, error, reload } = useLoad(() => listAppointments(startOfDayIso(from), startOfDayIso(to)), [from, to])
  const items = (data ?? []).filter((a) => AGENDA_STATUSES.includes(a.status))

  const step = (direction: 1 | -1) =>
    setAnchor(view === 'day' ? addDays(anchor, direction) : view === 'week' ? addDays(anchor, 7 * direction) : addMonths(anchor, direction))
  const openDay = (day: string) => {
    setAnchor(day)
    setView('day')
  }

  const title =
    view === 'day'
      ? formatLongDate(anchor)
      : view === 'week'
        ? `${formatShortDate(from)} a ${formatShortDate(addDays(from, 6))}`
        : formatMonth(anchor)

  return (
    <>
      <PageHeader title="Agenda" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => step(-1)} aria-label="Anterior" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-white">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Próximo" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-white">
            <ChevronRight className="size-5" />
          </button>
          <Button variant="secondary" onClick={() => setAnchor(todayInStudio())}>
            Hoje
          </Button>
          <p className="ml-2 font-serif text-2xl first-letter:uppercase">{title}</p>
        </div>
        <div role="group" aria-label="Visualização" className="flex rounded-full bg-white p-1">
          {views.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={cn('min-h-9 cursor-pointer rounded-full px-4 text-sm', view === key ? 'bg-brand-dark text-white' : 'text-ink-soft hover:text-ink')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}
      {!data && !error && <Loading />}
      {data && view === 'day' && <TimeGrid days={[anchor]} items={items} onOpen={setSelected} onDay={openDay} />}
      {data && view === 'week' && (
        <TimeGrid days={Array.from({ length: 7 }, (_, i) => addDays(from, i))} items={items} onOpen={setSelected} onDay={openDay} />
      )}
      {data && view === 'month' && <MonthGrid anchor={anchor} items={items} onDay={openDay} />}

      {selected && <AppointmentDialog appointment={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </>
  )
}
