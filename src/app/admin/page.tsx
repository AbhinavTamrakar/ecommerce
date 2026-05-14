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
  delivered: '#000000', 
  pending: '#96b1d8',   
  cancelled: '#ef4444', 
  processing: '#3b82f6', 
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

      const statusCounts: Record<string, number> = {}
      orderArr.forEach((o) => {
        const s = (o.status || 'unknown').toLowerCase()
        statusCounts[s] = (statusCounts[s] || 0) + 1
      })

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
    { label: 'Total Revenue', value: `$${Number(kpis.total_revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-black text-white shadow-lg' },
    { label: "Today's Yield", value: `$${Number(kpis.today_revenue || 0).toFixed(2)}`, icon: TrendingUp, color: 'bg-[#96b1d8] text-black shadow-md' },
    { label: 'Orders Volume', value: extraStats?.totalOrders ?? kpis.total_orders ?? 0, icon: ShoppingBag, color: 'bg-white border border-gray-100 text-black shadow-sm' },
    { label: 'Cloud Entities', value: kpis.new_customers || 0, icon: Users, color: 'bg-white border border-gray-100 text-black shadow-sm' },
  ]

  const revenueChartData = last7DayLabels().map((label, i) => ({
    label,
    revenue: parseFloat((extraStats?.revenueByDay?.[i] || 0).toFixed(2)),
  }))

  const statusPieData = Object.entries(extraStats?.statusCounts || {}).map(
    ([name, value]) => ({ name, value })
  )

  return (
    <div className="text-black">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-black tracking-tighter">Terminal</h1>
        <p className="text-black/40 text-[10px] font-bold mt-1 uppercase tracking-[0.3em]">System Intelligence & Commerce Audit</p>
      </div>

      {/* Main KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-[2rem] p-8 ${color} transition-all hover:scale-[1.02] duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{label}</span>
              <Icon size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-black tracking-tighter">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

        {/* Revenue line chart */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
          <div className="mb-8">
            <p className="text-xs font-black text-black uppercase tracking-[0.2em]">Revenue Velocity</p>
            <p className="text-[9px] text-black/30 font-bold uppercase tracking-widest">7-Day Trajectory</p>
          </div>
          {loading ? (
            <div className="h-[240px] bg-gray-50/50 rounded-3xl" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueChartData}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 900, fill: '#000' }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                  itemStyle={{ fontWeight: 900, fontSize: '14px', color: '#000' }}
                  cursor={{ stroke: '#000', strokeWidth: 1 }}
                />
                <Line type="step" dataKey="revenue" stroke="#000" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#fff', stroke: '#000', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status pie */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
          <div className="mb-8">
            <p className="text-xs font-black text-black uppercase tracking-[0.2em]">Asset Distribution</p>
            <p className="text-[9px] text-black/30 font-bold uppercase tracking-widest">Global Status Map</p>
          </div>
          {loading ? (
            <div className="h-[240px] bg-gray-50/50 rounded-3xl" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={55} paddingAngle={2}>
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#eee'} stroke="#fff" strokeWidth={4} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="rect" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products bar chart */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
           <div className="mb-8">
            <p className="text-xs font-black text-black uppercase tracking-[0.2em]">High Performance</p>
            <p className="text-[9px] text-black/30 font-bold uppercase tracking-widest">Top SKU Flux</p>
          </div>
          {loading ? (
            <div className="h-[240px] bg-gray-50/50 rounded-3xl" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={extraStats.topProducts} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 900, fill: '#000' }} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" fill="#96b1d8" radius={[0, 20, 20, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Footer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xs font-black text-black uppercase tracking-[0.25em]">Recent Traffic</h2>
            <a href="/admin/orders" className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-all">Audit Gate →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="px-8 py-16 text-[10px] font-bold text-black/20 uppercase tracking-widest text-center italic">Awaiting connection…</p>
            ) : recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="px-8 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-all cursor-pointer">
                <div>
                  <p className="text-sm font-black text-black tracking-tighter">REF-{order.id}</p>
                  <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-black tracking-tighter">${Number(order.total_amount || 0).toLocaleString()}</p>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#96b1d8]">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
             <h2 className="text-xs font-black text-black uppercase tracking-[0.25em] flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              Critical Stock
            </h2>
            <a href="/admin/products" className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-all">Restock Registry →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStock.length === 0 ? (
              <p className="px-8 py-16 text-[10px] font-bold text-black/20 uppercase tracking-widest text-center italic">Vault Healthy</p>
            ) : lowStock.slice(0, 5).map((product: any) => (
              <div key={product.id} className="px-8 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-all">
                <p className="text-sm font-black text-black tracking-tighter truncate">{product.name}</p>
                <div className="flex items-center gap-4">
                   <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${(product.stock / 10) * 100}%` }} />
                   </div>
                   <span className="text-[10px] font-black text-black bg-[#96b1d8] px-3 py-1.5 rounded-xl shrink-0 uppercase tracking-tighter shadow-sm">
                     {product.stock} Units
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}