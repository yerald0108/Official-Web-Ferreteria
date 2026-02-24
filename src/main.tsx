// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth'

// ← AÑADE ESTO: aplicar tema antes del primer render para evitar flash
const stored = localStorage.getItem('ferreteria-theme')
if (stored) {
  try {
    const parsed = JSON.parse(stored)
    if (parsed?.state?.isDark) {
      document.documentElement.classList.add('dark')
    }
  } catch {
    // si falla, no pasa nada
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)