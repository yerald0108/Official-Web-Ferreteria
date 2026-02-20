import { ShoppingCart, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { sileo } from 'sileo'
import type { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addItem, getTotalItems } = useCartStore()
  const navigate = useNavigate()
  const outOfStock = product.stock === 0

  const handleAdd = () => {
    const antes = getTotalItems()
    addItem(product, 1)
    const despues = getTotalItems()

    if (despues === antes) {
      sileo.warning({
        title: 'Stock insuficiente',
        description: `Solo hay ${product.stock} unidades disponibles`,
      })
    } else {
      sileo.success({
        title: 'Agregado al carrito',
        description: product.name,
        button: {
          title: 'Ver carrito',
          onClick: () => navigate('/cart'),
        },
      })
    }
  }

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      
      {/* Imagen — clickeable al detalle */}
      <Link to={`/product/${product.id}`} className="block relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {product.image_url ? (
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
            <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Agotado</span>
          </div>
        )}
        {product.category && (
          <span className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 text-xs font-medium text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
            {product.category.name}
          </span>
        )}
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-xl font-bold text-orange-500">${product.price.toFixed(2)}</p>
            <p className="text-xs text-gray-400">
              {outOfStock ? 'Sin stock' : `${product.stock} disponibles`}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors active:scale-95"
          >
            <ShoppingCart size={16} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}