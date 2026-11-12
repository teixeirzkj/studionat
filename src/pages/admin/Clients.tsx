import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/icons'
import { dateOfInstant, formatShortDate, formatTime } from '@/lib/datetime'
import type { AppointmentStatus } from '@/types'
import { db, errorMessage, useLoad } from './api'
import { Card, Empty, ErrorBox, Field, inputClass, Loading, Modal, PageHeader, StatusBadge } from './ui'

interface ClientRow {
  id: string
  name: string
  whatsapp: string
  notes: string | null
  whatsapp_opt_in: boolean
  appointments: { id: string; service_name: string; starts_at: string; status: AppointmentStatus }[]
}

async function listClients(): Promise<ClientRow[]> {
  const { data, error } = await db()
    .from('clients')
    .select('id, name, whatsapp, notes, whatsapp_opt_in, appointments(id, service_name, starts_at, status)')
    .order('name')
  if (error) throw error
  return data as unknown as ClientRow[]
}

const lastVisit = (c: ClientRow) =>
  c.appointments
    .filter((a) => a.status === 'completed')
    .map((a) => a.starts_at)
    .sort()
    .at(-1) ?? null

const fullDate = (iso: string) => `${formatShortDate(dateOfInstant(iso))}/${dateOfInstant(iso).slice(0, 4)}`
const phone = (whatsapp: string) => whatsapp.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')

function ClientDialog({ client, onClose, onChanged }: { client: ClientRow; onClose: () => void; onChanged: () => void }) {
  const [name, setName] = useState(client.name)
  const [notes, setNotes] = useState(client.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const history = [...client.appointments].sort((a, b) => b.starts_at.localeCompare(a.starts_at))

  const save = async () => {
    if (name.trim().length < 2) return setError('Informe o nome.')
    setBusy(true)
    const { error: saveError } = await db().from('clients').update({ name: name.trim(), notes: notes.trim() || null }).eq('id', client.id)
    setBusy(false)
    if (saveError) return setError(errorMessage(saveError))
    onChanged()
    onClose()
  }

  return (
    <Modal title="Cliente" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nome">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
        </Field>
        <p className="text-sm">
          <a href={`https://wa.me/${client.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-dark underline">
            <WhatsAppIcon className="size-4" /> {phone(client.whatsapp)}
          </a>
          <span className="ml-3 text-ink-soft">{client.whatsapp_opt_in ? 'Autorizou mensagens' : 'Sem autorização para mensagens'}</span>
        </p>
        <Field label="Observações internas">
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} py-2`} />
        </Field>
        {error && <ErrorBox>{error}</ErrorBox>}
        <div className="flex justify-end">
          <Button disabled={busy} onClick={save}>
            Salvar
          </Button>
        </div>

        <div>
          <h3 className="mb-2 font-sans text-sm font-semibold">Histórico de agendamentos ({history.length})</h3>
          {history.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhum agendamento.</p>
          ) : (
            <ul className="divide-y divide-petal/70 rounded-xl border border-petal/70 text-sm">
              {history.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span>
                    {fullDate(a.starts_at)} {formatTime(a.starts_at)} · {a.service_name}
                  </span>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}

export function Clients() {
  const { data, error, reload } = useLoad(listClients, [])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ClientRow | null>(null)

  const term = query.trim().toLowerCase()
  const digits = term.replace(/\D/g, '')
  const filtered = (data ?? []).filter(
    (c) => !term || c.name.toLowerCase().includes(term) || (digits !== '' && c.whatsapp.includes(digits)),
  )

  return (
    <>
      <PageHeader title="Clientes" description="Cadastradas automaticamente quando solicitam um horário pelo site." />
      <input
        type="search"
        placeholder="Buscar por nome ou WhatsApp"
        aria-label="Buscar cliente"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`${inputClass} mb-4 max-w-sm`}
      />

      {error && <ErrorBox>{error}</ErrorBox>}
      {!data && !error && <Loading />}
      {data && filtered.length === 0 && <Empty>{data.length === 0 ? 'Nenhuma cliente cadastrada ainda.' : 'Nenhuma cliente encontrada.'}</Empty>}
      {filtered.length > 0 && (
        <Card className="p-0">
          <ul className="divide-y divide-petal/70">
            {filtered.map((c) => {
              const last = lastVisit(c)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(c)}
                    className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-blush"
                  >
                    <span>
                      <span className="block font-medium">{c.name}</span>
                      <span className="text-sm text-ink-soft">{phone(c.whatsapp)}</span>
                    </span>
                    <span className="text-right text-sm text-ink-soft">
                      {c.appointments.length} agendamento{c.appointments.length === 1 ? '' : 's'}
                      <span className="block">{last ? `Último atendimento: ${fullDate(last)}` : 'Ainda sem atendimento realizado'}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      {selected && <ClientDialog client={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </>
  )
}
