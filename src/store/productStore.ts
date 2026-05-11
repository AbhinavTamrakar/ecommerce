import { create } from 'zustand'
import { Product } from '@/types'
import { productApi } from '@/lib/api'

interface ProductState {
  products: Product[]
  product: Product | null
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  fetchProduct: (id: number) => Promise<void>
  fetchByCategory: (slug: string) => Promise<void>
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  product: null,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await productApi.getAll()
      const products = res.data?.data || res.data
      set({ products })
    } catch {
      set({ error: 'Failed to load products.' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchProduct: async (id) => {
    set({ isLoading: true, error: null, product: null })
    try {
      const res = await productApi.getById(id)
      const product = res.data?.data || res.data
      set({ product })
    } catch {
      set({ error: 'Product not found.' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchByCategory: async (slug) => {
    set({ isLoading: true, error: null })
    try {
      const res = await productApi.getByCategory(slug)
      const products = res.data?.data || res.data
      set({ products })
    } catch {
      set({ error: 'Failed to load category products.' })
    } finally {
      set({ isLoading: false })
    }
  },
}))