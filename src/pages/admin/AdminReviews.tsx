import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Trash2, Search, Eye, EyeOff, MessageSquare,
  ChevronDown, Filter, Package,
  CheckCircle, XCircle, BarChart2
} from 'lucide-react'
import { sileo } from 'sileo'
import { useAdminReviews } from '../../hooks/useAdmin'
import ConfirmModal from '../../components/ui/ConfirmModal'
import StarRating from '../../components/ui/StarRating'
import type { AdminReview } from '../../hooks/useAdmin'

// ── Helpers ───────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Skeleton ──────────────────────────────────────────────────────
function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
          <div className="h-3 bg-gray-100 rounded w-3/4 mt-2" />
        </div>
        <div className="w-16 h-6 bg-gray-100 rounded-full" />
      </div>
    </div>
  )
}

// ── Rating badge ──────────────────────────────────────────────────
function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 4 ? 'bg-green-100 text-green-700' :
    rating === 3 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>
      <Star size={10} fill="currentColor" />
      {rating}
    </span>
  )
}

// ── Review Card ───────────────────────────────────────────────────
function ReviewCard({
  review,
  onDelete,
  onToggleVisible,
}: {
  review: AdminReview
  onDelete: (r: AdminReview) => void
  onToggleVisible: (r: AdminReview) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-sm ${
        review.is_visible === false
          ? 'border-gray-100 opacity-60'
          : 'border-gray-100'
      }`}
    >
      {/* Barra lateral de color según puntuación */}
      <div className={`h-1 w-full ${
        review.rating >= 4 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
        review.rating === 3 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
        'bg-gradient-to-r from-red-400 to-rose-500'
      }`} />

      <div className="p-5">
        {/* Fila principal */}
        <div className="flex items-start gap-4">
          {/* Avatar usuario */}
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {review.profile_name?.charAt(0).toUpperCase() ?? '?'}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-gray-900 text-sm">{review.profile_name ?? 'Usuario'}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating value={review.rating} size={13} />
                  <RatingBadge rating={review.rating} />
                  <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onToggleVisible(review)}
                  title={review.is_visible === false ? 'Mostrar reseña' : 'Ocultar reseña'}
                  className={`p-2 rounded-xl transition-colors ${
                    review.is_visible === false
                      ? 'hover:bg-green-50 text-gray-300 hover:text-green-500'
                      : 'hover:bg-amber-50 text-gray-400 hover:text-amber-500'
                  }`}
                >
                  {review.is_visible === false ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => onDelete(review)}
                  title="Eliminar reseña"
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Producto asociado */}
            <div className="flex items-center gap-1.5 mt-2">
              <Package size={11} className="text-orange-400 flex-shrink-0" />
              <p className="text-xs text-gray-500 truncate">
                <span className="font-medium">{review.product_name ?? 'Producto eliminado'}</span>
              </p>
            </div>

            {/* Comentario */}
            {review.comment ? (
              <div className="mt-3">
                <p className={`text-sm text-gray-600 leading-relaxed ${!expanded && 'line-clamp-2'}`}>
                  "{review.comment}"
                </p>
                {review.comment.length > 120 && (
                  <button
                    onClick={() => setExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 mt-1 font-medium"
                  >
                    {expanded ? 'Ver menos' : 'Ver más'}
                    <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={12} />
                    </motion.div>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-300 italic mt-2">Sin comentario</p>
            )}
          </div>
        </div>

        {/* Badge oculta */}
        {review.is_visible === false && (
          <div className="mt-3 flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 w-fit">
            <EyeOff size={11} className="text-gray-400" />
            <p className="text-xs font-medium text-gray-400">Reseña oculta al público</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function AdminReviews() {
  const { reviews, loading, stats, deleteReview, toggleVisibility } = useAdminReviews()

  const [search,       setSearch]       = useState('')
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all')
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const [togglingId,   setTogglingId]   = useState<string | null>(null)

  // ── Filtrado ──────────────────────────────────────────────────
  const filtered = reviews.filter(r => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false
    if (filterVisible === 'visible' && r.is_visible === false) return false
    if (filterVisible === 'hidden'  && r.is_visible !== false) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        (r.profile_name ?? '').toLowerCase().includes(q) ||
        (r.product_name ?? '').toLowerCase().includes(q) ||
        (r.comment ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  // ── Handlers ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const error = await deleteReview(deleteTarget.id)
    setDeleting(false)
    if (error) {
      sileo.error({ title: 'Error al eliminar', description: error.message })
    } else {
      sileo.success({ title: 'Reseña eliminada' })
    }
    setDeleteTarget(null)
  }

  const handleToggleVisible = async (review: AdminReview) => {
    setTogglingId(review.id)
    const error = await toggleVisibility(review.id, review.is_visible !== false)
    setTogglingId(null)
    if (error) {
      sileo.error({ title: 'Error al actualizar' })
    } else {
      sileo.success({
        title: review.is_visible === false ? 'Reseña visible' : 'Reseña oculta',
        description: review.is_visible === false
          ? 'La reseña vuelve a ser pública'
          : 'La reseña ya no se mostrará en la tienda',
      })
    }
  }

  // ── Distribución de calificaciones ────────────────────────────
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="space-y-6">

      {/* Modal de confirmación */}
      <ConfirmModal
        open={deleteTarget !== null}
        variant="danger"
        title="¿Eliminar reseña?"
        description={
          deleteTarget
            ? `Vas a eliminar la reseña de "${deleteTarget.profile_name ?? 'este usuario'}". Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel={deleting ? 'Eliminando...' : 'Sí, eliminar'}
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reseñas y valoraciones</h1>
        <p className="text-gray-400 text-sm mt-1">
          {reviews.length} reseña{reviews.length !== 1 ? 's' : ''} en total
        </p>
      </div>

      {/* Stats cards */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Total reseñas',
              value: stats.total,
              icon: MessageSquare,
              color: 'from-blue-400 to-blue-600',
              text: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Valoración media',
              value: stats.average.toFixed(1),
              icon: Star,
              color: 'from-amber-400 to-orange-500',
              text: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              label: 'Reseñas visibles',
              value: stats.visible,
              icon: CheckCircle,
              color: 'from-green-400 to-emerald-600',
              text: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Reseñas ocultas',
              value: stats.hidden,
              icon: XCircle,
              color: 'from-gray-400 to-gray-600',
              text: 'text-gray-500',
              bg: 'bg-gray-50',
            },
          ].map(({ label, value, icon: Icon, color, text, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm relative overflow-hidden">
              <div className={`absolute -top-3 -right-3 w-16 h-16 rounded-full bg-gradient-to-br ${color} opacity-10`} />
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={17} className={text} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Distribución de estrellas */}
      {!loading && reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-gray-400" />
            <p className="text-sm font-bold text-gray-700">Distribución de calificaciones</p>
          </div>
          <div className="space-y-2">
            {distribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 flex-shrink-0 justify-end">
                  <span className="text-xs font-semibold text-gray-500">{star}</span>
                  <Star size={11} fill="#fb923c" className="text-orange-400" />
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      star >= 4 ? 'bg-green-400' : star === 3 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-12 flex-shrink-0 font-medium">
                  {count} ({pct.toFixed(0)}%)
                </span>
                <button
                  onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex-shrink-0 ${
                    filterRating === star
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500'
                  }`}
                >
                  {filterRating === star ? 'Quitar filtro' : 'Filtrar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por usuario, producto o comentario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filtro visibilidad */}
        <div className="flex gap-2">
          {([
            { key: 'all',     label: 'Todas' },
            { key: 'visible', label: 'Visibles' },
            { key: 'hidden',  label: 'Ocultas'  },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilterVisible(f.key)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                filterVisible === f.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por estrellas (chips) */}
      {filterRating !== 'all' && (
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-gray-400" />
          <span className="text-xs text-gray-500">Filtrando por:</span>
          <button
            onClick={() => setFilterRating('all')}
            className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-orange-200 transition-colors"
          >
            <Star size={10} fill="currentColor" /> {filterRating} estrella{filterRating !== 1 ? 's' : ''}
            <XCircle size={12} />
          </button>
        </div>
      )}

      {/* Lista de reseñas */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <ReviewSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white rounded-2xl border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare size={28} strokeWidth={1.5} className="text-gray-300" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Sin reseñas</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || filterRating !== 'all' || filterVisible !== 'all'
                ? 'No hay reseñas con estos filtros'
                : 'Aún no hay reseñas de productos'}
            </p>
          </div>
          {(search || filterRating !== 'all' || filterVisible !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterRating('all'); setFilterVisible('all') }}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 font-medium">
            Mostrando {filtered.length} de {reviews.length} reseñas
          </p>
          <AnimatePresence mode="popLayout">
            {filtered.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.03 }}
              >
                <ReviewCard
                  review={{ ...review, is_visible: togglingId === review.id ? !review.is_visible : review.is_visible }}
                  onDelete={setDeleteTarget}
                  onToggleVisible={handleToggleVisible}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}