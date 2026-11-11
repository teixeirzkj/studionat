import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase'

/**
 * Ponto de entrada do painel administrativo (rota /admin).
 *
 * Reservado desde a Etapa 1 para manter a arquitetura planejada:
 *   Etapa 3 → login (Supabase Auth) + proteção de rota
 *   Etapa 4 → /admin (dashboard), /admin/agenda, /admin/clientes,
 *             /admin/servicos, /admin/horarios, /admin/financeiro,
 *             /admin/notificacoes, /admin/configuracoes
 *
 * Nada aqui simula um painel funcionando.
 */
export default function AdminPlaceholder() {
  useEffect(() => {
    document.title = 'Painel administrativo | Studio Natalli Anjos'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <main className="grid min-h-screen place-items-center bg-blush px-5">
      <div className="max-w-md rounded-3xl bg-white p-9 text-center shadow-soft">
        <p className="text-xs font-semibold tracking-[0.28em] text-brand-dark uppercase">Painel administrativo</p>
        <h1 className="mt-3 text-4xl font-medium">Em construção</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          O login e o painel de gestão do estúdio serão disponibilizados nas próximas etapas do projeto.
        </p>
        <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm text-ink-soft">
          Banco de dados: {isSupabaseConfigured ? 'credenciais configuradas' : 'ainda não conectado'}
        </p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-brand-dark underline underline-offset-4">
          Voltar ao site
        </Link>
      </div>
    </main>
  )
}
