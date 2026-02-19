import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Clock, CreditCard, CheckCircle, ChevronRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// ── Tipos ──────────────────────────────────────────────────────────
const deliverySlots = [
  'Mañana 8am - 12pm',
  'Mañana 12pm - 5pm',
  'Tarde 5pm - 8pm',
]

const paymentMethods = [
  { value: 'cash_on_delivery', label: 'Efectivo contra entrega', icon: '💵' },
  { value: 'bank_transfer',    label: 'Transferencia bancaria', icon: '🏦' },
  { value: 'other',            label: 'Otro método',            icon: '💳' },
]

const addressSchema = z.object({
  delivery_address:      z.string().min(10, 'Escribe una dirección más detallada'),
  delivery_phone:        z.string().min(8, 'Teléfono inválido').regex(/^\d+$/, 'Solo números'),
  notes:                 z.string().optional(),
})

type AddressForm = z.infer<typeof addressSchema>

// ── Variantes animación ────────────────────────────────────────────
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

const STEPS = [
  { label: 'Dirección',  icon: MapPin      },
  { label: 'Entrega',    icon: Clock       },
  { label: 'Pago',       icon: CreditCard  },
]

export default function CheckoutPage() {
  const navigate    = useNavigate()
  const { profile } = useAuth()
  const { items, getTotalPrice, clearCart } = useCartStore()

  const [step,          setStep]          = useState(1)
  const [direction,     setDirection]     = useState(1)
  const [selectedSlot,  setSelectedSlot]  = useState('')
  const [selectedPay,   setSelectedPay]   = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [addressData,   setAddressData]   = useState<AddressForm | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      delivery_address: profile?.address ?? '',
      delivery_phone:   profile?.phone   ?? '',
    },
  })

  // Redirigir si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
        <p className="text-lg">Tu carrito está vacío</p>
        <button
          onClick={() => navigate('/catalog')}
          className="text-orange-500 font-medium hover:underline"
        >
          Ir al catálogo
        </button>
      </div>
    )
  }

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  // ── Paso 1: confirmar dirección ────────────────────────────────
  const handleAddress = handleSubmit((data) => {
    setAddressData(data)
    goTo(2)
  })

  // ── Paso 2: confirmar horario ──────────────────────────────────
  const handleSlot = () => {
    if (!selectedSlot) return
    goTo(3)
  }

  // ── Paso 3: confirmar pago y crear pedido ──────────────────────
  const handleOrder = async () => {
    if (!selectedPay || !addressData || !profile) return
    setLoading(true)
    setError('')

    const total = getTotalPrice()

    // 1. Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id:              profile.id,
        status:               'pending',
        delivery_address:     addressData.delivery_address,
        delivery_province:    profile.province,
        delivery_municipality: profile.municipality,
        delivery_phone:       addressData.delivery_phone,
        delivery_slot:        selectedSlot,
        payment_method:       selectedPay,
        total,
        notes: addressData.notes ?? null,
      })
      .select()
      .single()

    if (orderError || !order) {
      setError('Error al crear el pedido. Intenta de nuevo.')
      setLoading(false)
      return
    }

    // 2. Insertar los items del pedido
    const orderItems = items.map(({ product, quantity }) => ({
      order_id:      order.id,
      product_id:    product.id,
      product_name:  product.name,
      product_price: product.price,
      quantity,
      subtotal:      product.price * quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      setError('Error al guardar los productos del pedido.')
      setLoading(false)
      return
    }

    // 3. Reducir stock de cada producto
    for (const { product, quantity } of items) {
      await supabase
        .from('products')
        .update({ stock: product.stock - quantity })
        .eq('id', product.id)
    }

    clearCart()
    setLoading(false)
    navigate(`/orders?success=${order.id}`)
  }

  const total = getTotalPrice()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finalizar compra</h1>

      {/* Indicador de pasos */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const num     = i + 1
          const active  = step === num
          const done    = step > num
          const Icon    = s.icon
          return (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  done   ? 'bg-green-500 text-white' :
                  active ? 'bg-orange-500 text-white' :
                           'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-xs font-medium ${active ? 'text-orange-500' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${step > num ? 'bg-green-400' : 'bg-gray-100'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenido de cada paso */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>

          {/* ── PASO 1: Dirección ── */}
          {step === 1 && (
            <motion.div key="step1" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" /> Dirección de entrega
                </h2>

                {/* Info de provincia y municipio (no editable aquí) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Provincia</p>
                    <p className="text-sm font-medium text-gray-700">{profile?.province}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Municipio</p>
                    <p className="text-sm font-medium text-gray-700">{profile?.municipality}</p>
                  </div>
                </div>

                {/* Dirección exacta */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Dirección exacta</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Calle, número, entre calles, reparto..."
                    {...register('delivery_address')}
                  />
                  {errors.delivery_address && (
                    <p className="text-xs text-red-500">{errors.delivery_address.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Teléfono de contacto</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ej: 52345678"
                    {...register('delivery_phone')}
                  />
                  {errors.delivery_phone && (
                    <p className="text-xs text-red-500">{errors.delivery_phone.message}</p>
                  )}
                </div>

                {/* Notas opcionales */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Notas adicionales <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Ej: Tocar el timbre, preguntar por Juan..."
                    {...register('notes')}
                  />
                </div>

                <button
                  onClick={handleAddress}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PASO 2: Horario de entrega ── */}
          {step === 2 && (
            <motion.div key="step2" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={18} className="text-orange-500" /> Horario de entrega
                </h2>

                <div className="space-y-3">
                  {deliverySlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        selectedSlot === slot
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-100 hover:border-orange-200 text-gray-700'
                      }`}
                    >
                      🕐 {slot}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => goTo(1)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={handleSlot}
                    disabled={!selectedSlot}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continuar <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PASO 3: Método de pago + resumen ── */}
          {step === 3 && (
            <motion.div key="step3" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="space-y-4">
                {/* Método de pago */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard size={18} className="text-orange-500" /> Método de pago
                  </h2>
                  {paymentMethods.map(method => (
                    <button
                      key={method.value}
                      onClick={() => setSelectedPay(method.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium flex items-center gap-3 ${
                        selectedPay === method.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-100 hover:border-orange-200 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{method.icon}</span>
                      {method.label}
                    </button>
                  ))}
                </div>

                {/* Resumen del pedido */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                  <h2 className="font-semibold text-gray-900">Resumen del pedido</h2>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate flex-1 mr-2">
                          {product.name} <span className="text-gray-400">x{quantity}</span>
                        </span>
                        <span className="font-medium text-gray-900 flex-shrink-0">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Envío</span>
                      <span className="text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-lg pt-1">
                      <span>Total</span>
                      <span className="text-orange-500">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Info de entrega */}
                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                    <p>📍 {addressData?.delivery_address}</p>
                    <p>🕐 {selectedSlot}</p>
                    <p>📞 {addressData?.delivery_phone}</p>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => goTo(2)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={handleOrder}
                    disabled={!selectedPay || loading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {loading ? 'Procesando...' : '✅ Confirmar pedido'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}