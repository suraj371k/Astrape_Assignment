import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { backendUrl } from "../utils/backendUrl";

// Axios instance
const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

export const useCartStore = create(
  devtools(
    (set, get) => ({
      cart: null,
      count: 0,
      loading: false,
      error: null,

      // Internal helpers
      setLoading: (loading) => set({ loading }),
      clearError: () => set({ error: null }),

      // Fetch full cart (creates one if not exists server-side)
      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/api/cart");
          if (res.data?.success) {
            set({ cart: res.data.cart, loading: false });
          } else {
            set({ loading: false, error: "Failed to fetch cart" });
          }
          return res.data;
        } catch (err) {
          set({ loading: false, error: err.response?.data?.message || "Failed to fetch cart" });
          throw err;
        }
      },

      // Fetch item count only
      fetchCartCount: async () => {
        try {
          const res = await api.get("/api/cart/count");
          if (res.data?.success) {
            set({ count: res.data.count });
            return res.data.count;
          }
          return 0;
        } catch (err) {
          // keep silent failure for count
          return 0;
        }
      },

      // Add item to cart
      addToCart: async (productId, quantity = 1) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/api/cart/add", { productId, quantity });
          if (res.data?.success) {
            set({ cart: res.data.cart, loading: false });
            // update count from cart totals
            set({ count: res.data.cart?.totalItems || 0 });
            return res.data.cart;
          } else {
            set({ loading: false, error: res.data?.message || "Failed to add to cart" });
          }
        } catch (err) {
          set({ loading: false, error: err.response?.data?.message || "Failed to add to cart" });
          throw err;
        }
      },

      // Update item quantity (set absolute quantity; 0 removes item)
      updateCartItem: async (productId, quantity) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put("/api/cart/update", { productId, quantity });
          if (res.data?.success) {
            set({ cart: res.data.cart, loading: false });
            set({ count: res.data.cart?.totalItems || 0 });
            return res.data.cart;
          } else {
            set({ loading: false, error: res.data?.message || "Failed to update cart" });
          }
        } catch (err) {
          set({ loading: false, error: err.response?.data?.message || "Failed to update cart" });
          throw err;
        }
      },

      // Remove item from cart
      removeFromCart: async (productId) => {
        set({ loading: true, error: null });
        try {
          const res = await api.delete(`/api/cart/remove/${productId}`);
          if (res.data?.success) {
            set({ cart: res.data.cart, loading: false });
            set({ count: res.data.cart?.totalItems || 0 });
            return res.data.cart;
          } else {
            set({ loading: false, error: res.data?.message || "Failed to remove item" });
          }
        } catch (err) {
          set({ loading: false, error: err.response?.data?.message || "Failed to remove item" });
          throw err;
        }
      },

      // Clear entire cart
      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.delete("/api/cart/clear");
          if (res.data?.success) {
            set({ cart: res.data.cart, count: res.data.cart?.totalItems || 0, loading: false });
            return res.data.cart;
          } else {
            set({ loading: false, error: res.data?.message || "Failed to clear cart" });
          }
        } catch (err) {
          set({ loading: false, error: err.response?.data?.message || "Failed to clear cart" });
          throw err;
        }
      },
    }),
    { name: "cart-store" }
  )
);


