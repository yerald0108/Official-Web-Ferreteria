import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, MapPin, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { sileo } from 'sileo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { InputField } from '../components/ui/InputField'
import { PROVINCES, getMunicipalities } from '../utils/cuba'

const profileSchema = z.object({
  full_name:    z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone:        z.string().min(8, 'Teléfono inválido').regex(/^\d+$/, 'Solo números'),
  province:     z.string().min(1, 'Selecciona una provincia'),
  municipality: z.string().min(1, 'Selecciona un municipio'),
  address:      z.string().min(10, 'Escribe una dirección más detallada'),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Escribe tu contraseña actual'),
  new_password:     z.string().min(6, 'Mínimo 6 caracteres'),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

type ProfileForm   = z.infer<typeof profileSchema>
type PasswordForm  = z.infer<typeof passwordSchema>

type Tab = 'info' | 'address' | 'password'

export default function ProfilePage() {
  const { profile, user } = useAuth()
  const [activeTab,      setActiveTab]      = useState<Tab>('info')
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrent,    setShowCurrent]    = useState(false)
  const [showNew,        setShowNew]        = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors }, reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: regPass, handleSubmit: handlePass,
    formState: { errors: passErrors }, reset: resetPass,
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const selectedProvince = watch('province')

  // Cargar datos del perfil
  useEffect(() => {
    if (profile) {
      reset({
        full_name:    profile.full_name,
        phone:        profile.phone,
        province:     profile.province,
        municipality: profile.municipality,
        address:      profile.address,
      })
    }
  }, [profile, reset])

  // Guardar info personal + dirección
  const onSaveProfile = handleSubmit(async (data) => {
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', profile?.id)

    setSavingProfile(false)
    if (error) sileo.error({ title: 'Error al guardar', description: error.message })
    else sileo.success({ title: 'Perfil actualizado correctamente' })
  })

  // Cambiar contraseña
  const onSavePassword = handlePass(async (data) => {
    setSavingPassword(true)

    // Verificar contraseña actual reautenticando
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email:    user?.email ?? '',
      password: data.current_password,
    })

    if (signInError) {
      sileo.error({ title: 'Contraseña actual incorrecta' })
      setSavingPassword(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: data.new_password })
    setSavingPassword(false)

    if (error) sileo.error({ title: 'Error al cambiar contraseña', description: error.message })
    else {
      sileo.success({ title: 'Contraseña actualizada correctamente' })
      resetPass()
    }
  })

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'info',     label: 'Información personal', icon: <User size={16} />     },
    { key: 'address',  label: 'Dirección',             icon: <MapPin size={16} />   },
    { key: 'password', label: 'Contraseña',            icon: <Lock size={16} />     },
  ]

  const roleLabel = profile?.role === 'admin'
    ? 'Administrador'
    : profile?.role === 'gestor'
    ? 'Gestor'
    : 'Cliente'

  const roleColor = profile?.role === 'admin'
    ? 'bg-orange-100 text-orange-600'
    : profile?.role === 'gestor'
    ? 'bg-blue-100 text-blue-600'
    : 'bg-gray-100 text-gray-500'

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header con avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm ${
          profile?.role === 'admin'  ? 'bg-orange-500' :
          profile?.role === 'gestor' ? 'bg-blue-500'   : 'bg-gray-400'
        }`}>
          {profile?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile?.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleColor}`}>
              {roleLabel}
            </span>
            <span className="text-xs text-gray-400">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-orange-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:block">{tab.label}</span>

              {/* Indicador activo */}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >

            {/* Tab: Información personal */}
            {activeTab === 'info' && (
              <form onSubmit={onSaveProfile} className="space-y-4">
                <InputField
                  label="Nombre completo"
                  placeholder="Tu nombre completo"
                  {...register('full_name')}
                  error={errors.full_name?.message}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400">
                    {user?.email}
                    <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">No editable</span>
                  </div>
                </div>
                <InputField
                  label="Teléfono"
                  type="tel"
                  placeholder="Ej: 52345678"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  <Save size={16} />
                  {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            )}

            {/* Tab: Dirección */}
            {activeTab === 'address' && (
              <form onSubmit={onSaveProfile} className="space-y-4">
                {/* Provincia */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Provincia</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    {...register('province')}
                    onChange={e => {
                      setValue('province', e.target.value)
                      setValue('municipality', '')
                    }}
                  >
                    <option value="">Selecciona una provincia</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.province && <p className="text-xs text-red-500">{errors.province.message}</p>}
                </div>

                {/* Municipio */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Municipio</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50"
                    disabled={!selectedProvince}
                    {...register('municipality')}
                  >
                    <option value="">Selecciona un municipio</option>
                    {getMunicipalities(selectedProvince).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {errors.municipality && <p className="text-xs text-red-500">{errors.municipality.message}</p>}
                </div>

                {/* Dirección exacta */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Dirección exacta</label>
                  <textarea
                    rows={3}
                    placeholder="Calle, número, entre calles, reparto..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    {...register('address')}
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  <Save size={16} />
                  {savingProfile ? 'Guardando...' : 'Guardar dirección'}
                </button>
              </form>
            )}

            {/* Tab: Contraseña */}
            {activeTab === 'password' && (
              <form onSubmit={onSavePassword} className="space-y-4">
                {/* Contraseña actual */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Contraseña actual</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="Tu contraseña actual"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      {...regPass('current_password')}
                    />
                    <button type="button" onClick={() => setShowCurrent(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {passErrors.current_password && <p className="text-xs text-red-500">{passErrors.current_password.message}</p>}
                </div>

                {/* Nueva contraseña */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      {...regPass('new_password')}
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {passErrors.new_password && <p className="text-xs text-red-500">{passErrors.new_password.message}</p>}
                </div>

                {/* Confirmar contraseña */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repite la nueva contraseña"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      {...regPass('confirm_password')}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {passErrors.confirm_password && <p className="text-xs text-red-500">{passErrors.confirm_password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  <Lock size={16} />
                  {savingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </form>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  )
}