import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sileo } from 'sileo'
import { useAdminOrders } from '../../hooks/useAdmin'
import type { Order } from '../../types'
import {
  User, MapPin, Phone, Clock, Package,
  ChevronRight, Search, Filter,
  CheckCircle, Truck, ClipboardList, Home, XCircle,
  Calendar, Hash, MessageSquare,
  ShoppingBag, TrendingUp, Eye, Loader2,
} from 'lucide-react'

// ── Configuración de estados ──────────────────────────────────────
const STATUSES = [
  {
    value:  'pending',
    label:  'Pendiente',
    icon:   ClipboardList,
    color:  'text-amber-600',
    bg:     'bg-amber-50',
    badge:  'bg-amber-100 text-amber-700 border-amber-200',
    dot:    'bg-amber-400',
  },
  {
    value:  'confirmed',
    label:  'Confirmado',
    icon:   CheckCircle,
    color:  'text-blue-600',
    bg:     'bg-blue-50',
    badge:  'bg-blue-100 text-blue-700 border-blue-200',
    dot:    'bg-blue-400',
  },
  {
    value:  'on_the_way',
    label:  'En camino',
    icon:   Truck,
    color:  'text-violet-600',
    bg:     'bg-violet-50',
    badge:  'bg-violet-100 text-violet-700 border-violet-200',
    dot:    'bg-violet-400',
  },
  {
    value:  'delivered',
    label:  'Entregado',
    icon:   Home,
    color:  'text-green-600',
    bg:     'bg-green-50',
    badge:  'bg-green-100 text-green-700 border-green-200',
    dot:    'bg-green-400',
  },
  {
    value:  'cancelled',
    label:  'Cancelado',
    icon:   XCircle,
    color:  'text-red-600',
    bg:     'bg-red-50',
    badge:  'bg-red-100 text-red-700 border-red-200',
    dot:    'bg-red-400',
  },
]

const NON_CANCELLED = STATUSES.filter(s => s.value !== 'cancelled')

const PAYMENT_INFO: Record<string, { label: string; icon: string }> = {
  cash_on_delivery: { label: 'Efectivo contra entrega', icon: '💵' },
  bank_transfer:    { label: 'Transferencia bancaria',  icon: '🏦' },
  other:            { label: 'Otro método',             icon: '💳' },
}

