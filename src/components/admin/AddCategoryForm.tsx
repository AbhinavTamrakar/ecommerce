'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const API = 'http://194.146.12.71:8008'

export function AddCategoryForm() {
  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = useAuthStore.getState().token ||
        JSON.parse(localStorage.getItem('auth') || '{}')?.state?.token

      const formData = new FormData()
      formData.append('name', name)
      if (image) formData.append('image', image)

      const res = await fetch(`${API}/api/categories`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        const msg = data?.message || 'Failed to add category'
        toast.error(msg)
        return
      }

      toast.success('Category added!')
      setName('')
      setImage(null)
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
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5">Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
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