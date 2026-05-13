'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp, ShoppingBag, Users, DollarSign,
  AlertTriangle, Package, Star, Clock, XCircle, CheckCircle
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useAuthStore } from '@/store/authStore'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

async function fetchWithToken(endpoint: string, token: string) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`${endpoint} failed`)
  const json = await res.json()
  return json.data ?? json
}

function last7DayLabels() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
}

function last7DayKeys() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

const STATUS_COLORS: Record<string, string> = {
  delivered: '#3d9e63',
  pending: '#e07c3a',
  cancelled: '#d94f4f',
  processing: '#3a7fd9',
}

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token) ?? ''

  const [stats, setStats] = useState<any>(null)
  const [extraStats, setExtraStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([
      fetchWithToken('/api/admin/dashboard/stats', token).catch(() => null),
      fetchWithToken('/api/admin/orders', token).catch(() => null),
      fetchWithToken('/api/products', token).catch(() => null),
      fetchWithToken('/api/admin/customers', token).catch(() => null),
      fetchWithToken('/api/admin/reviews', token).catch(() => null),
    ]).then(([dashStats, orders, products, customers, reviews]) => {
      setStats(dashStats)

      const orderArr: any[] = Array.isArray(orders)
        ? orders
        : orders?.data?.data ?? orders?.data ?? orders?.orders ?? []

      const productArr: any[] = Array.isArray(products)
        ? products
        : products?.data?.data ?? products?.data ?? products?.products ?? []

      const customerArr: any[] = Array.isArray(customers)
        ? customers
        : customers?.data?.data ?? customers?.data ?? customers?.customers ?? []

      const reviewArr: any[] = Array.isArray(reviews)
        ? reviews
        : reviews?.data?.data ?? reviews?.data ?? reviews?.reviews ?? []

      // Status counts
      const statusCounts: Record<string, number> = {}
      orderArr.forEach((o) => {
        const s = (o.status || 'unknown').toLowerCase()
        statusCounts[s] = (statusCounts[s] || 0) + 1
      })

      // Revenue last 7 days
      const keys = last7DayKeys()
      const revenueByDay = keys.map((day) =>
        orderArr
          .filter(
            (o) =>
              (o.created_at || '').slice(0, 10) === day &&
              o.status?.toLowerCase() === 'delivered'
          )
          .reduce((sum, o) => sum + parseFloat(o.total_amount || o.total || 0), 0)
      )

      // Top 5 products by order count
      const productCounts: Record<string, number> = {}
      orderArr.forEach((o) => {
        const items: any[] = o.items ?? o.order_items ?? []
        items.forEach((item) => {
          const name =
            item.product?.name ?? item.name ?? `Product ${item.product_id}`
          productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1)
        })
      })
      const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, count }))

      setExtraStats({
        statusCounts,
        revenueByDay,
        topProducts,
        totalProducts: productArr.length,
        totalCustomers: customerArr.length,
        totalReviews: reviewArr.length,
        totalOrders: orderArr.length,
        lowStock: productArr
          .filter((p: any) => (p.stock ?? 0) <= 5)
          .sort((a: any, b: any) => (a.stock ?? 0) - (b.stock ?? 0))
      })

      setLoading(false)
    })
  }, [token])

  const kpis = stats?.kpis || {}
  const recentOrders = stats?.recent_orders || []
  const lowStock = extraStats?.lowStock || stats?.low_stock || []

  const kpiCards = [
    { label: 'Total Revenue', value: `$${Number(kpis.total_revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-green-50 text-green-700' },
    { label: "Today's Revenue", value: `$${Number(kpis.today_revenue || 0).toFixed(2)}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Orders', value: extraStats?.totalOrders ?? kpis.total_orders ?? 0, icon: ShoppingBag, color: 'bg-orange-50 text-orange-700' },
    { label: 'New Customers', value: kpis.new_customers || 0, icon: Users, color: 'bg-purple-50 text-purple-700' },
  ]

  const extraCards = [
    { label: 'Pending', value: extraStats?.statusCounts?.pending ?? '—', icon: Clock, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Delivered', value: extraStats?.statusCounts?.delivered ?? '—', icon: CheckCircle, color: 'bg-green-50 text-green-700' },
    { label: 'Cancelled', value: extraStats?.statusCounts?.cancelled ?? '—', icon: XCircle, color: 'bg-red-50 text-red-700' },
    { label: 'Products', value: extraStats?.totalProducts ?? '—', icon: Package, color: 'bg-orange-50 text-orange-700' },
    { label: 'Customers', value: extraStats?.totalCustomers ?? '—', icon: Users, color: 'bg-blue-50 text-blue-700' },
    { label: 'Reviews', value: extraStats?.totalReviews ?? '—', icon: Star, color: 'bg-purple-50 text-purple-700' },
  ]

  const revenueChartData = last7DayLabels().map((label, i) => ({
    label,
    revenue: parseFloat((extraStats?.revenueByDay?.[i] || 0).toFixed(2)),
  }))

  const statusPieData = Object.entries(extraStats?.statusCounts || {}).map(
    ([name, value]) => ({ name, value })
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 py-10">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Main KPI cards */}
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

      {/* Extra stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {extraCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
              <div className={`p-1.5 rounded-lg ${color} shrink-0`}>
                <Icon size={13} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>

        {/* Revenue line chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Revenue — last 7 days</p>
          <p className="text-xs text-gray-400 mb-4">Delivered orders only</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueChartData}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#e07c3a" strokeWidth={2} dot={{ r: 3, fill: '#e07c3a' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status pie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Orders by status</p>
          <p className="text-xs text-gray-400 mb-4">Current distribution</p>
          {loading || statusPieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#888'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Top 5 products</p>
          <p className="text-xs text-gray-400 mb-4">By units ordered</p>
          {loading || !extraStats?.topProducts?.length ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={extraStats.topProducts} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#e07c3a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Recent Orders + Low Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

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