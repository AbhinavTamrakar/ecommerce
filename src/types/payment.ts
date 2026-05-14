export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  providers: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method_id: number;
  transaction_id: string | null;
  amount: string;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  paid_at: string;
  gateway_response: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  payment_method: PaymentMethod;
}