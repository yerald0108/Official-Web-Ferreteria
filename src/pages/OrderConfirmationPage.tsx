// src/pages/OrderConfirmationPage.tsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, Package, MapPin, Clock, CreditCard,
  Phone, ArrowRight, Home, ClipboardList, Share2,
  Sparkles, ChevronRight
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { launchConfetti } from '../hooks/useConfetti'
import type { Order } from '../types'
import { sileo } from 'sileo'

const STATUS_STEPS = [
  { key: 'pending',    label: 'Pedido recibido',   icon: ClipboardList, desc: 'Estamos procesando tu pedido' },
  { key: 'confirmed',  label: 'Confirmado',         icon: CheckCircle,   desc: 'Tu pedido fue confirmado'      },
  { key: 'on_the_way', label: 'En camino',          icon: Package,       desc: 'Tu pedido va en camino'        },
  { key: 'delivered',  label: 'Entregado',          icon: Home,          desc: '¡Pedido entregado!'            },
]

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Efectivo contra entrega',
  bank_transfer:    'Transferencia bancaria',
  other:            'Otro método',
}

export default function OrderConfirmationPage() {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const [order, setOrder]       = useState<Order | null>(null)
  const [loading, setLoading]   = useState(true)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/orders'); return }
        setOrder(data as Order)
        setLoading(false)

        // Pequeño delay antes del confetti para que la página se monte
        setTimeout(() => {
          launchConfetti(4000)
          setRevealed(true)
        }, 400)
      })
  }, [id, navigate])

  const handleShare = async () => {
    const text = `¡Hice un pedido en Ferretería Online! 🛠️ Número: #${id?.slice(0, 8).toUpperCase()}`
    if (navigator.share) {
      await navigator.share({ text, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(text)
      sileo.success({ title: 'Copiado al portapapeles' })
    }
  }

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Cargando confirmación...</p>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* ── HERO DE CONFIRMACIÓN ─────────────────────────────── */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1,    y: 0    }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-center"
          >
            {/* Patrón de puntos decorativo */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Aura naranja */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Icono animado */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              className="relative z-10 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-orange-500/40"
            >
              <CheckCircle size={40} className="text-white" strokeWidth={2.5} />

              {/* Sparkles orbitando */}
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear' }}
                  style={{ originX: '50%', originY: '50%' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                    className="absolute"
                    style={{
                      top: `${50 + 40 * Math.sin((i * Math.PI) / 2)}%`,
                      left: `${50 + 40 * Math.cos((i * Math.PI) / 2)}%`,
                    }}
                  >
                    <Sparkles size={12} className="text-orange-300" />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Textos */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="relative z-10 space-y-2"
            >
              <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
                ¡Pedido confirmado!
              </p>
              <h1 className="text-3xl font-black text-white">
                ¡Gracias por tu compra!
              </h1>
              <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                Tu pedido fue recibido y está siendo procesado. Te contactaremos pronto para coordinar la entrega.
              </p>
            </motion.div>

            {/* Número de pedido */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 mt-6 inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-3"
            >
              <div className="text-left">
                <p className="text-gray-400 text-xs">Número de pedido</p>
                <p className="text-white font-black text-lg tracking-wider">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <Share2 size={16} />
                <span className="text-xs">Compartir</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TIMELINE DE PROGRESO ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6"
      >
        <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-6">
          Estado del pedido
        </h2>

        <div className="relative">
          {/* Línea de progreso de fondo */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100 dark:bg-gray-800" />

          {/* Línea de progreso activa */}
          <motion.div
            className="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-orange-500 to-orange-400 origin-top"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: currentStepIndex === 0 ? 0.05 : currentStepIndex / (STATUS_STEPS.length - 1) }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
            style={{ height: 'calc(100% - 40px)' }}
          />

          <div className="space-y-6">
            {STATUS_STEPS.map((step, i) => {
              const Icon      = step.icon
              const isDone    = i <= currentStepIndex
              const isCurrent = i === currentStepIndex

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/40'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isDone ? 'text-white' : 'text-gray-400'}
                      />
                    </motion.div>

                    {/* Pulse en el step actual */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-orange-500"
                        animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Texto */}
                  <div className="pt-1.5 flex-1">
                    <p className={`text-sm font-semibold ${
                      isDone
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400'
                    }`}>
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 text-xs font-normal text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                          Estado actual
                        </span>
                      )}
                    </p>
                    {isDone && (
                      <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ── DETALLES DEL PEDIDO ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Resumen del pedido</h2>
        </div>

        {/* Productos */}
        <div className="p-5 space-y-3">
          {order.order_items?.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 + i * 0.06 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={14} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                  <p className="text-xs text-gray-400">${item.product_price.toFixed(2)} × {item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                ${item.subtotal.toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <div className="px-5 pb-5 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Envío</span>
            <span className="text-green-500 font-medium">Gratis</span>
          </div>
          <div className="flex justify-between font-black text-gray-900 dark:text-white text-lg pt-2 border-t border-gray-100 dark:border-gray-800">
            <span>Total</span>
            <span className="text-orange-500">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {/* ── INFO DE ENTREGA ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4"
      >
        <h2 className="font-bold text-gray-900 dark:text-white text-sm">Información de entrega</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: MapPin,      label: 'Dirección',   value: order.delivery_address },
            { icon: Clock,       label: 'Horario',     value: order.delivery_slot    },
            { icon: Phone,       label: 'Teléfono',    value: order.delivery_phone   },
            { icon: CreditCard,  label: 'Pago',        value: PAYMENT_LABELS[order.payment_method] ?? 'Otro' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
              <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-snug">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
            <p className="text-xs text-amber-600 font-semibold mb-0.5">Notas adicionales</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">{order.notes}</p>
          </div>
        )}
      </motion.div>

      {/* ── ACCIONES ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link
          to="/orders"
          className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-lg hover:shadow-orange-200 dark:hover:shadow-none text-sm"
        >
          <ClipboardList size={18} />
          Ver mis pedidos
          <ChevronRight size={16} />
        </Link>
        <Link
          to="/catalog"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold py-3.5 rounded-2xl hover:border-orange-400 hover:text-orange-500 transition-all text-sm"
        >
          <ArrowRight size={18} />
          Seguir comprando
        </Link>
      </motion.div>

    </div>
  )
}