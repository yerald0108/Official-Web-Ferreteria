// src/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { sileo } from 'sileo'
import type { Profile } from '../types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isGestor: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isGestor: false,
  signOut: async () => {},
})

const STATUS_MESSAGES: Record<string, { title: string; description: string }> = {
  confirmed:  { title: '✅ Pedido confirmado',       description: 'Tu pedido ha sido confirmado y está siendo preparado.'  },
  on_the_way: { title: '🚚 ¡Tu pedido va en camino!', description: 'El repartidor está en ruta hacia tu dirección.'        },
  delivered:  { title: '🎉 ¡Pedido entregado!',       description: 'Tu pedido fue entregado. ¡Gracias por tu compra!'      },
  cancelled:  { title: '❌ Pedido cancelado',          description: 'Tu pedido fue cancelado. Contáctanos si tienes dudas.' },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  // ── Suscripción Realtime a pedidos del usuario ──────────────────
  useEffect(() => {
    if (!user || profile?.role === 'admin' || profile?.role === 'gestor') return

    const prevStatuses: Record<string, string> = {}

    const channel = supabase
      .channel(`orders:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus  = payload.new?.status as string
          const orderId    = payload.new?.id     as string
          const prevStatus = prevStatuses[orderId]

          if (!newStatus || newStatus === prevStatus) return
          prevStatuses[orderId] = newStatus

          const msg = STATUS_MESSAGES[newStatus]
          if (!msg) return

          sileo.info({ title: msg.title, description: msg.description, duration: 6000 })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, profile?.role])

  // ── Auth state ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false))
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin:  profile?.role === 'admin',
      isGestor: profile?.role === 'gestor',
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)