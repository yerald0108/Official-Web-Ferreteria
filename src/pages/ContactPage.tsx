// src/pages/ContactPage.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Animación reutilizable (mismo patrón que AboutPage) ─────────────────────
const FadeUp = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Datos de contacto ────────────────────────────────────────────────────────
const contactInfo = [
  {
    icon: Phone,
    label: 'Teléfono',
    value: '+53 5 000 0000',
    sub: 'Lunes a sábado',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Mail,
    label: 'Correo electrónico',
    value: 'info@ferreteria.cu',
    sub: 'Respondemos en 24h',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: MapPin,
    label: 'Cobertura',
    value: 'Todo el territorio nacional',
    sub: 'Envíos a Cuba',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    icon: Clock,
    label: 'Horario de atención',
    value: 'Lun–Sab 8am–6pm',
    sub: 'Dom 9am–1pm',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
];

// ─── Opciones del select de asunto ───────────────────────────────────────────
const asuntos = [
  'Selecciona un asunto',
  'Consulta sobre un pedido',
  'Información de productos',
  'Problema con entrega',
  'Solicitud de presupuesto',
  'Sugerencia o reclamo',
  'Otro',
];

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface FormState {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

interface FormErrors {
  nombre?: string;
  email?: string;
  asunto?: string;
  mensaje?: string;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // ── Validación ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }
    if (!form.asunto || form.asunto === 'Selecciona un asunto') {
      newErrors.asunto = 'Selecciona un asunto';
    }
    if (!form.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    } else if (form.mensaje.trim().length < 20) {
      newErrors.mensaje = 'El mensaje debe tener al menos 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    setEnviando(true);
    // Simulación de envío — aquí conectarías tu backend o servicio de email
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setEnviando(false);
    setEnviado(true);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Clases base de inputs ───────────────────────────────────────────────────
  const inputBase =
    'w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500';
  const inputNormal = `${inputBase} border-gray-200 dark:border-gray-700`;
  const inputError = `${inputBase} border-red-400 dark:border-red-500 focus:ring-red-400`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 dark:bg-gray-950 py-20 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <span className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <MessageSquare className="w-3.5 h-3.5" />
              Estamos aquí para ayudarte
            </span>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              ¿Cómo podemos{' '}
              <span className="text-orange-400">ayudarte?</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Escríbenos, llámanos o cuéntanos tu consulta. Nuestro equipo responde
              lo antes posible para que tengas lo que necesitas.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Tarjetas de información ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {contactInfo.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeUp key={item.label} delay={i * 0.08}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`inline-flex p-2 rounded-xl mb-3 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </section>

      {/* ── Formulario ───────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <FadeUp>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 md:p-8">
            {enviado ? (
              /* ── Estado de éxito ─────────────────────────────────────── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  ¡Mensaje enviado!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
                  Gracias por contactarnos, <span className="font-medium text-gray-700 dark:text-gray-300">{form.nombre}</span>.
                  Te responderemos a <span className="font-medium text-gray-700 dark:text-gray-300">{form.email}</span> en
                  menos de 24 horas.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setEnviado(false);
                      setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
                    }}
                    className="px-5 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Enviar otro mensaje
                  </button>
                  <Link
                    to="/catalogo"
                    className="px-5 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors text-center"
                  >
                    Ver catálogo
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* ── Formulario ──────────────────────────────────────────── */
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Envíanos un mensaje
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Todos los campos son requeridos
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      className={errors.nombre ? inputError : inputNormal}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={errors.email ? inputError : inputNormal}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Asunto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Asunto
                    </label>
                    <select
                      value={form.asunto}
                      onChange={(e) => handleChange('asunto', e.target.value)}
                      className={errors.asunto ? inputError : inputNormal}
                    >
                      {asuntos.map((a) => (
                        <option key={a} value={a === 'Selecciona un asunto' ? '' : a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    {errors.asunto && (
                      <p className="text-red-500 text-xs mt-1">{errors.asunto}</p>
                    )}
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Mensaje
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe tu consulta con el mayor detalle posible..."
                      value={form.mensaje}
                      onChange={(e) => handleChange('mensaje', e.target.value)}
                      className={`${errors.mensaje ? inputError : inputNormal} resize-none`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.mensaje ? (
                        <p className="text-red-500 text-xs">{errors.mensaje}</p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {form.mensaje.length} caracteres
                      </span>
                    </div>
                  </div>

                  {/* Botón */}
                  <button
                    onClick={handleSubmit}
                    disabled={enviando}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
                  >
                    {enviando ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar mensaje
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </FadeUp>
      </section>
    </div>
  );
}