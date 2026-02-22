import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ShoppingCart, Package, Tag,
  CheckCircle, AlertCircle, Minus, Plus, ChevronRight, Share2, Heart
} from 'lucide-react'
import { useProduct, useRelatedProducts } from '../hooks/useProducts'
import { useCartStore } from '../store/cartStore'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useAuth } from '../hooks/useAuth'
import { useWishlist } from '../hooks/useWishlist'
import ProductCard from '../components/products/ProductCard'
import ErrorState from '../components/ui/ErrorState'
import { sileo } from 'sileo'

// ── Skeleton para productos relacionados ──────────────────────────
function RelatedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-gray-100 dark:bg-gray-800" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/2" />
            <div className="flex justify-between items-center mt-4">
              <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg w-16" />
              <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProductPage() {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const { product, loading, error } = useProduct(id ?? '')

  // ← loading ahora viene del hook modificado
  const { products: related, loading: loadingRelated } = useRelatedProducts(
    product?.category_id ?? null,
    id ?? ''
  )

  const { addItem, getTotalItems }  = useCartStore()
  const { isOnline }                = useNetworkStatus()
  const [quantity, setQuantity]     = useState(1)
  const [added, setAdded]           = useState(false)

  const { user }                          = useAuth()
  const { isWishlisted, toggleWishlist }  = useWishlist(user?.id)
  const wishlisted                        = product ? isWishlisted(product.id) : false

  const handleAdd = () => {
    if (!product) return
    const antes = getTotalItems()
    addItem(product, quantity)
    const despues = getTotalItems()

    if (despues === antes) {
      sileo.warning({
        title: 'Stock insuficiente',
        description: `Solo hay ${product.stock} unidades disponibles`,
      })
    } else {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
      sileo.success({
        title: 'Agregado al carrito',
        description: `${quantity} × ${product.name}`,
        button: { title: 'Ver carrito', onClick: () => navigate('/cart') },
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product?.name, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      sileo.success({ title: 'Enlace copiado al portapapeles' })
    }
  }

  const handleWishlist = async () => {
    if (!user) {
      sileo.warning({
        title: 'Inicia sesión',
        description: 'Necesitas una cuenta para guardar favoritos',
        button: { title: 'Iniciar sesión', onClick: () => navigate('/login') },
      })
      return
    }

    if (!product) return

    await toggleWishlist(product.id)
    sileo.success({
      title: wishlisted ? 'Eliminado de favoritos' : '❤️ Agregado a favoritos',
      description: product.name,
      ...(!wishlisted && {
        button: { title: 'Ver favoritos', onClick: () => navigate('/favoritos') },
      }),
    })
  }

  // ── Loading skeleton principal ────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded-xl w-1/3 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded-xl w-3/4 animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl w-1/3 animate-pulse" />
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // ── Error / no encontrado ─────────────────────────────────────
  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <ErrorState
          type={!isOnline ? 'network' : !product && !error ? 'generic' : 'server'}
          title={!product && !error ? 'Producto no encontrado' : undefined}
          description={
            !product && !error
              ? 'Este producto no existe o fue eliminado.'
              : undefined
          }
          onRetry={error ? () => window.location.reload() : undefined}
        />
        <div className="mt-6 flex justify-center">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={16} /> Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  const outOfStock = product.stock === 0
  const lowStock   = product.stock > 0 && product.stock <= 5
  const maxQty     = Math.min(product.stock, 99)

  return (
    <div className="max-w-5xl mx-auto space-y-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link to="/" className="hover:text-orange-500 transition-colors">Inicio</Link>
        <ChevronRight size={14} />
        <Link to="/catalog" className="hover:text-orange-500 transition-colors">Catálogo</Link>
        {product.category && (
          <>
            <ChevronRight size={14} />
            <Link
              to={`/catalog?category=${product.category.slug}`}
              className="hover:text-orange-500 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[180px]">{product.name}</span>
      </nav>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Imagen */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 dark:text-gray-700 gap-3">
                <Package size={64} strokeWidth={1} />
                <p className="text-sm text-gray-300">Sin imagen</p>
              </div>
            )}

            {outOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl">
                <span className="bg-white text-gray-700 font-bold px-4 py-2 rounded-full text-sm">
                  Producto agotado
                </span>
              </div>
            )}
          </div>

          {product.category && (
            <div className="absolute top-4 left-4">
              <Link
                to={`/catalog?category=${product.category.slug}`}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700 hover:border-orange-300 transition-colors shadow-sm"
              >
                <Tag size={11} />
                {product.category.name}
              </Link>
            </div>
          )}

          {/* Botones flotantes derecha */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Compartir */}
          <button
            onClick={handleShare}
            className="w-9 h-9 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-300 transition-all shadow-sm"
          >
            <Share2 size={15} />
          </button>

          {/* Corazón — NUEVO */}
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm border ${
              wishlisted
                ? 'bg-red-500 border-red-500 text-white scale-110'
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-300 hover:scale-110'
            }`}
          >
            <Heart
              size={15}
              fill={wishlisted ? 'currentColor' : 'none'}
              className="transition-all duration-200"
            />
          </button>
        </div>

          <button
            onClick={handleShare}
            className="absolute top-4 right-4 w-9 h-9 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-300 transition-all shadow-sm"
          >
            <Share2 size={15} />
          </button>
        </motion.div>

        {/* Info del producto */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-4xl font-black text-orange-500">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400">CUP</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold w-fit ${
            outOfStock
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              : lowStock
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
              : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {outOfStock ? (
              <><AlertCircle size={16} /> Sin stock disponible</>
            ) : lowStock ? (
              <><AlertCircle size={16} /> Solo quedan {product.stock} unidades</>
            ) : (
              <><CheckCircle size={16} /> {product.stock} unidades disponibles</>
            )}
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Descripción
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {product.description}
              </p>
            </div>
          )}

          {!outOfStock && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Cantidad
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-orange-500 disabled:opacity-30 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900 dark:text-white text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-orange-500 disabled:opacity-30 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Subtotal:{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <motion.button
              onClick={handleAdd}
              disabled={outOfStock}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 flex items-center justify-center gap-2.5 font-bold py-3.5 rounded-2xl text-sm transition-all ${
                outOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : added
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none'
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={18} /> ¡Agregado!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            
            {/* Botón favoritos — NUEVO */}
            <button
              onClick={handleWishlist}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border-2 ${
                wishlisted
                  ? 'bg-red-50 border-red-400 text-red-500 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <Heart
                size={18}
                fill={wishlisted ? 'currentColor' : 'none'}
                className="transition-all duration-200"
              />
              {wishlisted ? 'En favoritos' : 'Guardar'}
            </button>

            <Link
              to="/cart"
              className="flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-500 transition-all"
            >
              Ver carrito
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            {[
              { icon: '🚚', text: 'Envío nacional a domicilio'    },
              { icon: '💵', text: 'Pago en efectivo al recibir'   },
              { icon: '✅', text: 'Producto verificado'           },
              { icon: '📞', text: 'Soporte antes y después'       },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Productos relacionados ──────────────────────────────── */}
      {/* Se muestra mientras carga (skeleton) O cuando hay resultados */}
      {(loadingRelated || related.length > 0) && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-1">
                De la misma categoría
              </p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Productos relacionados
              </h2>
            </div>
            {/* El link solo aparece cuando los datos ya cargaron */}
            {!loadingRelated && (
              <Link
                to={`/catalog?category=${product.category?.slug}`}
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
              >
                Ver más <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {/* Skeleton mientras carga, grid real cuando termina */}
          {loadingRelated ? (
            <RelatedSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}