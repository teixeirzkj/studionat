/**
 * Tipos de domínio compartilhados entre a landing page e o painel administrativo.
 * Espelham as tabelas que serão criadas no Supabase (Etapa 3).
 */

export type ServiceCategory =
  | 'sobrancelhas'
  | 'epilacao'
  | 'unhas'
  | 'massagem'
  | 'micropigmentacao'
  | 'tatuagem'
  | 'piercing'
  | 'outros'

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

/** 0 = domingo … 6 = sábado */
export interface BusinessHours {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6
  opensAt: string // "09:00"
  closesAt: string // "18:00"
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'no_show'
