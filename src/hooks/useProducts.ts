import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, Category } from '../types'

const PAGE_SIZE = 12

interface UseProductsOptions {
  categorySlug?: string
  search?: string
  page?: number
  sortBy?: 'created_at' | 'price_asc' | 'price_desc' | 'name'
}

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export function useProducts({
  categorySlug,
  search,
  page = 1,
  sortBy = 'created_at',
}: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [totalCount, setTotalCount] = useState(0)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')

    // Resolver categoría si hay filtro
    let categoryId: string | null = null
    if (categorySlug && categorySlug !== 'todos') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      categoryId = cat?.id ?? null
      if (!categoryId) {
        setProducts([])
        setTotalCount(0)
        setLoading(false)
        return
      }
    }

    // Ordenamiento
    let orderColumn = 'created_at'
    let ascending   = false
    if (sortBy === 'price_asc')  { orderColumn = 'price'; ascending = true  }
    if (sortBy === 'price_desc') { orderColumn = 'price'; ascending = false }
    if (sortBy === 'name')       { orderColumn = 'name';  ascending = true  }

    // Rango de paginación
    const from = (page - 1) * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    let query = supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('is_active', true)
      .order(orderColumn, { ascending })
      .range(from, to)

    if (categoryId) query = query.eq('category_id', categoryId)

    // Búsqueda full-text (nombre o descripción)
    if (search && search.trim().length > 0) {
      query = query.or(
        `name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
      )
    }

    const { data, error: err, count } = await query

    if (err) {
      setError(err.message)
    } else {
      setProducts(data ?? [])
      setTotalCount(count ?? 0)
    }

    setLoading(false)
  }, [categorySlug, search, page, sortBy])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return {
    products,
    loading,
    error,
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    hasMore: page * PAGE_SIZE < totalCount,
  }
}

// Hook para un solo producto
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!id) return
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .eq('is_active', true)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setProduct(data)
        setLoading(false)
      })
  }, [id])

  return { product, loading, error }
}

// Hook para productos relacionados
export function useRelatedProducts(categoryId: string | null, excludeId: string) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!categoryId) return
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', excludeId)
      .limit(4)
      .then(({ data }) => setProducts(data ?? []))
  }, [categoryId, excludeId])

  return { products }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)

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