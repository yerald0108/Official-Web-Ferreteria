import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, ClipboardList, MapPin, Clock, CreditCard,
  ChevronDown, ChevronRight, CheckCircle, Truck, ShoppingBag,
  Home, AlertCircle, XCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import ErrorState from '../components/ui/ErrorState'
import type { Order } from '../types'

// ── Configuración de estados ───────────────────────────────────────
interface StepConfig {
  key: string
  label: string
  shortLabel: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  trackColor: string
}

const STEPS: StepConfig[] = [
  {
    key: 'pending',
    label: 'Pedido recibido',
    shortLabel: 'Recibido',
    icon: ClipboardList,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
    trackColor: 'from-amber-500',
  },
  {
    key: 'confirmed',
    label: 'Confirmado',
    shortLabel: 'Confirmado',
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
    trackColor: 'from-blue-500',
  },
  {
    key: 'on_the_way',
    label: 'En camino',
    shortLabel: 'En camino',
    icon: Truck,
    color: 'text-violet-600',
    bgColor: 'bg-violet-500',
    borderColor: 'border-violet-200',
    trackColor: 'from-violet-500',
  },
  {
    key: 'delivered',
    label: 'Entregado',
    shortLabel: 'Entregado',
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-200',
    trackColor: 'from-green-500',
  },
]

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: '💵 Efectivo',
  bank_transfer:    '🏦 Transferencia',
  other:            '💳 Otro',
}

