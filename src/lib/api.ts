import { supabase } from '@/lib/supabase'
import type { BusinessHours, GalleryItem, Service, ServiceCategory, Testimonial } from '@/types'

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

export async function fetchBusinessHours(): Promise<BusinessHours[]> {
  const { data, error } = await client().from('business_hours').select('weekday, opens_at, closes_at').order('opens_at')
  if (error) throw error
  const rows = data as { weekday: BusinessHours['weekday']; opens_at: string; closes_at: string }[]
  // Segunda a domingo; dias sem períodos aparecem como "Fechado".
  return ([1, 2, 3, 4, 5, 6, 0] as const).map((weekday) => ({
    weekday,
    periods: rows
      .filter((r) => r.weekday === weekday)
      .map((r) => ({ opensAt: r.opens_at.slice(0, 5), closesAt: r.closes_at.slice(0, 5) })),
  }))
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await client()
    .from('testimonials')
    .select('id, client_name, comment, photo_url')
    .eq('published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as { id: string; client_name: string; comment: string; photo_url: string | null }[]).map((r) => ({
    id: r.id,
    clientName: r.client_name,
    comment: r.comment,
    photoUrl: r.photo_url,
  }))
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  const { data, error } = await client()
    .from('gallery_images')
    .select('id, category, image_url, before_image_url, caption')
    .eq('published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as { id: string; category: string; image_url: string; before_image_url: string | null; caption: string | null }[]).map((r) => ({
    id: r.id,
    category: r.category as ServiceCategory,
    imageUrl: r.image_url,
    beforeImageUrl: r.before_image_url,
    caption: r.caption,
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
