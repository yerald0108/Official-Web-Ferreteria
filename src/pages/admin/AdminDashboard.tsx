import { useCallback, useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  ShoppingBag, Package, Clock, CheckCircle,
  TrendingUp, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import ErrorState from '../../components/ui/ErrorState'
import type { Order, Product } from '../../types'

// ── Paleta ────────────────────────────────────────────────────────
const ORANGE  = '#f97316'
const AMBER   = '#f59e0b'
const GREEN   = '#22c55e'
const BLUE    = '#3b82f6'
const PURPLE  = '#a855f7'
const RED     = '#ef4444'

const STATUS_COLORS: Record<string, string> = {
  pending:    AMBER,
  confirmed:  BLUE,
  on_the_way: PURPLE,
  delivered:  GREEN,
  cancelled:  RED,
}

const STATUS_LABELS: Record<string, string> = {
  pending:    'Pendiente',
  confirmed:  'Confirmado',
  on_the_way: 'En camino',
  delivered:  'Entregado',
  cancelled:  'Cancelado',
}

// ── Tooltip personalizado ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-white/10">
      {label && <p className="text-gray-400 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill ?? '#fff' }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('ingreso')
            ? `$${p.value.toFixed(2)}`
            : p.value}
        </p>
      ))}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────
function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('es-CU', { weekday: 'short', day: 'numeric' })
  })
}

function groupByDay(orders: Order[]): { day: string; pedidos: number; ingresos: number }[] {
  const days = getLast7Days()
  return days.map((day, i) => {
    const target = new Date()
    target.setDate(target.getDate() - (6 - i))
    const dayOrders = orders.filter(o => {
      const d = new Date(o.created_at)
      return d.toDateString() === target.toDateString()
    })
    return {
      day,
      pedidos:  dayOrders.length,
      ingresos: dayOrders.reduce((s, o) => s + o.total, 0),
    }
  })
}

// ── Animación de número ───────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', decimals = 0 }: {
  value: number
  prefix?: string
  decimals?: number
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start      = 0
    const end      = value
    const duration = 900
    const step     = 16
    const increment = (end / duration) * step

    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, step)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.floor(display)}
    </span>
  )
}

// ── Tipos ─────────────────────────────────────────────────────────
interface Stats {
  totalOrders:      number
  pendingOrders:    number
  deliveredOrders:  number
  totalProducts:    number
  lowStockProducts: number
  totalRevenue:     number
}

