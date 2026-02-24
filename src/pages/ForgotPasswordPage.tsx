import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Mail, ArrowLeft, ArrowRight, CheckCircle2, Sun, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useThemeStore } from '../store/themeStore'

const schema = z.object({
  email: z.string().email('Correo inválido'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { isDark, toggle } = useThemeStore()
  const [mounted, setMounted]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [sent,    setSent]      = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  useEffect(() => { setMounted(true) }, [])

  const { register, handleSubmit, formState: { errors, dirtyFields } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setLoading(false)
    if (!error) {
      setSentEmail(data.email)
      setSent(true)
    }
    // Aunque haya error no lo mostramos (seguridad: no revelar si el email existe)
    // Siempre mostramos la pantalla de éxito
    setSentEmail(data.email)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-6 transition-colors duration-300">

      {/* Botón tema */}
      <button
        onClick={toggle}
        className={`fixed top-4 right-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border ${
          isDark
            ? 'bg-white/5 border-white/10 hover:bg-white/10'
            : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
        }`}
      >
        {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-500" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Wrench size={18} className="text-white" />
          </div>
          <span className="text-gray-900 dark:text-white font-bold text-lg">Ferretería Online</span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden">

          <AnimatePresence mode="wait">

            {/* ── Estado: formulario ── */}
            {!sent && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-8"
              >
                <div className="mb-7">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center mb-4">
                    <Mail size={22} className="text-orange-500 dark:text-orange-400" />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                    Recuperar contraseña
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        autoFocus
                        {...register('email')}
                        className={`
                          w-full bg-white dark:bg-white/5 border rounded-xl pl-10 pr-4 py-3.5
                          text-gray-900 dark:text-white text-sm
                          placeholder-gray-400 dark:placeholder-gray-500
                          outline-none transition-all duration-200
                          ${errors.email
                            ? 'border-red-400 dark:border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : dirtyFields.email && !errors.email
                            ? 'border-green-400 dark:border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                            : 'border-gray-200 dark:border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/15'
                          }
                        `}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-500 dark:text-red-400 pl-1"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full overflow-hidden bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar enlace</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Volver al inicio de sesión
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── Estado: correo enviado ── */}
            {sent && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-green-500/10 dark:bg-green-500/15 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 size={32} className="text-green-500 dark:text-green-400" />
                </motion.div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                  ¡Correo enviado!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                  Si <span className="font-semibold text-gray-700 dark:text-gray-200">{sentEmail}</span> está registrado, recibirás un enlace para restablecer tu contraseña.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
                  Revisa también tu carpeta de spam si no ves el correo en unos minutos.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => setSent(false)}
                    className="w-full py-3.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                  >
                    Usar otro correo
                  </button>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-colors shadow-md shadow-orange-500/20"
                  >
                    <ArrowLeft size={14} />
                    Volver al inicio de sesión
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}