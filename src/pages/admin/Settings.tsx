import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { fullAddress, site } from '@/config/site'
import { db } from './api'
import { BookingRules } from './Hours'
import { Card, Field, inputClass, PageHeader } from './ui'

function ChangePassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const save = async () => {
    if (password.length < 8) return setMessage({ ok: false, text: 'A senha precisa ter pelo menos 8 caracteres.' })
    if (password !== confirm) return setMessage({ ok: false, text: 'As duas senhas não são iguais.' })
    setBusy(true)
    const { error } = await db().auth.updateUser({ password })
    setBusy(false)
    if (error) return setMessage({ ok: false, text: 'Não foi possível alterar a senha. Saia, entre de novo e tente outra vez.' })
    setPassword('')
    setConfirm('')
    setMessage({ ok: true, text: 'Senha alterada.' })
  }

  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nova senha">
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Repita a nova senha">
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </Field>
      </div>
      {message && (
        <p role={message.ok ? 'status' : 'alert'} className={`mt-3 rounded-xl px-4 py-3 text-sm ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <Button disabled={busy} onClick={save}>
          Alterar senha
        </Button>
      </div>
    </Card>
  )
}

export function Settings({ email }: { email: string }) {
  return (
    <>
      <PageHeader title="Configurações" />
      <div className="space-y-10">
        <section>
          <h2 className="mb-3 text-2xl font-medium">Regras de agendamento</h2>
          <BookingRules />
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-medium">Dados do estúdio</h2>
          <Card>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-ink-soft">Nome</dt>
                <dd>{site.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink-soft">WhatsApp</dt>
                <dd>{site.whatsapp.display}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink-soft">Instagram</dt>
                <dd>{site.instagram.handle}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink-soft">Endereço</dt>
                <dd>{fullAddress}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-ink-soft">Estes dados ainda são alterados no código do site. Para mudar, peça ao desenvolvedor.</p>
          </Card>
        </section>

        <section>
          <h2 className="mb-1 text-2xl font-medium">Minha conta</h2>
          <p className="mb-3 text-sm text-ink-soft">{email}</p>
          <ChangePassword />
        </section>
      </div>
    </>
  )
}
