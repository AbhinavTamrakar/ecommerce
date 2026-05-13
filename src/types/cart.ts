import type { ProductVariant, VariantOption } from './product'

export interface CartItem {
  id: number;
  product_id: number;
  product_variant_id: number | null;
  quantity: number;
  price: string;
  discount_percentage: string;
  stock_available: number;
  subtotal: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
    status: string;
    primary_image: string | null;
    delivery_charge: string;
  };
  variant: ProductVariant | null;
  variant_options: VariantOption[];
}

export interface Cart {
  id: number;
  user_id: number;
  user_name: string;
  items: CartItem[];
  items_count: number;
  total_quantity: number;
  total: number;
  created_at: string;
  updated_at: string;
}