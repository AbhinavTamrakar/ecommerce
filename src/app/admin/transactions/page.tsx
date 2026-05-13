'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'

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
  success: 'bg-green-100 text-green-700 border border-green-200',
  failed:  'bg-red-100 text-red-700 border border-red-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  refunded:'bg-blue-100 text-blue-700 border border-blue-200',
}

const METHOD_ICON: Record<string, string> = {
  paypal: '🅿',
  cod:    '💵',
  stripe: '💳',
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[s] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s === 'success' ? 'bg-green-500' : s === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`} />
      {s === 'success' ? 'Success' : s}
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
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${BASE}/api/admin/payments?per_page=15&page=${page}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((res) => {
        const d = res.data
        setPayments(d.data || [])
        setTotalPages(d.last_page || 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token, page])

  const filtered = payments.filter((p) => {
    const matchSearch =
      !search ||
      (p.transaction_id || '').toLowerCase().includes(search.toLowerCase()) ||
      String(p.order_id).includes(search) ||
      p.order?.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status?.toLowerCase() === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage all payment activities.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search by Transaction ID, Order #, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #e8826a 0%, #d96b52 100%)' }}>
                  {['S.N', 'Transaction ID', 'Order #', 'Customer', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-gray-400 text-sm">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr key={p.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs">{(page - 1) * 15 + i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {p.transaction_id
                          ? <span title={p.transaction_id}>{p.transaction_id.slice(0, 14)}…</span>
                          : <span className="text-gray-300">N/A</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">#{p.order_id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 truncate max-w-[130px]">{p.order?.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[130px]">{p.order?.user?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">${Number(p.amount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <span className="text-base">{METHOD_ICON[p.payment_method?.code] || '💳'}</span>
                          <span className="text-xs">{p.payment_method?.name || '—'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(p.paid_at || p.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Transaction Details</h2>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Payment ID', `#${selectedPayment.id}`],
                ['Order', `#${selectedPayment.order_id}`],
                ['Transaction ID', selectedPayment.transaction_id || 'N/A'],
                ['Customer', selectedPayment.order?.user?.name || '—'],
                ['Email', selectedPayment.order?.user?.email || '—'],
                ['Amount', `$${Number(selectedPayment.amount).toFixed(2)}`],
                ['Method', selectedPayment.payment_method?.name || '—'],
                ['Status', selectedPayment.status],
                ['Date', new Date(selectedPayment.paid_at || selectedPayment.created_at).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2 border-b border-gray-50">
                  <span className="text-gray-400 shrink-0">{label}</span>
                  <span className={`font-medium text-right break-all ${label === 'Status' ? (selectedPayment.status === 'success' ? 'text-green-600' : 'text-red-500') : 'text-gray-800'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}