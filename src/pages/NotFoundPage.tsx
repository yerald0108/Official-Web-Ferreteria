import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search, Wrench } from 'lucide-react'

// ── Tornillo/tuerca flotante decorativo ───────────────────────────
function FloatingBolt({
  x, y, size, duration, delay, rotation,
}: {
  x: string; y: string; size: number
  duration: number; delay: number; rotation: number
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.15, 0.1, 0.15],
        scale:   [0, 1, 0.95, 1],
        y:       [0, -18, 0, -18],
        rotate:  [rotation, rotation + 180, rotation + 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Wrench size={size} className="text-orange-500" />
    </motion.div>
  )
}

// ── Contador regresivo ────────────────────────────────────────────
function Countdown({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [count, setCount] = useState(seconds)

  useEffect(() => {
    if (count <= 0) { onEnd(); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, onEnd])

  const pct = (count / seconds) * 100

  return (
    <div className="flex items-center gap-3">
      {/* Círculo SVG */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9"
            fill="none" stroke="#1f2937" strokeWidth="3" />
          <motion.circle
            cx="18" cy="18" r="15.9"
            fill="none" stroke="#f97316" strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={100 - pct}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-orange-500">
          {count}
        </span>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Regresando al inicio…
      </span>
    </div>
  )
}

// ── Número 404 con efecto glitch ──────────────────────────────────
function GlitchNumber() {
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const fire = () => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 300)
    }
    const interval = setInterval(fire, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative select-none">
      {/* Sombra naranja desplazada */}
      <motion.span
        className="absolute inset-0 text-[10rem] md:text-[14rem] font-black text-orange-500/20 leading-none"
        animate={glitch ? { x: [0, -6, 4, -2, 0], y: [0, 3, -3, 1, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        aria-hidden
      >
        404
      </motion.span>

      {/* Capa roja glitch */}
      {glitch && (
        <span
          className="absolute inset-0 text-[10rem] md:text-[14rem] font-black leading-none"
          style={{
            color: 'transparent',
            WebkitTextStroke: '2px #ef4444',
            clipPath: 'inset(30% 0 40% 0)',
            transform: 'translate(8px, -4px)',
          }}
          aria-hidden
        >
          404
        </span>
      )}

      {/* Número principal */}
      <span
        className="relative text-[10rem] md:text-[14rem] font-black leading-none"
        style={{
          color: 'transparent',
          WebkitTextStroke: '3px #f97316',
          WebkitBackgroundClip: 'text',
        }}
      >
        404
      </span>
    </div>
  )
}

// ── Partícula de chispa ───────────────────────────────────────────
interface Spark { id: number; x: number; y: number; vx: number; vy: number; life: number }

function SparkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparks    = useRef<Spark[]>([])
  const frameRef  = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let id = 0
    const spawn = () => {
      const cx = canvas.width / 2
      for (let i = 0; i < 3; i++) {
        sparks.current.push({
          id:   id++,
          x:    cx + (Math.random() - 0.5) * 180,
          y:    canvas.height * 0.38,
          vx:   (Math.random() - 0.5) * 3,
          vy:   -(Math.random() * 2 + 1),
          life: 1,
        })
      }
    }
    const spawnInterval = setInterval(spawn, 220)

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      sparks.current = sparks.current.filter(s => s.life > 0)
      for (const s of sparks.current) {
        s.x   += s.vx
        s.y   += s.vy
        s.vy  += 0.06
        s.life -= 0.022
        ctx.globalAlpha = s.life
        ctx.fillStyle   = s.life > 0.5 ? '#f97316' : '#fbbf24'
        ctx.beginPath()
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      clearInterval(spawnInterval)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

// ── Página principal ──────────────────────────────────────────────
const BOLTS = [
  { x: '5%',  y: '10%', size: 32, duration: 6,   delay: 0,   rotation: 15  },
  { x: '88%', y: '8%',  size: 24, duration: 7.5, delay: 0.8, rotation: -20 },
  { x: '2%',  y: '55%', size: 20, duration: 5.5, delay: 1.5, rotation: 45  },
  { x: '92%', y: '50%', size: 28, duration: 8,   delay: 0.3, rotation: -10 },
  { x: '10%', y: '80%', size: 18, duration: 6.5, delay: 2,   rotation: 30  },
  { x: '85%', y: '78%', size: 22, duration: 7,   delay: 1.1, rotation: -35 },
  { x: '50%', y: '5%',  size: 16, duration: 9,   delay: 0.6, rotation: 60  },
]

const SUGGESTIONS = [
  { label: 'Inicio',    to: '/',        icon: Home      },
  { label: 'Catálogo',  to: '/catalog', icon: Search    },
  { label: 'Mis pedidos', to: '/orders', icon: Wrench   },
]

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden flex flex-col items-center justify-center px-4">

      {/* ── Fondo con patrón de puntos ── */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Aura central ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-orange-500/8 blur-2xl pointer-events-none" />

      {/* ── Tornillos flotantes ── */}
      {BOLTS.map((b, i) => <FloatingBolt key={i} {...b} />)}

      {/* ── Canvas de chispas ── */}
      <SparkCanvas />

      {/* ── Contenido principal ── */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-lg w-full">

        {/* Número 404 animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlitchNumber />
        </motion.div>

        {/* Línea divisoria animada */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent w-full"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Textos */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Página no encontrada
          </h1>
          <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-sm mx-auto">
            Parece que esta página se perdió en el almacén. No te preocupes,
            te ayudamos a encontrar lo que buscas.
          </p>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-700 hover:border-orange-500 text-gray-300 hover:text-orange-400 font-semibold py-3 px-5 rounded-2xl transition-all duration-200 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Volver atrás
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 px-5 rounded-2xl transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02]"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
        </motion.div>

        {/* Sugerencias rápidas */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6, delay: 0.68 }}
        >
          <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3">
            O quizás buscabas…
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-orange-500/50 text-gray-400 hover:text-orange-400 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Cuenta regresiva */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Countdown seconds={15} onEnd={() => navigate('/')} />
        </motion.div>

      </div>

      {/* ── Línea inferior decorativa ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      />
    </div>
  )
}