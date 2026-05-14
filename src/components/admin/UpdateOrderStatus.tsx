'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { ChevronDown } from 'lucide-react'

const API = 'http://194.146.12.71:8008'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

interface Props {
  orderId: number
  currentStatus: string
  currentPaymentStatus?: string
  onUpdated?: () => void
}

export function UpdateOrderStatus({ orderId, currentStatus, currentPaymentStatus, onUpdated }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return
    setLoading(true)
    try {
      const token = useAuthStore.getState().token ||
        JSON.parse(localStorage.getItem('auth') || '{}')?.state?.token

      // Auto-set payment_status to 'paid' when delivered
      const payment_status = newStatus === 'delivered' ? 'paid'
        : newStatus === 'cancelled' || newStatus === 'refunded' ? 'refunded'
        : currentPaymentStatus || 'pending'

      const res = await fetch(`${API}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, payment_status }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.message || 'Failed')
      }

      setStatus(newStatus)
      toast.success(`Order #${orderId} → ${newStatus}`)
      onUpdated?.()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to update order status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        disabled={loading}
        className="appearance-none text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 pr-7 bg-white focus:outline-none focus:border-gray-400 disabled:opacity-50 cursor-pointer"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}