import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, Truck, Shield, Clock, Star,
  Wrench, Zap, Droplets, PaintBucket, Building2, Bolt,
  ChevronRight, BadgeCheck, Headphones, RotateCcw
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCategories, useProducts } from '../hooks/useProducts'
import ProductCard from '../components/products/ProductCard'

// ── Animación fade-up reutilizable ────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Contador animado ──────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 40
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [inView, to])

  return <span ref={ref}>{val}{suffix}</span>
}

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'herramientas': { icon: <Wrench size={22} />,      color: 'text-orange-500', bg: 'bg-orange-50'  },
  'electricidad': { icon: <Zap size={22} />,          color: 'text-yellow-500', bg: 'bg-yellow-50'  },
  'plomeria':     { icon: <Droplets size={22} />,     color: 'text-blue-500',   bg: 'bg-blue-50'    },
  'pinturas':     { icon: <PaintBucket size={22} />,  color: 'text-pink-500',   bg: 'bg-pink-50'    },
  'construccion': { icon: <Building2 size={22} />,    color: 'text-stone-500',  bg: 'bg-stone-50'   },
  'fijaciones':   { icon: <Bolt size={22} />,         color: 'text-gray-600',   bg: 'bg-gray-100'   },
}

const TESTIMONIALS = [
  { name: 'Carlos M.',    location: 'La Habana',      text: 'Excelente servicio, los materiales llegaron el mismo día. Muy recomendado.',          stars: 5 },
  { name: 'Mailin R.',    location: 'Santiago de Cuba', text: 'Por fin una ferretería que entrega a domicilio. Los precios son muy buenos.',        stars: 5 },
  { name: 'Roberto P.',   location: 'Matanzas',       text: 'Pedí herramientas eléctricas y llegaron perfectas. El proceso de compra es sencillo.', stars: 5 },
  { name: 'Dayami L.',    location: 'Holguín',        text: 'Compré pinturas y materiales de construcción. Todo llegó bien empacado.',              stars: 4 },
]

const GUARANTEES = [
  { icon: BadgeCheck,  title: 'Calidad garantizada',   desc: 'Todos nuestros productos son verificados antes del envío'       },
  { icon: Headphones,  title: 'Soporte al cliente',    desc: 'Estamos disponibles para resolver tus dudas y pedidos'         },
  { icon: RotateCcw,   title: 'Devoluciones fáciles',  desc: 'Si hay algún problema con tu pedido, lo resolvemos de inmediato'},
  { icon: Truck,       title: 'Envío nacional',        desc: 'Entregamos en todas las provincias y municipios de Cuba'        },
]

