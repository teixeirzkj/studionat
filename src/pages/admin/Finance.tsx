import { useState } from 'react'
import { addDays, addMonths, dateOfInstant, formatMonth, monthStart, startOfDayIso, todayInStudio } from '@/lib/datetime'
import { formatPrice } from '@/lib/format'
import { db, isPaid, listAppointments, useLoad } from './api'
import { BarChart, Card, Empty, ErrorBox, inputClass, Loading, PageHeader, Stat } from './ui'

interface PaidRow {
  amount_cents: number
  paid_at: string
}

/** Pagamentos efetivamente recebidos (status 'paid') dentro do período. */
async function listReceived(from: string, to: string): Promise<PaidRow[]> {
  const { data, error } = await db()
    .from('payments')
    .select('amount_cents, paid_at')
    .eq('status', 'paid')
    .gte('paid_at', from)
    .lt('paid_at', to)
  if (error) throw error
  return data as PaidRow[]
}

export function Finance() {
  const [month, setMonth] = useState(monthStart(todayInStudio()))
  const next = addMonths(month, 1)
  const { data, error } = useLoad(
    async () => {
      const [appointments, received] = await Promise.all([
        listAppointments(startOfDayIso(month), startOfDayIso(next)),
        listReceived(startOfDayIso(month), startOfDayIso(next)),
      ])
      return { appointments, received }
    },
    [month],
  )

  const completed = data?.appointments.filter((a) => a.status === 'completed') ?? []
  const receivedTotal = data?.received.reduce((sum, p) => sum + p.amount_cents, 0) ?? 0
  const unpaid = completed.filter((a) => !isPaid(a))
  const unpaidTotal = unpaid.reduce((sum, a) => sum + (a.price_cents ?? 0), 0)
  // Agendamentos futuros confirmados: previsão, não receita.
  const forecast = (data?.appointments ?? []).filter((a) => a.status === 'confirmed').reduce((sum, a) => sum + (a.price_cents ?? 0), 0)

  const daysInMonth = Math.round((Date.parse(next) - Date.parse(month)) / 86400000)
  const perDay = Array.from({ length: daysInMonth }, (_, i) => {
    const day = addDays(month, i)
    return {
      label: String(i + 1),
      value: (data?.received ?? []).filter((p) => dateOfInstant(p.paid_at) === day).reduce((sum, p) => sum + p.amount_cents, 0),
    }
  })

  const byService = new Map<string, { count: number; cents: number }>()
  for (const a of completed) {
    const entry = byService.get(a.service_name) ?? { count: 0, cents: 0 }
    byService.set(a.service_name, { count: entry.count + 1, cents: entry.cents + (a.price_cents ?? 0) })
  }
  const topServices = [...byService.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8)

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Só entra como recebido o que foi registrado como pago."
        action={
          <input
            type="month"
            aria-label="Mês"
            value={month.slice(0, 7)}
            onChange={(e) => e.target.value && setMonth(`${e.target.value}-01`)}
            className={`${inputClass} w-44`}
          />
        }
      />

      {error && <ErrorBox>{error}</ErrorBox>}
      {!data && !error && <Loading />}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Atendimentos realizados" value={completed.length} hint={formatMonth(month)} />
            <Stat label="Valores recebidos" value={formatPrice(receivedTotal)} hint="pagamentos registrados no mês" />
            <Stat label="Pagamentos pendentes" value={formatPrice(unpaidTotal)} hint={`${unpaid.length} atendimento(s) realizado(s) sem pagamento`} />
            <Stat label="Previsto" value={formatPrice(forecast)} hint="confirmados ainda não realizados — não é receita" />
          </div>

          <section className="mt-10">
            <h2 className="mb-3 text-2xl font-medium">Recebido por dia — {formatMonth(month)}</h2>
            <Card>
              <BarChart data={perDay} format={(v) => formatPrice(v) ?? ''} />
            </Card>
          </section>

          <section className="mt-10">
            <h2 className="mb-3 text-2xl font-medium">Serviços mais realizados</h2>
            {topServices.length === 0 ? (
              <Empty>Nenhum atendimento realizado neste mês.</Empty>
            ) : (
              <Card className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-petal/70 text-left text-xs text-ink-soft">
                      <th className="px-4 py-2 font-semibold">Serviço</th>
                      <th className="px-4 py-2 text-right font-semibold">Atendimentos</th>
                      <th className="px-4 py-2 text-right font-semibold">Valor de tabela</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-petal/70">
                    {topServices.map(([name, entry]) => (
                      <tr key={name}>
                        <td className="px-4 py-2.5">{name}</td>
                        <td className="px-4 py-2.5 text-right">{entry.count}</td>
                        <td className="px-4 py-2.5 text-right">{formatPrice(entry.cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </section>
        </>
      )}
    </>
  )
}
