import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, LogOut, Wrench, ChevronRight, Users, LayoutList } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Toaster } from 'sileo'

const links = [
  { to: '/admin',          label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/orders',   label: 'Pedidos',     icon: ShoppingBag,     end: false },
  { to: '/admin/products', label: 'Productos',   icon: Package,         end: false },
  { to: '/admin/categories', label: 'Categorías',  icon: LayoutList,    end: false },
  { to: '/admin/users',    label: 'Usuarios',    icon: Users,           end: false },
]

export default function AdminLayout() {
  const { signOut } = useAuth()
  const navigate    = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="text-white" size={18} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Ferretería</p>
              <p className="text-xs text-orange-500 font-medium">Panel Admin</p>
            </div>
          </div>
        </div>

        <Link
            to="/"
            className="mx-3 mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors border border-gray-100"
        >
            🏠 <span>Ir a la tienda</span>
        </Link>

        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon size={18} />
                {label}
              </div>
              <ChevronRight size={14} className="opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 ml-56 overflow-y-auto flex flex-col p-6">
        <Outlet />
      </main>
    </div>
  )
}