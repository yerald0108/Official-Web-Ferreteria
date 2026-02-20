// src/pages/CartPage.tsx — con modal de confirmación para vaciar carrito
import { useState } from 'react'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import { useCartStore } from '../store/cartStore'
import { useAuth } from '../hooks/useAuth'
import ConfirmModal from '../components/ui/ConfirmModal'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId)
    sileo.success({ title: 'Producto eliminado', description: productName })
  }

  const handleClearCart = () => {
    clearCart()
    setShowClearConfirm(false)
    sileo.success({ title: 'Carrito vaciado', description: 'Se eliminaron todos los productos' })
  }

  const handleCheckout = () => {
    if (!user) {
      sileo.warning({
        title: 'Inicia sesión para continuar',
        description: 'Necesitas una cuenta para hacer un pedido',
        button: { title: 'Iniciar sesión', onClick: () => navigate('/login') },
      })
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingCart size={36} className="text-gray-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
        <p className="text-gray-400 text-sm">Agrega productos desde el catálogo para comenzar</p>
        <Link
          to="/catalog"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    )
  }

  const total = getTotalPrice()

  return (
    <>
      {/* Modal de confirmación para vaciar carrito */}
      <ConfirmModal
        open={showClearConfirm}
        variant="danger"
        title="¿Vaciar el carrito?"
        description={`Se eliminarán los ${items.length} producto${items.length !== 1 ? 's' : ''} que tienes en el carrito. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, vaciar"
        cancelLabel="No, mantener"
        onConfirm={handleClearCart}
        onCancel={() => setShowClearConfirm(false)}
      />

      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Mi carrito</h1>
          <span className="bg-orange-100 text-orange-600 text-sm font-bold px-2.5 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </span>

          {/* Botón vaciar — ahora abre el modal */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="ml-auto flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Trash2 size={15} />
            Vaciar carrito
          </button>
        </div>

        {/* Lista de productos */}
        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">

              {/* Imagen */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                {product.category && (
                  <p className="text-xs text-gray-400 mt-0.5">{product.category.name}</p>
                )}
                <p className="text-orange-500 font-bold mt-1">${product.price.toFixed(2)} c/u</p>

                <div className="flex items-center justify-between mt-3">
                  {/* Controles cantidad */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                    <button
                      onClick={() => {
                        updateQuantity(product.id, quantity - 1)
                        if (quantity - 1 > 0) {
                          sileo.info({ title: 'Cantidad actualizada', description: `${product.name}: ${quantity - 1} unidad${quantity - 1 === 1 ? '' : 'es'}` })
                        }
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-orange-400 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => {
                        if (quantity >= product.stock) {
                          sileo.warning({
                            title: 'Stock máximo alcanzado',
                            description: `Solo hay ${product.stock} unidades disponibles`,
                          })
                          return
                        }
                        updateQuantity(product.id, quantity + 1)
                        sileo.info({ title: 'Cantidad actualizada', description: `${product.name}: ${quantity + 1} unidades` })
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-orange-400 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen y botón */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 sticky bottom-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Envío</span>
            <span className="text-green-600 font-medium">Gratis</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-xl border-t pt-3">
            <span>Total</span>
            <span className="text-orange-500">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            Proceder al pago →
          </button>
          <Link
            to="/catalog"
            className="block text-center text-sm text-gray-400 hover:text-orange-500 transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </>
  )
}