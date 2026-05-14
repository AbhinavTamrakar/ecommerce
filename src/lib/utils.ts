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
  let urlPath = path
  if (typeof urlPath === 'object') {
    urlPath = urlPath.url || urlPath.path || urlPath.image || urlPath.src || ''
  }
  if (typeof urlPath !== 'string' || !urlPath) return '/placeholder.png'
  if (urlPath.startsWith('http')) return urlPath
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'
  return `${base}/storage/${urlPath}`
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "…";
}