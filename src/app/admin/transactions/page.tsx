'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Eye, CreditCard, X, Search } from 'lucide-react'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface Payment {
  id: number
  order_id: number
  transaction_id: string | null
  amount: string
  status: string
  paid_at: string
  created_at: string
  order: {
    id: number
    user: {
      name: string
      email: string
    }
  }
  payment_method: {
    name: string
    code: string
  }
}

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-500 text-white shadow-sm',
  failed:  'bg-red-500 text-white shadow-sm',
  pending: 'bg-black text-white shadow-sm',
  refunded:'bg-[#96b1d8] text-white shadow-sm',
}

const METHOD_ICON: Record<string, string> = {
  paypal: '🅿',
  cod:    '💵',
  stripe: '💳',
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-[0.1em] ${STATUS_STYLES[s] || 'bg-gray-100 text-black'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s === 'success' ? 'bg-white' : s === 'failed' ? 'bg-white' : 'bg-white opacity-50'}`} />
      {s === 'success' ? 'Completed' : s}
    </span>
  )
}

export default function TransactionsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${BASE}/api/admin/payments?page=${page}&per_page=${pageSize}&limit=${pageSize}&pageSize=${pageSize}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((res) => {
        const d = res.data
        const raw = d.data || []
        const lastPage = d.last_page || 0
        
        setPayments(raw)
        
        if (lastPage > 0) {
          setIsServerPaginated(true)
          setTotalPages(lastPage)
        } else {
          setIsServerPaginated(false)
          setTotalPages(Math.ceil(raw.length / pageSize) || 1)
        }
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [token, page, pageSize])

  const filtered = payments.filter((p) => {
    const matchSearch =
      !search ||
      (p.transaction_id || '').toLowerCase().includes(search.toLowerCase()) ||
      String(p.order_id).includes(search) ||
      p.order?.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status?.toLowerCase() === statusFilter
    return matchSearch && matchStatus
  })

  // Display logic
  const displayData = isServerPaginated 
    ? filtered.slice(0, pageSize) 
    : filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="text-black">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
               <CreditCard size={22} className="text-black" /> 
            </div>
            Financial Ledger
          </h1>
          <p className="text-[10px] font-bold text-black/80 mt-1 uppercase tracking-[0.3em] ml-1">Universal Asset Acquisition Registry</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-3 mb-8 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black" size={18} />
          <input
            type="text"
            placeholder="Filter by Transaction ID, Order # or Identity Node"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm font-bold border border-transparent bg-gray-50/50 rounded-2xl px-14 py-4 outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-inner"
          />
        </div>
        <div className="flex items-center gap-2 px-6 h-14 bg-gray-50/30 rounded-2xl border border-gray-50">
           <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-[10px] font-black uppercase tracking-widest border-none outline-none focus:ring-0 bg-transparent text-[#96b1d8] hover:text-black cursor-pointer transition-all"
          >
            <option value="all">Global Visibility</option>
            <option value="success">Completed</option>
            <option value="pending">Awaiting</option>
            <option value="failed">Rejected</option>
            <option value="refunded">Reversed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['S.N', 'Ref ID', 'Order', 'Entity Node', 'Volume', 'Channel', 'Phase', 'Timestamp', 'View'].map((h) => (
                  <th key={h} className="px-8 py-6 text-left text-[10px] font-bold text-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && payments.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-8 py-6 min-w-[80px]"><div className="h-4 bg-gray-100 rounded-full w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <CreditCard size={56} className="stroke-[1px]" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">No Registry Data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((p, i) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer" onClick={() => setSelectedPayment(p)}>
                    <td className="px-8 py-6 text-black font-black text-[10px]">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-8 py-6">
                      {p.transaction_id
                        ? <span className="font-mono text-[9px] font-bold text-[#96b1d8] bg-[#96b1d8]/5 px-2 py-0.5 rounded-lg uppercase tracking-tighter" title={p.transaction_id}>{p.transaction_id.slice(0, 10)}…</span>
                        : <span className="text-black/90 font-bold text-[9px]">NULL_REF</span>}
                    </td>
                    <td className="px-8 py-6 font-black text-black text-xs tracking-widest leading-none">ORD-{p.order_id}</td>
                    <td className="px-8 py-6">
                      <p className="font-black text-black text-base tracking-tighter leading-none truncate max-w-[150px]">{p.order?.user?.name || '—'}</p>
                      <p className="text-[10px] font-black text-black/70 truncate max-w-[150px] uppercase tracking-widest mt-2">{p.order?.user?.email || ''}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-black text-lg tracking-tighter">${Number(p.amount).toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-white transition-all shadow-sm">{METHOD_ICON[p.payment_method?.code] || '💳'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/80">{p.payment_method?.name || 'GENERIC'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-black/70 uppercase tracking-[0.2em] whitespace-nowrap">
                      {new Date(p.paid_at || p.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        className="p-3 rounded-2xl text-black group-hover:text-black group-hover:bg-white transition-all shadow-sm border border-transparent group-hover:border-gray-100"
                        title="Analyze Transaction"
                      >
                        <Eye size={18} />
                      </button>
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

      {/* Detail Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="bg-white rounded-[4rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-12 py-10 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-black tracking-tighter leading-none mb-2">Audit Receipt</h2>
                <p className="text-[10px] font-black text-[#96b1d8] uppercase tracking-[0.3em]">Payload Hash: ORD-{selectedPayment.order_id}</p>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)} 
                className="text-black/90 hover:text-black p-4 bg-white rounded-3xl shadow-sm transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-12 space-y-2">
              {[
                ['Registry ID', `#${selectedPayment.id}`],
                ['Transaction', selectedPayment.transaction_id || 'LOCAL_CACHE'],
                ['Identity', selectedPayment.order?.user?.name || 'Unmapped Node'],
                ['Endpoint', selectedPayment.order?.user?.email || 'OFFLINE'],
                ['Gross Value', `$${Number(selectedPayment.amount).toLocaleString()}`],
                ['Methodology', selectedPayment.payment_method?.name || 'GENERIC_GW'],
                ['Lifecycle', selectedPayment.status.toUpperCase()],
                ['Log Timestamp', new Date(selectedPayment.paid_at || selectedPayment.created_at).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-5 border-b border-gray-50 last:border-0">
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">{label}</span>
                  <span className={`text-sm font-black text-right break-all ml-8 tracking-tighter ${label === 'Lifecycle' ? (selectedPayment.status === 'success' ? 'text-green-600' : 'text-red-500') : 'text-black'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-12 py-8 text-center border-t border-gray-100">
               <button onClick={() => setSelectedPayment(null)} className="text-[11px] font-black text-black uppercase tracking-[0.4em] hover:text-black transition-all">Dismiss Internal Audit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}