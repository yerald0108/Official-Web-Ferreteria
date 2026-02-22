import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Package, Trash2, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWishlist } from '../hooks/useWishlist'
import { useCartStore } from '../store/cartStore'
import { sileo } from 'sileo'

// ── Skeleton ──────────────────────────────────────────────────────
function WishlistSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-100 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/2" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg w-20" />
          <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl w-28" />
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function WishlistPage() {
  const { user }                              = useAuth()
  const { items, loading, removeFromWishlist } = useWishlist(user?.id)
  const { addItem, getTotalItems }             = useCartStore()

  const handleAddToCart = (item: typeof items[0]) => {
    if (!item.product) return

    const antes   = getTotalItems()
    addItem(item.product, 1)
    const despues = getTotalItems()

    if (despues === antes) {
      sileo.warning({
        title:       'Stock insuficiente',
        description: `Solo hay ${item.product.stock} unidades disponibles`,
      })
    } else {
      sileo.success({
        title:       'Agregado al carrito',
        description: item.product.name,
      })
    }
  }

  const handleRemove = (item: typeof items[0]) => {
    removeFromWishlist(item.product_id)
    sileo.success({
      title:       'Eliminado de favoritos',
      description: item.product?.name ?? '',
    })
  }

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis favoritos</h1>
          <p className="text-gray-400 text-sm mt-1">Cargando...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <WishlistSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  // ── Estado vacío ──────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis favoritos</h1>
          <p className="text-gray-400 text-sm mt-1">0 productos guardados</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center gap-5"
        >
          {/* Icono animado */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center"
          >
            <Heart size={40} className="text-red-300" strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Aún no tienes favoritos
            </h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Guarda los productos que te interesan tocando el corazón
              y encuéntralos aquí cuando quieras comprarlos.
            </p>
          </div>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-200 dark:shadow-none text-sm"
          >
            Explorar catálogo <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Lista de favoritos ────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis favoritos</h1>
          <p className="text-gray-400 text-sm mt-1">
            {items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/catalog"
          className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          Seguir explorando <ArrowRight size={15} />
        </Link>
      </div>

      {/* Grid de productos */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, i) => {
            const product    = item.product
            const outOfStock = (product?.stock ?? 0) === 0

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                {/* Imagen */}
                <Link
                  to={`/product/${item.product_id}`}
                  className="block relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden"
                >
                  {product?.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <Package size={40} strokeWidth={1} />
                      <span className="text-xs mt-1">Sin imagen</span>
                    </div>
                  )}

                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                        Agotado
                      </span>
                    </div>
                  )}

                  {product?.category && (
                    <span className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 text-xs font-medium text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                      {product.category.name}
                    </span>
                  )}

                  {/* Botón eliminar favorito */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemove(item)
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:scale-110 transition-all duration-200"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Corazón relleno — siempre visible */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm group-hover:opacity-0 transition-opacity duration-200">
                    <Heart size={13} fill="currentColor" />
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-orange-500 transition-colors">
                      {product?.name ?? 'Producto no disponible'}
                    </h3>
                  </Link>
                  {product?.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-xl font-bold text-orange-500">
                        ${product?.price.toFixed(2) ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {outOfStock ? 'Sin stock' : `${product?.stock} disponibles`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={outOfStock || !product}
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors active:scale-95"
                    >
                      <ShoppingCart size={16} />
                      Agregar
                    </button>
                  </div>

                  {/* Fecha guardado */}
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                    Guardado el {new Date(item.created_at).toLocaleDateString('es-CU', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>
    </div>
  )
}