function getStatus(value: string) {
  return STATUSES.find(s => s.value === value) ?? STATUSES[0]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('es-CU', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s    = getStatus(status)
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.badge}`}>
      <Icon size={11} />
      {s.label}
    </span>
  )
}

// ── Order Card ────────────────────────────────────────────────────
function OrderCard({ order, isSelected, onClick }: {
  order: Order
  isSelected: boolean
  onClick: () => void
}) {
  const s          = getStatus(order.status)
  const Icon       = s.icon
  const pay        = PAYMENT_INFO[order.payment_method]
  const itemCount  = order.order_items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0
  const clientName = order.profile?.full_name ?? 'Cliente desconocido'

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
        isSelected
          ? 'border-orange-400 bg-orange-50/50 shadow-md shadow-orange-100'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      {/* Fila 1: ID + Estado + Total */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
            <Icon size={16} className={s.color} />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm tracking-wide">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Calendar size={10} />
              {formatDateShort(order.created_at)}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-black text-orange-500 text-base">${order.total.toFixed(2)}</p>
          <div className="mt-1">
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Fila 2: CLIENTE — siempre visible */}
      <div className="flex items-center gap-2 mb-2.5 bg-gray-50 rounded-xl px-3 py-2">
        <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-black">
            {clientName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{clientName}</p>
        </div>
        {order.profile?.phone && (
          <p className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
            <Phone size={10} />
            {order.profile.phone}
          </p>
        )}
      </div>

      {/* Fila 3: Dirección + Productos */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1 truncate flex-1">
          <MapPin size={11} className="text-orange-400 flex-shrink-0" />
          <span className="truncate">{order.delivery_address}</span>
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          <span>{pay?.icon}</span>
          {itemCount} {itemCount === 1 ? 'prod.' : 'prods.'}
        </span>
      </div>

      {isSelected && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronRight size={16} className="text-orange-500" />
        </div>
      )}
    </button>
  )
}

// ── Panel de detalle ──────────────────────────────────────────────
function OrderDetail({ order, onStatusChange, loadingStatus }: {
  order: Order
  onStatusChange: (id: string, status: string) => void
  loadingStatus: string | null
}) {
  const pay        = PAYMENT_INFO[order.payment_method]
  const totalItems = order.order_items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0
  const clientName = order.profile?.full_name ?? 'Cliente desconocido'

  const isFinalState = order.status === 'delivered' || order.status === 'cancelled'
  const isUpdating   = loadingStatus !== null

  const bannerGradient =
    order.status === 'pending'    ? 'from-amber-400  to-amber-500'   :
    order.status === 'confirmed'  ? 'from-blue-400   to-blue-500'    :
    order.status === 'on_the_way' ? 'from-violet-400 to-violet-500'  :
    order.status === 'delivered'  ? 'from-green-400  to-green-500'   :
                                    'from-red-400    to-red-500'

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >

      {/* ── HEADER ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className={`h-2 w-full bg-gradient-to-r ${bannerGradient}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash size={13} className="text-gray-400" />
                <p className="font-black text-gray-900 text-lg tracking-widest">
                  {order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Calendar size={11} />
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <StatusBadge status={order.status} />
              <p className="text-2xl font-black text-orange-500 mt-2">${order.total.toFixed(2)}</p>
              <p className="text-xs text-gray-400">{totalItems} producto{totalItems !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total',  value: `$${order.total.toFixed(2)}`, Icon: TrendingUp },
              { label: 'Envío',  value: 'Gratis',                     Icon: Truck      },
              { label: 'Items',  value: `${totalItems} uds.`,         Icon: ShoppingBag },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                <Icon size={13} className="text-gray-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-900">{value}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CLIENTE — prominente ── */}
      <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/40 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-orange-100 flex items-center gap-2">
          <User size={13} className="text-orange-500" />
          <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Cliente</p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-black text-2xl">
                {clientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-xl leading-tight truncate">{clientName}</p>
              {order.profile?.phone && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Phone size={13} className="text-orange-400" />
                  <p className="text-sm font-medium text-gray-600">{order.profile.phone}</p>
                </div>
              )}
            </div>
            {order.profile?.phone && (
              <a
                href={`tel:${order.profile.phone}`}
                className="w-10 h-10 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                title="Llamar al cliente"
              >
                <Phone size={16} className="text-green-600" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── ENTREGA ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <MapPin size={12} /> Información de entrega
        </p>
        <div className="space-y-2.5">
          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={14} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Dirección exacta</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{order.delivery_address}</p>
              {(order.delivery_province || order.delivery_municipality) && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.delivery_municipality && `${order.delivery_municipality}, `}
                  {order.delivery_province}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={13} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Teléfono</p>
                <p className="text-xs font-semibold text-gray-800">{order.delivery_phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
              <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={13} className="text-violet-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Horario</p>
                <p className="text-xs font-semibold text-gray-800">{order.delivery_slot}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-base bg-green-50">
              {pay?.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Método de pago</p>
              <p className="text-xs font-semibold text-gray-800">{pay?.label ?? 'Otro'}</p>
            </div>
          </div>
          {order.notes && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageSquare size={13} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-amber-600 font-semibold mb-0.5">Notas del cliente</p>
                <p className="text-xs text-amber-800 leading-snug">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCTOS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
          <Package size={13} className="text-gray-400" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Productos del pedido
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {order.order_items?.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package size={15} className="text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.product_name}</p>
                <p className="text-xs text-gray-400">
                  ${item.product_price.toFixed(2)} × {item.quantity} uds.
                </p>
              </div>
              <p className="font-bold text-gray-900 flex-shrink-0">${item.subtotal.toFixed(2)}</p>
            </motion.div>
          ))}
        </div>
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-600">Total del pedido</p>
          <p className="text-lg font-black text-orange-500">${order.total.toFixed(2)}</p>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp size={12} /> Progreso del pedido
        </p>
        {order.status === 'cancelled' ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5">
            <XCircle size={20} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">Pedido cancelado</p>
              <p className="text-xs text-red-500 mt-0.5">Este pedido fue cancelado</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
            <div className="space-y-3">
              {NON_CANCELLED.map(st => {
                const currentIdx = NON_CANCELLED.findIndex(x => x.value === order.status)
                const stIdx      = NON_CANCELLED.findIndex(x => x.value === st.value)
                const isDone     = stIdx <= currentIdx
                const isCurrent  = st.value === order.status
                const StIcon     = st.icon
                return (
                  <div key={st.value} className="relative flex items-center gap-4">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                      isDone ? `${st.dot} border-transparent shadow-md` : 'bg-white border-gray-200'
                    }`}>
                      <StIcon size={14} className={isDone ? 'text-white' : 'text-gray-300'} />
                      {isCurrent && (
                        <span className={`absolute inset-0 rounded-full ${st.dot} opacity-30 animate-ping`} />
                      )}
                    </div>
                    <p className={`text-sm font-semibold ${isDone ? 'text-gray-900' : 'text-gray-300'}`}>
                      {st.label}
                      {isCurrent && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-normal ${st.badge}`}>
                          Actual
                        </span>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── CAMBIAR ESTADO ── */}
      {!isFinalState && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Cambiar estado
          </p>
          <div className="grid grid-cols-1 gap-2">
            {NON_CANCELLED.map(st => {
              const isCurrent  = order.status === st.value
              const isLoading  = loadingStatus === st.value
              const StIcon     = st.icon
              return (
                <button
                  key={st.value}
                  disabled={isCurrent || isUpdating}
                  onClick={() => onStatusChange(order.id, st.value)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                    isCurrent
                      ? `${st.bg} ${st.color} border-current/20 cursor-default`
                      : isLoading
                        ? `${st.bg} ${st.color} border-current/20`
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent disabled:opacity-40'
                  }`}
                >
                  {isLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <StIcon size={16} />
                  }
                  {isCurrent
                    ? `✓ ${st.label} (estado actual)`
                    : isLoading
                      ? `Actualizando a ${st.label.toLowerCase()}...`
                      : `Marcar como ${st.label.toLowerCase()}`
                  }
                </button>
              )
            })}
            {(() => {
              const isLoading = loadingStatus === 'cancelled'
              return (
                <button
                  disabled={isUpdating}
                  onClick={() => onStatusChange(order.id, 'cancelled')}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold border-2 border-transparent disabled:opacity-40 transition-all mt-1 ${
                    isLoading ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {isLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <XCircle size={16} />
                  }
                  {isLoading ? 'Cancelando pedido...' : 'Cancelar pedido'}
                </button>
              )
            })()}
          </div>
        </div>
      )}

      {isFinalState && (
        <div className={`rounded-2xl border p-4 text-center ${
          order.status === 'delivered' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
        }`}>
          <p className={`text-sm font-bold ${
            order.status === 'delivered' ? 'text-green-700' : 'text-red-700'
          }`}>
            {order.status === 'delivered' ? '✅ Pedido completado exitosamente' : '❌ Pedido cancelado'}
          </p>
          <p className="text-xs text-gray-400 mt-1">No se puede cambiar el estado</p>
        </div>
      )}
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gray-100" />
          <div className="space-y-1.5">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
        </div>
        <div className="space-y-1.5 text-right">
          <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
          <div className="h-5 bg-gray-100 rounded-full w-20 ml-auto" />
        </div>
      </div>
      <div className="h-10 bg-gray-100 rounded-xl" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function AdminOrders() {
  const { orders, loading, updateStatus } = useAdminOrders()
  const [selected,      setSelected]      = useState<Order | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)
  const [filter,        setFilter]        = useState('all')
  const [search,        setSearch]        = useState('')

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        o.id.toLowerCase().includes(q) ||
        (o.profile?.full_name ?? '').toLowerCase().includes(q) ||
        o.delivery_address.toLowerCase().includes(q) ||
        o.delivery_phone.includes(q)
      )
    })

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoadingStatus(newStatus)
    const error = await updateStatus(orderId, newStatus)
    setLoadingStatus(null)
    if (error) {
      sileo.error({ title: 'Error al actualizar', description: error.message })
    } else {
      sileo.success({ title: 'Estado actualizado correctamente' })
      if (selected?.id === orderId) {
        setSelected(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null)
      }
    }
  }

  const stats = {
    pending:   orders.filter(o => o.status === 'pending').length,
    active:    orders.filter(o => ['confirmed', 'on_the_way'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <div className="flex flex-col h-full space-y-5">

      {/* ── HEADER ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} pedidos en total</p>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          {[
            { label: 'Pendientes', value: stats.pending,   color: 'text-amber-500'  },
            { label: 'En curso',   value: stats.active,    color: 'text-blue-500'   },
            { label: 'Entregados', value: stats.delivered, color: 'text-green-500'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BÚSQUEDA ── */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por ID, nombre del cliente, dirección o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* ── FILTROS ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          <Filter size={11} /> Todos
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>
            {orders.length}
          </span>
        </button>
        {STATUSES.map(s => {
          const count  = orders.filter(o => o.status === s.value).length
          const StIcon = s.icon
          return (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === s.value ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <StIcon size={11} /> {s.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === s.value ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── LAYOUT ── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Lista — scroll propio */}
        <div className={`flex flex-col gap-2.5 overflow-y-auto transition-all duration-300 flex-shrink-0 ${
          selected ? 'w-[400px]' : 'w-full'
        }`}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <OrderSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={28} strokeWidth={1.5} className="text-gray-300" />
              </div>
              <p className="font-semibold text-gray-600 mb-1">No hay pedidos</p>
              <p className="text-sm text-gray-400">
                {search ? 'Sin resultados para esa búsqueda' : 'No hay pedidos en esta categoría'}
              </p>
            </div>
          ) : (
            filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selected?.id === order.id}
                onClick={() => setSelected(order)}
              />
            ))
          )}
        </div>

        {/* Panel de detalle — scroll SOLO aquí, todo lo demás queda fijo */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key="detail-panel"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 min-w-0 flex flex-col min-h-0"
            >
              {/* Header fijo del panel */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-gray-400" />
                  <p className="text-sm font-semibold text-gray-500">Detalle del pedido</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-all"
                >
                  Cerrar <XCircle size={14} />
                </button>
              </div>

              {/* Contenido con scroll */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                <OrderDetail
                  order={selected}
                  onStatusChange={handleStatusChange}
                  loadingStatus={loadingStatus}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}