'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface Props {
  productId?: number
}

export default function ProductForm({ productId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!productId)
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '', slug: '', price: '', stock: '', description: '',
    short_description: '', discount_percentage: '0',
    status: 'active', category_id: '', delivery_charge: '0',
  })

  useEffect(() => {
    const token = useAuthStore.getState().token
    fetch(`${BASE}/api/public/categories`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    }).then(r => r.json()).then(d => setCategories(d.data || []))

    if (productId) {
      fetch(`${BASE}/api/public/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      }).then(r => r.json()).then(d => {
        const p = d.data
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          price: p.price || '',
          stock: p.stock || '',
          description: p.description || '',
          short_description: p.short_description || '',
          discount_percentage: p.discount_percentage || '0',
          status: p.status || 'active',
          category_id: p.category_id || '',
          delivery_charge: p.delivery_charge || '0',
        })
        setFetching(false)
      })
    }
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = useAuthStore.getState().token
      const url = productId ? `${BASE}/api/products/${productId}` : `${BASE}/api/products`
      const method = productId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(productId ? 'Product updated!' : 'Product created!')
      router.push('/admin/products')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-gray-400 text-sm">Loading...</div>

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
          <ChevronLeft size={15} /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {productId ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Name *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Slug</label>
              <input
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Price *</label>
              <input
                required type="number" step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Stock *</label>
              <input
                required type="number"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Discount %</label>
              <input
                type="number" step="0.01"
                value={form.discount_percentage}
                onChange={e => setForm({ ...form, discount_percentage: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="">Select category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Short Description</label>
            <input
              value={form.short_description}
              onChange={e => setForm({ ...form, short_description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Delivery Charge</label>
            <input
              type="number" step="0.01"
              value={form.delivery_charge}
              onChange={e => setForm({ ...form, delivery_charge: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f97316] transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}