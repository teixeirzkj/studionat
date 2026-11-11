import type { FaqItem, GalleryItem, Service, ServiceCategory, Testimonial } from '@/types'

/**
 * Conteúdo inicial da landing page.
 *
 * É o que o site exibe enquanto o Supabase não está conectado. A partir da
 * Etapa 3, serviços, galeria e depoimentos são lidos do banco e administrados
 * pelo painel; este arquivo vira apenas a carga inicial (seed).
 *
 * IMPORTANTE: preços e durações estão `null` porque não estão publicados nas
 * referências do estúdio. Não preencha com valores estimados.
 */

export const categoryLabels: Record<ServiceCategory, string> = {
  sobrancelhas: 'Sobrancelhas',
  epilacao: 'Epilação',
  unhas: 'Unhas',
  massagem: 'Massagem',
  micropigmentacao: 'Micropigmentação',
  tatuagem: 'Tatuagem',
  piercing: 'Piercing',
  outros: 'Outros',
}

const service = (
  id: string,
  name: string,
  category: ServiceCategory,
  description: string,
): Service => ({
  id,
  name,
  category,
  description,
  priceCents: null,
  durationMinutes: null,
  imageUrl: null,
  active: true,
})

export const services: Service[] = [
  service(
    'design-de-sobrancelhas',
    'Design de sobrancelhas',
    'sobrancelhas',
    'Desenho pensado para o formato do seu rosto, valorizando o olhar com naturalidade.',
  ),
  service(
    'epilacao-com-cera',
    'Epilação com cera',
    'epilacao',
    'Remoção dos pelos com cuidado e técnica, deixando a pele lisa e macia por mais tempo.',
  ),
  service(
    'epilacao-com-linha',
    'Epilação com linha',
    'epilacao',
    'Técnica precisa e delicada, indicada para o rosto e para peles mais sensíveis.',
  ),
  service(
    'manicure-e-pedicure',
    'Manicure e pedicure',
    'unhas',
    'Cuidado completo para mãos e pés, com acabamento caprichado.',
  ),
  service(
    'massagens',
    'Massagens',
    'massagem',
    'Um momento de pausa para relaxar o corpo e aliviar as tensões do dia a dia.',
  ),
  service(
    'micropigmentacao',
    'Micropigmentação',
    'micropigmentacao',
    'Realce duradouro e de aparência natural, planejado em conjunto com você antes do procedimento.',
  ),
  service(
    'tatuagens',
    'Tatuagens',
    'tatuagem',
    'Traços delicados, feitos com atenção a cada detalhe do desenho que você escolher.',
  ),
  service(
    'body-piercing',
    'Body piercing',
    'piercing',
    'Perfuração realizada com técnica e orientação de cuidados para uma boa cicatrização.',
  ),
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
