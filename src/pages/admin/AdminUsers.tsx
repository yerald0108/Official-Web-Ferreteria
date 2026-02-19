import { useEffect, useState } from 'react'
import { Users, Search, MapPin, Phone, Calendar, Shield, User, BriefcaseBusiness } from 'lucide-react'
import { sileo } from 'sileo'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types'

export default function AdminUsers() {
  const [users,    setUsers]    = useState<Profile[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<Profile | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchUsers = () => {
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUsers(data ?? [])
        setLoading(false)
      })
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.province.toLowerCase().includes(search.toLowerCase()) ||
    u.municipality.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  )

  const customers = users.filter(u => u.role === 'customer').length
  const admins    = users.filter(u => u.role === 'admin').length
  const gestores  = users.filter(u => u.role === 'gestor').length

  const handleRoleToggle = async (user: Profile) => {
    if (user.role === 'admin') return // no tocar otros admins

    const newRole = user.role === 'gestor' ? 'customer' : 'gestor'
    setUpdating(true)

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)

    setUpdating(false)

    if (error) {
      sileo.error({ title: 'Error al actualizar rol', description: error.message })
      return
    }

    sileo.success({
      title: newRole === 'gestor' ? '✅ Gestor activado' : '🔄 Gestor desactivado',
      description: `${user.full_name} ${newRole === 'gestor' ? 'ahora puede gestionar productos' : 'volvió a ser cliente'}`,
    })

    // Actualizar estado local
    const updated = { ...user, role: newRole as Profile['role'] }
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u))
    setSelected(updated)
  }

  const getRoleStyle = (role: Profile['role']) => {
    if (role === 'admin')   return { bg: 'bg-orange-500',  icon: <Shield size={18} />,            label: 'Administrador', badge: 'bg-orange-100 text-orange-600' }
    if (role === 'gestor')  return { bg: 'bg-blue-500',    icon: <BriefcaseBusiness size={18} />, label: 'Gestor',        badge: 'bg-blue-100 text-blue-600'     }
    return                         { bg: 'bg-gray-300',    icon: null,                            label: 'Cliente',       badge: 'bg-gray-100 text-gray-500'     }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Clientes', value: customers, color: 'text-gray-900'   },
            { label: 'Gestores', value: gestores,  color: 'text-blue-500'   },
            { label: 'Admins',   value: admins,    color: 'text-orange-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, provincia, municipio o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        />
      </div>

      <div className="flex gap-4">

        {/* Lista */}
        <div className="flex-1 space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={40} strokeWidth={1} className="mx-auto mb-2" />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            filtered.map(user => {
              const roleStyle = getRoleStyle(user.role)
              return (
                <button
                  key={user.id}
                  onClick={() => setSelected(user)}
                  className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${
                    selected?.id === user.id
                      ? 'border-orange-400 ring-1 ring-orange-400'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${roleStyle.bg}`}>
                      {roleStyle.icon ?? (
                        <span className="text-gray-500 text-base">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user.full_name}</p>
                        {user.role !== 'customer' && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${roleStyle.badge}`}>
                            {roleStyle.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        📍 {user.municipality}, {user.province}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(user.created_at).toLocaleDateString('es-CU', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Panel de detalle */}
        {selected && (() => {
          const roleStyle = getRoleStyle(selected.role)
          const isGestor  = selected.role === 'gestor'
          const isAdmin   = selected.role === 'admin'

          return (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6 space-y-5 shadow-sm">

                {/* Cabecera */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${roleStyle.bg}`}>
                      {roleStyle.icon ?? (
                        <span className="text-xl">{selected.full_name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{selected.full_name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleStyle.badge}`}>
                        {roleStyle.label}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                </div>

                {/* Botón Convertir en gestor */}
                {!isAdmin && (
                  <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
                    isGestor ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={16} className={isGestor ? 'text-blue-500' : 'text-gray-400'} />
                        <p className={`text-sm font-semibold ${isGestor ? 'text-blue-700' : 'text-gray-600'}`}>
                          Gestor de productos
                        </p>
                      </div>

                      {/* Toggle switch animado */}
                      <button
                        onClick={() => handleRoleToggle(selected)}
                        disabled={updating}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${
                          isGestor ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                          isGestor ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <p className={`text-xs leading-relaxed ${isGestor ? 'text-blue-600' : 'text-gray-400'}`}>
                      {isGestor
                        ? '✅ Este usuario tiene acceso al panel de gestión de productos.'
                        : 'Activa para que este usuario pueda gestionar el catálogo de productos.'}
                    </p>
                  </div>
                )}

                {/* Contacto */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contacto</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone size={13} className="text-blue-500" />
                      </div>
                      <span>{selected.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Dirección</p>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-orange-400 flex-shrink-0" />
                      <span className="font-medium">{selected.province}</span>
                    </div>
                    <p className="pl-5 text-gray-500">{selected.municipality}</p>
                    <p className="pl-5 text-gray-500">{selected.address}</p>
                  </div>
                </div>

                {/* Cuenta */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cuenta</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar size={13} className="text-green-500" />
                      </div>
                      <span>Registrado el {new Date(selected.created_at).toLocaleDateString('es-CU', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-orange-500" />
                      </div>
                      <span className="font-mono text-xs text-gray-400 break-all">{selected.id}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}