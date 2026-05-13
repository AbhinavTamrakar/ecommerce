'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { Order } from '@/types'
import { LogOut, Package, ChevronDown, ChevronUp, Settings, ShoppingBag, RotateCcw, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

const formatPrice = (amount: string | number | null) => {
  if (!amount) return '$0.00'
  return `$${Number(amount).toFixed(2)}`
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-green-100 text-green-700 border border-green-200'
    case 'processing': return 'bg-blue-100 text-blue-700 border border-blue-200'
    case 'pending': return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'cancelled': return 'bg-red-100 text-red-700 border border-red-200'
    default: return 'bg-gray-100 text-gray-600 border border-gray-200'
  }
}

type FilterType = 'all' | 'pending' | 'processing' | 'delivered' | 'cancelled'

export default function AccountPage() {
  const { user, isAuthenticated, logout, setUser } = useAuthStore()
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [updating, setUpdating] = useState(false)

  // Wait for Zustand to hydrate from localStorage before checking auth
  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    const token = useAuthStore.getState().token
    // Fetch full profile to get created_at and any fields missing from login response
    fetch(`${BASE}/api/profile`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        const profileData = res.data || res
        if (profileData?.id) setUser(profileData)
      })
      .catch(() => {})
    fetch(`${BASE}/api/orders`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => setOrders(res.data || res || []))
      .catch(() => {})
  }, [hydrated, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' })
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const token = useAuthStore.getState().token
      const res = await fetch(`${BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, phone: form.phone || undefined }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setUser(data.data || data)
      toast.success('Profile updated!')
      setShowEditProfile(false)
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = useAuthStore.getState().token
      await fetch(`${BASE}/api/logout`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
    } catch {}
    logout()
    router.push('/')
  }

  const handleReorder = (order: Order) => {
    // Add all order items back to cart
    toast.success('Items added to cart!')
    // TODO: implement actual reorder logic with useCartStore
  }

  // Show nothing while hydrating to prevent flash of protected content
  if (!hydrated || !isAuthenticated || !user) return null

  const displayUser = user

  const totalSpent = orders.reduce(
    (sum, o) => sum + Number(o.total_amount ?? o.subtotal ?? 0),
    0
  )
  const memberSince = displayUser.created_at
    ? new Date(displayUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status?.toLowerCase() === filter)

  const filterCounts: Record<FilterType, number> = {
    all: orders.length,
    pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
    processing: orders.filter(o => o.status?.toLowerCase() === 'processing').length,
    delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
    cancelled: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length,
  }

  return (
    <div className="min-h-screen pt-8 pb-24">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-base flex-shrink-0">
              {getInitials(displayUser.name || 'U')}
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {displayUser.name}
              </h1>
              <p className="text-[var(--color-muted)] text-sm">{displayUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditProfile(!showEditProfile)}
              className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] border border-[var(--color-border)] rounded-lg px-3 py-2 hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)] transition-colors"
            >
              <Settings size={14} />
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] border border-[var(--color-border)] rounded-lg px-3 py-2 hover:text-red-500 hover:border-red-300 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>

        {/* Edit Profile Drawer */}
        {showEditProfile && (
          <div className="mb-8 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)]">
            <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[var(--color-muted)]">
              Edit Profile
            </h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--color-muted)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2 text-[var(--color-muted)]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={displayUser.email}
                    disabled
                    className="input opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-primary" disabled={updating}>
                  {updating ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg text-[var(--color-muted)] hover:text-[var(--color-charcoal)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total orders', value: orders.length },
            { label: 'Total spent', value: formatPrice(totalSpent) },
            { label: 'Member since', value: memberSince },
          ].map(({ label, value }) => (
            <div key={label} className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-surface)]">
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1.5">{label}</p>
              <p className="text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Orders
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(['all', 'processing', 'pending', 'delivered', 'cancelled'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize font-medium ${
                  filter === f
                    ? 'bg-[var(--color-charcoal)] text-white border-[var(--color-charcoal)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-charcoal)] hover:text-[var(--color-charcoal)]'
                }`}
              >
                {f === 'all' ? `All (${filterCounts.all})` : `${f} (${filterCounts[f]})`}
              </button>
            ))}
          </div>

          {/* Order List */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)]">
              <Package size={36} className="mb-4 opacity-30" />
              <p className="text-sm mb-3">
                {filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`}
              </p>
              {filter === 'all' && (
                <a
                  href="/products"
                  className="flex items-center gap-1.5 text-sm text-[var(--color-charcoal)] font-medium hover:underline"
                >
                  <ShoppingBag size={14} />
                  Start shopping
                </a>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrder === order.id
                return (
                  <div
                    key={order.id}
                    className="border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-charcoal)] transition-colors"
                  >
                    {/* Order Row */}
                    <button
                      className="w-full flex items-center justify-between p-4 text-left"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] flex-shrink-0">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order #{order.id}</p>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                            {' · '}
                            {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatPrice(order.total_amount ?? order.subtotal)}
                          </p>
                          <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={15} className="text-[var(--color-muted)]" /> : <ChevronDown size={15} className="text-[var(--color-muted)]" />}
                      </div>
                    </button>

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="border-t border-[var(--color-border)] px-4 pb-4 pt-3 bg-[var(--color-surface)]">
                        {/* Items */}
                        {order.items && order.items.length > 0 ? (
                          <div className="flex flex-col gap-2 mb-4">
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-[var(--color-border)] flex-shrink-0"
                                  />
                                )}
                                {!item.image && (
                                  <div className="w-10 h-10 rounded-lg border border-[var(--color-border)] bg-gray-100 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.name ?? item.product_name ?? 'Product'}</p>
                                  <p className="text-xs text-[var(--color-muted)]">
                                    Qty: {item.quantity ?? 1}
                                    {item.size ? ` · Size: ${item.size}` : ''}
                                    {item.color ? ` · ${item.color}` : ''}
                                  </p>
                                </div>
                                <p className="text-sm font-medium flex-shrink-0">
                                  {formatPrice(item.price ?? item.unit_price)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--color-muted)] mb-4">No item details available.</p>
                        )}

                        {/* Order Meta + Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                          <div className="text-xs text-[var(--color-muted)] space-y-0.5">
                            {order.shipping_address_id && (
                              <p>Ship to: {typeof order.shipping_address_id === 'string' ? order.shipping_address_id : order.shipping_address_id?.city ?? ''}</p>
                            )}
                            {order.payment_method && (
                              <p>Payment: {order.payment_method}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2"> 
                            {order.status?.toLowerCase() === 'delivered' && (
                              <button
                                onClick={() => handleReorder(order)}
                                className="flex items-center gap-1.5 text-xs border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)] transition-colors"
                              >
                                <RotateCcw size={12} />
                                Reorder
                              </button>
                            )}
                            {order.tracking_url && (
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)] transition-colors"
                              >
                                <ExternalLink size={12} />
                                Track
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}