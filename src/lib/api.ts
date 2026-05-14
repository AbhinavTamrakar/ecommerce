// lib/api.ts
import { useAuthStore } from '@/store/authStore'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? useAuthStore.getState().token : null

  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  // Remove credentials: 'include' — incompatible with wildcard CORS on backend
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    throw { response: { data } }
  }

  return { data }
}

export const authApi = {
  login: (data: { email: string; password: string }) => {
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    return apiRequest('/api/login', {
      method: 'POST',
      body: formData,
    })
  },

  register: (data: any) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, val]: [string, any]) => {
      formData.append(key, val)
    })
    return apiRequest('/api/register', {
      method: 'POST',
      body: formData,
    })
  },

  logout: () => apiRequest('/api/logout', { method: 'POST' }),
  profile: () => apiRequest('/api/profile'),
  updateProfile: (data: any) =>
    apiRequest('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
}

export const cartApi = {
  index: () => apiRequest('/api/cart'),
  addItem: (productId: number, quantity: number) =>
    apiRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  updateItem: (id: number, quantity: number) =>
    apiRequest(`/api/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (id: number) => apiRequest(`/api/cart/${id}`, { method: 'DELETE' }),
  clear: () => apiRequest('/api/cart', { method: 'DELETE' }),
}

export const productApi = {
  getAll: () => apiRequest('/api/public/products'),
  getById: (id: number) => apiRequest(`/api/public/products/${id}`),
  getByCategory: (slug: string) =>
    apiRequest(`/api/public/categories/${slug}/products`),
  getBySlug: (slug: string) => apiRequest(`/api/public/products/slug/${slug}`),
}

export const orderApi = {
  list: () => apiRequest('/api/orders'),
  get: (id: number) => apiRequest(`/api/orders/${id}`),
  create: (data: any) => apiRequest('/api/checkout', { method: 'POST', body: JSON.stringify(data) }),
}

export const categoryApi = {
  list: () => apiRequest('/api/public/categories'),
}

export default apiRequest