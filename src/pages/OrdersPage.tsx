import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Package, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Order } from '../types'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:      { label: 'Pendiente',    color: 'bg-yellow-100 text-yellow-700' },
  confirmed:    { label: 'Confirmado',   color: 'bg-blue-100 text-blue-700'    },
  on_the_way:   { label: 'En camino',    color: 'bg-purple-100 text-purple-700'},
  delivered:    { label: 'Entregado',    color: 'bg-green-100 text-green-700'  },
  cancelled:    { label: 'Cancelado',    color: 'bg-red-100 text-red-700'      },
}

export default function OrdersPage() {
  const { profile }             = useAuth()
  const [searchParams]          = useSearchParams()
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const successId               = searchParams.get('success')

  useEffect(() => {
    if (!profile) return
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? [])
        setLoading(false)
      })
  }, [profile])

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Banner de éxito */}
      {successId && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={22} />
          <div>
            <p className="font-semibold text-green-800">¡Pedido confirmado!</p>
            <p className="text-green-600 text-sm mt-0.5">
              Tu pedido fue recibido y está siendo procesado. Te contactaremos pronto.
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-32 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} strokeWidth={1} className="mx-auto mb-3" />
          <p>Aún no tienes pedidos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = STATUS_LABEL[order.status]
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('es-CU', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <p>🕐 {order.delivery_slot}</p>
                    <p>📍 {order.delivery_address}</p>
                  </div>
                  <p className="font-bold text-orange-500 text-lg">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}