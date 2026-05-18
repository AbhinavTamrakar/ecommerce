'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { UpdateOrderStatus } from '@/components/admin/UpdateOrderStatus'
import { Package, ShoppingBag, Search, Filter, Calendar, X } from 'lucide-react'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

const statusColor: Record<string, string> = {
  delivered: 'bg-green-500 text-white shadow-sm',
  processing: 'bg-blue-500 text-white shadow-sm',
  shipped: 'bg-purple-500 text-white shadow-sm',
  pending: 'bg-black text-white shadow-sm',
  cancelled: 'bg-red-500 text-white shadow-sm',
}

export default function AdminOrdersPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  const fetchOrders = async (p = 1, limit = 10) => {
    if (!token) return
    setLoading(true)
    try {
      // Trying multiple parameter names to force server-side volume control
      const res = await fetch(`${BASE}/api/admin/orders?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      
      // Determine response structure
      const raw = data?.data?.data ?? data?.data ?? data
      const lastPage = data?.data?.last_page || data?.last_page || 0
      
      setOrders(Array.isArray(raw) ? raw : [])
      
      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(data?.data?.current_page || data?.current_page || p)
      } else {
        // Fallback: implement local pagination if server doesn't support it
        setIsServerPaginated(false)
        const totalItems = Array.isArray(raw) ? raw.length : 0
        setTotalPages(Math.ceil(totalItems / limit) || 1)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders(page, pageSize) }, [token, page, pageSize])

  const filtered = orders.filter((order) => {
    const searchLower = search.toLowerCase()
    const matchSearch = 
      !search ||
      String(order.id).includes(searchLower) ||
      (order.user?.name || '').toLowerCase().includes(searchLower) ||
      (order.status || '').toLowerCase().includes(searchLower) ||
      (order.payment_status || '').toLowerCase().includes(searchLower)

    const matchStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter
    
    const oDateStr = order.created_at ? order.created_at.split('T')[0] : ''
    const matchFromDate = !fromDate || oDateStr >= fromDate
    const matchToDate = !toDate || oDateStr <= toDate
    
    return matchSearch && matchStatus && matchFromDate && matchToDate
  })

  // Display logic: only slice if server didn't paginate
  const displayData = isServerPaginated 
    ? filtered.slice(0, pageSize) // Extra safety slice for current page
    : filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="text-black">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <ShoppingBag size={22} className="text-black" /> 
             </div>
             Recent Orders
          </h1>
          <p className="text-[10px] font-bold text-black/80 mt-1 uppercase tracking-[0.3em] ml-1">
            {loading ? 'Checking cloud registry…' : `${orders.length} transactions managed in current view`}
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 mb-8 flex-wrap animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex items-center flex-1 min-w-[280px]">
           <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30" size={18} />
              <input 
                 type="text" 
                 placeholder="Search orders..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-gray-50/50 border-none rounded-xl py-2.5 pl-14 pr-6 text-sm font-bold text-black placeholder:text-black/30 focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-inner"
              />
           </div>
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-100 rounded-2xl py-3 px-6 text-[10px] font-black uppercase tracking-widest text-black focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-sm cursor-pointer hover:border-gray-200"
        >
          <option value="all">All Orders</option>
          {Object.keys(statusColor).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute -top-2.5 left-3 px-1 bg-white text-[8px] font-black text-black/40 uppercase tracking-widest z-10">From</span>
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={12} />
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-[9px] font-black uppercase tracking-widest text-black focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-sm hover:border-gray-200"
            />
          </div>
          <div className="relative group">
            <span className="absolute -top-2.5 left-3 px-1 bg-white text-[8px] font-black text-black/40 uppercase tracking-widest z-10">To</span>
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={12} />
            <input 
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-[9px] font-black uppercase tracking-widest text-black focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-sm hover:border-gray-200"
            />
            <button 
              onClick={() => {
                setStatusFilter('all');
                setFromDate('');
                setToDate('');
                setSearch('');
              }}
              className="absolute -bottom-5 right-2 text-[8px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-red-500 transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full text-[15px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-black">
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">S.N</th>
                {['Order No.', 'Customer', 'Date', 'Total Price', 'Payment Status', 'Delivery Status', 'Actions'].map((h) => (
                  <th key={h} className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && orders.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-8 py-7">
                        <div className="h-4 bg-gray-100 rounded-full w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <Package size={56} className="stroke-[1px]" />
                      <p className="text-sm font-black uppercase tracking-[0.4em]">Registry Empty</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((order: any, i: number) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all cursor-pointer group">
                    <td className="px-8 py-6 text-black font-black text-[10px]">
                       {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-black group-hover:text-[#96b1d8] transition-colors text-xs tracking-widest leading-none block">#{order.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-black text-base tracking-tighter leading-none">{order.user?.name || `Guest Node`}</p>
                      <p className="text-[10px] font-black text-black/70 uppercase tracking-widest mt-2">{order.user?.email || 'external entity'}</p>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-black/70 uppercase tracking-[0.2em] whitespace-nowrap">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-8 py-6 font-black text-black text-lg tracking-tighter">
                      ${Number(order.total_amount || order.subtotal || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-[0.1em] shadow-sm ${
                        order.payment_status === 'paid' ? 'bg-green-500 text-white' :
                        order.payment_status === 'refunded' ? 'bg-black text-white' :
                        'bg-[#96b1d8] text-white'
                      }`}>
                        {order.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-[0.1em] shadow-sm ${statusColor[order.status] || 'bg-gray-100 text-black'}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                       <UpdateOrderStatus
                        orderId={order.id}
                        currentStatus={order.status}
                        currentPaymentStatus={order.payment_status}
                        onUpdated={() => fetchOrders(page, pageSize)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 0 && (
          <div className="px-10 py-8 border-t border-gray-50 bg-gray-50/10">
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}