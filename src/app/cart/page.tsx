"use client";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, X, MapPin, CreditCard } from "lucide-react";
import { CartItem } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SavedAddress {
  id: number;
  label?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country?: string;
  postal_code?: string;
  is_default?: boolean;
}

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  providers: string;
  is_active: boolean;
}

// ── Checkout Modal ─────────────────────────────────────────────────────────────
function CheckoutModal({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void;
  onConfirm: (addressId: number, paymentMethodId: number) => void;
  isLoading: boolean;
}) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: "",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    country: "Nepal",
    postal_code: "",
  });

  // Fetch saved addresses
  useEffect(() => {
    const token = useAuthStore.getState().token;
    fetch("/api/addresses", {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list: SavedAddress[] = data?.data || data || [];
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddressId(def.id);
        if (list.length === 0) setShowNewForm(true);
      })
      .catch(() => setShowNewForm(true))
      .finally(() => setLoadingAddresses(false));
  }, []);

  // ✅ Fetch payment methods from backend
  useEffect(() => {
    fetch("/api/public/payment-methods", {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        const list: PaymentMethod[] = (data?.data || []).filter((m: PaymentMethod) => m.is_active);
        setPaymentMethods(list);
        if (list.length > 0) setSelectedPaymentMethodId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingPayments(false));
  }, []);

  const handleSaveAddress = async () => {
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state) {
      toast.error("Please fill all required fields (marked *).");
      return;
    }
    setSavingAddress(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: newAddress.label || null,
          full_name: newAddress.full_name,
          phone: newAddress.phone,
          address_line1: newAddress.address_line1,
          address_line2: newAddress.address_line2 || null,
          city: newAddress.city,
          state: newAddress.state,
          country: newAddress.country || null,
          postal_code: newAddress.postal_code || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to save address");
      }
      const data = await res.json();
      const saved: SavedAddress = data?.data || data;
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setShowNewForm(false);
      toast.success("Address saved!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const addressFields: { label: string; key: keyof typeof newAddress; placeholder: string; required?: boolean }[] = [
    { label: "Address Label", key: "label", placeholder: "e.g. Home, Office" },
    { label: "Full Name", key: "full_name", placeholder: "John Doe", required: true },
    { label: "Phone", key: "phone", placeholder: "98XXXXXXXX", required: true },
    { label: "Street Address", key: "address_line1", placeholder: "House No., Street Name", required: true },
    { label: "Address Line 2", key: "address_line2", placeholder: "Landmark, Area (optional)" },
    { label: "City", key: "city", placeholder: "Kathmandu", required: true },
    { label: "State", key: "state", placeholder: "Bagmati", required: true },
    { label: "Country", key: "country", placeholder: "Nepal" },
    { label: "Postal Code", key: "postal_code", placeholder: "00000" },
  ];

  const canPlaceOrder = !!selectedAddressId && !!selectedPaymentMethodId && !showNewForm;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Checkout
          </h2>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-charcoal)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Shipping Address */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} /> Shipping Address
            </h3>

            {loadingAddresses ? (
              <p className="text-sm text-[var(--color-muted)]">Loading addresses…</p>
            ) : (
              <>
                {addresses.length > 0 && !showNewForm && (
                  <div className="space-y-2 mb-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                          selectedAddressId === addr.id
                            ? "border-[var(--color-charcoal)] bg-gray-50"
                            : "border-[var(--color-border)] hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-0.5"
                        />
                        <div className="text-sm">
                          {addr.label && (
                            <p className="text-xs uppercase tracking-wider text-[var(--color-accent)] mb-0.5">
                              {addr.label}
                            </p>
                          )}
                          <p className="font-medium">{addr.full_name}</p>
                          <p className="text-[var(--color-muted)]">{addr.phone}</p>
                          <p className="text-[var(--color-muted)]">
                            {addr.address_line1}
                            {addr.address_line2 ? `, ${addr.address_line2}` : ""}, {addr.city},{" "}
                            {addr.state}
                            {addr.country ? `, ${addr.country}` : ""}
                          </p>
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => setShowNewForm(true)}
                      className="text-xs text-[var(--color-accent)] underline underline-offset-2 mt-1"
                    >
                      + Add a new address
                    </button>
                  </div>
                )}

                {showNewForm && (
                  <div className="space-y-3 border border-[var(--color-border)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                      New Address
                    </p>
                    {addressFields.map(({ label, key, placeholder, required }) => (
                      <div key={key}>
                        <label className="text-xs text-[var(--color-muted)] block mb-1">
                          {label} {required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          placeholder={placeholder}
                          value={newAddress[key]}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-charcoal)]"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
                      >
                        {savingAddress ? "Saving…" : "Save Address"}
                      </button>
                      {addresses.length > 0 && (
                        <button
                          onClick={() => setShowNewForm(false)}
                          className="btn-outline text-sm px-4 py-2"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ✅ Payment Method — fetched from backend, sends id */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={14} /> Payment Method
            </h3>
            {loadingPayments ? (
              <p className="text-sm text-[var(--color-muted)]">Loading payment methods…</p>
            ) : paymentMethods.length === 0 ? (
              <p className="text-sm text-red-500">No payment methods available.</p>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                      selectedPaymentMethodId === method.id
                        ? "border-[var(--color-charcoal)] bg-gray-50"
                        : "border-[var(--color-border)] hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethodId === method.id}
                      onChange={() => setSelectedPaymentMethodId(method.id)}
                    />
                    <div>
                      <span className="text-sm font-medium">{method.name}</span>
                      <span className="text-xs text-[var(--color-muted)] ml-2">
                        via {method.providers}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--color-border)]">
          <button
            onClick={() => {
              if (selectedAddressId && selectedPaymentMethodId) {
                onConfirm(selectedAddressId, selectedPaymentMethodId);
              }
            }}
            disabled={isLoading || !canPlaceOrder}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Placing Order…" : "Place Order"}
          </button>
          {!selectedAddressId && !showNewForm && (
            <p className="text-xs text-red-500 text-center mt-2">
              Please select a shipping address.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Cart Page ──────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const router = useRouter();

  const items: CartItem[] = cart?.items || [];

  // ✅ Now receives paymentMethodId (integer) instead of string
  const handleConfirmOrder = async (addressId: number, paymentMethodId: number) => {
    setCheckingOut(true);
    try {
      const token = useAuthStore.getState().token;

      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id ?? null,
        quantity: item.quantity,
        price_at_purchase: parseFloat(item.price),
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          total_amount: cart?.total ?? 0,
          status: "pending",
          payment_status: "unpaid",
          payment_method_id: paymentMethodId, // ✅ integer id, not string
          shipping_address_id: addressId,
          items: orderItems,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to place order.");
      }

      toast.success("Order placed successfully!");
      setShowCheckout(false);
      await clearCart();
      router.push("/account");
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={60} className="mx-auto text-gray-200 mb-6" />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Your cart is empty
          </h1>
          <p className="text-[var(--color-muted)] mb-8 py-3">Discover our latest collection</p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;

  return (
    <>
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onConfirm={handleConfirmOrder}
          isLoading={checkingOut}
        />
      )}

      <div className="min-h-screen pt-8 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Shopping Cart
            </h1>
            <button
              onClick={clearCart}
              className="text-sm text-[var(--color-muted)] hover:text-red-500 transition-colors underline underline-offset-2"
            >
              Clear cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => {
                const img = item.product?.primary_image || null;
                return (
                  <div
                    key={item.id}
                    className="flex gap-5 bg-white p-4 animate-fade-up opacity-0"
                    style={{ animationFillMode: "forwards" }}
                  >
                    <div className="relative w-24 h-32 shrink-0 bg-gray-50">
                      {img ? (
                        <Image src={img} alt={item.product?.name || ""} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ShoppingBag size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-sm mb-1">{item.product?.name}</h3>
                        {item.variant_options?.length > 0 && (
                          <p className="text-xs text-[var(--color-muted)]">
                            {item.variant_options.map((o) => o.value).join(" / ")}
                          </p>
                        )}
                        {Number(item.discount_percentage) > 0 && (
                          <p className="text-xs text-green-600 mt-0.5">
                            {Number(item.discount_percentage)}% off applied
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mt-3 sm:mt-0">
                        <div className="flex items-center border border-[var(--color-border)] w-fit">
                          <button
                            onClick={() =>
                              item.quantity > 1
                                ? updateItem(item.id, item.quantity - 1)
                                : removeItem(item.id)
                            }
                            className="px-2 py-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="px-2 py-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <span className="text-sm font-semibold">{formatPrice(item.subtotal)}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[var(--color-muted)] hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white p-6 sticky top-28">
                <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>
                  <div className="border-t border-[var(--color-border)] pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(cart?.total ?? subtotal + shipping)}</span>
                  </div>
                </div>

                <button onClick={() => setShowCheckout(true)} className="btn-primary w-full">
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  className="block text-center text-xs text-[var(--color-muted)] mt-4 hover:text-[var(--color-charcoal)] transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}