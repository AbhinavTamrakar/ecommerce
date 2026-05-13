'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Star, Trash2, X } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface Review {
  id: number
  rating: number
  comment: string | null
  created_at: string | null
  user: { id: number; name: string }
  product: { id: number; name: string; slug: string; primary_image?: string }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const token = useAuthStore((s) => s.token) ?? ''
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filterRating, setFilterRating] = useState(0)

  const h = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${BASE}/api/admin/reviews`, { headers: h })
      .then(r => r.json())
      .then(json => {
        const raw = json?.data?.data ?? json?.data ?? json
        setReviews(Array.isArray(raw) ? raw : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  async function handleDelete(id: number) {
    setDeleting(true)
    const res = await fetch(`${BASE}/api/reviews/${id}`, { method: 'DELETE', headers: h })
    if (res.ok) { setReviews(p => p.filter(r => r.id !== id)); setDeleteId(null) }
    else setError('Failed to delete review.')
    setDeleting(false)
  }

  const filtered = filterRating > 0 ? reviews.filter(r => r.rating === filterRating) : reviews
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Star size={20} className="text-orange-500" /> Reviews</h1>
          <p className="text-sm text-gray-400 mt-0.5">{reviews.length} reviews · avg {avgRating} ★</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Filter:</span>
          {[0,1,2,3,4,5].map(r => (
            <button key={r} onClick={() => setFilterRating(r)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filterRating === r ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-300'}`}>
              {r === 0 ? 'All' : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">{error}<button onClick={() => setError('')}><X size={14} /></button></div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Customer', 'Product', 'Rating', 'Comment', 'Date', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded" /></td>)}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No reviews found.</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{r.user?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[130px] truncate text-xs">{r.product?.name || '—'}</td>
                <td className="px-4 py-3"><StarRating rating={r.rating} /></td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate text-xs">{r.comment || <span className="text-gray-300 italic">No comment</span>}</td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Review</h2>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to delete this review? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">{deleting ? 'Deleting…' : 'Delete'}</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}