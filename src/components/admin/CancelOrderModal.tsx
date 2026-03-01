import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XCircle, X, AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  orderShortId: string
  customerName: string
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export default function CancelOrderModal({ open, orderShortId, customerName, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState('')
  const isValid = reason.trim().length >= 10

  const handleConfirm = () => {
    if (!isValid) return
    onConfirm(reason.trim())
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onCancel()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Barra roja superior */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-600" />

              <div className="p-7">
                {/* Botón cerrar */}
                <button
                  onClick={handleClose}
                  className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Ícono */}
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-5">
                  <XCircle size={28} className="text-red-500" />
                </div>

                {/* Título */}
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                  Cancelar pedido #{orderShortId}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Se le enviará un correo a <strong className="text-gray-700 dark:text-gray-300">{customerName}</strong> con el motivo de la cancelación.
                </p>

                {/* Textarea del motivo */}
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    Motivo de cancelación
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Ej: El producto solicitado está agotado temporalmente y no podremos cumplir con la entrega en el plazo acordado..."
                    className="w-full px-4 py-3 border-2 rounded-2xl text-sm bg-white dark:bg-gray-800 dark:text-white resize-none focus:outline-none transition-all placeholder-gray-400
                      border-gray-200 dark:border-gray-700 focus:border-red-400 dark:focus:border-red-500"
                  />
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${!isValid && reason.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {!isValid && reason.length > 0
                        ? `Mínimo 10 caracteres (${reason.trim().length}/10)`
                        : `${reason.trim().length} caracteres`
                      }
                    </p>
                    {isValid && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-green-500 font-medium"
                      >
                        ✓ Listo para enviar
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={handleConfirm}
                    disabled={!isValid}
                    whileTap={isValid ? { scale: 0.97 } : {}}
                    className="flex-1 py-3 px-4 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-none"
                  >
                    <XCircle size={16} />
                    Cancelar pedido
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