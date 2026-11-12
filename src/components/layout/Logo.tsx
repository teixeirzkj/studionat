import { LotusIcon } from '@/components/ui/BrandMark'
import { site } from '@/config/site'

/** Usa o arquivo de logo quando cadastrado em `site.images.logo`; senão, a marca desenhada (lótus + nome). */
export function Logo() {
  return (
    <a href="/#inicio" aria-label={`${site.name} — início`} className="inline-flex items-center gap-2.5">
      {site.images.logo ? (
        <img src={site.images.logo} alt={site.name} width={405} height={220} className="h-11 w-auto sm:h-14" />
      ) : (
        <>
          <LotusIcon className="h-7 w-auto text-brand-dark" />
          <span className="flex flex-col leading-none">
            <span className="text-[0.6rem] font-semibold tracking-[0.42em] text-brand-dark uppercase">Studio</span>
            <span className="font-serif text-2xl font-medium text-ink italic">{site.shortName}</span>
          </span>
        </>
      )}
    </a>
  )
}
