export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    primary_image: {
      url: string | null;
    };
  };
  variant: any | null;
  variant_options: any | null;
  quantity: number;
  price_at_purchase: string;
  review: {
    id: number;
    rating: number;
    comment: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  id: number;
  user_id: number;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  subtotal: string;
  shipping_fee: string;
  total_amount: string | null;
  status: string;
  payment_status: string | null;
  shipping_address_id: number | null;
  shipping_address: ShippingAddress | null;
  items: OrderItem[];
  tracking_url?: string | null;
  payment_method?: string | null;
  created_at: string;
  updated_at: string | null;
}