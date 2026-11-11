import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/cormorant-garamond'
import '@fontsource-variable/cormorant-garamond/wght-italic.css'
import '@fontsource-variable/manrope'
import './index.css'
import App from './App'
import { initAnalytics } from './lib/analytics'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
