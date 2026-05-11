'use client'
import { Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

export function DeleteCategoryButton({ id }: { id: number }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this category?')) return
    try {
      const token = useAuthStore.getState().token
      const res = await fetch(`${BASE}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      if (!res.ok) throw new Error()
      toast.success('Category deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete category')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
    >
      <Trash2 size={15} />
    </button>
  )
}