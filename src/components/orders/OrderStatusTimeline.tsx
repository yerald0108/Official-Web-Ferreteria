import { motion } from 'framer-motion'
import {
  ClipboardList, CheckCircle, Truck, Home, XCircle,
} from 'lucide-react'
import type { OrderStatusHistory } from '../../types'

interface Props {
  history: OrderStatusHistory[]
  currentStatus: string
}

const STATUS_CONFIG: Record<string, {
  label: string
  icon: React.ElementType
  color: string
  bg: string
  dot: string
}> = {
  pending: {
    label: 'Pedido recibido',
    icon: ClipboardList,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmado',
    icon: CheckCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    dot: 'bg-blue-500',
  },
  on_the_way: {
    label: 'En camino',
    icon: Truck,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    dot: 'bg-violet-500',
  },
  delivered: {
    label: 'Entregado',
    icon: Home,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    dot: 'bg-green-500',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    dot: 'bg-red-500',
  },
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('es-CU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrderStatusTimeline({ history, currentStatus }: Props) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  )

  return (
    <div className="relative">
      {/* Línea vertical conectora */}
      {sorted.length > 1 && (
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100 dark:bg-gray-800" />
      )}

      <div className="space-y-4">
        {sorted.map((entry, i) => {
          const config  = STATUS_CONFIG[entry.status]
          const Icon    = config?.icon ?? ClipboardList
          const isLast  = i === sorted.length - 1
          const isCurrent = entry.status === currentStatus && isLast

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex items-start gap-4"
            >
              {/* Dot con icono */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    config?.bg ?? 'bg-gray-50'
                  } border-2 ${
                    isCurrent
                      ? 'border-current'
                      : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <Icon size={17} className={config?.color ?? 'text-gray-400'} />
                </motion.div>

                {/* Pulso en estado actual */}
                {isCurrent && (
                  <motion.div
                    className={`absolute inset-0 rounded-full ${config?.dot}`}
                    animate={{ scale: [1, 1.7], opacity: [0.3, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Contenido */}
              <div className={`flex-1 pb-1 pt-1.5 rounded-2xl px-4 py-3 border transition-shadow ${
                isCurrent
                  ? `${config?.bg} border-transparent shadow-sm`
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
              }`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className={`text-sm font-bold ${
                      isCurrent
                        ? config?.color
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {config?.label ?? entry.status}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {formatDateTime(entry.changed_at)}
                    </p>
                    {isCurrent && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                        config?.bg
                      } ${config?.color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        Estado actual
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}