import { useEffect } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/ui/Section'
import { site } from '@/config/site'

/**
 * RASCUNHO de política de privacidade (LGPD), descrevendo apenas o que o
 * sistema realmente faz. Deve ser revisado pela proprietária antes da
 * divulgação em anúncios.
 */
const sections = [
  {
    title: 'Quais dados coletamos',
    text: 'Para solicitar um agendamento pedimos apenas o seu nome e o seu número de WhatsApp. Não solicitamos documentos, dados de saúde nem dados de pagamento pelo site.',
  },
  {
    title: 'Para que usamos',
    text: 'Usamos esses dados somente para confirmar, lembrar, reagendar ou cancelar os seus atendimentos e manter o histórico dos procedimentos realizados no estúdio.',
  },
  {
    title: 'Mensagens pelo WhatsApp',
    text: 'Ao solicitar um agendamento, você poderá receber mensagens do estúdio sobre esse atendimento. Você pode pedir para não receber mais mensagens a qualquer momento.',
  },
  {
    title: 'Cookies e medição de anúncios',
    text: 'O site pode usar ferramentas de medição de anúncios (como o Meta Pixel) somente se você aceitar no aviso de cookies. Se recusar, nenhum dado de navegação é enviado a terceiros e o site funciona normalmente.',
  },
  {
    title: 'Compartilhamento',
    text: 'Não vendemos nem compartilhamos os seus dados com terceiros para fins de marketing. Eles ficam armazenados em serviços de hospedagem e banco de dados contratados para o funcionamento do sistema.',
  },
  {
    title: 'Seus direitos',
    text: 'Você pode solicitar a consulta, a correção ou a exclusão dos seus dados a qualquer momento, entrando em contato com o estúdio pelo WhatsApp.',
  },
]

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = `Política de privacidade | ${site.name}`
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header nav={[{ label: 'Voltar ao site', href: '/' }]} />
      <main className="bg-blush pt-32 pb-20">
        <Container className="max-w-3xl">
          <h1 className="text-5xl font-medium">Política de privacidade</h1>
          <p className="mt-4 text-ink-soft">
            Como o {site.name} trata os dados pessoais de quem usa este site, de acordo com a Lei Geral de Proteção de
            Dados (Lei nº 13.709/2018).
          </p>
          <div className="mt-10 space-y-8 rounded-3xl bg-white p-7 shadow-soft sm:p-10">
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-2xl font-medium">{s.title}</h2>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.text}</p>
              </section>
            ))}
            <section>
              <h2 className="text-2xl font-medium">Contato</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                {site.name} — WhatsApp {site.whatsapp.display}.
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}
