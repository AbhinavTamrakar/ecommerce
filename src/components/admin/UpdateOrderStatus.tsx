'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''
const statuses = ['pending', 'processing', 'delivered', 'cancelled']

export function UpdateOrderStatus({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const token = useAuthStore.getState().token
      const res = await fetch(`${BASE}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setStatus(newStatus)
      toast.success('Status updated')
      router.refresh()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={status}
      onChange={e => handleChange(e.target.value)}
      disabled={loading}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-400 capitalize disabled:opacity-50"
    >
      {statuses.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}