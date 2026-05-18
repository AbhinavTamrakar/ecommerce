'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Database, Search, ImageIcon, Filter, Calendar, X } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'
import { useAuthStore } from '@/store/authStore'
import { getImageUrl } from '@/lib/utils'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

export default function AdminProductsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isServerPaginated, setIsServerPaginated] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [dateSort, setDateSort] = useState('desc')

  async function fetchProducts(p: number, limit: number) {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/products?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      const data = await res.json()
      const raw = data.data?.data || data.data || []
      const lastPage = data.data?.last_page || 0
      
      setProducts(raw)
      setTotalProducts(data.data?.total || raw.length)
      
      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(data.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        setTotalPages(Math.ceil(raw.length / limit) || 1)
      }
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch(`${BASE}/api/public/categories`, {
        headers: { Accept: 'application/json' },
      })
      const data = await res.json()
      setCategories(data.data?.data || data.data || data || [])
    } catch {
      setCategories([])
    }
  }

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { if (token) fetchProducts(page, pageSize) }, [token, page, pageSize])

  const filtered = products
    .filter(p => {
      const matchesSearch = (p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.slug?.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = (categoryFilter === 'all' || p.category_id === Number(categoryFilter) || p.category?.id === Number(categoryFilter));
      
      const pDateStr = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '';
      const matchesFromDate = !fromDate || pDateStr >= fromDate;
      const matchesToDate = !toDate || pDateStr <= toDate;
      
      return matchesSearch && matchesCategory && matchesFromDate && matchesToDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateSort === 'desc' ? dateB - dateA : dateA - dateB
    })

  // Hybrid display logic
  const displayData = isServerPaginated 
    ? filtered.slice(0, pageSize) 
    : filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="text-black">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <Database size={22} className="text-black" /> 
             </div>
             Inventory
          </h1>
          <p className="text-[10px] font-bold text-black/80 mt-1 uppercase tracking-[0.3em] ml-1">{totalProducts} units listed in registry</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} />
          <span>Onboard Product</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8 flex-wrap animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex items-center flex-1 min-w-[240px]">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={16} />
              <input 
                 type="text" 
                 placeholder="Search assets..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-gray-50/50 border-none rounded-xl py-2.5 pl-11 pr-4 text-[11px] font-bold text-black placeholder:text-black/30 focus:ring-2 focus:ring-black/5 outline-none transition-all"
              />
           </div>
        </div>
        
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-gray-100 rounded-2xl py-3 px-6 text-[10px] font-black uppercase tracking-widest text-black focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-sm cursor-pointer hover:border-gray-200"
        >
          <option value="all">Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute -top-2.5 left-3 px-1 bg-white text-[7px] font-black text-black/40 uppercase tracking-widest z-10">From</span>
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
                setCategoryFilter('all');
                setFromDate('');
                setToDate('');
                setSearch('');
              }}
              className="absolute -bottom-4 right-2 text-[9px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-red-500 transition-colors whitespace-nowrap"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-md">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-8 py-6 text-left text-[10px] font-bold text-black uppercase tracking-[0.2em]">S.N</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold text-black uppercase tracking-[0.2em]">Product Name</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold text-black uppercase tracking-[0.2em]">Categories</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold text-black uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold text-black uppercase tracking-[0.2em]">Stock</th>
                <th className="px-8 py-6 text-left text-[10px] font-bold text-black uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-bold text-black uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && products.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-8 py-7"><div className="h-4 bg-gray-100 rounded-full w-full" /></td>)}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                       <Database size={56} className="stroke-[1px]" />
                       <p className="text-sm font-black uppercase tracking-[0.4em]">Registry Empty</p>
                    </div>
                  </td>
                </tr>
              ) : displayData.map((product: any, i: number) => (
                <tr key={product.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                  <td className="px-8 py-6 text-black font-black text-[10px]">
                     {(page - 1) * pageSize + i + 1}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 overflow-hidden relative group-hover:scale-110 transition-transform shadow-sm">
                          {product.primary_image ? (
                            <Image src={getImageUrl(product.primary_image)} alt="" fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-black/90"><ImageIcon size={24} strokeWidth={1} /></div>
                          )}
                       </div>
                       <div>
                         <p className="font-black text-black text-sm tracking-tighter leading-none">{product.name}</p>
                         <p className="text-[7px] font-black text-black/70 uppercase tracking-widest mt-2 px-1">{product.slug}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[11px] font-bold text-[#96b1d8] bg-[#96b1d8]/5 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                       {product.category?.name || 'Unclassified'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-black text-lg tracking-tighter">${Number(product.price).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-2">
                       <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-1000 ${product.stock <= 5 ? 'bg-red-500' : 'bg-black'}`} 
                            style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }} 
                          />
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-tighter ${product.stock <= 5 ? 'text-red-600' : 'text-black'}`}>
                         {product.stock} Units
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] px-3.5 py-1.5 rounded-full font-black uppercase tracking-[0.15em] shadow-sm transition-all ${
                      product.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-black'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 translate-x-2">
                      <Link href={`/admin/products/${product.id}`} className="p-3 rounded-2xl text-black/80 hover:text-black hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100">
                        <Pencil size={18} />
                      </Link>
                      <DeleteProductButton id={product.id} />
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
    </div>
  )
}