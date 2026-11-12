import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { categoryLabels, categoryOrder } from '@/data/content'
import { db, errorMessage, useLoad } from './api'
import { Card, Empty, ErrorBox, Field, inputClass, Loading, PageHeader } from './ui'
import { uploadImage } from './upload'

const iconButton = 'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink-soft hover:bg-blush hover:text-red-700'

function PublishToggle({ published, onChange }: { published: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={published} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-brand-dark" />
      No site
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* Depoimentos                                                         */
/* ------------------------------------------------------------------ */
interface TestimonialRow {
  id: string
  client_name: string
  comment: string
  published: boolean
}

function Testimonials() {
  const { data, error, reload } = useLoad(async () => {
    const { data: rows, error: loadError } = await db().from('testimonials').select('id, client_name, comment, published').order('created_at', { ascending: false })
    if (loadError) throw loadError
    return rows as TestimonialRow[]
  }, [])
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const act = async (action: PromiseLike<{ error: unknown }>) => {
    const { error: actionError } = await action
    setFormError(actionError ? errorMessage(actionError) : null)
    reload()
  }

  const add = () => {
    if (name.trim().length < 2 || comment.trim().length < 5) return setFormError('Informe o nome da cliente e o comentário.')
    act(db().from('testimonials').insert({ client_name: name.trim(), comment: comment.trim(), published: true }))
    setName('')
    setComment('')
  }

  return (
    <Card>
      <p className="mb-4 text-sm text-ink-soft">Cadastre apenas avaliações reais, com autorização da cliente para publicar.</p>
      <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
        <Field label="Nome da cliente">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
        </Field>
        <Field label="Comentário">
          <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={600} className={`${inputClass} py-2`} />
        </Field>
      </div>
      {formError && <div className="mt-3"><ErrorBox>{formError}</ErrorBox></div>}
      <div className="mt-3 flex justify-end">
        <Button onClick={add}>Adicionar depoimento</Button>
      </div>

      <div className="mt-6">
        {error && <ErrorBox>{error}</ErrorBox>}
        {!data && !error && <Loading />}
        {data?.length === 0 && <Empty>Nenhum depoimento. Enquanto estiver vazio, a seção não aparece no site.</Empty>}
        {data && data.length > 0 && (
          <ul className="divide-y divide-petal/70 rounded-xl border border-petal/70">
            {data.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-x-3 py-2 pr-1 pl-4">
                <p className="min-w-0 flex-1 basis-48 text-sm">
                  <strong>{t.client_name}</strong>
                  <span className="block text-ink-soft">{t.comment}</span>
                </p>
                <PublishToggle published={t.published} onChange={(published) => act(db().from('testimonials').update({ published }).eq('id', t.id))} />
                <button type="button" aria-label="Excluir depoimento" className={iconButton} onClick={() => window.confirm('Excluir este depoimento?') && act(db().from('testimonials').delete().eq('id', t.id))}>
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Galeria                                                             */
/* ------------------------------------------------------------------ */
interface GalleryRow {
  id: string
  category: string
  image_url: string
  before_image_url: string | null
  caption: string | null
  published: boolean
}

function Gallery() {
  const { data, error, reload } = useLoad(async () => {
    const { data: rows, error: loadError } = await db().from('gallery_images').select('id, category, image_url, before_image_url, caption, published').order('created_at', { ascending: false })
    if (loadError) throw loadError
    return rows as GalleryRow[]
  }, [])
  const [category, setCategory] = useState<string>('sobrancelhas')
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [before, setBefore] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const act = async (action: PromiseLike<{ error: unknown }>) => {
    const { error: actionError } = await action
    setFormError(actionError ? errorMessage(actionError) : null)
    reload()
  }

  const add = async () => {
    if (!photo) return setFormError('Escolha a foto do resultado.')
    setBusy(true)
    setFormError(null)
    try {
      const imageUrl = await uploadImage(photo, 'gallery')
      const beforeUrl = before ? await uploadImage(before, 'gallery') : null
      const { error: insertError } = await db().from('gallery_images').insert({ category, image_url: imageUrl, before_image_url: beforeUrl, caption: caption.trim() || null, published: true })
      if (insertError) throw new Error(errorMessage(insertError))
      setCaption('')
      setPhoto(null)
      setBefore(null)
      setFileKey((k) => k + 1)
      reload()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <p className="mb-4 text-sm text-ink-soft">Publique apenas fotos autorizadas pelas clientes. O "antes" é opcional e cria uma comparação antes/depois.</p>
      <div key={fileKey} className="grid gap-3 sm:grid-cols-2">
        <Field label="Foto do resultado (JPG, PNG ou WebP, até 5 MB)">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="block w-full min-w-0 text-sm" />
        </Field>
        <Field label="Foto do antes (opcional)">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setBefore(e.target.files?.[0] ?? null)} className="block w-full min-w-0 text-sm" />
        </Field>
        <Field label="Procedimento">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {categoryOrder.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Legenda (opcional)">
          <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={140} className={inputClass} />
        </Field>
      </div>
      {formError && <div className="mt-3"><ErrorBox>{formError}</ErrorBox></div>}
      <div className="mt-3 flex justify-end">
        <Button disabled={busy} onClick={add}>
          {busy ? 'Enviando…' : 'Adicionar foto'}
        </Button>
      </div>

      <div className="mt-6">
        {error && <ErrorBox>{error}</ErrorBox>}
        {!data && !error && <Loading />}
        {data?.length === 0 && <Empty>Nenhuma foto. Enquanto estiver vazia, a galeria do site aponta para o Instagram.</Empty>}
        {data && data.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.map((g) => (
              <li key={g.id} className="overflow-hidden rounded-xl border border-petal/70">
                <img src={g.image_url} alt={g.caption ?? ''} loading="lazy" className="aspect-square w-full object-cover" />
                <div className="flex items-center justify-between gap-1 py-1 pr-1 pl-3">
                  <PublishToggle published={g.published} onChange={(published) => act(db().from('gallery_images').update({ published }).eq('id', g.id))} />
                  <button type="button" aria-label="Excluir foto" className={iconButton} onClick={() => window.confirm('Excluir esta foto?') && act(db().from('gallery_images').delete().eq('id', g.id))}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="truncate px-3 pb-2 text-xs text-ink-soft">
                  {categoryLabels[g.category as keyof typeof categoryLabels] ?? g.category}
                  {g.before_image_url && ' · antes/depois'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

export function SiteContent() {
  return (
    <>
      <PageHeader title="Conteúdo do site" description="Depoimentos e fotos exibidos na página pública." />
      <div className="space-y-10">
        <section>
          <h2 className="mb-3 text-2xl font-medium">Depoimentos</h2>
          <Testimonials />
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-medium">Galeria de resultados</h2>
          <Gallery />
        </section>
      </div>
    </>
  )
}
