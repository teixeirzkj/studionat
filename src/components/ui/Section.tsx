import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>
}

interface SectionProps {
  id: string
  /** Fundo rosa muito claro para alternar o ritmo da página. */
  tinted?: boolean
  children: ReactNode
  className?: string
}

export function Section({ id, tinted, children, className }: SectionProps) {
  return (
    <section id={id} className={cn('py-20 sm:py-28', tinted && 'bg-blush', className)}>
      <Container>{children}</Container>
    </section>
  )
}

interface HeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'center' | 'left'
}

export function SectionHeading({ eyebrow, title, description, align = 'center' }: HeadingProps) {
  return (
    <div className={cn('mb-12 max-w-2xl sm:mb-16', align === 'center' && 'mx-auto text-center')}>
      <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-brand-dark uppercase">{eyebrow}</p>
      <h2 className="text-4xl leading-tight font-medium text-balance sm:text-5xl">{title}</h2>
      {description && <p className="mt-5 text-base leading-relaxed text-pretty text-ink-soft sm:text-lg">{description}</p>}
    </div>
  )
}
