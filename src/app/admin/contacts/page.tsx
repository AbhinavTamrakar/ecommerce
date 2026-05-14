'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, Mail, Calendar, Trash2, Search, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

export default function AdminContactsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    i.name?.toLowerCase().includes(search.toLowerCase()) || 
    i.email?.toLowerCase().includes(search.toLowerCase())
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
          <p className="text-gray-500 text-[15px] mt-1 ml-1 font-medium">
            View and manage messages sent from the Contact Us page
          </p>
        </div>
        
        <div className="relative w-full md:w-[320px]">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
              type="text" 
              placeholder="Search by name, email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-[14px] text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
           />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[20px] shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full text-sm min-w-[1000px]">
          <thead>
            {/* The distinct salmon/red background requested from the visual */}
            <tr className="bg-red-400 text-white">
              <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[11px] rounded-tl-[20px]">SN</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[11px]">SENDER</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[11px]">SUBJECT</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[11px]">PHONE</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[11px]">MESSAGE</th>
              <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[11px]">DATE</th>
              <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-[11px] rounded-tr-[20px]">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && inquiries.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded-lg w-full" /></td>)}
                    </tr>
                ))
            ) : displayData.length === 0 ? (
              <tr>
                 <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <ShieldCheck size={48} strokeWidth={1} />
                    <p className="text-sm font-semibold">No submissions found</p>
                  </div>
                </td>
              </tr>
            ) : displayData.map((i, idx) => (
              <tr key={i.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-6 text-gray-400 text-sm font-medium">
                   {(page - 1) * pageSize + idx + 1}
                </td>
                <td className="px-6 py-6">
                  <div className="flex flex-col space-y-1">
                    <span className="font-bold text-gray-900 text-[15px]">{i.name}</span>
                    <div className="flex items-center gap-1.5 text-gray-500 text-[13px]">
                      <Mail size={12} className="text-gray-400" />
                      {i.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 cursor-pointer group/item">
                    <span className="text-gray-700 font-medium text-[14px] truncate max-w-[150px]">{i.subject || 'No Subject'}</span>
                    <ChevronDown size={14} className="text-blue-500 opacity-50 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-gray-700 font-medium text-[14px]">{i.phone || 'N/A'}</span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 cursor-pointer group/item">
                    <span className="text-gray-700 text-[14px] line-clamp-1 max-w-[200px]">{i.message}</span>
                    <ChevronDown size={14} className="text-blue-500 opacity-50 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 text-gray-600 text-[13px] font-medium">
                    <Calendar size={14} className="text-blue-500" />
                    {new Date(i.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <button 
                    onClick={() => handleDelete(i.id)} 
                    disabled={deleting === i.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center w-full"
                    title="Delete submission"
                  >
                     <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination component logic handling */}
      {!loading && totalPages > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 pb-8">
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
    </div>
  )
}