// ── Timeline visual de un pedido ─────────────────────────────────
function OrderTimeline({ order }: { order: Order }) {
  const isCancelled = order.status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2.5 py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
        <XCircle size={18} className="text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">Pedido cancelado</p>
          <p className="text-xs text-red-400 mt-0.5">Este pedido fue cancelado</p>
        </div>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex(s => s.key === order.status)

  return (
    <div className="relative pt-1">
      <div className="flex items-center justify-between relative">
        {/* Línea base */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 dark:bg-gray-800" />

        {/* Línea de progreso animada */}
        <motion.div
          className={`absolute top-4 left-4 h-0.5 bg-gradient-to-r ${
            STEPS[currentIdx]?.trackColor ?? 'from-orange-500'
          } to-orange-400 origin-left`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentIdx / (STEPS.length - 1) }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ width: 'calc(100% - 32px)' }}
        />

        {STEPS.map((step, i) => {
          const Icon      = step.icon
          const isDone    = i <= currentIdx
          const isCurrent = i === currentIdx

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10" style={{ flex: '0 0 auto' }}>
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone
                      ? `${step.bgColor} border-transparent shadow-md`
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Icon size={14} className={isDone ? 'text-white' : 'text-gray-300'} />
                </motion.div>

                {isCurrent && (
                  <>
                    <motion.div
                      className={`absolute inset-0 rounded-full ${step.bgColor} opacity-30`}
                      animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <motion.div
                      className={`absolute inset-0 rounded-full ${step.bgColor} opacity-20`}
                      animate={{ scale: [1, 2.4], opacity: [0.2, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                    />
                  </>
                )}
              </div>

              <p
                className={`text-center leading-tight transition-colors ${
                  isDone
                    ? `text-[10px] font-bold ${step.color}`
                    : 'text-[10px] font-medium text-gray-300 dark:text-gray-600'
                }`}
                style={{ maxWidth: '56px', wordBreak: 'break-word' }}
              >
                {step.shortLabel}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Tarjeta de pedido expandible ─────────────────────────────────
function OrderCard({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const isCancelled = order.status === 'cancelled'

  const statusColors: Record<string, string> = {
    pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    confirmed:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    on_the_way: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    delivered:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const statusLabels: Record<string, string> = {
    pending:    'Pendiente',
    confirmed:  'Confirmado',
    on_the_way: 'En camino',
    delivered:  'Entregado',
    cancelled:  'Cancelado',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className={`bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden transition-shadow hover:shadow-md ${
        isCancelled
          ? 'border-red-100 dark:border-red-900/40'
          : 'border-gray-100 dark:border-gray-800'
      }`}
    >
      {/* ── Cabecera del pedido ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isCancelled ? 'bg-red-50 dark:bg-red-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
        }`}>
          {isCancelled
            ? <AlertCircle size={20} className="text-red-500" />
            : <ShoppingBag size={20} className="text-orange-500" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-black text-gray-900 dark:text-white text-sm tracking-wide">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('es-CU', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
              <span className="font-black text-orange-500">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2 truncate">
            {order.order_items?.map(i => `${i.product_name} ×${i.quantity}`).join(' · ')}
          </p>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-gray-400"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      {/* ── Timeline (siempre visible) ── */}
      {!isCancelled && (
        <div className="px-5 pb-4">
          <OrderTimeline order={order} />
        </div>
      )}

      {/* ── Contenido expandible ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">

              {/* Productos detallados */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Productos
                </p>
                <div className="space-y-2">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                          <Package size={12} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                          <p className="text-xs text-gray-400">${item.product_price.toFixed(2)} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Total</span>
                  <span className="font-black text-orange-500 text-base">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Info de entrega */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Entrega
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { icon: MapPin,     text: order.delivery_address },
                    { icon: Clock,      text: order.delivery_slot    },
                    { icon: CreditCard, text: PAYMENT_LABELS[order.payment_method] ?? 'Otro' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                      <Icon size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link al detalle completo */}
              <Link
                to={`/orders/${order.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all"
              >
                Ver confirmación completa
                <ChevronRight size={15} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" />
      </div>
      <div className="flex items-center justify-between pt-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function OrdersPage() {
  const { profile }             = useAuth()
  const { isOnline }            = useNetworkStatus()
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [filter, setFilter]     = useState<string>('all')

  const fetchOrders = () => {
    if (!profile) return

    // Reinicia el error antes de cada intento
    setFetchError(false)
    setLoading(true)

    supabase
      .from('orders')
      .select('*, order_items(*),  order_status_history(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setFetchError(true)
        } else {
          setOrders((data ?? []) as Order[])
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const filters = [
    { key: 'all',        label: 'Todos'       },
    { key: 'pending',    label: 'Pendientes'  },
    { key: 'confirmed',  label: 'Confirmados' },
    { key: 'on_the_way', label: 'En camino'   },
    { key: 'delivered',  label: 'Entregados'  },
    { key: 'cancelled',  label: 'Cancelados'  },
  ]

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  const activeCount = orders.filter(o =>
    ['pending', 'confirmed', 'on_the_way'].includes(o.status)
  ).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Mis pedidos</h1>
            <p className="text-gray-400 text-sm mt-1">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          {activeCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-3 py-2"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-orange-500 rounded-full"
              />
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                {activeCount} activo{activeCount !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Filtros ───────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        {filters.map(f => {
          const count = f.key === 'all'
            ? orders.length
            : orders.filter(o => o.status === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f.key
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300'
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === f.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Lista de pedidos con manejo de estados ────────────── */}
      {loading ? (
        // 1. Skeleton mientras carga
        <div className="space-y-4">
          {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
        </div>

      ) : !isOnline || fetchError ? (
        // 2. Sin conexión o error del servidor
        <ErrorState
          type={!isOnline ? 'network' : 'server'}
          // El botón de reintento vuelve a ejecutar la consulta
          onRetry={fetchOrders}
        />

      ) : filtered.length === 0 ? (
        // 3. Sin pedidos (estado vacío)
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center gap-4"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Package size={36} strokeWidth={1} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {filter === 'all' ? 'Aún no tienes pedidos' : 'Sin pedidos en esta categoría'}
          </h3>
          <p className="text-gray-400 text-sm max-w-xs">
            {filter === 'all'
              ? 'Cuando hagas tu primer pedido aparecerá aquí con su estado en tiempo real.'
              : 'Prueba con otro filtro o vuelve más tarde.'}
          </p>
          {filter === 'all' && (
            <Link
              to="/catalog"
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Explorar catálogo
            </Link>
          )}
        </motion.div>

      ) : (
        // 4. Lista de pedidos
        <div className="space-y-4">
          {filtered.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}