import { useEffect, type ReactNode } from 'react'
import { CalendarDays, Clock, Image, LayoutDashboard, LogOut, Sparkles, Users, Wallet } from 'lucide-react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/format'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { Agenda } from './Agenda'
import { Clients } from './Clients'
import { Dashboard } from './Dashboard'
import { Finance } from './Finance'
import { Hours } from './Hours'
import { Login } from './Login'
import { ServicesAdmin } from './ServicesAdmin'
import { SiteContent } from './SiteContent'
import { useAdminSession } from './useAdminSession'

/**
 * Painel administrativo (rota /admin). Só carrega depois do login de uma
 * conta cadastrada como administradora; os dados em si são protegidos pelo
 * RLS do banco, não por esta tela.
 */

const navigation = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/servicos', label: 'Serviços', icon: Sparkles },
  { to: '/admin/horarios', label: 'Horários', icon: Clock },
  { to: '/admin/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/admin/site', label: 'Site', icon: Image },
]

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
    <div className="min-h-screen bg-blush lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-petal bg-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 pt-4 lg:block lg:pt-6">
          <div>
            <p className="text-[0.6rem] font-semibold tracking-[0.42em] text-brand-dark uppercase">Painel</p>
            <p className="font-serif text-2xl italic">Natalli Anjos</p>
          </div>
          <button type="button" onClick={signOut} aria-label="Sair" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-blush lg:hidden">
            <LogOut className="size-5" />
          </button>
        </div>

        <nav aria-label="Painel" className="flex gap-1 overflow-x-auto px-3 py-3 lg:mt-4 lg:flex-col lg:overflow-visible">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-3.5 text-sm whitespace-nowrap transition',
                  isActive ? 'bg-brand-dark font-medium text-white' : 'text-ink-soft hover:bg-blush hover:text-ink',
                )
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden px-5 lg:absolute lg:inset-x-0 lg:bottom-5 lg:block">
          <p className="truncate text-xs text-ink-soft">{state.session.user.email}</p>
          <div className="mt-2 flex items-center justify-between">
            <Link to="/" className="text-sm text-brand-dark underline underline-offset-4">
              Ver o site
            </Link>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="servicos" element={<ServicesAdmin />} />
          <Route path="horarios" element={<Hours />} />
          <Route path="financeiro" element={<Finance />} />
          <Route path="site" element={<SiteContent />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
