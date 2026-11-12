import { supabase } from '@/lib/supabase'
import type { Service, ServiceCategory } from '@/types'

/**
 * Acesso ao banco usado pelo site público. Tudo aqui roda com a chave pública:
 * só lê conteúdo publicado e chama as funções de agendamento, que validam
 * disponibilidade e dados no servidor.
 */

function client() {
  if (!supabase) throw new Error('Supabase não configurado')
  return supabase
}

interface ServiceRow {
  id: string
  name: string
  category: string
  description: string
  price_cents: number | null
  duration_minutes: number
  image_url: string | null
  active: boolean
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await client()
    .from('services')
    .select('id, name, category, description, price_cents, duration_minutes, image_url, active')
    .eq('active', true)
    .order('sort_order')
    .order('name')
  if (error) throw error
  return (data as ServiceRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as ServiceCategory,
    description: row.description,
    priceCents: row.price_cents,
    durationMinutes: row.duration_minutes,
    imageUrl: row.image_url,
    active: row.active,
  }))
}

export interface BookingConfig {
  /** Dias da semana com atendimento (0 = domingo). */
  openWeekdays: Set<number>
  maxAdvanceDays: number
}

export async function fetchBookingConfig(): Promise<BookingConfig> {
  const [hours, settings] = await Promise.all([
    client().from('business_hours').select('weekday'),
    client().from('settings').select('key, value').eq('key', 'max_advance_days'),
  ])
  if (hours.error) throw hours.error
  if (settings.error) throw settings.error
  const maxAdvance = Number(settings.data[0]?.value)
  return {
    openWeekdays: new Set((hours.data as { weekday: number }[]).map((h) => h.weekday)),
    maxAdvanceDays: Number.isFinite(maxAdvance) && maxAdvance > 0 ? maxAdvance : 60,
  }
}

/** Horários livres (instantes ISO) de um serviço em um dia "AAAA-MM-DD". */
export async function fetchAvailableSlots(serviceId: string, date: string): Promise<string[]> {
  const { data, error } = await client().rpc('get_available_slots', { p_service_id: serviceId, p_date: date })
  if (error) throw error
  return (data as { slot_start: string }[]).map((row) => row.slot_start)
}

export interface AppointmentRequest {
  serviceId: string
  startsAt: string
  name: string
  whatsapp: string
  whatsappOptIn: boolean
}

export interface AppointmentReceipt {
  id: string
  service_name: string
  starts_at: string
  ends_at: string
  status: 'pending'
}

export type BookingErrorCode =
  | 'SLOT_UNAVAILABLE'
  | 'INVALID_NAME'
  | 'INVALID_WHATSAPP'
  | 'SERVICE_NOT_FOUND'
  | 'TOO_MANY_PENDING'
  | 'RATE_LIMITED'
  | 'UNKNOWN'

const bookingErrorMessages: Record<BookingErrorCode, string> = {
  SLOT_UNAVAILABLE: 'Esse horário acabou de ser reservado. Escolha outro horário, por favor.',
  INVALID_NAME: 'Informe o seu nome.',
  INVALID_WHATSAPP: 'Confira o número de WhatsApp: use DDD + número.',
  SERVICE_NOT_FOUND: 'Esse procedimento não está mais disponível. Escolha outro, por favor.',
  TOO_MANY_PENDING: 'Você já tem solicitações aguardando confirmação. Aguarde o retorno do estúdio ou fale pelo WhatsApp.',
  RATE_LIMITED: 'Recebemos muitas solicitações agora. Tente de novo em alguns minutos ou fale pelo WhatsApp.',
  UNKNOWN: 'Não foi possível enviar a solicitação. Verifique a conexão e tente novamente.',
}

export class BookingError extends Error {
  code: BookingErrorCode
  constructor(code: BookingErrorCode) {
    super(bookingErrorMessages[code])
    this.code = code
  }
}

export async function requestAppointment(request: AppointmentRequest): Promise<AppointmentReceipt> {
  const { data, error } = await client().rpc('request_appointment', {
    p_service_id: request.serviceId,
    p_starts_at: request.startsAt,
    p_name: request.name,
    p_whatsapp: request.whatsapp,
    p_whatsapp_opt_in: request.whatsappOptIn,
  })
  if (error) {
    const code = (Object.keys(bookingErrorMessages) as BookingErrorCode[]).find((c) => error.message.includes(c))
    throw new BookingError(code ?? 'UNKNOWN')
  }
  return data as AppointmentReceipt
}
