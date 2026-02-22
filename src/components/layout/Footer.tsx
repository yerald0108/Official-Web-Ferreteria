import { Link } from 'react-router-dom'
import { Wrench, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SocialLink {
  Icon: LucideIcon
  href: string
}

interface ContactItem {
  Icon: LucideIcon
  text: string
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks: SocialLink[] = [
    { Icon: Facebook, href: '#' },
    { Icon: Instagram, href: '#' },
    { Icon: Twitter, href: '#' },
  ]

  const navLinks = [
    { label: 'Inicio', to: '/' },
    { label: 'Catalogo', to: '/catalog' },
    { label: 'Nosotros',    to: '/nosotros'  },
    { label: 'Contacto',    to: '/contacto'  },
    { label: 'Mi carrito', to: '/cart' },
    { label: 'Mis pedidos', to: '/orders' },
    { label: 'Mi perfil', to: '/profile' },
    { label: 'Mis favoritos', to: '/favoritos' },
  ]

  const categories = [
    { label: 'Herramientas', slug: 'herramientas' },
    { label: 'Electricidad', slug: 'electricidad' },
    { label: 'Plomeria', slug: 'plomeria' },
    { label: 'Pinturas', slug: 'pinturas' },
    { label: 'Construccion', slug: 'construccion' },
    { label: 'Fijaciones', slug: 'fijaciones' },
  ]

  const contactInfo: ContactItem[] = [
    { Icon: Phone, text: '+53 5 000 0000' },
    { Icon: Mail, text: 'info@ferreteria.cu' },
    { Icon: MapPin, text: 'Cuba - Envios nacionales' },
  ]

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <Wrench className="text-white" size={20} />
              </div>
              <span className="text-white font-bold text-lg">Ferreteria Online</span>
            </div>
            <p className="text-sm leading-relaxed">
              Tu ferreteria de confianza en Cuba. Herramientas, materiales y mas,
              entregados a domicilio en todo el pais.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="w-8 h-8 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors"
                >
                  <item.Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Navegacion */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
              Navegacion
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm hover:text-orange-400 transition-colors inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
              Categorias
            </h3>
            <ul className="space-y-2.5">
              {categories.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/catalog?category=${item.slug}`}
                    className="text-sm hover:text-orange-400 transition-colors inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
              Contacto
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((item) => (
                <li key={item.text} className="flex items-start gap-2.5 text-sm">
                  <div className="w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.Icon size={13} className="text-orange-400" />
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-white font-medium mb-1.5">Horario de atencion</p>
              <p className="text-xs">Lun - Sab: 8:00am - 6:00pm</p>
              <p className="text-xs mt-0.5">Dom: 9:00am - 1:00pm</p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>
            {currentYear} Ferreteria Online. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-orange-400 cursor-pointer transition-colors">
              Terminos y condiciones
            </span>
            <span className="hover:text-orange-400 cursor-pointer transition-colors">
              Politica de privacidad
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}