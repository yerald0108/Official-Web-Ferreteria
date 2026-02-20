// src/pages/AboutPage.tsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Wrench, Shield, Truck, Clock, Users, Package,
  ArrowRight, Star, MapPin, Award, Hammer, Zap,
  Heart, ChevronRight
} from 'lucide-react'

// ── Fade-up reutilizable ─────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Datos del equipo ─────────────────────────────────────────────
const TEAM = [
  {
    name: 'Carlos Rodríguez',
    role: 'Fundador & Director',
    initial: 'C',
    color: 'from-orange-400 to-orange-600',
    bio: 'Con más de 20 años en el sector ferretero cubano, Carlos fundó la empresa con la visión de modernizar el acceso a materiales de construcción.',
  },
  {
    name: 'Mailin Torres',
    role: 'Directora de Operaciones',
    initial: 'M',
    color: 'from-amber-400 to-orange-500',
    bio: 'Experta en logística nacional, Mailin garantiza que cada pedido llegue en perfectas condiciones y en el horario acordado.',
  },
  {
    name: 'Roberto Pérez',
    role: 'Jefe de Almacén',
    initial: 'R',
    color: 'from-orange-500 to-red-500',
    bio: 'Roberto supervisa la calidad de cada producto antes de salir al cliente, asegurando los más altos estándares de la ferretería.',
  },
  {
    name: 'Dayami López',
    role: 'Atención al Cliente',
    initial: 'D',
    color: 'from-amber-500 to-amber-700',
    bio: 'Dayami es la voz amigable detrás de cada consulta. Su objetivo: que ningún cliente se quede sin respuesta.',
  },
]

