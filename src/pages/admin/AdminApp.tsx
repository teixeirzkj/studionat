import { useEffect, useState, type ReactNode } from 'react'
import {
  Bell,
  CalendarDays,
  Clock,
  ExternalLink,
  Image,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { BrandMark } from '@/components/ui/BrandMark'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/format'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { Agenda } from './Agenda'
import { db } from './api'
import { Appointments } from './Appointments'
import { Clients } from './Clients'
import { Dashboard } from './Dashboard'
import { Finance } from './Finance'
import { Hours } from './Hours'
import { Login } from './Login'
import { NewAppointmentDialog } from './NewAppointmentDialog'
import { Notifications } from './Notifications'
import { ServicesAdmin } from './ServicesAdmin'
import { Settings } from './Settings'
import { SiteContent } from './SiteContent'
import { useAdminSession } from './useAdminSession'

/**
 * Painel administrativo (rota /admin). Só carrega depois do login de uma
 * conta cadastrada como administradora; os dados em si são protegidos pelo
 * RLS do banco, não por esta tela.
 */

const navigation = [
  {
    group: 'Atendimento',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
      { to: '/admin/agendamentos', label: 'Agendamentos', icon: ListChecks, badge: true },
      { to: '/admin/clientes', label: 'Clientes', icon: Users },
    ],
  },
  {
    group: 'Estúdio',
    items: [
      { to: '/admin/servicos', label: 'Serviços', icon: Sparkles },
      { to: '/admin/horarios', label: 'Horários', icon: Clock },
      { to: '/admin/financeiro', label: 'Financeiro', icon: Wallet },
    ],
  },
  {
    group: 'Site e sistema',
    items: [
      { to: '/admin/site', label: 'Galeria e depoimentos', icon: Image },
      { to: '/admin/notificacoes', label: 'Notificações', icon: Bell },
      { to: '/admin/configuracoes', label: 'Configurações', icon: SettingsIcon },
    ],
  },
]

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-blush px-5">
      <div className="max-w-md rounded-3xl bg-white p-9 text-center shadow-soft">
        <BrandMark />
        <h1 className="mt-6 text-4xl font-medium">{title}</h1>
        <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">{children}</div>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-brand-dark underline underline-offset-4">
          Voltar ao site
        </Link>
      </div>
    </main>
  )
}

function Shell({ email }: { email: string }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  /** Muda quando algo é criado pelo botão global, para a tela atual recarregar os dados. */
  const [refreshKey, setRefreshKey] = useState(0)
  const [pending, setPending] = useState(0)

  // Fecha o menu (celular) e atualiza o contador de pendentes a cada troca de tela.
  useEffect(() => {
    setMenuOpen(false)
    db()
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPending(count ?? 0))
  }, [location.pathname, refreshKey])

  const signOut = () => supabase?.auth.signOut()
  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf3f6] lg:pl-64">
      {/* Barra superior — só no celular */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-dark px-3 py-2 text-white lg:hidden">
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu" aria-expanded={menuOpen} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-white/10">
          <Menu className="size-5" />
        </button>
        <span className="font-serif text-xl italic">Natalli Anjos</span>
        <button type="button" onClick={() => setCreating(true)} aria-label="Novo agendamento" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-white/10">
          <Plus className="size-5" />
        </button>
      </header>

      {menuOpen && <button type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-ink/50 lg:hidden" />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-linear-to-b from-brand-dark via-[#8a3a5d] to-[#5e2740] text-white transition-transform duration-300 lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative px-6 pt-8 pb-6 text-center">
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" className="absolute top-3 right-3 grid size-10 cursor-pointer place-items-center rounded-full hover:bg-white/10 lg:hidden">
            <X className="size-5" />
          </button>
          <BrandMark tone="light" />
          <p className="mt-3 text-[0.65rem] tracking-[0.3em] text-white/55 uppercase">Painel administrativo</p>
        </div>

        <nav aria-label="Painel" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 [scrollbar-color:rgb(255_255_255/0.25)_transparent] [scrollbar-width:thin]">
          {navigation.map((section) => (
            <div key={section.group}>
              <p className="mb-1.5 px-3 text-[0.65rem] font-semibold tracking-[0.2em] text-white/45 uppercase">{section.group}</p>
              <ul className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon, ...item }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={'end' in item}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition',
                          isActive ? 'bg-white font-semibold text-brand-dark shadow-lg shadow-black/10' : 'text-white/80 hover:bg-white/10 hover:text-white',
                        )
                      }
                    >
                      <Icon className="size-[1.1rem] shrink-0" />
                      <span className="flex-1">{label}</span>
                      {'badge' in item && pending > 0 && (
                        <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-bold text-amber-950" aria-label={`${pending} pendente(s)`}>
                          {pending}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <a href="/" target="_blank" rel="noopener" className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm text-white/80 hover:bg-white/10 hover:text-white">
            <ExternalLink className="size-4" /> Ver o site
          </a>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/10 p-2.5">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-petal font-serif text-lg text-brand-dark">
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-white/55">Administradora</span>
              <span className="block truncate text-xs">{email}</span>
            </span>
            <button type="button" onClick={signOut} aria-label="Sair" title="Sair" className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-white/15">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-8 sm:py-7 lg:py-10">
        <div className="mb-2 hidden justify-end lg:flex">
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Novo agendamento
          </Button>
        </div>
        <div key={refreshKey}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="agendamentos" element={<Appointments />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="servicos" element={<ServicesAdmin />} />
            <Route path="horarios" element={<Hours />} />
            <Route path="financeiro" element={<Finance />} />
            <Route path="site" element={<SiteContent />} />
            <Route path="notificacoes" element={<Notifications />} />
            <Route path="configuracoes" element={<Settings email={email} />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>

      {creating && <NewAppointmentDialog onClose={() => setCreating(false)} onCreated={() => setRefreshKey((k) => k + 1)} />}
    </div>
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

  if (state.status === 'forbidden') {
    return (
      <Notice title="Sem permissão">
        <p>A conta {state.session.user.email} não tem acesso ao painel.</p>
        <Button variant="secondary" onClick={() => supabase?.auth.signOut()}>
          Sair
        </Button>
      </Notice>
    )
  }

  return <Shell email={state.session.user.email ?? ''} />
}
