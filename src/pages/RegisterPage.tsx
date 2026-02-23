import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Eye, EyeOff, ArrowRight, ArrowLeft, User, Mail, Lock, CheckCircle2, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { sileo } from 'sileo'

// ── Schemas por paso ──────────────────────────────────────────────────────────
const step1Schema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres'),
  email:     z.string().email('Correo inválido'),
})

const step2Schema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirm_password: z.string().min(1, 'Confirma tu contraseña'),
}).refine(d => d.password === d.confirm_password, {
  message: '¡Las contraseñas no coinciden!',
  path: ['confirm_password'],
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

// ── Evaluador de fortaleza ────────────────────────────────────────────────────
type Strength = { score: number; label: string; color: string; barColor: string }

function evaluateStrength(password: string): Strength {
  let score = 0
  if (password.length >= 8)                   score++
  if (password.length >= 12)                  score++
  if (/[A-Z]/.test(password))                 score++
  if (/[0-9]/.test(password))                 score++
  if (/[^A-Za-z0-9]/.test(password))          score++

  if (score <= 1) return { score, label: 'Muy débil',  color: 'text-red-400',    barColor: 'bg-red-500' }
  if (score === 2) return { score, label: 'Débil',      color: 'text-orange-400', barColor: 'bg-orange-500' }
  if (score === 3) return { score, label: 'Regular',    color: 'text-yellow-400', barColor: 'bg-yellow-400' }
  if (score === 4) return { score, label: 'Fuerte',     color: 'text-lime-400',   barColor: 'bg-lime-500' }
  return               { score, label: '¡Excelente!', color: 'text-green-400',  barColor: 'bg-green-500' }
}

// ── Partícula de celebración ──────────────────────────────────────────────────
function Particle({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{ left: x, top: y, backgroundColor: color }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1, 0],
        opacity: [1, 1, 0],
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 80,
      }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    />
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [mounted, setMounted]       = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [passwordVal, setPasswordVal] = useState('')
  const [confirmVal, setConfirmVal]   = useState('')
  const [particles, setParticles]     = useState<{ id: number; x: number; y: number; color: string }[]>([])
  const [step1Data, setStep1Data]     = useState<Step1Data | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const strength = evaluateStrength(passwordVal)
  const passwordsMatch = passwordVal.length > 0 && passwordVal === confirmVal

  // Dispara partículas cuando las contraseñas coinciden
  const prevMatch = useState(false)
  const triggerParticles = useCallback(() => {
    const colors = ['#f97316', '#fb923c', '#fdba74', '#22c55e', '#86efac']
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 300,
      y: Math.random() * 60 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 800)
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordVal(e.target.value)
    form2.setValue('password', e.target.value, { shouldValidate: true })
  }

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const wasMatch = passwordVal.length > 0 && passwordVal === confirmVal
    const nowMatch  = passwordVal.length > 0 && passwordVal === val
    setConfirmVal(val)
    form2.setValue('confirm_password', val, { shouldValidate: true })
    if (!wasMatch && nowMatch) triggerParticles()
  }

  const onStep1 = async (data: Step1Data) => {
    setStep1Data(data)
    setStep(2)
  }

  const onStep2 = async (data: Step2Data) => {
    if (!step1Data) return
    setLoading(true)

    const { data: authData, error } = await supabase.auth.signUp({
      email:    step1Data.email,
      password: data.password,
      options: {
        data: { full_name: step1Data.full_name },
      },
    })

    if (error) {
      setLoading(false)
      sileo.error({ title: error.message })
      return
    }

    if (authData.user) {
      await supabase.from('profiles').upsert({
        id:        authData.user.id,
        full_name: step1Data.full_name,
        email:     step1Data.email,
        role:      'cliente',
      })
    }

    setLoading(false)
    sileo.success({ title: '¡Cuenta creada! Bienvenido 🎉' })
    navigate('/')
  }

  // ── Indicadores de requisitos ─────────────────────────────────────────────
  const requirements = [
    { met: passwordVal.length >= 8,           label: 'Al menos 8 caracteres' },
    { met: /[A-Z]/.test(passwordVal),         label: 'Una letra mayúscula' },
    { met: /[0-9]/.test(passwordVal),         label: 'Un número' },
    { met: /[^A-Za-z0-9]/.test(passwordVal),  label: 'Un símbolo especial' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex overflow-hidden">

      {/* ── Panel izquierdo ── */}
      <div className="hidden lg:flex flex-col w-[48%] relative bg-gradient-to-br from-gray-900 via-gray-950 to-black p-12 overflow-hidden">

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 -left-20 w-64 h-64 rounded-full bg-orange-400/8 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={mounted ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Wrench className="text-white" size={20} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Ferretería Online</span>
        </motion.div>

        {/* Texto principal */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Únete hoy
            </p>
            <h1 className="text-5xl font-black text-white leading-[1.05] mb-6">
              Empieza a<br />
              <span className="text-orange-400">construir</span><br />
              tu proyecto.
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              Regístrate gratis y accede al catálogo completo de herramientas y materiales de construcción.
            </p>
          </motion.div>

          {/* Pasos del proceso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 space-y-4"
          >
            {[
              { n: '01', title: 'Crea tu cuenta',        desc: 'Nombre, correo y contraseña' },
              { n: '02', title: 'Explora el catálogo',    desc: '+200 productos disponibles' },
              { n: '03', title: 'Recibe en tu puerta',    desc: 'Entrega express en toda Cuba' },
            ].map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: -20 }}
                animate={mounted ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-400 text-xs font-black">{n}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3"
        >
          <ShieldCheck size={20} className="text-orange-400 flex-shrink-0" />
          <p className="text-gray-400 text-xs leading-snug">
            Tu información está protegida con <span className="text-white font-semibold">encriptación de nivel bancario</span>.
          </p>
        </motion.div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 w-full max-w-sm"
        >

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <Wrench className="text-white" size={18} />
            </div>
            <span className="text-white font-bold">Ferretería Online</span>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-orange-500 text-white ring-4 ring-orange-500/20'
                    : 'bg-white/10 text-gray-500'
                }`}>
                  {s < step ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : s}
                </div>
                <span className={`text-xs font-medium ${s === step ? 'text-white' : 'text-gray-600'}`}>
                  {s === 1 ? 'Tus datos' : 'Contraseña'}
                </span>
                {s < 2 && <div className="w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          {/* ── PASO 1 ── */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-7">
                  <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                    Crea tu<br />cuenta
                  </h2>
                  <p className="text-gray-500 text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
                      Inicia sesión
                    </Link>
                  </p>
                </div>

                <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-5">

                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="Juan García"
                        autoComplete="name"
                        {...form1.register('full_name')}
                        className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 ${
                          form1.formState.errors.full_name
                            ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                            : form1.formState.dirtyFields.full_name && !form1.formState.errors.full_name
                            ? 'border-green-500/50 focus:border-green-400 focus:ring-2 focus:ring-green-500/20'
                            : 'border-white/10 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15'
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {form1.formState.errors.full_name && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-400 pl-1"
                        >
                          {form1.formState.errors.full_name.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                        autoComplete="email"
                        {...form1.register('email')}
                        className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 ${
                          form1.formState.errors.email
                            ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                            : form1.formState.dirtyFields.email && !form1.formState.errors.email
                            ? 'border-green-500/50 focus:border-green-400 focus:ring-2 focus:ring-green-500/20'
                            : 'border-white/10 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15'
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {form1.formState.errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-400 pl-1"
                        >
                          {form1.formState.errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full overflow-hidden bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 group mt-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span>Continuar</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── PASO 2 ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-7">
                  <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                    Elige tu<br />contraseña
                  </h2>
                  <p className="text-gray-500 text-sm">Que sea segura y fácil de recordar.</p>
                </div>

                <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-5">

                  {/* Campo de contraseña */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        value={passwordVal}
                        onChange={handlePasswordChange}
                        className={`w-full bg-white/5 border rounded-xl pl-10 pr-12 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 ${
                          passwordVal.length > 0
                            ? strength.score >= 4
                              ? 'border-green-500/50 focus:border-green-400 focus:ring-2 focus:ring-green-500/15'
                              : strength.score >= 3
                              ? 'border-yellow-500/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/15'
                              : 'border-orange-500/40 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/15'
                            : 'border-white/10 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>

                    {/* Barra de fortaleza animada */}
                    <AnimatePresence>
                      {passwordVal.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {/* Barras segmentadas */}
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(segment => (
                              <div key={segment} className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${strength.barColor}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: strength.score >= segment ? '100%' : '0%' }}
                                  transition={{ duration: 0.3, delay: segment * 0.05 }}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Label de fortaleza */}
                          <div className="flex items-center justify-between">
                            <motion.span
                              key={strength.label}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`text-xs font-bold ${strength.color}`}
                            >
                              {strength.label}
                            </motion.span>
                            <span className="text-gray-600 text-xs">{strength.score}/5</span>
                          </div>

                          {/* Requisitos */}
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            {requirements.map(({ met, label }) => (
                              <motion.div
                                key={label}
                                className="flex items-center gap-1.5"
                                animate={{ opacity: met ? 1 : 0.5 }}
                              >
                                <motion.div
                                  animate={{ scale: met ? [1, 1.3, 1] : 1 }}
                                  transition={{ duration: 0.2 }}
                                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                                    met ? 'bg-green-500' : 'bg-white/10'
                                  }`}
                                >
                                  {met && (
                                    <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                                      <path d="M0.5 2.5L2.5 4.5L6.5 0.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </motion.div>
                                <span className={`text-[10px] transition-colors duration-200 ${met ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {label}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Campo confirmar contraseña */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showConf ? 'text' : 'password'}
                        placeholder="Repite tu contraseña"
                        autoComplete="new-password"
                        value={confirmVal}
                        onChange={handleConfirmChange}
                        className={`w-full bg-white/5 border rounded-xl pl-10 pr-12 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 ${
                          confirmVal.length > 0
                            ? passwordsMatch
                              ? 'border-green-500/60 focus:border-green-400 focus:ring-2 focus:ring-green-500/20'
                              : 'border-red-500/40 focus:border-red-400 focus:ring-2 focus:ring-red-500/15'
                            : 'border-white/10 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConf(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showConf ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>

                      {/* Ícono de match animado */}
                      <AnimatePresence>
                        {passwordsMatch && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="absolute right-10 top-1/2 -translate-y-1/2"
                          >
                            <CheckCircle2 size={18} className="text-green-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Partículas de celebración */}
                    <div className="relative h-0 overflow-visible">
                      <AnimatePresence>
                        {particles.map(p => (
                          <Particle key={p.id} x={p.x} y={p.y} color={p.color} />
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Mensaje de coincidencia */}
                    <AnimatePresence>
                      {confirmVal.length > 0 && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={`text-xs pl-1 font-medium ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {passwordsMatch ? '✓ ¡Contraseñas coinciden!' : '✗ Las contraseñas no coinciden'}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-4 py-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all duration-200 text-sm font-medium"
                    >
                      <ArrowLeft size={16} />
                      Volver
                    </button>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileTap={{ scale: 0.98 }}
                      className="relative flex-1 overflow-hidden bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>Creando...</span>
                        </>
                      ) : (
                        <>
                          <span>Crear cuenta</span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}