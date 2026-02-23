// src/components/ui/ProductImage.tsx
import { useState } from 'react'
import { Package } from 'lucide-react'

interface Props {
  src: string | null | undefined
  alt: string
  className?: string
}

export default function ProductImage({ src, alt, className = '' }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  // Sin src → mostramos directamente el fallback sin intentar cargar nada
  if (!src) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-100 dark:bg-gray-800 ${className}`}>
        <Package size={40} strokeWidth={1} />
        <span className="text-xs mt-1">Sin imagen</span>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>

      {/* ── Placeholder shimmer — visible mientras carga ─────────────────── */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      )}

      {/* ── Fallback — visible si la imagen falla ────────────────────────── */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gray-100 dark:bg-gray-800">
          <Package size={40} strokeWidth={1} />
          <span className="text-xs mt-1">Sin imagen</span>
        </div>
      )}

      {/* ── Imagen real ──────────────────────────────────────────────────── */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={[
          'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500',
          // Oculta la imagen hasta que cargue para que no haya flash de imagen rota
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

    </div>
  )
}