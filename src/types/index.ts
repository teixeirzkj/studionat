/**
 * Tipos de domínio compartilhados entre a landing page e o painel administrativo.
 * Espelham as tabelas que serão criadas no Supabase (Etapa 3).
 */

export type ServiceCategory = 'sobrancelhas' | 'epilacao-cera' | 'epilacao-linha' | 'micropigmentacao' | 'outros'

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  description: string
  /** Preço em centavos. `null` = ainda não cadastrado (exibe "Consulte o valor"). */
  priceCents: number | null
  /** Duração em minutos. `null` = ainda não cadastrada. */
  durationMinutes: number | null
  imageUrl: string | null
  active: boolean
}

export interface GalleryItem {
  id: string
  category: ServiceCategory
  imageUrl: string
  /** Presente apenas em comparações antes/depois autorizadas pela cliente. */
  beforeImageUrl?: string | null
  caption?: string | null
}

export interface Testimonial {
  id: string
  clientName: string
  comment: string
  photoUrl?: string | null
}

export interface FaqItem {
  question: string
  answer: string
}

export interface TimePeriod {
  opensAt: string // "08:00"
  closesAt: string // "09:30"
}

/** 0 = domingo … 6 = sábado. Sem períodos = fechado. Mais de um período = há intervalo entre eles. */
export interface BusinessHours {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6
  periods: TimePeriod[]
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'no_show' | 'expired'
