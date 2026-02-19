import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { sileo } from 'sileo'

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/40 z-50"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-orange-500" />
                <h2 className="font-bold text-gray-900">Mi carrito</h2>
                {items.length > 0 && (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={toggleCart}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
                  <ShoppingCart size={48} strokeWidth={1} />
                  <p className="text-sm">Tu carrito está vacío</p>
                  <button
                    onClick={toggleCart}
                    className="text-orange-500 text-sm font-medium hover:underline"
                  >
                    Ver catálogo
                  </button>
                </div>
              ) : (
                items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    {/* Imagen */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-orange-600 font-bold text-sm">
                        ${(product.price * quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">${product.price.toFixed(2)} c/u</p>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:border-orange-400 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:border-orange-400 disabled:opacity-40 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Eliminar */}
                    <button
                    onClick={() => {
                        removeItem(product.id)
                        sileo.success({ title: 'Producto eliminado del carrito' })
                    }}
                      className="text-gray-300 hover:text-red-400 transition-colors self-start"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={toggleCart}
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-center transition-colors"
                >
                  Proceder al pago
                </Link>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}