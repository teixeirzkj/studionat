import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/ui/BrandMark'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const inputClass = 'min-h-12 w-full rounded-2xl border border-petal bg-white px-4 text-base outline-none focus:border-brand-dark'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase || submitting) return
    setSubmitting(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSubmitting(false)
    // Mensagem única para e-mail ou senha errados: não revela qual dos dois existe.
    if (signInError) setError('E-mail ou senha incorretos.')
  }

  return (
    <main className="grid min-h-screen bg-blush lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-linear-to-br from-brand-dark via-[#8a3a5d] to-[#5e2740] lg:grid lg:place-items-center">
        <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute inset-0 h-full w-full text-white/10" fill="none" stroke="currentColor">
          <circle cx="330" cy="70" r="150" />
          <circle cx="330" cy="70" r="105" />
          <path d="M-20 330 C 90 250, 190 380, 420 270" />
          <path d="M-20 360 C 100 280, 200 410, 420 305" />
        </svg>
        <div className="relative text-center">
          <BrandMark tone="light" className="scale-150" />
          <p className="mt-12 max-w-xs text-sm leading-relaxed text-white/75">Agenda, clientes e financeiro do estúdio em um só lugar.</p>
        </div>
      </div>

      <div className="grid place-items-center px-5 py-10">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-8 shadow-soft">
          <div className="text-center">
            <BrandMark className="lg:hidden" />
            <p className="mt-4 text-xs font-semibold tracking-[0.28em] text-brand-dark uppercase lg:mt-0">Painel administrativo</p>
            <h1 className="mt-2 text-4xl font-medium">Entrar</h1>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">E-mail</span>
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Senha</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </label>
          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
          <p className="text-center text-sm">
            <Link to="/" className="text-brand-dark underline underline-offset-4">
              Voltar ao site
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
