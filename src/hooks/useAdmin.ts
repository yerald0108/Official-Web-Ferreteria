import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Order, Product, Category } from '../types'

// src/hooks/useAdmin.ts — solo useAdminOrders cambia
export function useAdminOrders() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        profile:profiles(full_name, phone)
      `)
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
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

  useEffect(() => {
    supabase.from('categories').select('*').order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  return { categories }
}