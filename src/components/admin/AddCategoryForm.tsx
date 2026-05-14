'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const API = 'http://194.146.12.71:8008'

export function AddCategoryForm({ onCategoryAdded }: { onCategoryAdded?: () => void }) {
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
      onCategoryAdded?.()
      router.refresh()
    } catch {
      toast.error('Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-black">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2 ml-1">Category Name *</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Summer Collection"
          className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#96b1d8] focus:ring-1 focus:ring-[#96b1d8]/20 shadow-sm transition-all"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2 ml-1">Slug (auto-generated)</label>
        <input
          disabled
          value={name.toLowerCase().replace(/\s+/g, '-')}
          className="w-full border border-gray-50 rounded-2xl px-4 py-3 text-sm bg-gray-50 text-black/30 font-mono shadow-inner"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2 ml-1">Brand Illustration (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
          className="w-full text-[11px] text-black/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-black/5 file:text-black hover:file:bg-black/10 transition-all cursor-pointer"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3.5 rounded-[1.2rem] text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-black/20 hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50 mt-4"
      >
        {loading ? 'Processing…' : 'Finalize Category'}
      </button>
    </form>
  )
}