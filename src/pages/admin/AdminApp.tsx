import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { Login } from './Login'
import { Requests } from './Requests'
import { useAdminSession } from './useAdminSession'

/**
 * Painel administrativo (rota /admin).
 *
 * Hoje: login seguro e tela de solicitações (confirmar, recusar, cancelar).
 * Etapa 4: dashboard, calendário, clientes, serviços, horários e financeiro.
 */

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-blush px-5">
      <div className="max-w-md rounded-3xl bg-white p-9 text-center shadow-soft">
        <p className="text-xs font-semibold tracking-[0.28em] text-brand-dark uppercase">Painel administrativo</p>
        <h1 className="mt-3 text-4xl font-medium">{title}</h1>
        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">{children}</div>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-brand-dark underline underline-offset-4">
          Voltar ao site
        </Link>
      </div>
    </main>
  )
}

export default function AdminApp() {
  const state = useAdminSession()

  useEffect(() => {
    document.title = 'Painel administrativo | Studio Natalli Anjos'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <Notice title="Banco não conectado">
        <p>O painel fica disponível depois que as credenciais do Supabase forem configuradas.</p>
      </Notice>
    )
  }

  if (state.status === 'loading') {
    return (
      <div role="status" className="grid min-h-screen place-items-center bg-blush">
        <span className="size-9 animate-spin rounded-full border-2 border-petal border-t-brand-dark" />
        <span className="sr-only">Carregando…</span>
      </div>
    )
  }

  if (state.status === 'signed-out') return <Login />

  const signOut = () => supabase?.auth.signOut()

  if (state.status === 'forbidden') {
    return (
      <Notice title="Sem permissão">
        <p>A conta {state.session.user.email} não tem acesso ao painel.</p>
        <Button variant="secondary" onClick={signOut}>
          Sair
        </Button>
      </Notice>
    )
  }

  return (
    <div className="min-h-screen bg-blush">
      <header className="border-b border-petal bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-[0.6rem] font-semibold tracking-[0.42em] text-brand-dark uppercase">Painel</p>
            <p className="font-serif text-2xl italic">Natalli Anjos</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft sm:inline">{state.session.user.email}</span>
            <Button variant="secondary" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10">
        <Requests />
      </main>
    </div>
  )
}
