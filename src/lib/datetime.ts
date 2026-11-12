/**
 * Datas e horas sempre no fuso do estúdio, independentemente do fuso do
 * aparelho de quem está acessando.
 */
export const STUDIO_TZ = 'America/Bahia'

const isoDate = new Intl.DateTimeFormat('en-CA', { timeZone: STUDIO_TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
const time = new Intl.DateTimeFormat('pt-BR', { timeZone: STUDIO_TZ, hour: '2-digit', minute: '2-digit' })
const hour = new Intl.DateTimeFormat('en-GB', { timeZone: STUDIO_TZ, hour: '2-digit', hourCycle: 'h23' })
const longDate = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })
const shortWeekday = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'short' })
const shortMonth = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'short' })

/** Um dia de calendário ("2026-11-17") como Date ao meio-dia UTC — seguro para formatar e somar dias. */
const noonUtc = (date: string) => new Date(`${date}T12:00:00Z`)

/** "2026-11-17" — o dia de hoje no estúdio. */
export const todayInStudio = () => isoDate.format(new Date())

/** Dia de calendário (no estúdio) de um instante ISO. */
export const dateOfInstant = (iso: string) => isoDate.format(new Date(iso))

export function addDays(date: string, days: number) {
  const d = noonUtc(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** 0 = domingo … 6 = sábado */
export const weekdayOf = (date: string) => noonUtc(date).getUTCDay()

/** "terça-feira, 17 de novembro" */
export const formatLongDate = (date: string) => longDate.format(noonUtc(date))

export const dayParts = (date: string) => ({
  weekday: shortWeekday.format(noonUtc(date)).replace('.', ''),
  day: noonUtc(date).getUTCDate(),
  month: shortMonth.format(noonUtc(date)).replace('.', ''),
})

/** "14:30" a partir de um instante ISO. */
export const formatTime = (iso: string) => time.format(new Date(iso))

/** Hora (0–23) no estúdio — usada para agrupar manhã / tarde / noite. */
export const hourOf = (iso: string) => Number(hour.format(new Date(iso)))

/** Minutos desde a meia-noite, no estúdio. */
export const minutesOfDay = (iso: string) => hourOf(iso) * 60 + Number(formatTime(iso).split(':')[1])

const wallClock = new Intl.DateTimeFormat('sv-SE', { timeZone: STUDIO_TZ, dateStyle: 'short', timeStyle: 'medium' })

/** Dia + hora do estúdio ("2026-11-17", "14:30") → instante ISO em UTC. */
export function studioToIso(date: string, time: string) {
  const guess = new Date(`${date}T${time.slice(0, 5)}:00Z`)
  const shown = new Date(`${wallClock.format(guess).replace(' ', 'T')}Z`)
  return new Date(guess.getTime() - (shown.getTime() - guess.getTime())).toISOString()
}

/** Início do dia (00:00 no estúdio) como instante ISO. */
export const startOfDayIso = (date: string) => studioToIso(date, '00:00')

/** Primeiro dia do mês de uma data. */
export const monthStart = (date: string) => `${date.slice(0, 7)}-01`

/** Primeiro dia do mês, `months` meses à frente (ou atrás, se negativo). */
export function addMonths(date: string, months: number) {
  const d = noonUtc(monthStart(date))
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString().slice(0, 10)
}

/** Domingo da semana de uma data. */
export const weekStart = (date: string) => addDays(date, -weekdayOf(date))

/** "17/11" */
export const formatShortDate = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`

/** "novembro de 2026" */
export const formatMonth = (date: string) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(noonUtc(date))
