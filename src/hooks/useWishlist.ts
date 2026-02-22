import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { WishlistItem } from '../types'

export function useWishlist(userId: string | null | undefined) {
  const [items,   setItems]   = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  // ── Cargar favoritos del usuario ──────────────────────────────
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('wishlists')
      .select('*, product:products(*, category:categories(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setItems(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  // ── Verificar si un producto está en favoritos ─────────────────
  const isWishlisted = useCallback(
    (productId: string) => items.some(i => i.product_id === productId),
    [items]
  )

  // ── Agregar a favoritos (optimista) ───────────────────────────
  const addToWishlist = useCallback(async (productId: string) => {
    if (!userId) return

    // Actualización optimista — UI responde inmediato
    const tempItem: WishlistItem = {
      id:         'temp-' + productId,
      user_id:    userId,
      product_id: productId,
      created_at: new Date().toISOString(),
    }
    setItems(prev => [tempItem, ...prev])

    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: userId, product_id: productId })

    // Si falla, revertir
    if (error) {
      setItems(prev => prev.filter(i => i.product_id !== productId))
    } else {
      // Refetch para tener el item completo con producto
      fetchWishlist()
    }
  }, [userId, fetchWishlist])

  // ── Eliminar de favoritos (optimista) ─────────────────────────
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!userId) return

    // Actualización optimista — UI responde inmediato
    setItems(prev => prev.filter(i => i.product_id !== productId))

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    // Si falla, revertir
    if (error) fetchWishlist()
  }, [userId, fetchWishlist])

  // ── Toggle: agrega si no está, elimina si ya está ─────────────
  const toggleWishlist = useCallback(async (productId: string) => {
    if (isWishlisted(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }, [isWishlisted, addToWishlist, removeFromWishlist])

  return {
    items,
    loading,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refetch: fetchWishlist,
  }
}