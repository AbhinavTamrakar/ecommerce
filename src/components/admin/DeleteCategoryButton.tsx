'use client'
import { Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const API = 'http://194.146.12.71:8008'

export function DeleteCategoryButton({ id, onDeleted }: { id: number; onDeleted?: () => void }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this category?')) return
    try {
      const token = useAuthStore.getState().token ||
        JSON.parse(localStorage.getItem('auth') || '{}')?.state?.token

      const res = await fetch(`${API}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error()
      toast.success('Category removed')
      onDeleted?.()
      router.refresh()
    } catch {
      toast.error('Failed to delete category')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2.5 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
    >
      <Trash2 size={16} />
    </button>
  )
}