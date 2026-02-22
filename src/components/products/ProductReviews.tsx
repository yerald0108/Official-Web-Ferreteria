import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, Pencil, CheckCircle } from 'lucide-react'
import { sileo } from 'sileo'
// ⚠️ Ajusta estas rutas según la ubicación real de los archivos en tu proyecto
import { useAuth } from '../../hooks/useAuth'              // ruta a tu hook useAuth existente
import { useProductReviews } from '../../hooks/useReviews'
import type { Review } from '../../hooks/useReviews'
import StarRating from './StarRating'                       // StarRating.tsx en la misma carpeta

interface Props {
  productId: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function ProductReviews({ productId }: Props) {
  const { user } = useAuth()
  const { reviews, loading, average, count, userReview, submitReview } = useProductReviews(productId)

  const [selectedRating, setSelectedRating] = useState(userReview?.rating ?? 0)
  const [comment, setComment]               = useState(userReview?.comment ?? '')
  const [saving, setSaving]                 = useState(false)
  const [showForm, setShowForm]             = useState(false)

  // Sincronizar form cuando carga el review del usuario
  useState(() => {
    if (userReview) {
      setSelectedRating(userReview.rating)
      setComment(userReview.comment ?? '')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRating === 0) {
      sileo.warning({ title: 'Selecciona una calificación' })
      return
    }
    setSaving(true)
    const { error } = await submitReview(selectedRating, comment)
    setSaving(false)
    if (error) {
      sileo.error({ title: 'Error al guardar', description: error })
    } else {
      sileo.success({ title: userReview ? 'Reseña actualizada' : '¡Gracias por tu reseña!' })
      setShowForm(false)
    }
  }

  // Distribución de calificaciones
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter((r: Review) => r.rating === star).length,
    pct: count ? (reviews.filter((r: Review) => r.rating === star).length / count) * 100 : 0,
  }))

  return (
    <section className="space-y-8">
      <h2 className="text-xl font-black text-gray-900 dark:text-white">Reseñas y valoraciones</h2>

      {/* ── Resumen general ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">

          {/* Número grande */}
          <div className="text-center flex-shrink-0">
            <p className="text-6xl font-black text-gray-900 dark:text-white leading-none">
              {count === 0 ? '–' : average.toFixed(1)}
            </p>
            <StarRating value={average} size={18} className="justify-center mt-2" />
            <p className="text-xs text-gray-400 mt-1">{count} reseña{count !== 1 ? 's' : ''}</p>
          </div>

          {/* Barras de distribución */}
          <div className="flex-1 w-full space-y-1.5">
            {distribution.map(({ star, count: c, pct }) => (
              <div key={star} className="flex items-center gap-2.5 text-xs">
                <span className="text-gray-500 w-3 text-right flex-shrink-0">{star}</span>
                <Star size={11} fill="#fb923c" className="text-orange-400 flex-shrink-0" />
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-orange-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-gray-400 w-4 flex-shrink-0">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botón para escribir reseña */}
        {user && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            {userReview && !showForm ? (
              <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Tu valoración: {userReview.rating}/5
                    </p>
                    <StarRating value={userReview.rating} size={12} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedRating(userReview.rating)
                    setComment(userReview.comment ?? '')
                    setShowForm(true)
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Pencil size={13} /> Editar
                </button>
              </div>
            ) : !showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                <MessageSquare size={16} /> Escribir una reseña
              </button>
            ) : null}

            {/* Formulario */}
            <AnimatePresence>
              {showForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Tu calificación
                      </p>
                      <StarRating
                        value={selectedRating}
                        size={28}
                        interactive
                        onChange={setSelectedRating}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Comentario <span className="text-gray-400 font-normal">(opcional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Cuéntanos tu experiencia con el producto..."
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving || selectedRating === 0}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
                      >
                        {saving ? 'Guardando...' : userReview ? 'Actualizar' : 'Publicar reseña'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        )}

        {!user && (
          <p className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-400">
            <a href="/login" className="text-orange-500 font-semibold hover:underline">Inicia sesión</a> para dejar tu reseña
          </p>
        )}
      </div>

      {/* ── Lista de reseñas ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare size={36} strokeWidth={1} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-sm">Sé el primero en dejar una reseña</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: Review, i: number) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {review.profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {review.profile?.full_name ?? 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                  </div>
                  <StarRating value={review.rating} size={13} className="mt-1 mb-2" />
                  {review.comment && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}