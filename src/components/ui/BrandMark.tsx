import type { SVGProps } from 'react'
import { cn } from '@/lib/format'

/** Flor de lótus em traço fino — símbolo usado junto do nome do estúdio. */
export function LotusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M24 2.5c4.2 5.2 5 11.4 0 19.5c-5-8.1-4.2-14.3 0-19.500z" />
      <path d="M24 22c.8-6.800 4.600-11.800 11-14c.200 6.800-3.200 12-11 14z" />
      <path d="M24 22c-.8-6.800-4.600-11.800-11-14c-.2 6.800 3.200 12 11 14z" />
      <path d="M24 22c5-3.800 11.200-5.600 19-3.800c-3.800 5.400-10.200 6.800-19 3.800z" />
      <path d="M24 22c-5-3.800-11.200-5.600-19-3.800c3.800 5.400 10.200 6.800 19 3.800z" />
      <path d="M11 28.500c8.500 2.600 17.500 2.600 26 0" />
    </svg>
  )
}

/** Marca completa (lótus + nome). `tone="light"` para fundos escuros. */
export function BrandMark({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  const light = tone === 'light'
  return (
    <span className={cn('inline-flex flex-col items-center leading-none', className)}>
      <LotusIcon className={cn('h-7 w-auto', light ? 'text-petal' : 'text-brand-dark')} />
      <span className={cn('mt-2 text-[0.6rem] font-semibold tracking-[0.42em] uppercase', light ? 'text-petal' : 'text-brand-dark')}>Studio</span>
      <span className={cn('font-serif text-2xl italic', light ? 'text-white' : 'text-ink')}>Natalli Anjos</span>
    </span>
  )
}
