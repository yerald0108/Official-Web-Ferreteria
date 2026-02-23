import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Eye, EyeOff, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { sileo } from 'sileo'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
})

type FormData = z.infer<typeof schema>

const FEATURES = [
  { icon: ShieldCheck, text: 'Compras 100% seguras' },
  { icon: Zap,        text: 'Entrega express a domicilio' },
  { icon: Wrench,     text: 'Más de 200 productos' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted]           = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { register, handleSubmit, formState: { errors, dirtyFields } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    setLoading(false)

    if (error) {
      sileo.error({ title: 'Correo o contraseña incorrectos' })
      return
    }

    sileo.success({ title: '¡Bienvenido de vuelta!' })

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
      .single()

    if (profileData?.role === 'admin')  { navigate('/admin');           return }
    if (profileData?.role === 'gestor') { navigate('/gestor/products'); return }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex overflow-hidden">

      {/* ── Panel izquierdo — decorativo ── */}
      <div className="hidden lg:flex flex-col w-[52%] relative bg-gradient-to-br from-gray-900 via-gray-950 to-black p-12 overflow-hidden">

        {/* Patrón de puntos */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Esferas de luz */}
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-500/8 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-orange-400/6 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
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

        {/* Contenido central */}
        <div className="relative z-10 flex-1 flex flex-col justify-center mt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Cuba's #1 Ferretería Online
            </p>
            <h1 className="text-5xl font-black text-white leading-[1.05] mb-6">
              Todo lo que<br />
              <span className="text-orange-400">necesitas</span><br />
              construir.
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              Herramientas, materiales y más. Entregados directamente a tu puerta en toda Cuba.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 space-y-3"
          >
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={mounted ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-orange-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Card decorativa flotante */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
          animate={mounted ? { opacity: 1, scale: 1, rotate: -4 } : {}}
          transition={{ duration: 0.7, delay: 0.5, type: 'spring' }}
          className="relative z-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">500+ clientes satisfechos</p>
            <div className="flex gap-0.5 mt-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-3 h-3 rounded-sm bg-orange-400" />
              ))}
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-orange-400 text-lg font-black">98%</p>
            <p className="text-gray-500 text-xs">satisfacción</p>
          </div>
        </motion.div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">

        {/* Fondo sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />

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

          {/* Cabecera */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2 leading-tight">
              Bienvenido<br />de vuelta
            </h2>
            <p className="text-gray-500 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  {...register('email')}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 focus:bg-white/8 ${
                    errors.email
                      ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                      : dirtyFields.email && !errors.email
                      ? 'border-green-500/50 focus:border-green-400 focus:ring-2 focus:ring-green-500/20'
                      : 'border-white/10 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15'
                  }`}
                />
                <AnimatePresence>
                  {dirtyFields.email && !errors.email && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 pl-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 focus:bg-white/8 pr-12 ${
                    errors.password
                      ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                      : 'border-white/10 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 pl-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Botón submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 group mt-2"
            >
              {/* Brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-gray-600 text-xs">o</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Link a registro */}
          <Link
            to="/register"
            className="block w-full border-2 border-white/10 hover:border-orange-500/40 text-gray-300 hover:text-white font-semibold py-3.5 rounded-xl text-center text-sm transition-all duration-200 hover:bg-orange-500/5"
          >
            Crear cuenta nueva
          </Link>

        </motion.div>
      </div>
    </div>
  )
}