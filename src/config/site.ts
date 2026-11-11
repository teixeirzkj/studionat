import type { BusinessHours } from '@/types'

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

  /** A CONFIRMAR: horários de funcionamento. Vazio = rodapé mostra "Atendimento com hora marcada". */
  hours: [] as BusinessHours[],

  /** A CONFIRMAR: fotos oficiais. Coloque os arquivos em /public/images e informe o caminho. */
  images: {
    logo: null as string | null, // ex.: '/images/logo.svg'
    hero: null as string | null, // ex.: '/images/hero.jpg'
    owner: null as string | null, // ex.: '/images/natalli.jpg'
  },

  /** A CONFIRMAR: formações e certificações da profissional. Vazio = bloco não aparece. */
  certifications: [] as string[],
} as const

export const fullAddress = `${site.address.street} - ${site.address.district}, ${site.address.city} - ${site.address.state}, ${site.address.zip}`

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.name}, ${fullAddress}`,
)}`