const VALUES = [
  {
    icon: Shield,
    title: 'Calidad sin compromisos',
    desc: 'Cada producto en nuestro catálogo pasa por un proceso de verificación antes de llegar a tus manos. No vendemos lo que no usaríamos nosotros mismos.',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: Heart,
    title: 'Servicio humano',
    desc: 'Somos cubanos atendiendo a cubanos. Entendemos tus necesidades porque vivimos la misma realidad. Aquí no hay bots, hay personas reales.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: Truck,
    title: 'Logística confiable',
    desc: 'Nuestra red de entrega cubre las 16 provincias. Coordinamos tu pedido en el horario que más te convenga, sin sorpresas ni excusas.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Award,
    title: 'Precios justos',
    desc: 'Trabajamos directamente con distribuidores para ofrecerte los mejores precios del mercado sin intermediarios innecesarios que encarezcan el producto.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
]

const MILESTONES = [
  { year: '2018', label: 'Fundación', desc: 'Abrimos nuestra primera bodega en La Habana con 80 referencias de productos.' },
  { year: '2019', label: 'Expansión', desc: 'Llegamos a Matanzas, Cienfuegos y Villa Clara. Primer equipo de entrega propio.' },
  { year: '2021', label: 'Digital', desc: 'Lanzamos nuestro catálogo online. Más de 500 pedidos en el primer mes.' },
  { year: '2023', label: 'Nacional', desc: 'Presencia en las 16 provincias. Más de 5,000 clientes satisfechos.' },
  { year: '2024', label: 'Hoy',       desc: 'Tienda online completa, entregas coordinadas y un catálogo en constante crecimiento.' },
]

const STATS = [
  { value: '5,000+', label: 'Clientes satisfechos', icon: Users   },
  { value: '200+',   label: 'Productos en catálogo', icon: Package },
  { value: '16',     label: 'Provincias con entrega', icon: MapPin  },
  { value: '6+',     label: 'Años de experiencia',   icon: Clock   },
]

export default function AboutPage() {
  return (
    <div className="space-y-24 pb-16 overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative">
        {/* Fondo con patrón */}
        <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />
        </div>

        <div className="rounded-3xl px-8 md:px-16 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <Wrench size={13} />
              Nuestra historia
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.08] mb-6">
              Construimos Cuba,{' '}
              <span className="text-orange-400">una entrega</span>{' '}
              a la vez
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
              Desde 2018 conectamos a los cubanos con las herramientas y materiales que necesitan para construir, reparar y crecer. Somos más que una ferretería — somos tu socio de confianza.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/30 text-sm"
              >
                Ver catálogo <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-all text-sm"
              >
                Contáctanos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <FadeUp>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Icon size={20} className="text-orange-500" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-1 leading-snug">{label}</p>
            </motion.div>
          ))}
        </div>
      </FadeUp>

      {/* ── MISIÓN ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <FadeUp>
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest">
              <div className="w-6 h-0.5 bg-orange-500" />
              Nuestra misión
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              Democratizar el acceso a materiales de calidad
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              En Cuba, conseguir una llave inglesa o un saco de cemento puede ser una odisea. Nosotros eliminamos esa fricción. Con un catálogo online completo y entrega a domicilio en todo el país, ponemos en tus manos lo que necesitas para construir el hogar, el negocio o el proyecto que tienes en mente.
            </p>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              No somos una empresa anónima. Somos un equipo pequeño, comprometido y apasionado por hacer las cosas bien. Cada pedido que sale de nuestra bodega lleva nuestra firma.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {['C','M','R','D'].map((l, i) => (
                  <div key={i} className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-black">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">El equipo detrás de cada entrega</p>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          {/* Visual decorativo */}
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-3xl p-8 border border-orange-100 dark:border-orange-800/30">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Hammer, label: 'Herramientas',  n: '80+' },
                  { icon: Zap,    label: 'Electricidad',  n: '45+'  },
                  { icon: Package,label: 'Construcción',  n: '70+' },
                  { icon: Star,   label: 'Más vendidos',  n: '20+'  },
                ].map(({ icon: Icon, label, n }) => (
                  <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-orange-100 dark:border-gray-800">
                    <Icon size={22} className="text-orange-500 mb-2" />
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{n}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-orange-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <Truck size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-sm">Entrega nacional</p>
                  <p className="text-xs text-gray-400">16 provincias · Horario flexible</p>
                </div>
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Elementos flotantes decorativos */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200 dark:shadow-orange-900/40 rotate-6">
              <Wrench size={28} className="text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-xl -rotate-6">
              <Shield size={20} className="text-orange-500" />
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── VALORES ───────────────────────────────────────────── */}
      <section>
        <FadeUp className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-0.5 bg-orange-500" />
            Lo que nos define
            <div className="w-6 h-0.5 bg-orange-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Nuestros valores
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-black text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LÍNEA DE TIEMPO ───────────────────────────────────── */}
      <section>
        <FadeUp className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-0.5 bg-orange-500" />
            Cómo llegamos hasta aquí
            <div className="w-6 h-0.5 bg-orange-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Nuestra trayectoria
          </h2>
        </FadeUp>

        <div className="relative max-w-2xl mx-auto">
          {/* Línea vertical */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-orange-300 to-orange-100 dark:to-orange-900/20" />

          <div className="space-y-8">
            {MILESTONES.map(({ year, label, desc }, i) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-6 pl-20"
              >
                {/* Dot */}
                <div className="absolute left-5 top-1 w-6 h-6 bg-orange-500 rounded-full border-4 border-white dark:border-gray-950 shadow-md shadow-orange-200 dark:shadow-orange-900/40 flex-shrink-0 z-10" />

                {/* Año */}
                <div className="absolute left-14 top-0.5 text-xs font-black text-orange-500 w-8 -translate-x-full text-right">
                </div>

                {/* Contenido */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex-1 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-black text-orange-500">{year}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{label}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EQUIPO ────────────────────────────────────────────── */}
      <section>
        <FadeUp className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-0.5 bg-orange-500" />
            Las personas detrás
            <div className="w-6 h-0.5 bg-orange-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Nuestro equipo
          </h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
            Somos un equipo pequeño con un compromiso enorme. Cada persona aquí trabaja para que tu experiencia sea perfecta.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map(({ name, role, initial, color, bio }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center hover:shadow-md transition-shadow group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                {initial}
              </div>
              <h3 className="font-black text-gray-900 dark:text-white text-sm">{name}</h3>
              <p className="text-xs text-orange-500 font-semibold mt-0.5 mb-3">{role}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────── */}
      <FadeUp>
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-black text-white mb-3">
              ¿Listo para hacer tu primer pedido?
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Explora nuestro catálogo y encuentra todo lo que necesitas. Entregamos en toda Cuba.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all hover:scale-105 shadow-xl shadow-orange-500/20 text-sm"
            >
              Ver catálogo <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 transition-all text-sm"
            >
              Hablar con nosotros <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </FadeUp>

    </div>
  )
}