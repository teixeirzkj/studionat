import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { categoryLabels, categoryOrder } from '@/data/content'
import { formatDuration, formatPrice } from '@/lib/format'
import type { ServiceCategory } from '@/types'
import { db, errorMessage, useLoad } from './api'
import { Card, Empty, ErrorBox, Field, inputClass, Loading, Modal, PageHeader } from './ui'
import { uploadImage } from './upload'

interface ServiceRow {
  id: string
  name: string
  category: string
  description: string
  price_cents: number | null
  duration_minutes: number
  image_url: string | null
  active: boolean
  sort_order: number
}

async function listServices(): Promise<ServiceRow[]> {
  const { data, error } = await db().from('services').select('*').order('sort_order').order('name')
  if (error) throw error
  return data as ServiceRow[]
}

const emptyService: Omit<ServiceRow, 'id'> = {
  name: '',
  category: 'sobrancelhas',
  description: '',
  price_cents: null,
  duration_minutes: 30,
  image_url: null,
  active: true,
  sort_order: 999,
}

function ServiceDialog({ service, onClose, onChanged }: { service: ServiceRow | null; onClose: () => void; onChanged: () => void }) {
  const [form, setForm] = useState<Omit<ServiceRow, 'id'>>(service ?? emptyService)
  const [price, setPrice] = useState(service?.price_cents != null ? (service.price_cents / 100).toFixed(2).replace('.', ',') : '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))

  const run = async (action: () => Promise<{ error: unknown }>) => {
    setBusy(true)
    setError(null)
    const { error: actionError } = await action()
    setBusy(false)
    if (actionError) return setError(errorMessage(actionError))
    onChanged()
    onClose()
  }

  const save = () => {
    const priceCents = price.trim() === '' ? null : Math.round(Number(price.replace(/\./g, '').replace(',', '.')) * 100)
    if (form.name.trim().length < 2) return setError('Informe o nome do serviço.')
    if (priceCents !== null && (!Number.isFinite(priceCents) || priceCents < 0)) return setError('Preço inválido.')
    if (!Number.isInteger(form.duration_minutes) || form.duration_minutes < 5 || form.duration_minutes > 600)
      return setError('A duração deve ficar entre 5 e 600 minutos.')

    const row = { ...form, name: form.name.trim(), description: form.description.trim(), price_cents: priceCents }
    run(async () => (service ? db().from('services').update(row).eq('id', service.id) : db().from('services').insert(row)))
  }

  const remove = () => {
    if (!service) return
    if (!window.confirm(`Excluir "${service.name}"? Os agendamentos já feitos são mantidos no histórico.`)) return
    run(async () => db().from('services').delete().eq('id', service.id))
  }

  const pickImage = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      set('image_url', await uploadImage(file, 'services'))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={service ? 'Editar serviço' : 'Novo serviço'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nome">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={120} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria" className="col-span-2">
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
              {categoryOrder.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preço (R$) — vazio = sob consulta">
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" className={inputClass} />
          </Field>
          <Field label="Duração (minutos)">
            <input
              type="number"
              min={5}
              max={600}
              step={5}
              value={form.duration_minutes}
              onChange={(e) => set('duration_minutes', Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Descrição (opcional)">
          <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} py-2`} />
        </Field>

        <div>
          <span className="mb-1 block text-xs font-semibold text-ink-soft">Fotografia (opcional)</span>
          <div className="flex flex-wrap items-center gap-3">
            {form.image_url && <img src={form.image_url} alt="" className="size-16 rounded-xl object-cover" />}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pickImage(e.target.files?.[0])} className="min-w-0 flex-1 text-sm" />
            {form.image_url && (
              <Button variant="ghost" onClick={() => set('image_url', null)}>
                Remover
              </Button>
            )}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="size-5 accent-brand-dark" />
          Disponível para agendamento no site
        </label>

        {error && <ErrorBox>{error}</ErrorBox>}
        <div className="flex justify-between gap-2">
          {service ? (
            <Button variant="ghost" disabled={busy} onClick={remove}>
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <Button disabled={busy} onClick={save}>
            {busy ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function ServicesAdmin() {
  const { data, error, reload } = useLoad(listServices, [])
  const [editing, setEditing] = useState<ServiceRow | 'new' | null>(null)

  const categories = [...categoryOrder, ...new Set((data ?? []).map((s) => s.category as ServiceCategory))].filter(
    (c, i, list) => list.indexOf(c) === i && (data ?? []).some((s) => s.category === c),
  )

  return (
    <>
      <PageHeader
        title="Serviços"
        description="O que aparece no site e pode ser agendado."
        action={<Button onClick={() => setEditing('new')}>Novo serviço</Button>}
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      {!data && !error && <Loading />}
      {data?.length === 0 && <Empty>Nenhum serviço cadastrado.</Empty>}

      <div className="space-y-7">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="mb-2 font-sans text-xs font-semibold tracking-[0.2em] text-brand-dark uppercase">
              {categoryLabels[category] ?? category}
            </h2>
            <Card className="p-0">
              <ul className="divide-y divide-petal/70">
                {data!
                  .filter((s) => s.category === category)
                  .map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-blush"
                      >
                        <span className={s.active ? '' : 'text-ink-soft line-through'}>{s.name}</span>
                        <span className="flex shrink-0 items-center gap-3 text-sm text-ink-soft sm:gap-4">
                          {!s.active && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs no-underline">Desativado</span>}
                          <span>{formatDuration(s.duration_minutes)}</span>
                          <span className="text-right font-medium text-ink sm:w-20">{formatPrice(s.price_cents) ?? 'Consulte'}</span>
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </Card>
          </section>
        ))}
      </div>

      {editing && <ServiceDialog service={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onChanged={reload} />}
    </>
  )
}
