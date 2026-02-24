import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wrench, ScrollText } from 'lucide-react'

interface TermsModalProps {
  open: boolean
  onClose: () => void
}

const SECTIONS = [
  {
    title: '1. Aceptación de los términos',
    content: `Al crear una cuenta y utilizar los servicios de Ferretería Online, usted acepta quedar vinculado por estos Términos de Uso. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice nuestros servicios. El uso continuado de la plataforma tras la publicación de cambios constituye su aceptación de los nuevos términos.`,
  },
  {
    title: '2. Descripción del servicio',
    content: `Ferretería Online es una plataforma de comercio electrónico que permite a los usuarios consultar, reservar y adquirir herramientas, materiales de construcción y productos ferreteros. Nos reservamos el derecho de modificar, suspender o interrumpir el servicio en cualquier momento, con o sin previo aviso, sin incurrir en responsabilidad alguna frente al usuario.`,
  },
  {
    title: '3. Registro y cuenta de usuario',
    content: `Para acceder a determinadas funcionalidades deberá crear una cuenta proporcionando información veraz, completa y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas bajo su cuenta. Notifíquenos inmediatamente si sospecha de un uso no autorizado de su cuenta. Nos reservamos el derecho de cancelar cuentas que proporcionen información falsa o que incumplan estos términos.`,
  },
  {
    title: '4. Pedidos y disponibilidad',
    content: `La confirmación de un pedido no garantiza la disponibilidad del producto. En caso de que un artículo no esté disponible tras la confirmación, nos pondremos en contacto con usted para ofrecer alternativas o proceder con la cancelación. Los precios publicados están sujetos a cambios sin previo aviso y serán válidos hasta agotar existencias. Ferretería Online se reserva el derecho de cancelar pedidos en caso de errores tipográficos en los precios.`,
  },
  {
    title: '5. Entregas y zona de cobertura',
    content: `El servicio de entrega opera en las provincias y municipios indicados en nuestra plataforma. Los plazos de entrega son estimados y pueden verse afectados por factores externos fuera de nuestro control. El usuario deberá proporcionar una dirección de entrega válida y estar disponible para recibirla. Ferretería Online no se hace responsable de demoras ocasionadas por información incorrecta proporcionada por el cliente.`,
  },
  {
    title: '6. Precios y pagos',
    content: `Todos los precios se expresan en la moneda vigente en Cuba. El pago deberá realizarse por los medios habilitados en la plataforma. En caso de disputas relacionadas con cobros, el usuario deberá notificarlo dentro de los 30 días siguientes a la transacción. Ferretería Online utiliza sistemas de pago seguros y no almacena datos bancarios del usuario en sus servidores.`,
  },
  {
    title: '7. Devoluciones y reclamaciones',
    content: `Los productos podrán devolverse dentro de los 7 días naturales siguientes a su recepción, siempre que se encuentren en su estado original, sin uso y con el embalaje intacto. Los productos dañados durante el transporte deberán reportarse dentro de las 24 horas de recibidos, adjuntando evidencia fotográfica. No se aceptan devoluciones de productos especiales, cortados a medida o con uso evidente.`,
  },
  {
    title: '8. Uso aceptable',
    content: `El usuario se compromete a utilizar la plataforma únicamente para fines lícitos y de acuerdo con estos términos. Queda prohibido: intentar acceder a áreas restringidas del sistema, publicar contenido falso o engañoso, utilizar robots o sistemas automatizados para interactuar con la plataforma, y cualquier actividad que pueda dañar, deshabilitar o sobrecargar los servidores.`,
  },
  {
    title: '9. Privacidad y protección de datos',
    content: `La información personal que usted nos proporciona será utilizada exclusivamente para la gestión de su cuenta, el procesamiento de pedidos y la mejora de nuestros servicios. No compartimos sus datos con terceros sin su consentimiento, salvo cuando sea requerido por disposición legal. Para más detalles, consulte nuestra Política de Privacidad.`,
  },
  {
    title: '10. Limitación de responsabilidad',
    content: `Ferretería Online no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la plataforma. Nuestra responsabilidad total frente al usuario no excederá el monto pagado por los productos o servicios objeto de la reclamación. Esta limitación se aplica en la máxima medida permitida por la legislación cubana vigente.`,
  },
  {
    title: '11. Modificaciones',
    content: `Ferretería Online se reserva el derecho de actualizar estos Términos de Uso en cualquier momento. Le notificaremos los cambios sustanciales a través del correo electrónico registrado o mediante un aviso destacado en la plataforma. El uso continuado del servicio tras la notificación de cambios implica la aceptación de los términos actualizados.`,
  },
  {
    title: '12. Legislación aplicable',
    content: `Estos Términos de Uso se rigen por la legislación de la República de Cuba. Cualquier controversia derivada de estos términos será sometida a la jurisdicción de los tribunales competentes del territorio cubano. Si alguna disposición de estos términos fuera declarada inválida, las demás disposiciones continuarán en plena vigencia.`,
  },
]

export default function TermsModal({ open, onClose }: TermsModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="
                pointer-events-auto w-full max-w-xl max-h-[85vh] flex flex-col
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-white/10
                rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60
                overflow-hidden
              "
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                  <ScrollText size={18} className="text-orange-500 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    Términos de Uso
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Ferretería Online · Última actualización: enero 2025
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    text-gray-400 dark:text-gray-500
                    hover:text-gray-700 dark:hover:text-white
                    hover:bg-gray-100 dark:hover:bg-white/10
                    transition-all duration-150
                  "
                >
                  <X size={16} />
                </button>
              </div>

              {/* Intro */}
              <div className="px-6 py-4 bg-orange-50 dark:bg-orange-500/5 border-b border-orange-100 dark:border-orange-500/10 flex-shrink-0">
                <div className="flex items-start gap-2.5">
                  <Wrench size={15} className="text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                    Por favor, lee estos términos detenidamente antes de crear tu cuenta. Al registrarte en Ferretería Online, aceptas cumplir con las condiciones descritas a continuación.
                  </p>
                </div>
              </div>

              {/* Contenido scrolleable */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scroll-smooth"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(156 163 175 / 0.3) transparent' }}
              >
                {SECTIONS.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}

                {/* Padding final para que el último párrafo no quede pegado */}
                <div className="h-2" />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex-shrink-0 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  © 2025 Ferretería Online. Todos los derechos reservados.
                </p>
                <button
                  onClick={onClose}
                  className="
                    px-4 py-2 rounded-xl text-sm font-semibold
                    bg-orange-500 hover:bg-orange-400
                    text-white
                    transition-colors duration-150
                    shadow-md shadow-orange-500/20
                    flex-shrink-0
                  "
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}