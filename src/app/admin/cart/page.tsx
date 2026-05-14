'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import Image from 'next/image'
import { ShoppingCart, Package, Eye, X, Calendar, Search } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import Pagination from '@/components/admin/Pagination'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface CartItem {
  id: number
  product_id: number
  quantity: number
  price: string
  subtotal: number
  product: {
    id: number
    name: string
    slug: string
    primary_image: string | null
  }
  variant_options?: { id: number; attribute_name: string; value: string }[]
}

interface Cart {
  id: number
  user_id: number
  user_name: string
  items: CartItem[]
  total_quantity: number
  total: number
  created_at: string
  updated_at: string
}

export default function AdminCartsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [carts, setCarts] = useState<Cart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Cart | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isServerPaginated, setIsServerPaginated] = useState(false)

  const h = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  async function load(p = 1, limit = 10) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/api/admin/carts?page=${p}&per_page=${limit}&limit=${limit}&pageSize=${limit}`, { headers: h })
      if (!res.ok) throw new Error(`${res.status}`)
      const json = await res.json()
      const raw = json?.data?.data ?? json?.data ?? json
      const lastPage = json?.data?.last_page || 0

      setCarts(Array.isArray(raw) ? raw : [])
      
      if (lastPage > 0) {
        setIsServerPaginated(true)
        setTotalPages(lastPage)
        setPage(json?.data?.current_page || p)
      } else {
        setIsServerPaginated(false)
        setTotalPages(Math.ceil(raw.length / limit) || 1)
      }
    } catch {
      setError('Failed to load carts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page, pageSize) }, [token, page, pageSize])

  const filtered = search
    ? carts.filter(c =>
        c.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(c.user_id).includes(search)
      )
    : carts

  const displayData = isServerPaginated 
    ? filtered.slice(0, pageSize) 
    : filtered.slice((page - 1) * pageSize, page * pageSize)

  const totalValue = carts.reduce((s, c) => s + Number(c.total || 0), 0)

  return (
    <div className="text-black max-w-6xl mx-auto px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-black tracking-tighter flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <ShoppingCart size={22} className="text-black" /> 
             </div>
             Abandoned Carts
          </h1>
          <p className="text-[10px] font-black text-black/80 mt-1 uppercase tracking-[0.3em] ml-1">Asset Staging Registry</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
          {error}<button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 group hover:border-black transition-all">
           <p className="text-[10px] font-black text-black uppercase tracking-[0.4em] mb-2">Active Staging Cycles</p>
           <p className="text-4xl font-black text-black tracking-tighter group-hover:scale-105 transition-transform origin-left">{loading ? '…' : carts.length}</p>
        </div>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 group hover:border-[#96b1d8] transition-all">
           <p className="text-[10px] font-black text-black uppercase tracking-[0.4em] mb-2">Total Staged Valuation</p>
           <p className="text-4xl font-black text-black tracking-tighter group-hover:scale-105 transition-transform origin-left">${totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-3 mb-8 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex-1 relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black" size={18} />
           <input 
              type="text" 
              placeholder="Filter by Customer Node or Session Identity..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50/50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-black placeholder:text-black focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-inner"
           />
        </div>
      </div>

      {/* Carts table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-black">
                <th className="px-8 py-6 text-left">S.N</th>
                {['Customer Entity', 'Asset Visuals', 'Volume', 'Valuation', 'Updated', 'Action'].map(h => (
                  <th key={h} className="px-8 py-6 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && carts.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-8 py-7"><div className="h-5 bg-gray-100 rounded-full w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                       <ShoppingCart size={56} className="stroke-[1px]" />
                       <p className="text-sm font-black uppercase tracking-[0.4em]">No matching carts</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((cart, idx) => (
                  <tr key={cart.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer" onClick={() => setSelected(cart)}>
                    <td className="px-8 py-6 text-black font-black text-[10px]">
                       {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-black text-base tracking-tighter leading-none">{cart.user_name || `Anonymous Node`}</p>
                      <p className="text-[10px] font-black text-black/70 uppercase tracking-widest mt-2 px-1">ID: {cart.user_id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex -space-x-4">
                        {(cart.items || []).slice(0, 3).map(item => (
                          <div key={item.id} className="w-12 h-12 rounded-2xl bg-white border-2 border-white shadow-xl overflow-hidden shrink-0 relative transition-transform group-hover:-translate-y-1">
                            {item.product?.primary_image ? (
                              <Image src={getImageUrl(item.product.primary_image)} alt="" fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package size={16} className="text-black/90" /></div>
                            )}
                          </div>
                        ))}
                        {(cart.items?.length || 0) > 3 && (
                          <div className="w-12 h-12 rounded-2xl bg-black border-2 border-white flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:-translate-y-1">
                            <span className="text-[10px] font-black text-white">+{(cart.items?.length || 0) - 3}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-black tracking-widest">{cart.total_quantity} SKU</td>
                    <td className="px-8 py-6 font-black text-black text-lg tracking-tighter">${Number(cart.total).toLocaleString()}</td>
                    <td className="px-8 py-6 text-[10px] font-black text-black uppercase tracking-widest whitespace-nowrap group-hover:text-black/80 transition-colors">
                      {cart.updated_at ? new Date(cart.updated_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <button className="p-3 rounded-2xl text-black hover:text-black hover:bg-white transition-all shadow-sm border border-transparent group-hover:border-gray-100 mt-1">
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
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-12 py-10 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-black tracking-tighter leading-none mb-2">{selected.user_name}'s Cart</h2>
                <p className="text-[10px] font-black text-[#96b1d8] uppercase tracking-[0.3em]">Payload Audit · {selected.items?.length || 0} Assets Staged</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-5 bg-white rounded-3xl shadow-sm text-black/90 hover:text-black transition-all">
                 <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-gray-50 p-8">
              {(selected.items || []).map(item => (
                <div key={item.id} className="flex items-center gap-8 px-6 py-6 hover:bg-gray-50/50 rounded-[2.5rem] transition-all group/item">
                  <div className="w-20 h-20 rounded-[2rem] bg-white border border-gray-100 overflow-hidden shrink-0 relative shadow-xl group-hover/item:scale-105 transition-transform">
                    {item.product?.primary_image ? (
                      <Image src={getImageUrl(item.product.primary_image)} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-black/5" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-black tracking-tight leading-none mb-2 truncate group-hover/item:text-[#96b1d8] transition-colors">{item.product?.name || `Asset #${item.product_id}`}</p>
                    {item.variant_options && item.variant_options.length > 0 && (
                      <p className="text-[10px] font-black text-black uppercase tracking-widest">{item.variant_options.map(v => `${v.attribute_name}: ${v.value}`).join(' · ')}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-black tracking-tighter leading-none mb-2">${Number(item.subtotal).toLocaleString()}</p>
                    <p className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Volume: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-12 py-10 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-[11px] font-black text-black uppercase tracking-[0.4em]">Integrated Valuation</span>
              <span className="text-3xl font-black text-black tracking-tighter">${Number(selected.total).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}