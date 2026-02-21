import { motion } from 'framer-motion'
import { WifiOff, ServerCrash, RefreshCw } from 'lucide-react'

interface Props {
  type?: 'network' | 'server' | 'generic'
  title?: string
  description?: string
  onRetry?: () => void
}

const CONFIG = {
  network: {
    icon: WifiOff,
    defaultTitle: 'Sin conexión a internet',
    defaultDesc: 'Comprueba tu conexión y vuelve a intentarlo.',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-500',
    gradient: 'from-blue-500/10 via-transparent to-transparent',
  },
  server: {
    icon: ServerCrash,
    defaultTitle: 'Error del servidor',
    defaultDesc: 'Tuvimos un problema al cargar los datos. Intenta de nuevo en unos segundos.',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500',
    gradient: 'from-red-500/10 via-transparent to-transparent',
  },
  generic: {
    icon: ServerCrash,
    defaultTitle: 'Algo salió mal',
    defaultDesc: 'No pudimos cargar esta sección. Intenta recargar la página.',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-500',
    gradient: 'from-orange-500/10 via-transparent to-transparent',
  },
}

export default function ErrorState({
  type = 'generic',
  title,
  description,
  onRetry,
}: Props) {
  const { icon: Icon, defaultTitle, defaultDesc, iconBg, iconColor, gradient } = CONFIG[type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden flex flex-col items-center justify-center py-20 px-6 text-center rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      {/* Fondo degradado decorativo */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`} />

      {/* Patrón de puntos */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-sm">
        {/* Icono animado */}
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className={`w-20 h-20 ${iconBg} rounded-3xl flex items-center justify-center shadow-sm`}
        >
          <Icon size={36} className={iconColor} strokeWidth={1.5} />
        </motion.div>

        {/* Textos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {title ?? defaultTitle}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
            {description ?? defaultDesc}
          </p>
        </motion.div>

        {/* Botón de reintento */}
        {onRetry && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onRetry}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold px-6 py-3 rounded-2xl transition-all shadow-lg text-sm"
          >
            <RefreshCw size={16} />
            Reintentar
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}