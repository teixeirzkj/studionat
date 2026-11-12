import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { studioToIso, todayInStudio } from '@/lib/datetime'
import { formatDuration, formatPrice } from '@/lib/format'
import { db, errorMessage, useLoad } from './api'
import { ErrorBox, Field, inputClass, Loading, Modal } from './ui'

interface ServiceOption {
  id: string
  name: string
  price_cents: number | null
  duration_minutes: number
}

function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/**
 * Agendamento criado pela administradora (cliente que ligou, mandou mensagem
 * ou veio pessoalmente). Entra já confirmado; o banco recusa se o horário
 * estiver ocupado.
 */
export function NewAppointmentDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const services = useLoad(async () => {
    const { data, error } = await db().from('services').select('id, name, price_cents, duration_minutes').eq('active', true).order('sort_order')
    if (error) throw error
    return data as ServiceOption[]
  }, [])

  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState(todayInStudio())
  const [time, setTime] = useState('09:00')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const service = services.data?.find((s) => s.id === serviceId)

  const save = async () => {
    const digits = phone.replace(/\D/g, '')
    if (!service) return setError('Escolha o serviço.')
    if (!date || !time) return setError('Informe a data e o horário.')
    if (name.trim().length < 2) return setError('Informe o nome da cliente.')
    if (digits.length !== 10 && digits.length !== 11) return setError('Informe o WhatsApp com DDD.')

    setBusy(true)
    setError(null)
    try {
      const whatsapp = `55${digits}`
      // Cliente identificada pelo WhatsApp: reaproveita o cadastro, se já existir.
      const existing = await db().from('clients').select('id').eq('whatsapp', whatsapp).maybeSingle()
      if (existing.error) throw existing.error
      let clientId = existing.data?.id as string | undefined
      if (!clientId) {
        const created = await db().from('clients').insert({ name: name.trim(), whatsapp }).select('id').single()
        if (created.error) throw created.error
        clientId = created.data.id as string
      }

      const startsAt = studioToIso(date, time)
      const { error: insertError } = await db().from('appointments').insert({
        client_id: clientId,
        service_id: service.id,
        service_name: service.name,
        price_cents: service.price_cents,
        starts_at: startsAt,
        ends_at: new Date(new Date(startsAt).getTime() + service.duration_minutes * 60000).toISOString(),
        status: 'confirmed',
        source: 'admin',
        notes: notes.trim() || null,
      })
      if (insertError) throw insertError
      onCreated()
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Novo agendamento" onClose={onClose}>
      {services.error && <ErrorBox>{services.error}</ErrorBox>}
      {services.loading && <Loading />}
      {services.data && (
        <div className="space-y-4">
          <Field label="Serviço">
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputClass}>
              <option value="">Selecione…</option>
              {services.data.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {formatDuration(s.duration_minutes)}
                  {s.price_cents !== null ? ` — ${formatPrice(s.price_cents)}` : ''}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Horário">
              <input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Nome da cliente">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
            </Field>
            <Field label="WhatsApp">
              <input type="tel" inputMode="numeric" placeholder="(74) 99999-9999" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} className={inputClass} />
            </Field>
          </div>
          <Field label="Observações internas (opcional)">
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} py-2`} />
          </Field>
          <p className="text-xs text-ink-soft">
            O agendamento entra como confirmado. Você pode marcar fora do expediente; o sistema só impede dois atendimentos no mesmo horário.
          </p>
          {error && <ErrorBox>{error}</ErrorBox>}
          <div className="flex justify-end">
            <Button disabled={busy} onClick={save}>
              {busy ? 'Salvando…' : 'Agendar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
