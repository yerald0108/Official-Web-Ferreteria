import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { sileo } from 'sileo'
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload } from 'lucide-react'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { supabase } from '../../lib/supabase'
import { useAdminProducts, useAdminCategories } from '../../hooks/useAdmin'
import { InputField } from '../../components/ui/InputField'
import type { Product } from '../../types'

const schema = z.object({
  name:        z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  price:       z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
  stock:       z.coerce.number().min(0, 'Stock no puede ser negativo').int(),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  is_active:   z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

export default function AdminProducts() {
  const { products, loading, deleteProduct, toggleActive, refetch } = useAdminProducts()
  const { categories } = useAdminCategories()

  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', description: '', price: 0, stock: 0, category_id: '', is_active: true })
    setImageFile(null)
    setShowForm(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    reset({
      name:        product.name,
      description: product.description ?? '',
      price:       product.price,
      stock:       product.stock,
      category_id: product.category_id ?? '',
      is_active:   product.is_active,
    })
    setImageFile(null)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const error = await deleteProduct(deleteTarget.id)
    setDeleting(false)
    if (error) {
      sileo.error({ title: 'Error al eliminar', description: error.message })
    } else {
      sileo.success({ title: 'Producto eliminado', description: deleteTarget.name })
    }
    setDeleteTarget(null)
  }

  const handleToggle = async (product: Product) => {
    const error = await toggleActive(product.id, product.is_active)
    if (error) sileo.error({ title: 'Error al actualizar' })
    else sileo.success({
      title: product.is_active ? 'Producto desactivado' : 'Producto activado',
      description: product.name,
    })
  }

  const onSubmit = async (data: FormData) => {
    setUploading(true)
    let image_url = editing?.image_url ?? null

    // Subir imagen si hay una nueva
    if (imageFile) {
      const ext      = imageFile.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filename, imageFile, { upsert: true })

      if (uploadError) {
        sileo.error({ title: 'Error al subir imagen', description: uploadError.message })
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('products').getPublicUrl(filename)
      image_url = urlData.publicUrl
    }

    const payload = { ...data, image_url }

    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
      if (error) sileo.error({ title: 'Error al actualizar', description: error.message })
      else { sileo.success({ title: 'Producto actualizado', description: data.name }); refetch() }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) sileo.error({ title: 'Error al crear', description: error.message })
      else { sileo.success({ title: 'Producto creado', description: data.name }); refetch() }
    }

    setUploading(false)
    setShowForm(false)
    reset()
  }

  return (
    <div className="space-y-5">
      <ConfirmModal
        open={deleteTarget !== null}
        variant="danger"
        title="¿Eliminar producto?"
        description={
          deleteTarget
            ? `Estás a punto de eliminar "${deleteTarget.name}". Esta acción es permanente y no se puede deshacer.`
            : ''
          }
        confirmLabel={deleting ? 'Eliminando...' : 'Sí, eliminar'}
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} productos en total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">
            {editing ? `Editar: ${editing.name}` : 'Nuevo producto'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Nombre"
                placeholder="Ej: Martillo 16oz"
                {...register('name')}
                error={errors.name?.message}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Categoría</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  {...register('category_id')}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
              </div>
              <InputField
                label="Precio ($)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('price')}
                error={errors.price?.message}
              />
              <InputField
                label="Stock"
                type="number"
                placeholder="0"
                {...register('stock')}
                error={errors.stock?.message}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                rows={2}
                placeholder="Describe el producto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                {...register('description')}
              />
            </div>

            {/* Imagen */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Imagen</label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-orange-400 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {imageFile ? imageFile.name : 'Haz clic para seleccionar imagen'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {editing?.image_url && !imageFile && (
                <img src={editing.image_url} alt="actual" className="h-16 w-16 object-cover rounded-lg mt-1" />
              )}
            </div>

            {/* Activo */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" {...register('is_active')} />
              <span className="text-sm font-medium text-gray-700">Producto activo (visible en tienda)</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {uploading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de productos */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gray-100" />
                        }
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{product.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleToggle(product)}
                        className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-500 transition-colors"
                        title={product.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {product.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}