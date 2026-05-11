export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
}

export interface ProductAttributeValue {
  id: number
  value: string
  color_code?: string | null
}

export interface ProductAttribute {
  id: number
  name: string
  values: ProductAttributeValue[]
}

export interface VariantOption {
  id: number
  product_attribute_id: number
  value: string
  color_code?: string | null
  attribute_name: string
}

export interface ProductVariant {
  id: number
  sku: string
  price: string
  stock: number
  options: VariantOption[]
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description?: string
  price: number
  sale_price: number | null
  discount_percentage?: string | null
  images: { id: number; url: string; is_primary?: boolean }[]
  thumbnail?: string
  stock: number
  status?: string
  delivery_charge?: string
  category: { id: number; name: string; slug: string }
  type?: any
  variants?: ProductVariant[]
  attributes?: ProductAttribute[]
  average_rating?: number
  reviews_count?: number
  in_stock: boolean
}

export interface ProductsResponse {
  data: Product[]
}

export interface CartItem {
  id: number
  quantity: number
  price: number
  product: {
    id: number
    name: string
    price: number
    thumbnail?: string
    image?: string
    images?: { url: string }[]
    category?: {
      id: number
      name: string
      slug: string
    }
  }
}

export interface Cart {
  id: number
  items: CartItem[]
  total?: number
}

export interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  button_text?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  is_default?: boolean;
}

export interface Order {
  id: number
  user_id: number
  subtotal: string
  shipping_fee: string
  total_amount: string | null
  status: string
  payment_status: string | null
  shipping_address_id: number | null
  items: OrderItem[]
  created_at: string
  updated_at: string | null
}

export interface OrderItem {
  id: number
  product_id: number
  product: {
    id: number
    name: string
    price: number
    images: string[]
  }
  quantity: number
  price: number
}