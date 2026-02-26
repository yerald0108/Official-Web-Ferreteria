import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Order, Product, Category } from '../types'

// ── Tipo para reseñas en el panel admin ──────────────────────────
export interface AdminReview {
  id: string
  product_id: string | null
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  is_visible: boolean
  product_name?: string | null
  profile_name?: string | null
}

interface ReviewStats {
  total: number
  average: number
  visible: number
  hidden: number
}

// src/hooks/useAdmin.ts — solo useAdminOrders cambia
export function useAdminOrders() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        profile:profiles!orders_user_id_fkey(full_name, phone, email),
        order_status_history(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      // Intentar sin el join de profiles si falla
      const { data: fallback } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
      setOrders(fallback ?? [])
    } else {
      setOrders(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    if (!error) fetchOrders()
    return error
  }

  return { orders, loading, updateStatus, refetch: fetchOrders }
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) fetchProducts()
    return error
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !current })
      .eq('id', id)
    if (!error) fetchProducts()
    return error
  }

  return { products, loading, deleteProduct, toggleActive, refetch: fetchProducts }
}

export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const createCategory = async (payload: { name: string; slug: string; description?: string }) => {
    const { error } = await supabase.from('categories').insert(payload)
    if (!error) fetchCategories()
    return error
  }

  const updateCategory = async (id: string, payload: { name: string; slug: string; description?: string }) => {
    const { error } = await supabase.from('categories').update(payload).eq('id', id)
    if (!error) fetchCategories()
    return error
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) fetchCategories()
    return error
  }

  return { categories, loading, createCategory, updateCategory, deleteCategory, refetch: fetchCategories }
}

// ── Hook para gestión de reseñas desde el panel admin ────────────
export function useAdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats]     = useState<ReviewStats>({ total: 0, average: 0, visible: 0, hidden: 0 })

  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        product:products(name),
        profile:profiles!reviews_user_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const mapped: AdminReview[] = data.map((r: any) => ({
        id:           r.id,
        product_id:   r.product_id,
        user_id:      r.user_id,
        rating:       r.rating,
        comment:      r.comment,
        created_at:   r.created_at,
        is_visible:   r.is_visible ?? true,
        product_name: r.product?.name ?? null,
        profile_name: r.profile?.full_name ?? null,
      }))

      setReviews(mapped)

      const total   = mapped.length
      const visible = mapped.filter(r => r.is_visible !== false).length
      const hidden  = mapped.filter(r => r.is_visible === false).length
      const average = total > 0
        ? mapped.reduce((s, r) => s + r.rating, 0) / total
        : 0

      setStats({ total, average, visible, hidden })
    }

    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [])

  // ── Eliminar una reseña ──────────────────────────────────────
  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (!error) fetchReviews()
    return error
  }

  // ── Cambiar visibilidad de una reseña ────────────────────────
  const toggleVisibility = async (id: string, currentlyVisible: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_visible: !currentlyVisible })
      .eq('id', id)
    if (!error) fetchReviews()
    return error
  }

  return { reviews, loading, stats, deleteReview, toggleVisibility, refetch: fetchReviews }
}