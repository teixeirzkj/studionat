import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from '@/pages/Landing'

// Páginas secundárias e o painel ficam fora do pacote inicial da landing (desempenho em anúncios).
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'))
const AdminApp = lazy(() => import('@/pages/admin/AdminApp'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageLoader() {
  return (
    <div role="status" className="grid min-h-screen place-items-center bg-blush">
      <span className="size-9 animate-spin rounded-full border-2 border-petal border-t-brand-dark" />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
