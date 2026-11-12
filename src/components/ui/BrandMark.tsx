import type { SVGProps } from 'react'
import { site } from '@/config/site'
import { cn } from '@/lib/format'

/** Flor de lótus em traço fino — usada quando não há arquivo de logo cadastrado. */
export function LotusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M24 2.5c4.2 5.2 5 11.4 0 19.5c-5-8.1-4.2-14.3 0-19.5z" />
      <path d="M24 22c.8-6.8 4.6-11.8 11-14c.2 6.8-3.2 12-11 14z" />
      <path d="M24 22c-.8-6.8-4.6-11.8-11-14c-.2 6.8 3.2 12 11 14z" />
      <path d="M24 22c5-3.8 11.2-5.6 19-3.8c-3.800 5.4-10.200 6.8-19 3.800z" />
      <path d="M24 22c-5-3.8-11.2-5.6-19-3.8c3.800 5.400 10.200 6.800 19 3.800z" />
      <path d="M11 28.5c8.500 2.600 17.500 2.600 26 0" />
    </svg>
  )
}

/** Marca completa do estúdio. `tone="light"` para fundos escuros. */
export function BrandMark({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  const light = tone === 'light'
  const image = light ? site.images.logoLight : site.images.logo

  if (image) return <img src={image} alt={site.name} width={405} height={220} className={cn('mx-auto h-24 w-auto', className)} />

  return (
    <span className={cn('inline-flex flex-col items-center leading-none', className)}>
      <LotusIcon className={cn('h-7 w-auto', light ? 'text-petal' : 'text-brand-dark')} />
      <span className={cn('mt-2 text-[0.6rem] font-semibold tracking-[0.42em] uppercase', light ? 'text-petal' : 'text-brand-dark')}>Studio</span>
      <span className={cn('font-serif text-2xl italic', light ? 'text-white' : 'text-ink')}>Natalli Anjos</span>
    </span>
  )
}
