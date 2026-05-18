'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, Mail, Calendar, Trash2, Search, ChevronDown, Eye, X } from 'lucide-react'
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
      const res = await fetch(`${BASE}/api/contacts?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      const data = await res.json()
      console.log('Contacts API Response:', data)
      const raw = data?.data?.data ?? data?.data ?? data
      const contactsArray = Array.isArray(raw) ? raw : []
      const lastPage = data?.data?.last_page || 0
      
      setInquiries(contactsArray)
      
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
    if (!confirm('Are you sure you want to delete this contact submission?')) return
    setDeleting(id)
    try {
      const res = await fetch(`${BASE}/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) fetchContacts(page, pageSize)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = inquiries.filter(i => 
    (i.full_name || i.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (i.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const displayData = isServerPaginated 
    ? filtered.slice(0, pageSize) 
    : filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="text-black space-y-6 max-w-[1400px] mx-auto px-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-black flex items-center gap-3 tracking-tight">
             <ShieldCheck className="text-blue-600" size={32} strokeWidth={2.5} />
             Contact Submissions
          </h1>
          <p className="text-gray-700 text-[15px] mt-1 ml-1 font-medium">
            View and manage messages sent from the Contact Us page
          </p>
        </div>
        
        <div className="relative w-full md:w-[320px]">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
           <input 
              type="text" 
              placeholder="Search by name, email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-[14px] text-gray-700 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
           />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full text-[15px] min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-black">
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">SN</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">SENDER</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">SUBJECT</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">PHONE</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">MESSAGE</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em]">DATE</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em]">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && inquiries.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded-lg w-full" /></td>)}
                    </tr>
                ))
            ) : displayData.length === 0 ? (
              <tr>
                 <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-600">
                    <ShieldCheck size={48} strokeWidth={1} />
                    <p className="text-sm font-semibold">No submissions found</p>
                  </div>
                </td>
              </tr>
            ) : displayData.map((i, idx) => (
              <tr key={i.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-6 text-black/80 font-black text-[10px]">
                   {(page - 1) * pageSize + idx + 1}
                </td>
                <td className="px-6 py-6" onClick={() => setSelected(i)}>
                  <div className="flex flex-col space-y-1">
                    <span className="font-bold text-black text-[15px] cursor-pointer">{i.full_name || i.name || 'Unknown User'}</span>
                    <div className="flex items-center gap-1.5 text-black text-[13px] font-bold">
                      <Mail size={12} className="text-black" />
                      {i.email || 'No Email'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 cursor-pointer group/item" onClick={() => setSelected(i)}>
                    <span className="text-black font-bold text-[14px] truncate max-w-[150px]">{i.subject || 'No Subject'}</span>
                    <ChevronDown size={14} className="text-black/80 opacity-50 group-hover/item:opacity-700 transition-opacity" />
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-black font-bold text-[14px]">{i.phone || 'N/A'}</span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 cursor-pointer group/item" onClick={() => setSelected(i)}>
                    <span className="text-black font-medium text-[14px] line-clamp-1 max-w-[200px]">{i.message}</span>
                    <ChevronDown size={14} className="text-black/80 opacity-50 group-hover/item:opacity-700 transition-opacity" />
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 text-black text-[10px] font-bold uppercase tracking-widest">
                    <Calendar size={14} className="text-black" />
                    {new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => setSelected(i)} 
                      className="p-3 text-black/80 hover:text-black hover:bg-gray-100 rounded-2xl transition-all outline-none"
                      title="View submission details"
                    >
                       <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(i.id)} 
                      disabled={deleting === i.id}
                      className="p-3 text-black hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all outline-none"
                      title="Delete submission"
                    >
                       <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination component logic handling */}
      {!loading && totalPages > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-700 pt-2 pb-8">
           <div className="font-medium px-2">
             Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} results
           </div>
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

      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
               <div className="bg-gray-50/50 px-10 py-8 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">
                        {(selected.full_name || selected.name || 'U').charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-black tracking-tight leading-none mb-1.5">{selected.full_name || selected.name || 'Unknown User'}</h2>
                        <div className="flex items-center gap-1.5">
                           <Mail size={12} className="text-black/80" />
                           <p className="text-[12px] font-bold text-black">{selected.email || 'No Email'}</p>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-4 bg-white rounded-2xl shadow-sm text-black/80 hover:text-black hover:bg-gray-100 transition-all outline-none border border-gray-50"><X size={20} /></button>
               </div>
               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1.5 px-6 py-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                        <p className="text-[10px] font-bold text-black/80 uppercase tracking-widest">Phone Number</p>
                        <p className="font-bold text-black text-sm">{selected.phone || 'N/A'}</p>
                     </div>
                     <div className="space-y-1.5 px-6 py-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                        <p className="text-[10px] font-bold text-black/80 uppercase tracking-widest">Date Sent</p>
                        <p className="font-bold text-black text-sm">{new Date(selected.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                     </div>
                  </div>
                  <div className="pt-6">
                     <p className="text-[10px] font-bold text-black/80 uppercase tracking-widest mb-3">Subject</p>
                     <p className="text-black font-semibold text-base mb-6">{selected.subject || 'No Subject'}</p>
                     
                     <p className="text-[10px] font-bold text-black/80 uppercase tracking-widest mb-3">Message Content</p>
                     <div className="bg-gray-50 rounded-3xl p-8 text-black font-medium leading-relaxed text-[15px] border border-gray-200">
                        {selected.message}
                     </div>
                  </div>
               </div>
            </div>
        </div>
      )}
    </div>
  )
}