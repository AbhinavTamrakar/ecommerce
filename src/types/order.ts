export interface OrderItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
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
  items: OrderItem[];
  created_at: string;
  updated_at: string | null;
}