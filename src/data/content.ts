import type { FaqItem, GalleryItem, Service, ServiceCategory, Testimonial } from '@/types'

/**
 * Conteúdo inicial da landing page.
 *
 * Serviços, preços e durações foram copiados da página pública de agendamento
 * do estúdio (online.maapp.com.br/studionatallianjos) em 11/11/2026.
 *
 * É o que o site exibe enquanto o Supabase não está conectado. A partir da
 * Etapa 3, serviços, galeria e depoimentos são lidos do banco e administrados
 * pelo painel; este arquivo vira apenas a carga inicial (seed).
 */

export const categoryLabels: Record<ServiceCategory, string> = {
  sobrancelhas: 'Design de sobrancelha',
  'epilacao-cera': 'Epilação com cera',
  'epilacao-linha': 'Epilação com linha',
  micropigmentacao: 'Micropigmentação de sobrancelhas',
  outros: 'Outros',
}

/** Ordem em que as categorias aparecem no site. */
export const categoryOrder: ServiceCategory[] = ['sobrancelhas', 'epilacao-cera', 'epilacao-linha', 'micropigmentacao', 'outros']

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Serviços que já têm foto em /public/images/servicos/<slug>.jpg.
 * (No banco, a foto de cada serviço fica na coluna `image_url` e é trocada pelo painel.)
 */
const serviceImages = new Set([
  'design-com-henna',
  'design-com-tintura',
  'design-simples-personalizado',
  'barba-design',
  'epilacao-abdomen-peitoral',
])

/** [nome, duração em minutos, preço em reais] */
type Row = [name: string, minutes: number, reais: number]

const fromRows = (category: ServiceCategory, rows: Row[]): Service[] =>
  rows.map(([name, minutes, reais]) => ({
    id: slug(name),
    name,
    category,
    description: '',
    priceCents: reais * 100,
    durationMinutes: minutes,
    imageUrl: serviceImages.has(slug(name)) ? `/images/servicos/${slug(name)}.jpg` : null,
    active: true,
  }))

export const services: Service[] = [
  ...fromRows('sobrancelhas', [
    ['Design com henna', 30, 50],
    ['Design com tintura', 30, 50],
    ['Design simples personalizado', 15, 35],
  ]),
  ...fromRows('epilacao-cera', [
    ['Barba + design', 30, 80],
    ['Epilação abdômen + peitoral', 30, 70],
    ['Epilação abdômen completo', 30, 60],
    ['Epilação abdômen faixa', 15, 20],
    ['Epilação axila', 20, 35],
    ['Epilação de costas', 30, 60],
    ['Epilação de coxas', 30, 40],
    ['Epilação de meia perna', 30, 40],
    ['Epilação perna completa', 30, 60],
    ['Epilação virilha cavada', 25, 40],
    ['Epilação virilha completa', 30, 60],
    ['Epilação virilha completa + perianal', 30, 60],
    ['Epilação virilha simples', 20, 30],
  ]),
  ...fromRows('epilacao-linha', [
    ['Epilação costeletas', 30, 20],
    ['Epilação da testa', 30, 15],
    ['Epilação de buço', 5, 15],
    ['Epilação de rosto + design e henna', 40, 75],
    ['Epilação do queixo', 10, 15],
    ['Epilação rosto completo', 30, 55],
    ['Rosto + design sobrancelha', 40, 65],
  ]),
  ...fromRows('micropigmentacao', [
    ['Micropigmentação fio a fio', 80, 400],
    ['Micropigmentação híbrida', 120, 450],
    ['Micropigmentação shadow', 140, 450],
    ['Retoque anual micro', 60, 250],
    ['Retoque mensal micro', 60, 80],
  ]),
]

/** Somente fotos reais e autorizadas. Vazio = seção mostra o convite para o Instagram. */
export const gallery: GalleryItem[] = []

/** Somente avaliações reais de clientes. Vazio = seção não aparece no site. */
export const testimonials: Testimonial[] = []

/** Respostas neutras, sem afirmar políticas ainda não confirmadas pelo estúdio. Revisar com a proprietária. */
export const faq: FaqItem[] = [
  {
    question: 'Como faço para agendar um horário?',
    answer:
      'Escolha o procedimento desejado aqui no site e toque em "Agendar". Sua solicitação é enviada ao estúdio, que confirma o horário com você pelo WhatsApp.',
  },
  {
    question: 'Preciso de algum preparo antes do procedimento?',
    answer:
      'Depende do procedimento. Ao confirmar o agendamento, o estúdio envia as orientações específicas para o seu atendimento.',
  },
  {
    question: 'Quais cuidados devo ter depois?',
    answer:
      'Cada procedimento tem seus próprios cuidados. Você recebe todas as orientações no dia do atendimento e pode tirar dúvidas pelo WhatsApp sempre que precisar.',
  },
  {
    question: 'Quais são as formas de pagamento?',
    answer:
      'As formas de pagamento disponíveis são informadas pelo estúdio no momento da confirmação do seu horário.',
  },
  {
    question: 'E se eu precisar remarcar ou cancelar?',
    answer:
      'Avise o estúdio pelo WhatsApp com a maior antecedência possível, para que o horário possa ser oferecido a outra cliente.',
  },
]
