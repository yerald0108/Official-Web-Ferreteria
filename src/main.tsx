import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Aplicar tema guardado antes de renderizar
const savedTheme = localStorage.getItem('ferreteria-theme')
if (savedTheme) {
  try {
    const parsed = JSON.parse(savedTheme)
    if (parsed?.state?.isDark) {
      document.documentElement.classList.add('dark')
    }
  } catch {}
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)