// ── Componente principal ──────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [orders,     setOrders]     = useState<Order[]>([])
  const [products,   setProducts]   = useState<Product[]>([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const { isOnline }                = useNetworkStatus()

  const fetchAll = useCallback(async () => {
    // Reinicia el estado de error antes de cada intento
    setFetchError(false)
    setLoading(true)

    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*, category:categories(name)'),
      ])

      // Si cualquiera de las dos consultas falla, mostramos el error
      if (ordersRes.error || productsRes.error) {
        setFetchError(true)
        setLoading(false)
        return
      }

      const allOrders   = (ordersRes.data   ?? []) as Order[]
      const allProducts = (productsRes.data ?? []) as Product[]

      setOrders(allOrders)
      setProducts(allProducts)
      setStats({
        totalOrders:      allOrders.length,
        pendingOrders:    allOrders.filter(o => o.status === 'pending').length,
        deliveredOrders:  allOrders.filter(o => o.status === 'delivered').length,
        totalProducts:    allProducts.filter(p => p.is_active).length,
        lowStockProducts: allProducts.filter(p => p.stock <= 5).length,
        totalRevenue:     allOrders
          .filter(o => o.status === 'delivered')
          .reduce((s, o) => s + o.total, 0),
      })
    } catch {
      // Error de red inesperado (timeout, fetch fallido, etc.)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Datos para gráficas ────────────────────────────────────────
  const dailyData    = groupByDay(orders)
  const PIE_COLORS   = [ORANGE, BLUE, GREEN, PURPLE, AMBER, RED]

  const statusData = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    name:  label,
    value: orders.filter(o => o.status === value).length,
    color: STATUS_COLORS[value],
  })).filter(d => d.value > 0)

  const stockData = products
    .filter(p => p.is_active)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8)
    .map(p => ({
      name:  p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
      stock: p.stock,
      fill:  p.stock <= 5 ? RED : p.stock <= 15 ? AMBER : GREEN,
    }))

  const categoryData = (() => {
    const map: Record<string, number> = {}
    products.forEach(p => {
      const cat = (p as any).category?.name ?? 'Sin categoría'
      map[cat]  = (map[cat] ?? 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  })()

  const STAT_CARDS = stats ? [
    { label: 'Total pedidos',     value: stats.totalOrders,      icon: ShoppingBag, color: 'from-blue-500 to-blue-600',     prefix: '',  decimals: 0 },
    { label: 'Pendientes',        value: stats.pendingOrders,    icon: Clock,       color: 'from-amber-400 to-orange-500',  prefix: '',  decimals: 0 },
    { label: 'Entregados',        value: stats.deliveredOrders,  icon: CheckCircle, color: 'from-green-400 to-emerald-600', prefix: '',  decimals: 0 },
    { label: 'Productos activos', value: stats.totalProducts,    icon: Package,     color: 'from-purple-500 to-violet-600', prefix: '',  decimals: 0 },
    { label: 'Stock bajo (≤5)',   value: stats.lowStockProducts, icon: AlertCircle, color: 'from-red-400 to-rose-600',      prefix: '',  decimals: 0 },
    { label: 'Ingresos totales',  value: stats.totalRevenue,     icon: TrendingUp,  color: 'from-orange-400 to-orange-600', prefix: '$', decimals: 2 },
  ] : []

  // ── Estado 1: cargando ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // ── Estado 2: sin conexión o error del servidor ────────────────
  if (!isOnline || fetchError) {
    return (
      <div className="space-y-4">
        {/* Mantenemos el header para que el admin sepa dónde está */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Visión general de tu ferretería</p>
        </div>
        <div className="py-6">
          <ErrorState
            type={!isOnline ? 'network' : 'server'}
            // El botón de reintento llama directamente a fetchAll
            onRetry={fetchAll}
          />
        </div>
      </div>
    )
  }

  // ── Estado 3: datos cargados correctamente ─────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Visión general de tu ferretería</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, prefix, decimals }, i) => (
          <div
            key={label}
            className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${color} opacity-10`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedNumber value={value} prefix={prefix} decimals={decimals} />
            </p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Gráfica 1: Pedidos por día (Area) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-1">Pedidos últimos 7 días</h2>
        <p className="text-xs text-gray-400 mb-5">Cantidad de pedidos recibidos por día</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPedidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={ORANGE} stopOpacity={0.25} />
                <stop offset="95%" stopColor={ORANGE} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="pedidos"
              name="Pedidos"
              stroke={ORANGE}
              strokeWidth={2.5}
              fill="url(#gradPedidos)"
              dot={{ fill: ORANGE, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica 2: Ingresos por día (Area) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-1">Ingresos últimos 7 días</h2>
        <p className="text-xs text-gray-400 mb-5">Solo pedidos con estado "Entregado"</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={GREEN} stopOpacity={0.25} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="ingresos"
              name="Ingresos"
              stroke={GREEN}
              strokeWidth={2.5}
              fill="url(#gradIngresos)"
              dot={{ fill: GREEN, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Fila: Pie de estados + Pie de categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Gráfica 3: Estado de pedidos (Pie) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-1">Estado de pedidos</h2>
          <p className="text-xs text-gray-400 mb-4">Distribución por estado actual</p>
          {statusData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-300 text-sm">
              Sin pedidos aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive
                  animationBegin={100}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfica 4: Productos por categoría (Pie) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-1">Productos por categoría</h2>
          <p className="text-xs text-gray-400 mb-4">Distribución del catálogo</p>
          {categoryData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-300 text-sm">
              Sin productos aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive
                  animationBegin={200}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gráfica 5: Stock de productos (Bar horizontal) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-1">Stock de productos</h2>
        <p className="text-xs text-gray-400 mb-5">
          Los 8 productos con menor stock —
          <span className="text-red-400 font-medium"> rojo ≤5</span>,
          <span className="text-amber-400 font-medium"> amarillo ≤15</span>,
          <span className="text-green-500 font-medium"> verde OK</span>
        </p>
        {stockData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-gray-300 text-sm">
            Sin productos aún
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, stockData.length * 42)}>
            <BarChart
              layout="vertical"
              data={stockData}
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="stock"
                name="Stock"
                radius={[0, 6, 6, 0]}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              >
                {stockData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}