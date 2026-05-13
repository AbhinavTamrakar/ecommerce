"use client";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, X, MapPin, ChevronRight, Truck, CreditCard, Banknote } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API = 'http://194.146.12.71:8008'

interface SavedAddress {
  id: number; label?: string; full_name: string; phone: string;
  address_line1: string; address_line2?: string; city: string;
  state: string; country?: string; postal_code?: string; is_default?: boolean;
}

interface PaymentMethod {
  id: number; name: string; code: string; providers: string; is_active: boolean;
}

// ── Checkout Modal ──────────────────────────────────────────────────────────
function CheckoutModal({ onClose, cart, items, total }: {
  onClose: () => void;
  cart: any;
  items: any[];
  total: number;
}) {
  const router = useRouter()
  const { clearCart } = useCartStore()
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [selectedPaymentCode, setSelectedPaymentCode] = useState<string>('cod')
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: "", full_name: "", phone: "", address_line1: "",
    address_line2: "", city: "", state: "", country: "Nepal", postal_code: "",
  })

  const token = useAuthStore.getState().token ||
    JSON.parse(localStorage.getItem('auth') || '{}')?.state?.token

  useEffect(() => {
    fetch("/api/addresses", {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const list: SavedAddress[] = Array.isArray(data) ? data : data?.data || []
        setAddresses(list)
        const def = list.find(a => a.is_default) || list[0]
        if (def) setSelectedAddressId(def.id)
        if (list.length === 0) setShowNewForm(true)
      })
      .catch(() => setShowNewForm(true))
      .finally(() => setLoadingAddresses(false))

    fetch("/api/public/payment-methods", { headers: { Accept: "application/json" } })
      .then(r => r.json())
      .then(data => {
        const list: PaymentMethod[] = (data?.data || []).filter((m: PaymentMethod) => m.is_active)
        setPaymentMethods(list)
        if (list.length > 0) setSelectedPaymentCode(list[0].code)
      })
      .catch(() => {})
  }, [])

  const handleSaveAddress = async () => {
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state) {
      toast.error("Please fill all required fields."); return
    }
    setSavingAddress(true)
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          label: newAddress.label || null, full_name: newAddress.full_name,
          phone: newAddress.phone, address_line1: newAddress.address_line1,
          address_line2: newAddress.address_line2 || null, city: newAddress.city,
          state: newAddress.state, country: newAddress.country || null,
          postal_code: newAddress.postal_code || null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).message || "Failed")
      const data = await res.json()
      const saved: SavedAddress = data?.data || data
      setAddresses(prev => [...prev, saved])
      setSelectedAddressId(saved.id)
      setShowNewForm(false)
      toast.success("Address saved!")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save address.")
    } finally {
      setSavingAddress(false)
    }
  }

  const buildOrderItems = () =>
    items.map(item => ({
      product_id: item.product_id,
      product_variant_id: item.product_variant_id || null,
      quantity: item.quantity,
      price_at_purchase: parseFloat(item.price),
    }))

  const handleCOD = async () => {
    if (!selectedAddressId) { toast.error("Please select a shipping address."); return }
    setPlacing(true)
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shipping_address_id: selectedAddressId,
          payment_method: 'cod',
          total_amount: total,
          status: 'pending',
          payment_status: 'pending',
          items: buildOrderItems(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to place order")
      toast.success("Order placed successfully!")
      clearCart()
      router.push('/account')
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order.")
    } finally {
      setPlacing(false)
    }
  }

  const handlePayPal = async () => {
    if (!selectedAddressId) { toast.error("Please select a shipping address."); return }
    setPlacing(true)
    try {
      // Step 1: Create PayPal order
      const res = await fetch(`${API}/api/paypal/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shipping_address_id: selectedAddressId,
          items: items.map(item => ({
            product_id: item.product_id,
            product_variant_id: item.product_variant_id || null,
            quantity: item.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to create PayPal order")

      // Step 2: Get PayPal approval URL — API returns it inside links[] with rel:"approve"
      const links = data?.data?.links || data?.links || []
      const approvalUrl = links.find((l: any) => l.rel === 'approve')?.href
        || data?.data?.approval_url || data?.approval_url
      const orderId = data?.data?.order_id || data?.order_id
      const paypalOrderId = data?.data?.paypal_order_id || data?.paypal_order_id

      if (approvalUrl) {
        // Store order info for capture after redirect
        sessionStorage.setItem('paypal_order_id', orderId)
        sessionStorage.setItem('paypal_paypal_order_id', paypalOrderId)
        window.location.href = approvalUrl
      } else {
        throw new Error("No PayPal approval URL received")
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate PayPal payment.")
      setPlacing(false)
    }
  }

  const handlePlaceOrder = () => {
    if (selectedPaymentCode === 'cod') {
      handleCOD()
    } else if (selectedPaymentCode === 'paypal') {
      handlePayPal()
    }
  }

  const canPlaceOrder = !!selectedAddressId && !showNewForm

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-hidden sm:rounded-2xl shadow-2xl flex flex-col rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Checkout</h2>
            <p className="text-xs text-gray-400 mt-0.5">Complete your order</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Shipping Address */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <MapPin size={12} /> Shipping Address
            </h3>
            {loadingAddresses ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <>
                {addresses.length > 0 && !showNewForm && (
                  <div className="space-y-2 mb-3">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr.id ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-300"
                      }`}>
                        <input type="radio" name="address" checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)} className="mt-0.5 accent-gray-900" />
                        <div className="text-sm flex-1">
                          {addr.label && (
                            <span className="text-[10px] uppercase tracking-wider bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium mr-1.5">{addr.label}</span>
                          )}
                          <span className="font-medium text-gray-900">{addr.full_name}</span>
                          <p className="text-gray-500 text-xs mt-0.5">{addr.address_line1}, {addr.city}, {addr.state}</p>
                          <p className="text-gray-400 text-xs">{addr.phone}</p>
                        </div>
                      </label>
                    ))}
                    <button onClick={() => setShowNewForm(true)}
                      className="text-xs text-orange-500 hover:underline mt-1">
                      + Add new address
                    </button>
                  </div>
                )}

                {showNewForm && (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Label", key: "label", placeholder: "Home, Office" },
                        { label: "Full Name *", key: "full_name", placeholder: "John Doe" },
                        { label: "Phone *", key: "phone", placeholder: "98XXXXXXXX" },
                        { label: "City *", key: "city", placeholder: "Kathmandu" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 block">{f.label}</label>
                          <input
                            value={newAddress[f.key as keyof typeof newAddress]}
                            onChange={e => setNewAddress({ ...newAddress, [f.key]: e.target.value })}
                            placeholder={f.placeholder}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 block">Street Address *</label>
                      <input
                        value={newAddress.address_line1}
                        onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                        placeholder="House No., Street Name"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 block">State *</label>
                        <input
                          value={newAddress.state}
                          onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="Bagmati"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 block">Country</label>
                        <input
                          value={newAddress.country}
                          onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
                          placeholder="Nepal"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveAddress} disabled={savingAddress}
                        className="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50">
                        {savingAddress ? "Saving..." : "Save Address"}
                      </button>
                      {addresses.length > 0 && (
                        <button onClick={() => setShowNewForm(false)}
                          className="px-4 text-sm border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <CreditCard size={12} /> Payment Method
            </h3>
            <div className="space-y-2">
              {paymentMethods.length === 0 ? (
                // Fallback if API doesn't load
                <>
                  {[
                    { code: 'cod', name: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: <Banknote size={18} /> },
                    { code: 'paypal', name: 'PayPal', desc: 'Pay securely with PayPal', icon: <CreditCard size={18} /> },
                  ].map(pm => (
                    <label key={pm.code} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPaymentCode === pm.code ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-300"
                    }`}>
                      <input type="radio" name="payment" checked={selectedPaymentCode === pm.code}
                        onChange={() => setSelectedPaymentCode(pm.code)} className="accent-gray-900" />
                      <div className="text-gray-500">{pm.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pm.name}</p>
                        <p className="text-xs text-gray-400">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </>
              ) : (
                paymentMethods.map(pm => (
                  <label key={pm.code} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPaymentCode === pm.code ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-300"
                  }`}>
                    <input type="radio" name="payment" checked={selectedPaymentCode === pm.code}
                      onChange={() => setSelectedPaymentCode(pm.code)} className="accent-gray-900" />
                    <div className="text-gray-500">
                      {pm.code === 'paypal' ? <CreditCard size={18} /> : <Banknote size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pm.name}</p>
                      <p className="text-xs text-gray-400">
                        {pm.code === 'paypal' ? 'Pay securely via PayPal' : 'Pay when your order arrives'}
                      </p>
                    </div>
                    {pm.code === 'paypal' && (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-medium">Secure</span>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Order Summary</h3>
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate mr-2">{item.product?.name} × {item.quantity}</span>
                <span className="text-gray-900 font-medium shrink-0">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {selectedPaymentCode === 'paypal' && (
            <p className="text-xs text-gray-400 text-center">
              You will be redirected to PayPal to complete your payment securely.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder || placing}
            className="w-full bg-[#f97316] hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {placing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {selectedPaymentCode === 'paypal' ? 'Redirecting to PayPal...' : 'Placing Order...'}
              </span>
            ) : (
              <>
                {selectedPaymentCode === 'paypal' ? 'Pay with PayPal' : 'Place Order'}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Cart Page ───────────────────────────────────────────────────────────────
export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart, fetchCart } = useCartStore()
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => { fetchCart() }, [])

  const items: any[] = cart?.items || []
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal || item.price * item.quantity || 0), 0)
  const shipping = subtotal >= 75 ? 0 : 9.99
  const total = subtotal + shipping

  if (!items.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
        <div className="text-center px-4">
          <ShoppingBag size={60} className="mx-auto text-gray-200 mb-6" />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Your cart is empty</h1>
          <p className="text-[var(--color-muted)] mb-8">Discover our latest collection</p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          cart={cart}
          items={items}
          total={total}
        />
      )}

      <div className="min-h-screen bg-[var(--color-cream)] pt-8 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                Shopping Cart
              </h1>
              <p className="text-gray-400 text-sm mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            </div>
            <button onClick={clearCart}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg bg-white">
              <Trash2 size={13} /> Clear all
            </button>
          </div>

          {/* Shipping progress */}
          {shipping > 0 ? (
            <div className="mb-6 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <Truck size={16} className="text-orange-400 shrink-0" />
              <span className="text-sm text-orange-700 flex-1">
                Add <strong>{formatPrice(75 - subtotal)}</strong> more for free shipping
              </span>
              <div className="w-24 h-1.5 bg-orange-100 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${Math.min((subtotal / 75) * 100, 100)}%` }} />
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-700">
              <Truck size={16} className="text-green-500" /> You qualify for <strong>free shipping!</strong>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(item => {
                const img = item.product?.primary_image?.url || item.product?.thumbnail || null
                return (
                  <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                      {img
                        ? <Image src={img} alt={item.product?.name || ""} fill className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={22} className="text-gray-200" /></div>
                      }
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 leading-snug">{item.product?.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{item.product?.category?.name}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500">
                            <Minus size={11} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                          <button onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500">
                            <Plus size={11} />
                          </button>
                        </div>
                        <p className="text-base font-bold text-gray-900">{formatPrice(parseFloat(item.subtotal || item.price * item.quantity))}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-28">
                <h2 className="text-lg font-bold text-gray-900 mb-5" style={{ fontFamily: "var(--font-display)" }}>
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium text-gray-900"}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900 text-base">Total</span>
                    <span className="font-bold text-gray-900 text-base">{formatPrice(total)}</span>
                  </div>
                </div>

                <button onClick={() => setShowCheckout(true)}
                  className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  Proceed to Checkout <ChevronRight size={16} />
                </button>

                <Link href="/products"
                  className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-4 transition-colors">
                  ← Continue Shopping
                </Link>

                <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-2">
                  {[["🔒", "Secure Checkout"], ["↩️", "Easy Returns"], ["🚚", "Fast Delivery"], ["✅", "Quality Guarantee"]].map(([icon, text]) => (
                    <div key={text} className="text-[11px] text-gray-400 flex items-center gap-1 justify-center">{icon} {text}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}