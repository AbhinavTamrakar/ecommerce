'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Star, Pencil, Trash2, X, Check } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.12.71:8008'

interface Review {
  id: number
  rating: number
  comment: string | null
  created_at: string | null
  user: { id: number; name: string }
}

interface Order {
  id: number
  status: string
  items: { product_id: number }[]
}

function Stars({ rating, interactive = false, onChange }: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={interactive ? 22 : 14}
          className={`${i <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} ${interactive ? 'cursor-pointer transition-colors' : ''}`}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  )
}

export function ProductReviews({ productId }: { productId: number }) {
  const { user, token } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [eligibleOrderId, setEligibleOrderId] = useState<number | null>(null)
  const [myReview, setMyReview] = useState<Review | null>(null)

  // Write form
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Edit
  const [editId, setEditId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const h = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  async function loadReviews() {
    const res = await fetch(`${BASE}/api/public/products/${productId}/reviews`, {
      headers: { Accept: 'application/json' },
    })
    const json = await res.json()
    const list: Review[] = json.data || json || []
    setReviews(list)
    if (user) setMyReview(list.find(r => String(r.user?.id) === String(user.id)) || null)
    setLoading(false)
  }

  async function loadEligibleOrder() {
    if (!token) return
    const res = await fetch(`${BASE}/api/orders`, { headers: h })
    const json = await res.json()
    const orders: Order[] = json.data || json || []
    const eligible = orders.find(o =>
      o.status === 'delivered' &&
      (o.items || []).some(item => item.product_id === productId)
    )
    setEligibleOrderId(eligible?.id || null)
  }

  useEffect(() => {
    loadReviews()
    loadEligibleOrder()
  }, [productId, token])

  async function handleSubmit() {
    if (!eligibleOrderId) return
    setSubmitting(true)
    setFormError('')
    const res = await fetch(`${BASE}/api/reviews`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ product_id: productId, order_id: eligibleOrderId, rating, comment }),
    })
    const json = await res.json()
    if (res.ok) {
      setComment(''); setRating(5)
      await loadReviews()
    } else {
      setFormError(json.message || 'Failed to submit review.')
    }
    setSubmitting(false)
  }

  async function handleEdit(id: number) {
    setEditSaving(true)
    const res = await fetch(`${BASE}/api/reviews/${id}`, {
      method: 'PUT',
      headers: h,
      body: JSON.stringify({ rating: editRating, comment: editComment }),
    })
    if (res.ok) { setEditId(null); await loadReviews() }
    setEditSaving(false)
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    const res = await fetch(`${BASE}/api/reviews/${id}`, { method: 'DELETE', headers: h })
    if (res.ok) { setDeleteId(null); await loadReviews() }
    setDeleting(false)
  }

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          Reviews
        </h2>
        {avg && (
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(Number(avg))} />
            <span className="text-sm font-semibold text-gray-700">{avg}</span>
            <span className="text-sm text-gray-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      {token && !myReview && eligibleOrderId && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">Write a Review</p>
          <div className="mb-3">
            <Stars rating={rating} interactive onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this product…"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 resize-none mb-3 bg-white"
          />
          {formError && <p className="text-xs text-red-500 mb-2">{formError}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      )}

      {token && !myReview && !eligibleOrderId && (
        <p className="text-sm text-gray-400 mb-6 italic">Purchase and receive this product to leave a review.</p>
      )}

      {!token && (
        <p className="text-sm text-gray-400 mb-6 italic">
          <a href="/login" className="text-orange-500 hover:underline">Sign in</a> to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="space-y-5">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              {editId === r.id ? (
                <div>
                  <Stars rating={editRating} interactive onChange={setEditRating} />
                  <textarea
                    value={editComment}
                    onChange={e => setEditComment(e.target.value)}
                    rows={2}
                    className="w-full mt-2 text-sm border border-orange-300 rounded-lg px-3 py-2 outline-none resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEdit(r.id)} disabled={editSaving} className="flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">
                      <Check size={12} />{editSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditId(null)} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg">
                      <X size={12} />Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">{r.user?.name}</span>
                        <Stars rating={r.rating} />
                      </div>
                      {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                      {r.created_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    {user && String(r.user?.id) === String(user.id) && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setEditId(r.id); setEditRating(r.rating); setEditComment(r.comment || '') }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete Review</h2>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to delete your review?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}