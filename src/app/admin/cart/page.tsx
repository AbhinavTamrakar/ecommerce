'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import Image from 'next/image'
import { ShoppingCart, Package, RefreshCw, Eye, X, ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface CartItem {
  id: number
  product_id: number
  quantity: number
  price: string
  subtotal: number
  discount_percentage: string
  product: {
    id: number
    name: string
    slug: string
    primary_image: string | null
    delivery_charge: string
  }
  variant_options?: { id: number; attribute_name: string; value: string }[]
}

interface Cart {
  id: number
  user_id: number
  user_name: string
  items: CartItem[]
  items_count: number
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

  const h = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/api/admin/carts`, { headers: h })
      if (!res.ok) throw new Error(`${res.status}`)
      const json = await res.json()
      const raw = json?.data?.data ?? json?.data ?? json
      setCarts(Array.isArray(raw) ? raw : [])
    } catch {
      setError('Failed to load carts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  const filtered = search
    ? carts.filter(c =>
        c.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(c.user_id).includes(search)
      )
    : carts

  const totalItems = carts.reduce((s, c) => s + (c.total_quantity || 0), 0)
  const totalValue = carts.reduce((s, c) => s + Number(c.total || 0), 0)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-500" /> Carts
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{carts.length} active carts</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 text-sm px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          {error}<button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Active Carts', value: carts.length },
          { label: 'Total Items', value: totalItems },
          { label: 'Total Value', value: `$${totalValue.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by customer name or user ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-300"
        />
        {search && <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500"><X size={14} /></button>}
      </div>

      {/* Carts table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Customer', 'Items', 'Total Qty', 'Cart Value', 'Last Updated', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <ShoppingCart size={36} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">{search ? 'No carts match your search.' : 'No active carts.'}</p>
                </td>
              </tr>
            ) : (
              filtered.map(cart => (
                <tr key={cart.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelected(cart)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{cart.user_name || `User #${cart.user_id}`}</p>
                    <p className="text-xs text-gray-400">ID: {cart.user_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {(cart.items || []).slice(0, 3).map(item => (
                        <div key={item.id} className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white overflow-hidden shrink-0 relative">
                          {item.product?.primary_image ? (
                            <Image src={getImageUrl(item.product.primary_image)} alt="" fill className="object-cover" sizes="28px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package size={10} className="text-gray-300" /></div>
                          )}
                        </div>
                      ))}
                      {(cart.items_count || cart.items?.length || 0) > 3 && (
                        <div className="w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center">
                          <span className="text-[9px] font-bold text-orange-600">+{(cart.items_count || cart.items?.length || 0) - 3}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">{cart.total_quantity}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">${Number(cart.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {cart.updated_at ? new Date(cart.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="View cart">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cart detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{selected.user_name}'s Cart</h2>
                <p className="text-xs text-gray-400">{selected.items?.length || 0} items · ${Number(selected.total).toFixed(2)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
              {(selected.items || []).map(item => {
                const img = item.product?.primary_image
                return (
                  <div key={item.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                      {img ? (
                        <Image src={getImageUrl(img)} alt="" fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-gray-300" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name || `Product #${item.product_id}`}</p>
                      {item.variant_options && item.variant_options.length > 0 && (
                        <p className="text-xs text-gray-400">{item.variant_options.map(v => `${v.attribute_name}: ${v.value}`).join(', ')}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">${Number(item.subtotal).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">×{item.quantity} @ ${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-base font-bold text-gray-900">${Number(selected.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}