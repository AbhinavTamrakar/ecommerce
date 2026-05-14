'use client'
import { Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

export function DeleteUserButton({ id }: { id: number }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try {
      const token = useAuthStore.getState().token
      const res = await fetch(`${BASE}/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      if (!res.ok) throw new Error()
      toast.success('User deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2.5 rounded-xl text-black/40 hover:text-red-500 hover:bg-red-50 transition-all"
    >
      <Trash2 size={16} />
    </button>
  )
}