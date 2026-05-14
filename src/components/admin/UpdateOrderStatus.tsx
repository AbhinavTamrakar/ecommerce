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
        className="appearance-none text-[10px] font-bold uppercase tracking-wider border border-gray-100 rounded-lg px-3 py-1.5 pr-8 bg-white focus:outline-none focus:border-[#96b1d8] focus:ring-1 focus:ring-[#96b1d8]/20 disabled:opacity-50 cursor-pointer shadow-sm transition-all"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
    </div>
  )
}