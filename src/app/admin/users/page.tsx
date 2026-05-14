'use client'

import { useEffect, useState } from 'react'
import { DeleteUserButton } from '@/components/admin/DeleteUserButton'
import { Users, Mail, Phone, Calendar, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

export default function AdminUsersPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  async function fetchUsers(p: number, limit: number) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/admin/customers?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      const data = await res.json()
      const raw = data.data?.data || data.data || []
      const lastPage = data.data?.last_page || 0
      
      setUsers(raw)
      
      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(data.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        setTotalPages(Math.ceil(raw.length / limit) || 1)
      }
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (token) fetchUsers(page, pageSize) }, [token, page, pageSize])

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
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
                <Users size={22} className="text-black" /> 
             </div>
             Directory
          </h1>
          <p className="text-[10px] font-bold text-black/80 mt-1 uppercase tracking-[0.3em] ml-1">Member Registry Access</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-3 mb-8 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex-1 relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black" size={18} />
           <input 
              type="text" 
              placeholder="Search by Identity or Alias..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50/50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-black placeholder:text-black focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-inner"
           />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-black">
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">S.N</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">User Profile</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Connectivity</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Registration</th>
                <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && users.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-8 py-7"><div className="h-5 bg-gray-100 rounded-full w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                       <Users size={56} className="stroke-[1px]" />
                       <p className="text-sm font-black uppercase tracking-[0.4em]">No Entities Detected</p>
                    </div>
                  </td>
                </tr>
              ) : displayData.map((user: any, i: number) => (
                <tr key={user.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                  <td className="px-8 py-6 text-black font-black text-[10px]">
                     {(page - 1) * pageSize + i + 1}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xs shadow-lg shadow-black/10 transition-transform group-hover:scale-110">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-black text-base tracking-tighter leading-none">{user.name}</p>
                        <div className="flex items-center gap-2 mt-2 grayscale group-hover:grayscale-0 transition-all">
                           <Mail size={12} className="text-[#96b1d8]" />
                           <p className="text-xs font-black text-black/70 group-hover:text-black transition-colors lowercase">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-mono font-black text-[#96b1d8] tracking-widest leading-none">
                    {user.phone || '——'}
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest group-hover:text-black/80 transition-colors">
                        <Calendar size={14} className="opacity-70" />
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right whitespace-nowrap">
                     <DeleteUserButton id={user.id} />
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
    </div>
  )
}