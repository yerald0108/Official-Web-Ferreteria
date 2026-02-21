// src/hooks/useOrderNotifications.ts
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { sileo } from 'sileo'

const STATUS_MESSAGES: Record<string, { title: string; description: string; emoji: string }> = {
  confirmed:  { emoji: '✅', title: 'Pedido confirmado',  description: 'Tu pedido ha sido confirmado y está siendo preparado.'  },
  on_the_way: { emoji: '🚚', title: '¡Tu pedido va en camino!', description: 'El repartidor está en ruta hacia tu dirección.'  },
  delivered:  { emoji: '🎉', title: '¡Pedido entregado!', description: 'Tu pedido fue entregado. ¡Gracias por tu compra!'         },
  cancelled:  { emoji: '❌', title: 'Pedido cancelado',   description: 'Tu pedido fue cancelado. Contáctanos si tienes dudas.'   },
}

export function useOrderNotifications(userId: string | null | undefined) {
  // Guardamos los estados anteriores para comparar y evitar falsos positivos
  const prevStatuses = useRef<Record<string, string>>({})

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`orders:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status as string
          const orderId   = payload.new?.id   as string
          const prevStatus = prevStatuses.current[orderId]

          // Solo notificar si el estado realmente cambió
          if (!newStatus || newStatus === prevStatus) return

          prevStatuses.current[orderId] = newStatus

          const msg = STATUS_MESSAGES[newStatus]
          if (!msg) return

          sileo.info({
            title:       `${msg.emoji} ${msg.title}`,
            description: msg.description,
            duration:    6000,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
}