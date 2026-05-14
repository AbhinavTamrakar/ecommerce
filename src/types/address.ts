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