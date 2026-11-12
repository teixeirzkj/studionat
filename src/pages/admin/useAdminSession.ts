import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type AdminState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  /** Logada, mas a conta não está na tabela admin_users. */
  | { status: 'forbidden'; session: Session }
  | { status: 'admin'; session: Session }

/**
 * Sessão do painel. Estar logada não basta: a conta precisa estar cadastrada
 * como administradora. Esta checagem só decide o que a tela mostra — quem
 * protege os dados de verdade são as políticas de RLS do banco.
 */
export function useAdminSession(): AdminState {
  const [state, setState] = useState<AdminState>({ status: 'loading' })

  useEffect(() => {
    if (!supabase) return setState({ status: 'signed-out' })
    const client = supabase
    let cancelled = false

    const resolve = async (session: Session | null) => {
      if (!session) return !cancelled && setState({ status: 'signed-out' })
      const { data, error } = await client.rpc('is_admin')
      if (cancelled) return
      setState(!error && data === true ? { status: 'admin', session } : { status: 'forbidden', session })
    }

    client.auth.getSession().then(({ data }) => resolve(data.session))
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      // Fora do callback, como recomenda o Supabase, para não travar a fila de autenticação.
      setTimeout(() => resolve(session), 0)
    })
    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  return state
}
