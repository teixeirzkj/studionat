import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { BookingButton } from '@/components/BookingButton'
import { Container } from '@/components/ui/Section'
import { cn } from '@/lib/format'
import { Logo } from './Logo'

export interface NavItem {
  label: string
  href: string
}

export function Header({ nav }: { nav: NavItem[] }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition duration-300',
        scrolled || open ? 'bg-white/90 shadow-[0_1px_0_0_rgb(157_66_106/0.12)] backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <Container className="flex h-18 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Seções do site" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-ink-soft transition hover:text-brand-dark">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <BookingButton placement="header" className="hidden sm:inline-flex" />
          <button
            type="button"
            className="grid size-11 cursor-pointer place-items-center rounded-full text-ink hover:bg-blush lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      <div id="menu-mobile" hidden={!open} className="border-t border-petal/60 lg:hidden">
        <Container className="flex flex-col py-4">
          <nav aria-label="Seções do site (menu)" className="flex flex-col">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-petal/40 py-4 font-serif text-xl text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <BookingButton placement="menu-mobile" size="lg" className="mt-5" />
        </Container>
      </div>
    </header>
  )
}
