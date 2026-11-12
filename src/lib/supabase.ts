import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
/** Chave pública do projeto: "publishable" (sb_publishable_…) ou a antiga "anon". */
const publicKey = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
)?.trim()

/** `true` somente quando as credenciais públicas do Supabase foram configuradas. */
export const isSupabaseConfigured = Boolean(url && publicKey)

/**
 * Cliente do Supabase com a chave pública. Toda a proteção dos dados fica nas
 * políticas de Row Level Security e nas funções do banco (supabase/migrations).
 * `null` enquanto o projeto não estiver conectado — o site continua funcionando
 * com o conteúdo de `src/data/content.ts` e agendamento pelo WhatsApp.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, publicKey!) : null
