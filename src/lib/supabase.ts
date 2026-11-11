import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** `true` somente quando as credenciais públicas do Supabase foram configuradas. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Cliente do Supabase com a chave pública (anon). Toda a proteção dos dados
 * fica nas políticas de Row Level Security do banco (Etapa 3).
 * `null` enquanto o projeto não estiver conectado — o site continua funcionando
 * com o conteúdo de `src/data/content.ts`.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!) : null
