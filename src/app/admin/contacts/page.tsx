'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Mail, Calendar, Eye, Trash2, X, ShieldCheck, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

export default function AdminContactsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  async function fetchContacts(p: number, limit: number) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/admin/contacts?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      const data = await res.json()
      const raw = data.data?.data || data.data || []
      const lastPage = data.data?.last_page || 0
      
      setInquiries(raw)
      
      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(data.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        setTotalPages(Math.ceil(raw.length / limit) || 1)
      }
    } catch {
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (token) fetchContacts(page, pageSize) }, [token, page, pageSize])

  const handleDelete = async (id: number) => {
    if (!confirm('Extraction of communications is permanent. Proceed?')) return
    setDeleting(id)
    try {
      const res = await fetch(`${BASE}/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) fetchContacts(page, pageSize)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = inquiries.filter(i => 
    i.name?.toLowerCase().includes(search.toLowerCase()) || 
    i.email?.toLowerCase().includes(search.toLowerCase())
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
             Communications Hub
          </h1>
          <p className="text-[10px] font-bold text-black/40 mt-1 uppercase tracking-[0.3em] ml-1">Inbound Signal Registry</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-3 mb-8 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex-1 relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
           <input 
              type="text" 
              placeholder="Search by Identity Node or Signal Origin..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50/50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-black placeholder:text-black/20 focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-inner"
           />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-black">
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">S.N</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Entity Identity</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Communication Channel</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Transmission Time</th>
                <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && inquiries.length === 0 ? (
                  Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-8 py-7"><div className="h-5 bg-gray-100 rounded-full w-full" /></td>)}
                      </tr>
                  ))
              ) : displayData.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <MessageSquare size={56} className="stroke-[1px]" />
                      <p className="text-sm font-black uppercase tracking-[0.4em]">No Signal Detected</p>
                    </div>
                  </td>
                </tr>
              ) : displayData.map((i, idx) => (
                <tr key={i.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer" onClick={() => setSelected(i)}>
                  <td className="px-8 py-6 text-black/20 font-black text-[10px]">
                     {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-[10px] shadow-lg shadow-black/10 group-hover:bg-[#96b1d8] transition-all">
                        {i.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-black text-black text-base tracking-tighter leading-none">{i.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 grayscale group-hover:grayscale-0 transition-all">
                      <Mail size={14} className="text-[#96b1d8]" />
                      <p className="text-xs font-black text-black/30 group-hover:text-black transition-colors">{i.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-black/20 uppercase tracking-[0.2em] whitespace-nowrap group-hover:text-black/40 transition-colors">
                    {new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 translate-x-2">
                      <button className="p-3 rounded-2xl text-black/20 hover:text-black hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100">
                         <Eye size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(i.id); }} 
                        disabled={deleting === i.id}
                        className="p-3 rounded-2xl text-black/20 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-transparent hover:border-red-100"
                      >
                         <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
               <div className="bg-gray-50/50 px-12 py-10 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-black text-white rounded-[2rem] flex items-center justify-center text-xl font-black shadow-2xl shadow-black/20">
                        {selected.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-black tracking-tighter leading-none mb-2">{selected.name}</h2>
                        <div className="flex items-center gap-2">
                           <ShieldCheck size={14} className="text-[#96b1d8]" />
                           <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Verified Communication Node</p>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-5 bg-white rounded-3xl shadow-sm text-black/10 hover:text-black transition-all"><X size={24} /></button>
               </div>
               <div className="p-12 space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2 px-8 py-6 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                        <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em]">Primary Channel</p>
                        <p className="font-black text-black text-sm tracking-tighter line-clamp-1">{selected.email}</p>
                     </div>
                     <div className="space-y-2 px-8 py-6 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                        <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em]">Transmission Log</p>
                        <p className="font-black text-black text-sm tracking-tight">{new Date(selected.created_at).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="pt-8 border-t border-gray-50">
                     <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mb-6 ml-2">Message Segment</p>
                     <div className="bg-gray-50 rounded-[2.5rem] p-10 text-black/80 font-black leading-relaxed text-base italic shadow-inner border border-gray-100 relative group/msg overflow-hidden">
                        <MessageSquare size={100} className="absolute -bottom-10 -right-10 text-[#96b1d8]/5 group-hover:text-[#96b1d8]/10 transition-all" strokeWidth={8} />
                        <span className="relative z-10">"{selected.message}"</span>
                     </div>
                  </div>
               </div>
               <div className="bg-gray-50/50 px-12 py-8 text-center border-t border-gray-100 ring-1 ring-inset ring-black/5">
                  <button onClick={() => setSelected(null)} className="text-[11px] font-black text-black/20 hover:text-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 mx-auto">
                     <ShieldCheck size={16} className="opacity-40" />
                     Archive Audit Segment
                  </button>
               </div>
            </div>
        </div>
      )}
    </div>
  )
}