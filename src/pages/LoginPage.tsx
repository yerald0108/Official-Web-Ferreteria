import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Eye, EyeOff, ArrowRight, Mail, Lock, ShieldCheck, Sun, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { sileo } from 'sileo'
import { useThemeStore } from '../store/themeStore'
import TermsModal from './TermsModal'

// ── Schema ────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

type LoginData = z.infer<typeof loginSchema>

// ── Input helper ──────────────────────────────────────────────────────────────
function inputCls(hasError: boolean, isDirtyValid = false) {
  const base =
    'w-full ' +
    // Fondo: blanco en claro, semitransparente en oscuro
    'bg-white dark:bg-white/5 ' +
    // Borde base
    'border ' +
    // Texto
    'text-gray-900 dark:text-white text-sm ' +
    // Placeholder
    'placeholder-gray-400 dark:placeholder-gray-500 ' +
    'rounded-xl px-4 py-3.5 outline-none transition-all duration-200'

  if (hasError)
    return `${base} border-red-400 dark:border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`
  if (isDirtyValid)
    return `${base} border-green-400 dark:border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20`
  return `${base} border-gray-200 dark:border-white/10 focus:border-orange-500 dark:focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/15`
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { isDark, toggle } = useThemeStore()

  const [loading,  setLoading]  = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [termsOpen, setTermsOpen]       = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { register, handleSubmit, formState: { errors, dirtyFields } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email:    data.email,
      password: data.password,
    })

    if (error) {
      setLoading(false)
      sileo.error({ title: 'Correo o contraseña incorrectos' })
      return
    }

    setLoading(false)
    navigate('/')
  }

  return (
    // Fondo raíz: gris claro en light, muy oscuro en dark
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex overflow-hidden transition-colors duration-300">

      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />

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
              Bienvenido de vuelta
            </p>
            <h1 className="text-5xl font-black text-white leading-[1.05] mb-6">
              Continúa<br />
              <span className="text-orange-400">construyendo</span><br />
              tu proyecto.
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              Accede a tu cuenta y gestiona tus pedidos, favoritos y mucho más.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 space-y-4"
          >
            {[
              { icon: '📦', title: 'Seguimiento de pedidos',  desc: 'Rastrea tus compras en tiempo real' },
              { icon: '❤️', title: 'Lista de favoritos',      desc: 'Guarda los productos que más usas' },
              { icon: '🔔', title: 'Notificaciones',          desc: 'Recibe alertas de ofertas y novedades' },
            ].map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={mounted ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-base">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
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
        {/* Fondo del panel: blanco en light, gris oscuro en dark */}
        <div className="absolute inset-0 bg-white dark:bg-gray-900 transition-colors duration-300" />

        {/* Botón de tema */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={mounted ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          onClick={toggle}
          className={`
            absolute top-5 right-5 z-20 w-10 h-10 rounded-xl flex items-center justify-center
            transition-all duration-200 border
            ${isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              : 'bg-gray-100 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
            }
          `}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark
            ? <Sun  size={17} className="text-amber-400" />
            : <Moon size={17} className="text-indigo-500" />
          }
        </motion.button>

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
            <span className="text-gray-900 dark:text-white font-bold">Ferretería Online</span>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight transition-colors duration-300">
              Iniciar sesión
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-orange-500 dark:text-orange-400 font-semibold hover:text-orange-600 dark:hover:text-orange-300 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  {...register('email')}
                  className={`${inputCls(!!errors.email, dirtyFields.email && !errors.email)} pl-10`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs text-red-500 dark:text-red-400 pl-1">
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contraseña
                </label>
                <Link to="/forgot-password" className="text-xs text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`${inputCls(!!errors.password)} pl-10 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs text-red-500 dark:text-red-400 pl-1">
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Botón */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 group mt-2"
            >
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

          {/* Separador y opciones extra */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Al continuar aceptas nuestros{' '}
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="text-orange-500 dark:text-orange-400 hover:underline focus:outline-none"
              >
                Términos de uso
              </button>
              </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
