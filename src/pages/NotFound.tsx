import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-blush px-5 text-center">
      <div>
        <p className="font-serif text-7xl text-brand-dark italic">404</p>
        <h1 className="mt-2 text-3xl font-medium">Página não encontrada</h1>
        <Link to="/" className="mt-6 inline-block font-medium text-brand-dark underline underline-offset-4">
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}
