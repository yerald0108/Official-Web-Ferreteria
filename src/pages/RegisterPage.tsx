import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { InputField } from '../components/ui/InputField'
import { PROVINCES, getMunicipalities } from '../utils/cuba'
import { sileo } from 'sileo'

// ── Schemas de validación ──────────────────────────────────────────
const step1Schema = z.object({
  full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos').regex(/^\d+$/, 'Solo números'),
})

const step2Schema = z.object({
  province: z.string().min(1, 'Selecciona una provincia'),
  municipality: z.string().min(1, 'Selecciona un municipio'),
  address: z.string().min(10, 'Escribe una dirección más detallada'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

// ── Variantes de animación ─────────────────────────────────────────
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // Formulario paso 1
  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })

  // Formulario paso 2
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })
  const selectedProvince = form2.watch('province')

  // ── Avanzar al paso 2 ──
  const handleStep1 = form1.handleSubmit((data) => {
    setStep1Data(data)
    setDirection(1)
    setStep(2)
  })

  // ── Volver al paso 1 ──
  const handleBack = () => {
    setDirection(-1)
    setStep(1)
  }

  // ── Enviar registro final ──
  const handleStep2 = form2.handleSubmit(async (data) => {
    if (!step1Data) return
    setLoading(true)
    setServerError('')

    const { error } = await supabase.auth.signUp({
      email: step1Data.email,
      password: data.password,
      options: {
        data: {
          full_name: step1Data.full_name,
          phone: step1Data.phone,
          address: data.address,
          province: data.province,
          municipality: data.municipality,
        },
      },
    })

    setLoading(false)

    if (error) {
      sileo.error({ title: 'Error al registrarse', description: error.message })
      return
    }

    navigate('/verify-email')
  })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl mb-3">
            <Wrench className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ferretería Online</h1>
          <p className="text-gray-500 text-sm">Crea tu cuenta para comprar</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Paso {step} de 2</span>
              <span>{step === 1 ? 'Información personal' : 'Dirección y contraseña'}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                className="bg-orange-500 h-2 rounded-full"
                initial={false}
                animate={{ width: step === 1 ? '50%' : '100%' }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Pasos con animación */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 ? (
                <motion.form
                  key="step1"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onSubmit={handleStep1}
                  className="flex flex-col gap-4"
                >
                  <InputField
                    label="Nombre completo"
                    placeholder="Ej: Juan García López"
                    {...form1.register('full_name')}
                    error={form1.formState.errors.full_name?.message}
                  />
                  <InputField
                    label="Correo electrónico"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...form1.register('email')}
                    error={form1.formState.errors.email?.message}
                  />
                  <InputField
                    label="Teléfono"
                    type="tel"
                    placeholder="Ej: 52345678"
                    {...form1.register('phone')}
                    error={form1.formState.errors.phone?.message}
                  />
                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
                  >
                    Siguiente →
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onSubmit={handleStep2}
                  className="flex flex-col gap-4"
                >
                  {/* Provincia */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Provincia</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      {...form2.register('province')}
                      onChange={e => {
                        form2.setValue('province', e.target.value)
                        form2.setValue('municipality', '')
                      }}
                    >
                      <option value="">Selecciona una provincia</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {form2.formState.errors.province && (
                      <p className="text-xs text-red-500">{form2.formState.errors.province.message}</p>
                    )}
                  </div>

                  {/* Municipio */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Municipio</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                      disabled={!selectedProvince}
                      {...form2.register('municipality')}
                    >
                      <option value="">Selecciona un municipio</option>
                      {getMunicipalities(selectedProvince).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {form2.formState.errors.municipality && (
                      <p className="text-xs text-red-500">{form2.formState.errors.municipality.message}</p>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Dirección exacta</label>
                    <textarea
                      rows={2}
                      placeholder="Calle, número, entre calles, reparto..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                      {...form2.register('address')}
                    />
                    {form2.formState.errors.address && (
                      <p className="text-xs text-red-500">{form2.formState.errors.address.message}</p>
                    )}
                  </div>

                  <InputField
                    label="Contraseña"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    {...form2.register('password')}
                    error={form2.formState.errors.password?.message}
                  />
                  <InputField
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="Repite tu contraseña"
                    {...form2.register('confirm_password')}
                    error={form2.formState.errors.confirm_password?.message}
                  />

                  {serverError && (
                    <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      {loading ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-orange-600 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}