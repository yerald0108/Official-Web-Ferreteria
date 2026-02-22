import { useState } from 'react'
import { sileo } from 'sileo'
import { useAdminOrders } from '../../hooks/useAdmin'
import type { Order } from '../../types'
import { User } from 'lucide-react'

const STATUSES = [
  { value: 'pending',    label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed',  label: 'Confirmado', color: 'bg-blue-100 text-blue-700'    },
  { value: 'on_the_way', label: 'En camino',  color: 'bg-purple-100 text-purple-700'},
  { value: 'delivered',  label: 'Entregado',  color: 'bg-green-100 text-green-700'  },
  { value: 'cancelled',  label: 'Cancelado',  color: 'bg-red-100 text-red-700'      },
]

function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find(s => s.value === status)
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s?.color}`}>
      {s?.label}
    </span>
  )
}

export default function AdminOrders() {
  const { orders, loading, updateStatus } = useAdminOrders()
  const [selected, setSelected]           = useState<Order | null>(null)
  const [updating, setUpdating]           = useState(false)
  const [filter, setFilter]               = useState('all')

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    const error = await updateStatus(orderId, newStatus)
    setUpdating(false)
    if (error) {
      sileo.error({ title: 'Error al actualizar', description: error.message })
    } else {
      sileo.success({ title: 'Estado actualizado correctamente' })
      if (selected?.id === orderId) {
        setSelected(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null)
      }
    }
  }

  console.log('orders:', orders, 'loading:', loading)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-400 text-sm mt-1">{orders.length} pedidos en total</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          Todos ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s.value ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {s.label} ({orders.filter(o => o.status === s.value).length})
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Lista */}
        <div className="flex-1 space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No hay pedidos en esta categoría</div>
          ) : (
            filtered.map(order => (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${
                  selected?.id === order.id ? 'border-orange-400 ring-1 ring-orange-400' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    {/* Nombre del cliente ← nuevo */}
                    {order.profile?.full_name && (
                      <p className="text-xs font-medium text-orange-600 mt-0.5">
                        👤 {order.profile.full_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('es-CU', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">📍 {order.delivery_address}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge status={order.status} />
                    <p className="font-bold text-orange-500 text-sm">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detalle del pedido */}
        {selected && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">
                  #{selected.id.slice(0, 8).toUpperCase()}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Info entrega */}
              <div className="space-y-2 text-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Entrega</p>

              {/* Nombre del cliente */}
              {selected.profile?.full_name && (
                <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User size={13} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selected.profile.full_name}
                    </p>
                  </div>
                  {selected.profile.phone && (
                    <p className="text-xs text-gray-500">
                      📞 {selected.profile.phone}
                    </p>
                  )}
                </div>
              )}

              {/* Detalles de entrega */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  <p className="text-gray-500">📍 {selected.delivery_address}</p>
                  <p className="text-gray-500">🕐 {selected.delivery_slot}</p>
                  <p className="text-gray-500">📞 {selected.delivery_phone}</p>
                  <p className="text-gray-500">
                  💳 {selected.payment_method === 'cash_on_delivery' ? 'Efectivo' :
                  selected.payment_method === 'bank_transfer' ? 'Transferencia' : 'Otro'}
                  </p>
                  {selected.notes && <p className="text-gray-500">📝 {selected.notes}</p>}
                </div>
              </div>

              {/* Productos */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Productos</p>
                {selected.order_items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-2">
                      {item.product_name} x{item.quantity}
                    </span>
                    <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-orange-500">${selected.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Cambiar estado */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Actualizar estado</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {STATUSES.map(s => (
                    <button
                      key={s.value}
                      disabled={selected.status === s.value || updating}
                      onClick={() => handleStatusChange(selected.id, s.value)}
                      className={`w-full py-2 px-3 rounded-xl text-sm font-medium transition-colors text-left ${
                        selected.status === s.value
                          ? `${s.color} opacity-100 cursor-default`
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40'
                      }`}
                    >
                      {selected.status === s.value ? '✓ ' : ''}{s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}