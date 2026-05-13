'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { UpdateOrderStatus } from '@/components/admin/UpdateOrderStatus'
import { Package } from 'lucide-react'

const API = 'http://194.146.12.71:8008'

const statusColor: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = useAuthStore.getState().token ||
        JSON.parse(localStorage.getItem('auth') || '{}')?.state?.token
      const res = await fetch(`${API}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setOrders(data.data || data || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 py-10">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? 'Loading...' : `${orders.length} orders total`}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Order</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Total</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Payment</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <Package className="mx-auto mb-3 text-gray-300" size={32} />
                  <p className="text-gray-400 text-sm">No orders yet</p>
                </td>
              </tr>
            ) : orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-700">{order.user?.name || `User #${order.user_id}`}</p>
                  <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  ${Number(order.total_amount || order.subtotal || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.payment_status === 'refunded' ? 'bg-gray-100 text-gray-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.payment_status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status || '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <UpdateOrderStatus
                    orderId={order.id}
                    currentStatus={order.status}
                    currentPaymentStatus={order.payment_status}
                    onUpdated={fetchOrders}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}