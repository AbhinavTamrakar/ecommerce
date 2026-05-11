"use client";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { CartItem } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [checkingOut, setCheckingOut] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${BASE}/api/checkout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ payment_method: 'cash_on_delivery' })
      });
      if (!res.ok) throw new Error("Failed");
      toast.success('Order placed successfully!');
      clearCart();
      router.push('/account');
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  {/*if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={60} className="mx-auto text-gray-200 mb-6" />
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Please login to view your cart
          </h1>
          <p className="text-[var(--color-muted)] mb-8 py-3">Sign in to start shopping</p>
          <Link href="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }*/}

  const items: CartItem[] = cart?.items || [];

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

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen pt-8 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
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
              const img =
                item.product?.thumbnail ||
                item.product?.image ||
                item.product?.images?.[0]?.url;
              return (
                <div
                  key={item.id}
                  className="flex gap-5 bg-white p-4 animate-fade-up opacity-0"
                  style={{ animationFillMode: "forwards" }}
                >
                  <div className="relative w-24 h-32 shrink-0 bg-gray-50">
                    {img ? (
                      <Image
                        src={getImageUrl(img)}
                        alt={item.product?.name || ""}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-sm mb-1">
                        {item.product?.name}
                      </h3>
                      <p className="text-xs text-[var(--color-muted)]">
                        {item.product?.category?.name}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mt-3 sm:mt-0">
                      {/* Quantity controls */}
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
                        <span className="px-3 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="px-2 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <span className="text-sm font-semibold">
                          {formatPrice(
                            (item.price || item.product?.price || 0) *
                              item.quantity
                          )}
                        </span>
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
              <h2
                className="text-lg font-bold mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Order Summary
              </h2>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkingOut ? 'Placing order…' : 'Proceed to Checkout'}
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
  );
}