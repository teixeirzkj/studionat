import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Section, SectionHeading } from '@/components/ui/Section'
import { InstagramIcon } from '@/components/ui/icons'
import { site } from '@/config/site'
import { categoryLabels } from '@/data/content'
import { cn } from '@/lib/format'
import type { GalleryItem, ServiceCategory } from '@/types'

function Lightbox({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (item && !dialog.open) dialog.showModal()
    if (!item && dialog.open) dialog.close()
  }, [item])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="Foto ampliada"
      className="m-auto max-h-[92vh] w-[min(92vw,64rem)] rounded-3xl bg-white p-0 backdrop:bg-ink/80"
    >
      {item && (
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3 right-3 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow"
          >
            <X className="size-5" />
          </button>
          <div className={cn('grid', item.beforeImageUrl && 'sm:grid-cols-2')}>
            {item.beforeImageUrl && (
              <figure className="relative">
                <img src={item.beforeImageUrl} alt="Antes do procedimento" className="max-h-[80vh] w-full object-contain" />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs">Antes</figcaption>
              </figure>
            )}
            <figure className="relative">
              <img src={item.imageUrl} alt={item.caption ?? 'Resultado do procedimento'} className="max-h-[80vh] w-full object-contain" />
              {item.beforeImageUrl && (
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs">Depois</figcaption>
              )}
            </figure>
          </div>
          {item.caption && <p className="px-6 py-4 text-sm text-ink-soft">{item.caption}</p>}
        </div>
      )}
    </dialog>
  )
}

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState<ServiceCategory | 'todas'>('todas')
  const [selected, setSelected] = useState<GalleryItem | null>(null)

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items])
  const visible = category === 'todas' ? items : items.filter((i) => i.category === category)

  return (
    <Section id="galeria">
      <SectionHeading
        eyebrow="Galeria"
        title="Resultados que falam por si"
        description={
          site.galleryIsIllustrative && items.length > 0
            ? 'Uma amostra do estilo dos nossos procedimentos. Imagens ilustrativas.'
            : 'Fotos reais de procedimentos realizados no estúdio, publicadas com autorização das clientes.'
        }
      />

      {items.length === 0 ? (
        // Sem fotos cadastradas ainda: em vez de imagens genéricas, leva para o Instagram oficial.
        <div className="mx-auto max-w-xl rounded-3xl border border-petal bg-blush px-6 py-12 text-center">
          <p className="font-serif text-2xl">Veja os resultados mais recentes no Instagram</p>
          <p className="mt-3 text-sm text-ink-soft">Transformações, bastidores e o dia a dia do estúdio.</p>
          <Button href={site.instagram.url} variant="secondary" className="mt-6">
            <InstagramIcon className="size-4" /> {site.instagram.handle}
          </Button>
        </div>
      ) : (
        <>
          {categories.length > 1 && (
            <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrar por procedimento">
              {(['todas', ...categories] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'min-h-11 cursor-pointer rounded-full px-5 text-sm transition',
                    category === c ? 'bg-brand-dark text-white' : 'bg-blush text-brand-dark hover:bg-petal',
                  )}
                >
                  {c === 'todas' ? 'Todas' : categoryLabels[c]}
                </button>
              ))}
            </div>
          )}

          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  aria-label={`Ampliar foto: ${item.caption ?? categoryLabels[item.category]}`}
                  className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption ?? categoryLabels[item.category]}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {item.beforeImageUrl && (
                    <span className="absolute top-2 left-2 rounded-full bg-white/90 px-3 py-1 text-xs text-ink">Antes e depois</span>
                  )}
                  {site.galleryIsIllustrative && (
                    <span className="absolute right-2 bottom-2 rounded-full bg-ink/70 px-2.5 py-0.5 text-[0.65rem] text-white">Imagem ilustrativa</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Lightbox item={selected} onClose={() => setSelected(null)} />
    </Section>
  )
}
