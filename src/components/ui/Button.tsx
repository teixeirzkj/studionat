import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/format'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-dark text-white shadow-soft hover:bg-ink',
  secondary: 'border border-brand-dark/30 bg-white/70 text-brand-dark hover:border-brand-dark hover:bg-white',
  ghost: 'text-brand-dark hover:bg-blush',
}

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-6 text-sm',
  lg: 'min-h-13 px-8 text-base',
}

interface Common {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
}

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type LinkProps = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** Botão do design system. Com `href` renderiza um link; links externos abrem em nova aba. */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  if (rest.href !== undefined) {
    const external = /^https?:\/\//.test(rest.href)
    return (
      <a className={classes} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...(rest as LinkProps)}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...(rest as ButtonProps)}>
      {children}
    </button>
  )
}
