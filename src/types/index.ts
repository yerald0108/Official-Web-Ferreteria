export interface Profile {
  id: string
  full_name: string
  phone: string
  address: string
  province: string
  municipality: string
  role: 'customer' | 'admin' | 'gestor'
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'on_the_way' | 'delivered' | 'cancelled'
  delivery_address: string
  delivery_province: string
  delivery_municipality: string
  delivery_phone: string
  delivery_slot: string
  payment_method: 'cash_on_delivery' | 'bank_transfer' | 'other'
  total: number
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  profile?: {
    full_name: string
    phone: string
    email?: string
  }
  order_status_history?: OrderStatusHistory[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: string
  changed_by: string | null
  changed_at: string
  note: string | null
}