import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { db, errorMessage, useLoad } from './api'
import { Card, Empty, ErrorBox, Loading, PageHeader, inputClass } from './ui'

interface Template {
  event: string
  enabled: boolean
  body: string
}

const eventLabels: Record<string, string> = {
  request_received: 'Nova solicitação recebida',
  confirmed: 'Agendamento confirmado',
  declined: 'Agendamento recusado',
  rescheduled: 'Agendamento reagendado',
  reminder_24h: 'Lembrete 24 horas antes',
  reminder_soon: 'Lembrete próximo ao atendimento',
  cancelled: 'Cancelamento',
}
const eventOrder = Object.keys(eventLabels)

/**
 * Modelos de mensagem e preferências de notificação.
 * O envio depende da integração com a WhatsApp Business Platform (Etapa 6);
 * até lá, esta tela só guarda os textos e as preferências — nada é enviado.
 */
export function Notifications() {
  const load = useLoad(async () => {
    const [templates, setting, log] = await Promise.all([
      db().from('notification_templates').select('event, enabled, body'),
      db().from('settings').select('value').eq('key', 'whatsapp_notifications_enabled').maybeSingle(),
      db().from('notifications').select('id', { count: 'exact', head: true }),
    ])
    if (templates.error) throw templates.error
    return {
      templates: (templates.data as Template[]).sort((a, b) => eventOrder.indexOf(a.event) - eventOrder.indexOf(b.event)),
      connected: setting.data?.value === true,
      sent: log.count ?? 0,
    }
  }, [])
  const [templates, setTemplates] = useState<Template[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (load.data) setTemplates(load.data.templates)
  }, [load.data])

  if (load.error) return <ErrorBox>{load.error}</ErrorBox>
  if (!templates || !load.data) return <Loading />

  const update = (event: string, patch: Partial<Template>) => setTemplates(templates.map((t) => (t.event === event ? { ...t, ...patch } : t)))

  const save = async () => {
    if (templates.some((t) => t.body.trim().length < 5)) return setMessage({ ok: false, text: 'Nenhuma mensagem pode ficar vazia.' })
    setBusy(true)
    const results = await Promise.all(
      templates.map((t) => db().from('notification_templates').update({ enabled: t.enabled, body: t.body.trim() }).eq('event', t.event)),
    )
    setBusy(false)
    const failed = results.find((r) => r.error)
    setMessage(failed ? { ok: false, text: errorMessage(failed.error) } : { ok: true, text: 'Modelos salvos.' })
  }

  return (
    <>
      <PageHeader title="Notificações" description="Mensagens automáticas de WhatsApp para as clientes." />

      <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${load.data.connected ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
        <p className="font-semibold">{load.data.connected ? 'WhatsApp conectado' : 'Notificações desativadas — WhatsApp não conectado'}</p>
        {!load.data.connected && (
          <p className="mt-1">
            Nenhuma mensagem é enviada automaticamente por enquanto. Você pode preparar os textos abaixo e escolher quais avisos quer ativar; eles
            passam a valer quando a integração for configurada. Até lá, use o botão de WhatsApp de cada agendamento para falar com a cliente.
          </p>
        )}
      </div>

      <Card>
        <p className="mb-4 text-xs text-ink-soft">
          Use <code>{'{{nome}}'}</code>, <code>{'{{servico}}'}</code>, <code>{'{{data}}'}</code> e <code>{'{{hora}}'}</code> para inserir os dados do agendamento.
        </p>
        <ul className="space-y-5">
          {templates.map((t) => (
            <li key={t.event}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor={`body-${t.event}`} className="text-sm font-semibold">
                  {eventLabels[t.event] ?? t.event}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" checked={t.enabled} onChange={(e) => update(t.event, { enabled: e.target.checked })} className="size-5 accent-brand-dark" />
                  Ativar
                </label>
              </div>
              <textarea id={`body-${t.event}`} rows={2} value={t.body} onChange={(e) => update(t.event, { body: e.target.value })} maxLength={600} className={`${inputClass} py-2`} />
            </li>
          ))}
        </ul>
        {message && (
          <p role={message.ok ? 'status' : 'alert'} className={`mt-4 rounded-xl px-4 py-3 text-sm ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </p>
        )}
        <div className="mt-4 flex justify-end">
          <Button disabled={busy} onClick={save}>
            Salvar modelos
          </Button>
        </div>
      </Card>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-medium">Histórico de envios</h2>
        <Empty>{load.data.sent === 0 ? 'Nenhuma mensagem foi enviada pelo sistema.' : `${load.data.sent} registro(s) de envio.`}</Empty>
      </section>
    </>
  )
}
