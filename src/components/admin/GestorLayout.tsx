import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Package, LogOut, Wrench, ChevronRight } from 'lucide-react'
import { Toaster } from 'sileo'
import { useAuth } from '../../hooks/useAuth'

export default function GestorLayout() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

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
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wrench className="text-white" size={18} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Ferretería</p>
              <p className="text-xs text-blue-500 font-medium">Panel Gestor</p>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="mx-3 mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors border border-gray-100"
        >
          🏠 <span>Ir a la tienda</span>
        </Link>

        <div className="px-3 py-4">
          <p className="text-xs text-gray-400 px-3 mb-2">Hola, {profile?.full_name.split(' ')[0]}</p>
          <NavLink
            to="/gestor/products"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Package size={18} />
              Productos
            </div>
            <ChevronRight size={14} className="opacity-40" />
          </NavLink>
        </div>

        <div className="mt-auto p-3 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-6">
        <Outlet />
      </main>
    </div>
  )
}