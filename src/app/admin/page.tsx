import { cookies } from 'next/headers'
import { TrendingUp, ShoppingBag, Users, DollarSign, AlertTriangle } from 'lucide-react'

const BASE = process.env.API_URL?.replace('/api', '') || 'http://194.146.12.71:8008'

async function getDashboardStats(token: string) {
  try {
    const res = await fetch(`${BASE}/api/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data
  } catch { return null }
}

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value || ''
  const stats = await getDashboardStats(token)

  const kpis = stats?.kpis || {}
  const recentOrders = stats?.recent_orders || []
  const lowStock = stats?.low_stock || []

  const kpiCards = [
    { label: 'Total Revenue', value: `$${Number(kpis.total_revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-green-50 text-green-700' },
    { label: "Today's Revenue", value: `$${Number(kpis.today_revenue || 0).toFixed(2)}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Orders', value: kpis.total_orders || 0, icon: ShoppingBag, color: 'bg-orange-50 text-orange-700' },
    { label: 'New Customers', value: kpis.new_customers || 0, icon: Users, color: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* KPI Cards - 2 cols on small, 4 on large */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium leading-tight">{label}</p>
              <div className={`p-1.5 rounded-lg ${color} shrink-0`}>
                <Icon size={14} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders + Low Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-orange-500 hover:underline">View all</a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="px-4 py-8 text-sm text-gray-400 text-center">No orders yet</p>
            ) : recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">Order #{order.id}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">${Number(order.total_amount || 0).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={15} className="text-orange-500" />
              Low Stock
            </h2>
            <a href="/admin/products" className="text-xs text-orange-500 hover:underline">View all</a>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStock.length === 0 ? (
              <p className="px-4 py-8 text-sm text-gray-400 text-center">All products well stocked</p>
            ) : lowStock.slice(0, 5).map((product: any) => (
              <div key={product.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full shrink-0">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}