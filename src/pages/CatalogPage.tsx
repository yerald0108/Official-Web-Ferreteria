import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, Package } from 'lucide-react'
import { useProducts, useCategories } from '../hooks/useProducts'
import ProductCard from '../components/products/ProductCard'
import Pagination from '../components/ui/Pagination'

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Más recientes'    },
  { value: 'price_asc',  label: 'Menor precio'     },
  { value: 'price_desc', label: 'Mayor precio'     },
  { value: 'name',       label: 'Nombre A-Z'       },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']

// Skeleton card
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-gray-100 rounded-lg w-20" />
          <div className="h-9 bg-gray-100 rounded-xl w-28" />
        </div>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Estado derivado de URL params (para que sea compartible/navegable)
  const [search,   setSearch]   = useState(searchParams.get('q')        ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? 'todos')
  const [sortBy,   setSortBy]   = useState<SortValue>((searchParams.get('sort') as SortValue) ?? 'created_at')
  const [page,     setPage]     = useState(Number(searchParams.get('page')) || 1)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [showFilters, setShowFilters] = useState(false)

  const { categories } = useCategories()

  // Debounce de búsqueda (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // resetear página al buscar
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Sincronizar URL
  useEffect(() => {
    const params: Record<string, string> = {}
    if (debouncedSearch) params.q        = debouncedSearch
    if (category !== 'todos') params.category = category
    if (sortBy !== 'created_at') params.sort = sortBy
    if (page > 1) params.page            = String(page)
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, category, sortBy, page, setSearchParams])

  // Reset página al cambiar filtros
  const handleCategory = useCallback((slug: string) => {
    setCategory(slug)
    setPage(1)
  }, [])

  const handleSort = useCallback((val: SortValue) => {
    setSortBy(val)
    setPage(1)
  }, [])

  const clearFilters = () => {
    setSearch('')
    setCategory('todos')
    setSortBy('created_at')
    setPage(1)
  }

  const hasActiveFilters = search || category !== 'todos' || sortBy !== 'created_at'

  const { products, loading, totalCount, totalPages } = useProducts({
    categorySlug: category,
    search: debouncedSearch,
    page,
    sortBy,
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catálogo</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? 'Buscando...' : `${totalCount} producto${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Botón filtros móvil */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Barra de búsqueda + ordenamiento */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos, marcas, referencias..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Ordenar — solo desktop */}
        <select
          value={sortBy}
          onChange={e => handleSort(e.target.value as SortValue)}
          className="hidden md:block px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer min-w-[160px]"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Filtros móvil expandible */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="pb-3 space-y-3">
              <select
                value={sortBy}
                onChange={e => handleSort(e.target.value as SortValue)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros por categoría */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        <button
          onClick={() => handleCategory('todos')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            category === 'todos'
              ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-300'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategory(cat.slug)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === cat.slug
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Badge de filtros activos */}
      <AnimatePresence>
        {hasActiveFilters && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-gray-400">Filtros activos:</span>
            <div className="flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
                  "{search}"
                  <button onClick={() => setSearch('')}><X size={12} /></button>
                </span>
              )}
              {category !== 'todos' && (
                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
                  {categories.find(c => c.slug === category)?.name}
                  <button onClick={() => handleCategory('todos')}><X size={12} /></button>
                </span>
              )}
              {sortBy !== 'created_at' && (
                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  <button onClick={() => handleSort('created_at')}><X size={12} /></button>
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors ml-auto"
            >
              Limpiar todo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de productos */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center gap-4"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Package size={36} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sin resultados</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              No encontramos productos con esos filtros. Intenta con otra búsqueda o categoría.
            </p>
            <button
              onClick={clearFilters}
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Ver todos los productos
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`products-${page}-${category}-${debouncedSearch}-${sortBy}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
          <p className="text-center text-xs text-gray-400 mt-3">
            Página {page} de {totalPages} · {totalCount} productos en total
          </p>
        </div>
      )}
    </div>
  )
}