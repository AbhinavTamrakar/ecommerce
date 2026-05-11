import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number | string | null): string {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount))
}

export function getImageUrl(path: any): string {
  if (!path) return '/placeholder.png'
  // If it's an object (e.g. image object from API), try common fields
  if (typeof path === 'object') {
    path = path.url || path.path || path.image || path.src || ''
  }
  if (!path) return '/placeholder.png'
  // If already a full URL, return as-is
  if (path.startsWith('http')) return path
  // Otherwise prepend your API base URL
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "…";
}