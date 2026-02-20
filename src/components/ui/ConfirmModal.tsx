// src/components/ui/ConfirmModal.tsx
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  icon?: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  variant      = 'danger',
  icon,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Focus trap — enfocar el botón cancelar al abrir (más seguro)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => confirmRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [open])

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  // Bloquear scroll del body
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else       document.body.style.overflow = ''
    return ()  => { document.body.style.overflow = '' }
  }, [open])

  const accentColor = variant === 'danger'
    ? { ring: 'ring-red-500/20', icon: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-500', btn: 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none' }
    : { ring: 'ring-amber-500/20', icon: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-none' }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.92, y: 12  }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className={`relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl ring-1 ${accentColor.ring} overflow-hidden`}
            >
              {/* Patrón decorativo sutil en esquina */}
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.06] pointer-events-none"
                style={{
                  background: variant === 'danger'
                    ? 'radial-gradient(circle, #ef4444, transparent)'
                    : 'radial-gradient(circle, #f59e0b, transparent)',
                }}
              />

              {/* Botón cerrar */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
              >
                <X size={16} />
              </button>

              <div className="p-7">
                {/* Icono */}
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1,   rotate: 0   }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.05 }}
                  className={`w-14 h-14 ${accentColor.icon} rounded-2xl flex items-center justify-center mb-5`}
                >
                  {icon ?? <AlertTriangle size={26} className={accentColor.iconColor} />}
                </motion.div>

                {/* Texto */}
                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight">
                  {title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-7">
                  {description}
                </p>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    {cancelLabel}
                  </button>
                  <motion.button
                    ref={confirmRef}
                    onClick={onConfirm}
                    whileTap={{ scale: 0.96 }}
                    className={`flex-1 py-3 px-4 rounded-2xl text-white font-bold text-sm shadow-lg transition-all ${accentColor.btn}`}
                  >
                    {confirmLabel}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}