export default function HomePage() {
  const { profile }               = useAuth()
  const { categories }            = useCategories()
  const { products: featured }    = useProducts()
  const featuredSlice             = featured.slice(0, 4)

  return (
    <div className="space-y-20 pb-10">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 min-h-[480px] flex items-center">
        {/* Fondo con patrón geométrico */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Gradiente naranja lateral */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-orange-500/20 to-transparent" />
        {/* Círculo decorativo */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -right-8 bottom-0 w-56 h-56 rounded-full bg-orange-400/10 blur-2xl" />

        <div className="relative z-10 px-8 md:px-14 py-16 max-w-2xl">
          {profile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
            >
              👋 Hola de nuevo, {profile.full_name.split(' ')[0]}
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white leading-tight mb-5"
          >
            Todo para tu obra,{' '}
            <span className="text-orange-400">entregado</span>{' '}
            en tu puerta
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-gray-300 text-lg mb-8 leading-relaxed"
          >
            Herramientas, electricidad, plomería, pinturas y más.
            Enviamos a todas las provincias de Cuba.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
            >
              Ver catálogo completo <ArrowRight size={18} />
            </Link>
            {!profile && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-all"
              >
                Crear cuenta gratis
              </Link>
            )}
          </motion.div>
        </div>

        {/* Badge flotante derecha */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute right-8 bottom-8 hidden lg:flex flex-col items-center bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 gap-1"
        >
          <div className="flex -space-x-2">
            {['C','M','R','D'].map((l, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-orange-500 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold">
                {l}
              </div>
            ))}
          </div>
          <p className="text-white text-xs font-semibold mt-1">+500 clientes satisfechos</p>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="#f97316" className="text-orange-400" />)}
          </div>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <FadeUp>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 500, suffix: '+', label: 'Clientes atecndidos'   },
            { value: 16,  suffix: '',  label: 'Provincias con entrega' },
            { value: 200, suffix: '+', label: 'Productos disponibles'  },
            { value: 98,  suffix: '%', label: 'Clientes satisfechos'   },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm">
              <p className="text-3xl font-black text-orange-500">
                <Counter to={value} suffix={suffix} />
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </FadeUp>

      {/* ── BENEFICIOS ───────────────────────────────────────────── */}
      <FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Truck,  title: 'Entrega a domicilio',  desc: 'En todas las provincias de Cuba, directo a tu puerta',      color: 'bg-orange-500' },
            { icon: Shield, title: 'Compra 100% segura',   desc: 'Paga en efectivo al recibir. Sin riesgos para ti',           color: 'bg-gray-800'  },
            { icon: Clock,  title: 'Elige tu horario',     desc: 'Mañana o tarde, tú decides cuándo recibir tu pedido',        color: 'bg-orange-500' },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-300">{title}</p>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </FadeUp>

      {/* ── CATEGORÍAS ───────────────────────────────────────────── */}
      <section>
        <FadeUp>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-1">Explora</p>
              <h2 className="text-2xl font-black text-gray-900">Categorías</h2>
            </div>
            <Link to="/catalog" className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Ver todo <ChevronRight size={16} />
            </Link>
          </div>
        </FadeUp>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat, i) => {
            const meta = CATEGORY_META[cat.slug] ?? {
              icon: <Wrench size={22} />,
              color: 'text-orange-500',
              bg: 'bg-orange-50',
            }
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <Link
                  to={`/catalog?category=${cat.slug}`}
                  className="flex flex-col items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 ${meta.bg} rounded-xl flex items-center justify-center ${meta.color} group-hover:scale-110 transition-transform`}>
                    {meta.icon}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">{cat.name}</p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ─────────────────────────────────── */}
      {featuredSlice.length > 0 && (
        <section>
          <FadeUp>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-1">Novedades</p>
                <h2 className="text-2xl font-black text-gray-900">Productos destacados</h2>
              </div>
              <Link to="/catalog" className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                Ver catálogo <ChevronRight size={16} />
              </Link>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredSlice.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── BANNER CTA INTERMEDIO ────────────────────────────────── */}
      <FadeUp>
        <div className="relative overflow-hidden bg-orange-500 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-black text-white mb-3">
              ¿Necesitas asesoría para tu proyecto?
            </h2>
            <p className="text-orange-100 text-lg">
              Nuestro equipo está listo para ayudarte a encontrar los materiales perfectos para tu obra.
            </p>
          </div>
          <Link
            to="/catalog"
            className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all hover:scale-105 shadow-xl"
          >
            Explorar productos <ArrowRight size={18} />
          </Link>
        </div>
      </FadeUp>

      {/* ── GARANTÍAS ────────────────────────────────────────────── */}
      <section>
        <FadeUp>
          <div className="text-center mb-10">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-1">Por qué elegirnos</p>
            <h2 className="text-2xl font-black text-gray-900">Nuestras garantías</h2>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUARANTEES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-orange-500" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white mb-2">{title}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIOS ──────────────────────────────────────────── */}
      <section>
        <FadeUp>
          <div className="text-center mb-10">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-1">Opiniones</p>
            <h2 className="text-2xl font-black text-gray-900">Lo que dicen nuestros clientes</h2>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map(({ name, location, text, stars }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: stars }).map((_, j) => (
                  <Star key={j} size={14} fill="#f97316" className="text-orange-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">{text}</p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────── */}
      {!profile && (
        <FadeUp>
          <div className="bg-gray-900 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '28px 28px',
              }}
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-orange-500 rounded-full" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white mb-3">
                ¿Listo para empezar?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Crea tu cuenta gratis y empieza a comprar con entrega a domicilio en todo el país.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/30"
                >
                  Crear cuenta gratis <ArrowRight size={18} />
                </Link>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all"
                >
                  Ver catálogo
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      )}

    </div>
  )
}