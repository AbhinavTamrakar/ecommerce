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
  id: number;
  value: string;
  color_code?: string | null;
}

export interface ProductAttribute {
  id: number;
  name: string;
  values: ProductAttributeValue[];
}

export interface VariantOption {
  id: number;
  product_attribute_id: number;
  value: string;
  color_code?: string | null;
  attribute_name: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: string;
  stock: number;
  options: VariantOption[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price: number | null;
  discount_percentage?: string | null;
  images: { id: number; url: string; is_primary?: boolean }[];
  thumbnail?: string;
  stock: number;
  status?: string;
  delivery_charge?: string;
  category: { id: number; name: string; slug: string };
  type?: any;
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  average_rating?: number;
  reviews_count?: number;
  in_stock: boolean;
}

export interface ProductsResponse {
  data: Product[];
}