'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Plus, Trash2, X, Layers, Image as ImageIcon } from 'lucide-react'
import { AddCategoryForm } from '@/components/admin/AddCategoryForm'
import { DeleteCategoryButton } from '@/components/admin/DeleteCategoryButton'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

export default function AdminCategoriesPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  async function fetchCategories(p: number, limit: number) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/public/categories?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      const data = await res.json()
      const raw = data.data?.data || data.data || data || []
      const lastPage = data.data?.last_page || 0
      
      setCategories(Array.isArray(raw) ? raw : [])

      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(data.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        const totalItems = Array.isArray(raw) ? raw.length : 0
        setTotalPages(Math.ceil(totalItems / limit) || 1)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories(page, pageSize) }, [token, page, pageSize])

  const displayData = isServerPaginated 
    ? categories.slice(0, pageSize) 
    : categories.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="text-black">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
               <Layers size={22} className="text-black" /> 
            </div>
            Categories
          </h1>
          <p className="text-[10px] font-bold text-black/40 mt-1 uppercase tracking-[0.3em] ml-1">Classification Registry</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-black">
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">S.N</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Category Entity</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Route Index</th>
                <th className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && categories.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     {Array.from({ length: 4 }).map((_, j) => <td key={j} className="px-8 py-7"><div className="h-6 bg-gray-100 rounded-xl w-full" /></td>)}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                       <Layers size={56} className="stroke-[1px]" />
                       <p className="text-sm font-black uppercase tracking-[0.4em]">Registry Empty</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((cat: any, idx: number) => (
                  <tr key={cat.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                    <td className="px-8 py-6 text-black/20 font-black text-[10px]">
                       {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        {cat.image ? (
                          <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-xl relative group-hover:scale-110 transition-transform">
                            <img src={`${BASE}/storage/${cat.image}`} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-black/5 shadow-inner">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        <div>
                           <p className="font-black text-black text-xl tracking-tighter leading-none group-hover:text-[#96b1d8] transition-colors">{cat.name}</p>
                           <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mt-2 ml-1">Node ID: {cat.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <span className="font-mono text-[11px] font-black text-[#96b1d8] bg-[#96b1d8]/5 rounded-lg px-3 py-1.5 uppercase tracking-tighter shadow-sm border border-[#96b1d8]/10 group-hover:bg-[#96b1d8]/10 transition-all">
                           /{cat.slug}
                        </span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                       <DeleteCategoryButton id={cat.id} onDeleted={() => fetchCategories(page, pageSize)} />
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6" onClick={() => setShowAddModal(false)}>
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="px-12 py-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div>
                    <h2 className="text-3xl font-black text-black tracking-tighter leading-none mb-2">New Category</h2>
                    <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Append classification node</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-5 bg-white rounded-3xl shadow-sm text-black/10 hover:text-black transition-all">
                    <X size={24} />
                 </button>
              </div>
              <div className="p-12">
                 <AddCategoryForm onCategoryAdded={() => { setShowAddModal(false); fetchCategories(page, pageSize); }} />
              </div>
           </div>
        </div>
      )}
    </div>
  )
}