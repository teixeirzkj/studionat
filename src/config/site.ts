import type { BusinessHours, TimePeriod } from '@/types'

const p = (opensAt: string, closesAt: string): TimePeriod => ({ opensAt, closesAt })

/**
 * Dados institucionais do estúdio.
 *
 * Tudo aqui veio de fontes públicas verificadas (página do MinhaAgenda e bio do
 * Instagram). Campos `null` / listas vazias são informações que AINDA NÃO foram
 * confirmadas — o site esconde ou mostra um texto neutro até serem preenchidas.
 * Na Etapa 3 estes valores passam a ser editáveis pelo painel (tabela `settings`).
 */
export const site = {
  name: 'Studio Natalli Anjos',
  shortName: 'Natalli Anjos',
  /** Bio do Instagram do estúdio. */
  specialties: ['Designer de sobrancelhas', 'Micropigmentadora', 'Epiladora', 'Body Piercer'],

  whatsapp: {
    /** Formato internacional, só dígitos (usado em wa.me). */
    number: '5574999220337',
    display: '(74) 99922-0337',
    defaultMessage: 'Olá, gostaria de marcar um horário',
  },

  instagram: {
    handle: '@studionatallianjos',
    url: 'https://www.instagram.com/studionatallianjos/',
  },

  address: {
    street: 'Rua Virgílio Almeida, 208',
    district: 'Centro',
    city: 'Miguel Calmon',
    state: 'BA',
    zip: '44720-000',
  },

  /** Expediente publicado na página de agendamento do estúdio (11/11/2026). */
  hours: [
    { weekday: 1, periods: [] },
    { weekday: 2, periods: [p('08:00', '09:30'), p('12:00', '18:00')] },
    { weekday: 3, periods: [p('08:00', '09:30'), p('11:00', '18:30')] },
    { weekday: 4, periods: [p('11:00', '12:30'), p('13:00', '17:00')] },
    { weekday: 5, periods: [p('08:30', '12:30'), p('13:30', '20:00')] },
    { weekday: 6, periods: [p('08:00', '12:00'), p('13:00', '15:30')] },
    { weekday: 0, periods: [] },
  ] as BusinessHours[],

  /** Fotos oficiais ficam em /public/images. `null` = fundo decorativo da marca. */
  images: {
    /** Logo enviada pelo cliente em 12/11/2026 (lótus + nome), em rosa e em branco. */
    logo: '/images/logo.png' as string | null,
    logoLight: '/images/logo-branca.png' as string | null,
    /** Imagem ilustrativa do ambiente (gerada por IA, enviada pelo cliente em 12/11/2026). */
    hero: '/images/hero.jpg' as string | null,
    /** Imagem ilustrativa do ambiente para a seção "Sobre". */
    studio: '/images/sobre-estudio.jpg' as string | null,
    /** Foto de perfil da página de agendamento do estúdio (500×500). */
    owner: '/images/natalli.jpg' as string | null,
  },

  /**
   * `true` enquanto a galeria usa imagens geradas como modelo (12/11/2026).
   * Mostra o aviso "imagens ilustrativas" no site. Trocar para `false` quando
   * a galeria tiver apenas fotos reais, autorizadas pelas clientes.
   */
  galleryIsIllustrative: true,

  /** A CONFIRMAR: formações e certificações da profissional. Vazio = bloco não aparece. */
  certifications: [] as string[],
} as const

export const fullAddress = `${site.address.street} - ${site.address.district}, ${site.address.city} - ${site.address.state}, ${site.address.zip}`

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.name}, ${fullAddress}`,
)}`
