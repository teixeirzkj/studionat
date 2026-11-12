import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { dateOfInstant, formatShortDate, formatTime, studioToIso, todayInStudio } from '@/lib/datetime'
import { weekdayNames } from '@/lib/format'
import { db, errorMessage, useLoad } from './api'
import { Card, Empty, ErrorBox, Field, inputClass, Loading, PageHeader } from './ui'

/* ------------------------------------------------------------------ */
/* Expediente semanal                                                  */
/* ------------------------------------------------------------------ */
interface Period {
  weekday: number
  opens_at: string
  closes_at: string
}

const weekOrder = [1, 2, 3, 4, 5, 6, 0]

function WeeklyHours() {
  const load = useLoad(async () => {
    const { data, error } = await db().from('business_hours').select('weekday, opens_at, closes_at').order('opens_at')
    if (error) throw error
    return (data as Period[]).map((p) => ({ ...p, opens_at: p.opens_at.slice(0, 5), closes_at: p.closes_at.slice(0, 5) }))
  }, [])
  const [periods, setPeriods] = useState<Period[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (load.data) setPeriods(load.data)
  }, [load.data])

  if (load.error) return <ErrorBox>{load.error}</ErrorBox>
  if (!periods) return <Loading />

  const update = (index: number, patch: Partial<Period>) => setPeriods(periods.map((p, i) => (i === index ? { ...p, ...patch } : p)))

  const save = async () => {
    for (const day of weekOrder) {
      const sorted = periods.filter((p) => p.weekday === day).sort((a, b) => a.opens_at.localeCompare(b.opens_at))
      for (let i = 0; i < sorted.length; i++) {
        if (!sorted[i].opens_at || !sorted[i].closes_at || sorted[i].closes_at <= sorted[i].opens_at)
          return setMessage({ ok: false, text: `${weekdayNames[day]}: o fechamento precisa ser depois da abertura.` })
        if (i > 0 && sorted[i].opens_at < sorted[i - 1].closes_at)
          return setMessage({ ok: false, text: `${weekdayNames[day]}: os períodos estão sobrepostos.` })
      }
    }
    setBusy(true)
    setMessage(null)
    // Troca o expediente inteiro em uma única transação no banco (ou grava tudo, ou nada).
    const { error } = await db().rpc('replace_business_hours', { p_periods: periods })
    setBusy(false)
    setMessage(error ? { ok: false, text: errorMessage(error) } : { ok: true, text: 'Expediente salvo. O site já usa os novos horários.' })
    load.reload()
  }

  return (
    <Card>
      <ul className="divide-y divide-petal/70">
        {weekOrder.map((day) => {
          const dayPeriods = periods.map((p, index) => ({ ...p, index })).filter((p) => p.weekday === day)
          return (
            <li key={day} className="flex flex-wrap items-start gap-x-4 gap-y-2 py-3">
              <span className="w-24 pt-2.5 text-sm font-semibold">{weekdayNames[day]}</span>
              <div className="flex-1 space-y-2">
                {dayPeriods.length === 0 && <p className="pt-2.5 text-sm text-ink-soft">Fechado</p>}
                {dayPeriods.map((p) => (
                  <div key={p.index} className="flex items-center gap-2">
                    <input type="time" aria-label={`${weekdayNames[day]}: abertura`} value={p.opens_at} onChange={(e) => update(p.index, { opens_at: e.target.value })} className={`${inputClass} w-32`} />
                    <span className="text-sm text-ink-soft">até</span>
                    <input type="time" aria-label={`${weekdayNames[day]}: fechamento`} value={p.closes_at} onChange={(e) => update(p.index, { closes_at: e.target.value })} className={`${inputClass} w-32`} />
                    <button
                      type="button"
                      aria-label="Remover período"
                      onClick={() => setPeriods(periods.filter((_, i) => i !== p.index))}
                      className="grid size-11 cursor-pointer place-items-center rounded-full text-ink-soft hover:bg-blush hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setPeriods([...periods, { weekday: day, opens_at: '08:00', closes_at: '12:00' }])}>
                <Plus className="size-4" /> Período
              </Button>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-soft">Dois períodos no mesmo dia criam um intervalo entre eles (por exemplo, o almoço).</p>
      {message && <p className={`mt-3 rounded-xl px-4 py-3 text-sm ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`} role={message.ok ? 'status' : 'alert'}>{message.text}</p>}
      <div className="mt-4 flex justify-end">
        <Button disabled={busy} onClick={save}>
          {busy ? 'Salvando…' : 'Salvar expediente'}
        </Button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Folgas, feriados e bloqueios                                        */
/* ------------------------------------------------------------------ */
interface Block {
  id: string
  kind: 'folga' | 'feriado' | 'bloqueio'
  starts_at: string
  ends_at: string
  reason: string | null
}

const kindLabels = { folga: 'Folga', feriado: 'Feriado', bloqueio: 'Bloqueio' } as const

function Blocks() {
  const { data, error, reload } = useLoad(async () => {
    const { data: rows, error: loadError } = await db().from('schedule_blocks').select('*').gte('ends_at', new Date().toISOString()).order('starts_at')
    if (loadError) throw loadError
    return rows as Block[]
  }, [])
  const today = todayInStudio()
  const [form, setForm] = useState({ kind: 'folga' as Block['kind'], fromDate: today, fromTime: '00:00', toDate: today, toTime: '23:59', reason: '' })
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const add = async () => {
    const startsAt = studioToIso(form.fromDate, form.fromTime)
    const endsAt = studioToIso(form.toDate, form.toTime)
    if (!form.fromDate || !form.toDate || endsAt <= startsAt) return setFormError('O fim precisa ser depois do início.')
    setBusy(true)
    setFormError(null)
    const { error: insertError } = await db().from('schedule_blocks').insert({ kind: form.kind, starts_at: startsAt, ends_at: endsAt, reason: form.reason.trim() || null })
    setBusy(false)
    if (insertError) return setFormError(errorMessage(insertError))
    setForm({ ...form, reason: '' })
    reload()
  }

  const remove = async (id: string) => {
    await db().from('schedule_blocks').delete().eq('id', id)
    reload()
  }

  const describe = (b: Block) => {
    const from = dateOfInstant(b.starts_at)
    const to = dateOfInstant(b.ends_at)
    return from === to
      ? `${formatShortDate(from)}, ${formatTime(b.starts_at)} às ${formatTime(b.ends_at)}`
      : `${formatShortDate(from)} ${formatTime(b.starts_at)} até ${formatShortDate(to)} ${formatTime(b.ends_at)}`
  }

  return (
    <Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <Field label="Tipo" className="col-span-2">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Block['kind'] })} className={inputClass}>
            {Object.entries(kindLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Início" className="sm:col-span-2">
          <input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value, toDate: e.target.value > form.toDate ? e.target.value : form.toDate })} className={inputClass} />
        </Field>
        <Field label="Hora" className="sm:col-span-2">
          <input type="time" value={form.fromTime} onChange={(e) => setForm({ ...form, fromTime: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Motivo (opcional)" className="col-span-2">
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} maxLength={120} className={inputClass} />
        </Field>
        <Field label="Fim" className="sm:col-span-2">
          <input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Hora" className="sm:col-span-2">
          <input type="time" value={form.toTime} onChange={(e) => setForm({ ...form, toTime: e.target.value })} className={inputClass} />
        </Field>
      </div>
      {formError && <div className="mt-3"><ErrorBox>{formError}</ErrorBox></div>}
      <div className="mt-4 flex justify-end">
        <Button disabled={busy} onClick={add}>
          Adicionar bloqueio
        </Button>
      </div>

      <div className="mt-6">
        {error && <ErrorBox>{error}</ErrorBox>}
        {!data && !error && <Loading />}
        {data?.length === 0 && <Empty>Nenhuma folga, feriado ou bloqueio à frente.</Empty>}
        {data && data.length > 0 && (
          <ul className="divide-y divide-petal/70 rounded-xl border border-petal/70 text-sm">
            {data.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-1 pr-1 pl-4">
                <span>
                  <strong>{kindLabels[b.kind]}</strong> · {describe(b)}
                  {b.reason && <span className="text-ink-soft"> · {b.reason}</span>}
                </span>
                <button type="button" aria-label="Remover bloqueio" onClick={() => remove(b.id)} className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink-soft hover:bg-blush hover:text-red-700">
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Regras de agendamento                                               */
/* ------------------------------------------------------------------ */
const rules = [
  ['pending_hold_minutes', 'Reserva de um pedido pendente (minutos)', 'Por quanto tempo o horário fica guardado enquanto você não responde.'],
  ['min_notice_minutes', 'Antecedência mínima (minutos)', 'Quanto tempo antes a cliente precisa pedir.'],
  ['slot_interval_minutes', 'Intervalo entre horários (minutos)', 'De quanto em quanto tempo o site oferece horários.'],
  ['max_advance_days', 'Agenda aberta até (dias)', 'Quantos dias à frente o site aceita pedidos.'],
] as const

export function BookingRules() {
  const load = useLoad(async () => {
    const { data, error } = await db().from('settings').select('key, value').in('key', rules.map(([key]) => key))
    if (error) throw error
    return Object.fromEntries((data as { key: string; value: unknown }[]).map((s) => [s.key, String(s.value)]))
  }, [])
  const [values, setValues] = useState<Record<string, string> | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (load.data) setValues(load.data)
  }, [load.data])

  if (load.error) return <ErrorBox>{load.error}</ErrorBox>
  if (!values) return <Loading />

  const save = async () => {
    const parsed = rules.map(([key]) => [key, Number(values[key])] as const)
    if (parsed.some(([, n]) => !Number.isInteger(n) || n < 1)) return setMessage({ ok: false, text: 'Use números inteiros maiores que zero.' })
    setBusy(true)
    const results = await Promise.all(parsed.map(([key, n]) => db().from('settings').update({ value: n }).eq('key', key)))
    setBusy(false)
    const failed = results.find((r) => r.error)
    setMessage(failed ? { ok: false, text: errorMessage(failed.error) } : { ok: true, text: 'Regras salvas.' })
  }

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {rules.map(([key, label, hint]) => (
          <Field key={key} label={label}>
            <input type="number" min={1} value={values[key] ?? ''} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className={inputClass} />
            <span className="mt-1 block text-xs text-ink-soft">{hint}</span>
          </Field>
        ))}
      </div>
      {message && <p className={`mt-3 rounded-xl px-4 py-3 text-sm ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`} role={message.ok ? 'status' : 'alert'}>{message.text}</p>}
      <div className="mt-4 flex justify-end">
        <Button disabled={busy} onClick={save}>
          Salvar regras
        </Button>
      </div>
    </Card>
  )
}

export function Hours() {
  return (
    <>
      <PageHeader title="Horários" description="Os horários livres do site são calculados a partir destas configurações." />
      <div className="space-y-10">
        <section>
          <h2 className="mb-3 text-2xl font-medium">Expediente semanal</h2>
          <WeeklyHours />
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-medium">Folgas, feriados e bloqueios</h2>
          <Blocks />
        </section>
      </div>
    </>
  )
}
