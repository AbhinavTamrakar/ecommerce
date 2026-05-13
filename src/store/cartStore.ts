import { create } from "zustand";
import { Cart, CartItem } from "@/types";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const BASE = '';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number, product_variant_id?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

function getToken(): string | null {
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  itemCount: 0,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const token = getToken();
      if (!token) throw new Error("No token");
      const res = await fetch(`${BASE}/api/cart`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      const cart: Cart = data.data || data;
      const count = cart?.items_count ?? cart?.items?.length ?? 0;
      set({ cart, itemCount: count });
    } catch {
      set({ cart: null, itemCount: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity, product_variant_id) => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login?redirect=/cart';
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          ...(product_variant_id ? { product_variant_id: product_variant_id } : {})
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const message = errData?.message || "Failed to add item.";
        toast.error(message);
        return;
      }
      toast.success("Added to cart!");
      await get().fetchCart();
    } catch {
      toast.error("Failed to add item. Please try again.");
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/api/cart/items/{productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      if (!res.ok) throw new Error("Failed to update");
      await get().fetchCart();
    } catch {
      toast.error("Failed to update item.");
    }
  },

  removeItem: async (productId) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/api/cart/items/${productId}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Item removed.");
      await get().fetchCart();
    } catch {
      toast.error("Failed to remove item.");
    }
  },

  // ✅ Fixed: DELETE /api/cart (not /api/cart/items)
  clearCart: async () => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/api/cart`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to clear");
      set({ cart: null, itemCount: 0 });
      toast.success("Cart cleared.");
    } catch {
      toast.error("Failed to clear cart.");
    }
  },
}));