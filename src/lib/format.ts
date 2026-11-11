const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatPrice(cents: number | null) {
  return cents === null ? null : brl.format(cents / 100)
}

export function formatDuration(minutes: number | null) {
  if (minutes === null) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

export const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
