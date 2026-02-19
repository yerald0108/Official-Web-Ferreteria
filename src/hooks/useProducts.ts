import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, Category } from '../types'

export function useProducts(categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetch() {
      setLoading(true)

      // Si hay filtro de categoría, primero obtenemos su ID
      let categoryId: string | null = null
      if (categorySlug && categorySlug !== 'todos') {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single()
        categoryId = cat?.id ?? null
      }

      let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query
      if (error) setError(error.message)
      else setProducts(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [categorySlug])

  return { products, loading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setCategories(data ?? [])
        setLoading(false)
      })
  }, [])

  return { categories, loading }
}