import { useEffect, useRef, type ComponentType, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/format'
import type { AppointmentStatus } from '@/types'
import { statusLabels } from './api'

/** Peças visuais compartilhadas pelas telas do painel. */

export const inputClass =
  'min-h-11 w-full rounded-xl border border-petal bg-white px-3 text-sm outline-none focus:border-brand-dark disabled:bg-blush'

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-xs font-semibold text-ink-soft">{label}</span>
      {children}
    </label>
  )
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7 sm:gap-4">
      <div>
        <h1 className="text-3xl font-medium sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-petal/70 bg-white p-4 sm:p-5', className)}>{children}</div>
}

const statTones = {
  rose: 'bg-petal/70 text-brand-dark',
  amber: 'bg-amber-100 text-amber-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  slate: 'bg-slate-100 text-slate-700',
}

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'rose',
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ComponentType<{ className?: string }>
  tone?: keyof typeof statTones
}) {
  return (
    <Card className="flex items-start justify-between gap-3 shadow-[0_8px_30px_-22px_rgb(157_66_106/0.5)]">
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold tracking-wide text-ink-soft uppercase sm:text-xs">{label}</p>
        <p className="mt-1 font-serif text-3xl text-ink sm:text-4xl">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      </div>
      {Icon && (
        <span className={cn('hidden size-10 shrink-0 place-items-center rounded-xl min-[400px]:grid', statTones[tone])}>
          <Icon className="size-5" />
        </span>
      )}
    </Card>
  )
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </p>
  )
}

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-8 text-sm text-ink-soft">
      <span className="size-5 animate-spin rounded-full border-2 border-petal border-t-brand-dark" />
      {label}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-petal px-5 py-8 text-center text-sm text-ink-soft">{children}</p>
}

const statusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  confirmed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  completed: 'bg-slate-200 text-slate-800 border-slate-300',
  no_show: 'bg-red-100 text-red-900 border-red-300',
  declined: 'bg-stone-100 text-stone-600 border-stone-300',
  cancelled: 'bg-stone-100 text-stone-600 border-stone-300',
  expired: 'bg-stone-100 text-stone-600 border-stone-300',
}

export const statusColor = (status: AppointmentStatus) => statusColors[status]

export function StatusBadge({ status, suffix }: { status: AppointmentStatus; suffix?: string }) {
  return (
    <span className={cn('inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', statusColors[status])}>
      {statusLabels[status]}
      {suffix}
    </span>
  )
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className={cn(
        'm-auto max-h-[92dvh] w-[calc(100vw-1.5rem)] rounded-3xl bg-white p-0 text-ink backdrop:bg-ink/60',
        wide ? 'max-w-2xl' : 'max-w-lg',
      )}
    >
      <div className="flex max-h-[92dvh] flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-petal/70 py-2 pr-2 pl-4 sm:py-3 sm:pr-3 sm:pl-6">
          <h2 className="text-2xl font-medium">{title}</h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Fechar"
            className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-blush"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </dialog>
  )
}

/** Gráfico de barras simples (uma série), com os valores acessíveis em texto. */
export function BarChart({ data, format = String }: { data: { label: string; value: number }[]; format?: (value: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul className="flex h-44 items-end gap-1" aria-label="Gráfico de barras">
      {data.map((d, i) => (
        <li key={i} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end" title={`${d.label}: ${format(d.value)}`}>
          <span className="sr-only">
            {d.label}: {format(d.value)}
          </span>
          <span
            aria-hidden="true"
            className={cn('w-full rounded-t-md transition-colors', d.value > 0 ? 'bg-brand group-hover:bg-brand-dark' : 'bg-petal/60')}
            style={{ height: d.value > 0 ? `${Math.max(4, (d.value / max) * 100)}%` : '2px' }}
          />
          <span aria-hidden="true" className="mt-1 truncate text-center text-[0.65rem] text-ink-soft">
            {d.label}
          </span>
        </li>
      ))}
    </ul>
  )
}
