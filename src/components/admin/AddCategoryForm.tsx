'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

export function AddCategoryForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = useAuthStore.getState().token
      const slug = name.toLowerCase().replace(/\s+/g, '-')
      const res = await fetch(`${BASE}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug }),
      })
      if (!res.ok) throw new Error()
      toast.success('Category added!')
      setName('')
      router.refresh()
    } catch {
      toast.error('Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Name *</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Summer Collection"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Slug (auto)</label>
        <input
          disabled
          value={name.toLowerCase().replace(/\s+/g, '-')}
          className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#f97316] transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Category'}
      </button>
    </form>
  )
}