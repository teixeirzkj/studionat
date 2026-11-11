import { cn } from '@/lib/format'

interface Props {
  src: string | null
  alt: string
  className?: string
  /** Imagens acima da dobra (hero) devem carregar com prioridade. */
  priority?: boolean
}

/**
 * Espaço de imagem. Enquanto a foto oficial não foi cadastrada, mostra um
 * fundo decorativo da marca em vez de uma foto de banco de imagens — assim o
 * site nunca exibe fotos que não são do estúdio.
 */
export function ImageSlot({ src, alt, className, priority }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative h-full w-full overflow-hidden bg-linear-to-br from-petal via-blush to-petal/70',
        className,
      )}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-brand/35" fill="none" stroke="currentColor" strokeWidth="0.6">
        <circle cx="150" cy="40" r="70" />
        <circle cx="150" cy="40" r="50" />
        <path d="M-10 170 C 40 120, 90 190, 210 130" />
        <path d="M-10 185 C 50 135, 100 205, 210 150" />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-serif text-6xl text-brand-dark/25 italic">N</span>
    </div>
  )
}
