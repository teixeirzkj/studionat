import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
    <main className="grid min-h-screen place-items-center bg-blush px-5 py-10">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-8 shadow-soft">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.28em] text-brand-dark uppercase">Painel administrativo</p>
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
    </main>
  )
}
