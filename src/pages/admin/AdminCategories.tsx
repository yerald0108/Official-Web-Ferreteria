import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Tag, Hash, FileText, Layers } from 'lucide-react'
import { sileo } from 'sileo'
import { useAdminCategories } from '../../hooks/useAdmin'
import { InputField } from '../../components/ui/InputField'
import ConfirmModal from '../../components/ui/ConfirmModal'
import type { Category } from '../../types'

// ── Schema ────────────────────────────────────────────────────────
const schema = z.object({
  name:        z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug:        z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ── Helper: generar slug desde nombre ────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ── Skeleton ──────────────────────────────────────────────────────
function CategorySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────
export default function AdminCategories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useAdminCategories()

  const [showForm,      setShowForm]      = useState(false)
  const [editing,       setEditing]       = useState<Category | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<Category | null>(null)
  const [saving,        setSaving]        = useState(false)
  const [deleting,      setDeleting]      = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const nameValue = watch('name')

  // ── Abrir formulario de creación ──────────────────────────────
  const openCreate = () => {
    setEditing(null)
    reset({ name: '', slug: '', description: '' })
    setShowForm(true)
  }

  // ── Abrir formulario de edición ───────────────────────────────
  const openEdit = (cat: Category) => {
    setEditing(cat)
    reset({
      name:        cat.name,
      slug:        cat.slug,
      description: cat.description ?? '',
    })
    setShowForm(true)
  }

  // ── Cancelar formulario ───────────────────────────────────────
  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    reset()
  }

  // ── Guardar (crear o editar) ──────────────────────────────────
  const onSubmit = handleSubmit(async (data) => {
    setSaving(true)
    const payload = {
      name:        data.name.trim(),
      slug:        data.slug.trim(),
      description: data.description?.trim() || undefined,
    }

    const error = editing
      ? await updateCategory(editing.id, payload)
      : await createCategory(payload)

    setSaving(false)

    if (error) {
      const isDuplicate = error.message.includes('duplicate') || error.message.includes('unique')
      sileo.error({
        title:       'Error al guardar',
        description: isDuplicate
          ? 'Ya existe una categoría con ese nombre o slug.'
          : error.message,
      })
      return
    }

    sileo.success({
      title:       editing ? 'Categoría actualizada' : 'Categoría creada',
      description: payload.name,
    })
    handleCancel()
  })

  // ── Eliminar ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const error = await deleteCategory(deleteTarget.id)
    setDeleting(false)

    if (error) {
      sileo.error({
        title:       'No se puede eliminar',
        description: 'Esta categoría tiene productos asociados. Reasígnalos primero.',
      })
    } else {
      sileo.success({ title: 'Categoría eliminada', description: deleteTarget.name })
    }
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">

      {/* ── Modal de confirmación ── */}
      <ConfirmModal
        open={deleteTarget !== null}
        variant="danger"
        title="¿Eliminar categoría?"
        description={
          deleteTarget
            ? `Estás a punto de eliminar "${deleteTarget.name}". Si tiene productos asociados, la operación será rechazada.`
            : ''
        }
        confirmLabel={deleting ? 'Eliminando...' : 'Sí, eliminar'}
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-400 text-sm mt-1">
            {categories.length} categoría{categories.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-orange-200"
        >
          <Plus size={18} /> Nueva categoría
        </button>
      </div>

      {/* ── Formulario ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Barra superior de color */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Tag size={18} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">
                    {editing ? `Editar: ${editing.name}` : 'Nueva categoría'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editing ? 'Modifica los datos de la categoría' : 'Completa los datos para crear una nueva categoría'}
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Nombre */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <Tag size={13} className="text-gray-400" /> Nombre
                    </label>
                    <input
                      placeholder="Ej: Herramientas eléctricas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      {...register('name', {
                        onChange: (e) => {
                          // Autogenerar slug solo si no estamos editando
                          if (!editing) {
                            setValue('slug', toSlug(e.target.value), { shouldValidate: true })
                          }
                        },
                      })}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  {/* Slug */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <Hash size={13} className="text-gray-400" /> Slug
                      <span className="text-xs text-gray-400 font-normal">(URL interna)</span>
                    </label>
                    <input
                      placeholder="Ej: herramientas-electricas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-mono"
                      {...register('slug')}
                    />
                    {errors.slug
                      ? <p className="text-xs text-red-500">{errors.slug.message}</p>
                      : <p className="text-xs text-gray-400">Solo minúsculas, números y guiones</p>
                    }
                  </div>
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <FileText size={13} className="text-gray-400" /> Descripción
                    <span className="text-xs text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe brevemente esta categoría..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all"
                    {...register('description')}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : editing ? 'Guardar cambios' : 'Crear categoría'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lista de categorías ── */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white rounded-2xl border border-gray-100"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Layers size={28} strokeWidth={1.5} className="text-gray-300" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Sin categorías</p>
              <p className="text-sm text-gray-400 mt-1">Crea tu primera categoría para organizar el catálogo</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus size={16} /> Crear primera categoría
            </button>
          </motion.div>
        ) : (
          categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow group"
            >
              {/* Ícono */}
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                <Tag size={20} className="text-orange-500" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900">{cat.name}</p>
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                    /{cat.slug}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-sm text-gray-400 mt-0.5 truncate">{cat.description}</p>
                )}
              </div>

              {/* Fecha */}
              <p className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                {new Date(cat.created_at).toLocaleDateString('es-CU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>

              {/* Acciones */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Editar categoría"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar categoría"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}