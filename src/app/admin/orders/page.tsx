import { cookies } from 'next/headers'
import { UpdateOrderStatus } from '@/components/admin/UpdateOrderStatus'

const BASE = process.env.API_URL?.replace('/api', '') || 'http://194.146.12.71:8008'

async function getOrders(token: string) {
  try {
    const res = await fetch(`${BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || data || []
  } catch { return [] }
}

const statusColor: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function AdminOrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value || ''
  const orders = await getOrders(token)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} orders total</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Order</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Total</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Payment</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No orders yet</td>
              </tr>
            ) : orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                  <p className="text-xs text-gray-400">User #{order.user_id}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  ${Number(order.total_amount || order.subtotal || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {order.payment_status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}