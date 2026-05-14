'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Star, Trash2, Box, X, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          size={12} 
          className={s <= rating ? 'fill-[#96b1d8] text-[#96b1d8]' : 'text-gray-100'} 
          strokeWidth={s <= rating ? 0 : 2}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  async function fetchReviews(p: number, limit: number) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/admin/reviews?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      const data = await res.json()
      const raw = data.data?.data || data.data || []
      const lastPage = data.data?.last_page || 0
      
      setReviews(raw)

      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(data.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        setTotalPages(Math.ceil(raw.length / limit) || 1)
      }
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (token) fetchReviews(page, pageSize) }, [token, page, pageSize])

  const handleDelete = async (id: number | null) => {
    if (!id) return
    setDeleting(true)
    try {
      const res = await fetch(`${BASE}/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) fetchReviews(page, pageSize)
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = reviews.filter(r => 
    r.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  )

  const displayData = isServerPaginated 
    ? filtered.slice(0, pageSize) 
    : filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="text-black">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <MessageSquare size={22} className="text-black" /> 
             </div>
             Feedback Registry
          </h1>
          <p className="text-[10px] font-bold text-black/40 mt-1 uppercase tracking-[0.3em] ml-1">Asset Performance Metrics</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-3 mb-8 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex-1 relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
           <input 
              type="text" 
              placeholder="Search by Author Node, Product Asset or Narrative Metadata..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50/50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-black placeholder:text-black/20 focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-inner"
           />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-black">
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">S.N</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Author Entity</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Target Asset</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Metric Scale</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Narrative Payload</th>
                <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && reviews.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-8 py-7"><div className="h-4 bg-gray-100 rounded-full w-full" /></td>)}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <MessageSquare size={56} className="stroke-[1px]" />
                      <p className="text-sm font-black uppercase tracking-[0.4em]">No Logs Available</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((r, i) => (
                  <tr key={r.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                    <td className="px-8 py-6 text-black/20 font-black text-[10px]">
                       {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-[10px] group-hover:bg-[#96b1d8] transition-all shadow-lg shadow-black/10">
                              {r.user?.name?.charAt(0) || 'U'}
                           </div>
                           <p className="font-black text-black tracking-tighter">{r.user?.name || 'Anonymous Entity'}</p>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <Box size={14} className="text-black/20" />
                           <p className="text-[11px] font-black text-black group-hover:text-[#96b1d8] transition-colors truncate max-w-[120px] uppercase tracking-widest">{r.product?.name || 'Purged Asset'}</p>
                        </div>
                    </td>
                    <td className="px-8 py-6"><StarRating rating={r.rating} /></td>
                    <td className="px-8 py-6">
                        <p className="text-[11px] font-black text-black/40 max-w-[280px] truncate leading-relaxed bg-gray-50/50 px-4 py-2.5 rounded-2xl border border-dotted border-gray-200 italic group-hover:text-black transition-colors">
                         {r.comment ? `"${r.comment}"` : <span className="opacity-40 uppercase tracking-[0.3em] text-[8px] font-black">Empty Segment</span>}
                        </p>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-black/20 uppercase tracking-[0.2em] whitespace-nowrap text-right group-hover:text-black/40">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <button onClick={() => setDeleteId(r.id)} className="p-3 rounded-2xl text-black/20 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-transparent hover:border-red-100" title="Purge Record">
                         <Trash2 size={18} />
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

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-[4rem] shadow-2xl p-12 max-w-sm w-full animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 mb-8 border-4 border-white shadow-xl shadow-red-500/10">
               <Trash2 size={28} />
            </div>
            <h2 className="text-3xl font-black text-black mb-3 tracking-tighter leading-none">Wipe Entry?</h2>
            <p className="text-[10px] font-black text-black/30 mb-12 leading-relaxed uppercase tracking-[0.3em]">
              This feedback fragment will be permanently purged from the cloud registry.
            </p>
            <div className="flex gap-4">
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-[2] bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] transition-all shadow-2xl shadow-red-500/20 active:scale-95">{deleting ? 'Purging…' : 'Finalize Wipe'}</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-black text-[11px] font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] transition-all active:scale-95">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}