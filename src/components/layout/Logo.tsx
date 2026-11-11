import { site } from '@/config/site'

/** Usa o arquivo de logo quando cadastrado em `site.images.logo`; senão, a marca tipográfica. */
export function Logo() {
  return (
    <a href="/#inicio" aria-label={`${site.name} — início`} className="inline-flex items-center">
      {site.images.logo ? (
        <img src={site.images.logo} alt={site.name} className="h-10 w-auto" />
      ) : (
        <span className="flex flex-col leading-none">
          <span className="text-[0.6rem] font-semibold tracking-[0.42em] text-brand-dark uppercase">Studio</span>
          <span className="font-serif text-2xl font-medium text-ink italic">{site.shortName}</span>
        </span>
      )}
    </a>
  )
}
