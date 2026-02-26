import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  is_visible: boolean
  profile?: { full_name: string }
}

export interface ProductRating {
  average: number
  count: number
}

// Hook para obtener reviews de un producto (solo visibles en la tienda)
export function useProductReviews(productId: string) {
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)
  const [userReview, setUserReview] = useState<Review | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('*, profile:profiles!reviews_user_id_fkey(full_name)')
      .eq('product_id', productId)
      // Solo mostrar reseñas visibles en la tienda pública
      // (is_visible IS NULL = reseña antigua antes de la migración, se trata como visible)
      .or('is_visible.is.null,is_visible.eq.true')
      .order('created_at', { ascending: false })

    setReviews((data ?? []) as Review[])
    setLoading(false)
  }, [productId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  // Detectar review del usuario actual
  // La reseña propia del usuario siempre se muestra aunque esté oculta
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('reviews')
        .select('*, profile:profiles!reviews_user_id_fkey(full_name)')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          setUserReview(data as Review | null)
        })
    })
  }, [productId, reviews])

  const submitReview = async (rating: number, comment: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const payload = { product_id: productId, user_id: user.id, rating, comment }

    const { error } = userReview
      ? await supabase.from('reviews').update({ rating, comment }).eq('id', userReview.id)
      : await supabase.from('reviews').insert(payload)

    if (!error) await fetchReviews()
    return { error: error?.message ?? null }
  }

  const average = reviews.length
    ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length
    : 0

  return { reviews, loading, average, count: reviews.length, userReview, submitReview, refetch: fetchReviews }
}

// Hook liviano para obtener solo el promedio (solo reseñas visibles)
export function useProductRating(productId: string): ProductRating {
  const [rating, setRating] = useState<ProductRating>({ average: 0, count: 0 })

  useEffect(() => {
    supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .or('is_visible.is.null,is_visible.eq.true')
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const avg = data.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / data.length
        setRating({ average: avg, count: data.length })
      })
  }, [productId])

  return rating
}