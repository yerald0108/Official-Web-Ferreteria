import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Wrench, LogOut, LayoutDashboard,
  ShoppingBag, Settings, ChevronDown, Shield, BriefcaseBusiness, Heart
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCartStore } from '../../store/cartStore'
import { useThemeStore } from '../../store/themeStore'
import { Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut, isAdmin, isGestor } = useAuth()
  const { getTotalItems } = useCartStore()
  const navigate          = useNavigate()
  const totalItems        = getTotalItems()
  const [open, setOpen]   = useState(false)
  const menuRef           = useRef<HTMLDivElement>(null)
  const { isDark, toggle } = useThemeStore()

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/login')
  }

  // Inicial del nombre para el avatar
  const initial = profile?.full_name?.charAt(0).toUpperCase() ?? '?'

  // Color del avatar según rol
  const avatarColor = isAdmin
    ? 'bg-orange-500'
    : isGestor
    ? 'bg-blue-500'
    : 'bg-gray-400'

  // Items del menú según rol
  const menuItems = [
    // Admin
    ...(isAdmin ? [
      { icon: LayoutDashboard, label: 'Panel de administración', to: '/admin',   color: 'text-orange-500' },
      
    ] : []),

    // Gestor
    ...(isGestor ? [
      { icon: BriefcaseBusiness, label: 'Gestionar productos', to: '/gestor/products', color: 'text-blue-500' },
    ] : []),

    // Cliente y todos
    ...(!isAdmin && !isGestor ? [
      
    ] : []),
    { icon: ShoppingBag, label: 'Mis pedidos',    to: '/orders',  color: 'text-gray-500' },
    { icon: Heart,    label: 'Mis favoritos',   to: '/favoritos', color: 'text-red-400'  },
    { icon: Settings,          label: 'Editar perfil',           to: '/profile'},
  ]

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Wrench className="text-white" size={18} />
          </div>
          <span className="font-bold text-gray-900 hidden sm:block">Ferretería Online</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-orange-500 transition-colors">Inicio</Link>
          <Link to="/catalog" className="hover:text-orange-500 transition-colors">Catálogo</Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Carrito */}
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-orange-50 transition-colors">
                <ShoppingCart size={22} className="text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Dropdown de usuario */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen(v => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${avatarColor}`}>
                    {isAdmin  ? <Shield size={15} /> :
                     isGestor ? <BriefcaseBusiness size={15} /> :
                     initial}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {profile?.full_name.split(' ')[0]}
                  </span>
                  <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={15} className="text-gray-400" />
                  </motion.div>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{  opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                      {/* Cabecera del menú */}
                      <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {profile?.full_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${avatarColor}`} />
                          <p className="text-xs text-gray-400 capitalize">
                            {isAdmin ? 'Administrador' : isGestor ? 'Gestor' : 'Cliente'}
                          </p>
                        </div>
                      </div>

                      {/* Links del menú */}
                      <div className="p-1.5 space-y-0.5">
                        {menuItems.map(({ icon: Icon, label, to, color }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors group"
                          >
                            <Icon size={16} className={`${color} group-hover:scale-110 transition-transform`} />
                            {label}
                          </Link>
                        ))}
                      </div>

                      {/* Separador de tema */}
                      <div className="p-1.5 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={toggle}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              isDark ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-amber-100'
                            }`}>
                              {isDark
                                ? <Moon size={14} className="text-indigo-500" />
                                : <Sun  size={14} className="text-amber-500" />
                              }
                            </div>
                            <span>{isDark ? 'Modo oscuro' : 'Modo claro'}</span>
                          </div>

                          {/* Toggle pill animado */}
                          <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                            isDark ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                            isDark ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </button>
                    </div>

                      {/* Cerrar sesión */}
                      <div className="p-1.5 border-t border-gray-50">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors group"
                        >
                          <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                          Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}