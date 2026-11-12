import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AppointmentStatus } from '@/types'

/**
 * Acesso ao banco usado pelo painel. Roda com a sessão da administradora:
 * quem autoriza cada leitura e escrita são as políticas de RLS do banco.
 */
export function db() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

export interface Payment {
  id: string
  amount_cents: number
  method: string | null
  status: 'pending' | 'paid' | 'refunded'
  paid_at: string | null
}

export interface Appointment {
  id: string
  client_id: string
  service_id: string | null
  service_name: string
  price_cents: number | null
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  hold_expires_at: string | null
  notes: string | null
  source: 'site' | 'admin'
  created_at: string
  client: { id: string; name: string; whatsapp: string } | null
  payments: Payment[]
}

const APPOINTMENT_COLUMNS =
  'id, client_id, service_id, service_name, price_cents, starts_at, ends_at, status, hold_expires_at, notes, source, created_at, client:clients(id, name, whatsapp), payments(id, amount_cents, method, status, paid_at)'

/** Agendamentos que começam em [from, to). */
export async function listAppointments(from: string, to: string): Promise<Appointment[]> {
  const { data, error } = await db()
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .gte('starts_at', from)
    .lt('starts_at', to)
    .order('starts_at')
  if (error) throw error
  return data as unknown as Appointment[]
}

export async function listPendingAppointments(): Promise<Appointment[]> {
  const { data, error } = await db()
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('status', 'pending')
    .order('starts_at')
  if (error) throw error
  return data as unknown as Appointment[]
}

export async function updateAppointment(
  id: string,
  patch: Partial<Pick<Appointment, 'status' | 'starts_at' | 'ends_at' | 'notes' | 'hold_expires_at'>>,
) {
  const { error } = await db().from('appointments').update(patch).eq('id', id)
  if (error) throw error
}

export async function addPayment(appointmentId: string, amountCents: number, method: string) {
  const { error } = await db().from('payments').insert({
    appointment_id: appointmentId,
    amount_cents: amountCents,
    method,
    status: 'paid',
    paid_at: new Date().toISOString(),
  })
  if (error) throw error
}

export const isPaid = (a: Appointment) => a.payments.some((p) => p.status === 'paid')
export const paidCents = (a: Appointment) =>
  a.payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0)

/** Um pedido pendente cuja reserva temporária do horário já venceu. */
export const holdExpired = (a: Appointment) =>
  a.status === 'pending' && a.hold_expires_at !== null && new Date(a.hold_expires_at) < new Date()

export const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Realizado',
  declined: 'Recusado',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
  expired: 'Expirado',
}

/** Status que ocupam espaço na agenda. */
export const AGENDA_STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'no_show']

export function errorMessage(error: unknown) {
  const message = (error as { message?: string } | null)?.message ?? ''
  if (message.includes('appointments_no_overlap')) return 'Esse horário já está ocupado por outro agendamento.'
  if (message.includes('row-level security') || message.includes('permission denied')) return 'Você não tem permissão para esta ação.'
  if (message.includes('Failed to fetch')) return 'Sem conexão. Verifique a internet e tente de novo.'
  return 'Não foi possível concluir a ação. Tente novamente.'
}

/** Carrega dados assíncronos com estados de carregamento e erro, e permite recarregar. */
export function useLoad<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setError(null)
    loader()
      .then((result) => !cancelled && setData(result))
      .catch((e) => !cancelled && setError(errorMessage(e)))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { data, error, loading: data === null && error === null, reload }
}
