import { create } from "zustand";
import { Cart, CartItem } from "@/types";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  itemCount: 0,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No token");
      const res = await fetch(`${BASE}/api/cart`, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      const cart = data.data || data;
      const items: CartItem[] = cart?.items || cart || [];
      const count = items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
      set({ cart, itemCount: count });
    } catch {
      // Not logged in — cart empty
      set({ cart: null, itemCount: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/cart'
      return
    }
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("No token");
      const res = await fetch(`${BASE}/api/cart`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity })
      });
      if (!res.ok) throw new Error("Failed to add");
      toast.success("Added to cart!");
      await get().fetchCart();
    } catch {
      toast.error("Failed to add item. Please login first.");
    }
  },

  updateItem: async (id, quantity) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${BASE}/api/cart/${id}`, {
        method: "PUT",
        credentials: "include",
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

  removeItem: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${BASE}/api/cart/${id}`, {
        method: "DELETE",
        credentials: "include",
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

  clearCart: async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${BASE}/api/cart`, {
        method: "DELETE",
        credentials: "include",
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
