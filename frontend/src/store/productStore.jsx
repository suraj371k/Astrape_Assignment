// store/productStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { backendUrl } from "../utils/backendUrl";
// Create axios instance with default config
const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

export const useProductStore = create(
  devtools(
    (set, get) => ({
      products: [],
      currentProduct: null,
      featuredProducts: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        pageSize: 10,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      },
      filters: {
        category: null,
        priceRange: { min: null, max: null },
        search: null,
        isFeatured: null,
        inStock: null,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      categories: [
        "electronics",
        "clothing",
        "books",
        "home",
        "sports",
        "accessories",
      ],
      priceRange: { minPrice: 0, maxPrice: 1000, avgPrice: 0 },
      loading: false,
      error: null,

      fetchProducts: async (queryParams = {}) => {
        set({ loading: true, error: null });

        try {
          const params = new URLSearchParams();

          // Add all query parameters
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              params.append(key, value);
            }
          });

          const response = await api.get(
            `/api/products/all?${params.toString()}`
          );

          if (response.data.success) {
            set({
              products: response.data.data.products,
              pagination: response.data.data.pagination,
              filters: response.data.data.filters,
              loading: false,
            });
            return response.data.data;
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to fetch products",
            loading: false,
          });
          throw error;
        }
      },

      // Get featured products
      fetchFeaturedProducts: async (limit = 6) => {
        set({ loading: true, error: null });

        try {
          const response = await api.get(
            `/api/products/featured?limit=${limit}`
          );

          if (response.data.success) {
            set({
              featuredProducts: response.data.data.products,
              loading: false,
            });
            return response.data.data.products;
          }
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch featured products",
            loading: false,
          });
          throw error;
        }
      },

      // Get all products posted by a specific user
      fetchUserProducts: async () => {
        set({ loading: true, error: null });

        try {
          const response = await api.get(`/api/products/user`);
          if (response.data.success) {
            set({
              userProducts: response.data.data.products,
              loading: false,
            });
            return response.data.data.products;
          }
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch user's products",
            loading: false,
          });
          throw error;
        }
      },

      // Get single product by ID
      fetchProductById: async (id) => {
        set({ loading: true, error: null });

        try {
          const response = await api.get(`/api/products/${id}`);
          const product =
            response.data?.product || response.data?.data?.product;
          if (product) {
            set({ currentProduct: product, loading: false });
            return product;
          } else {
            set({
              error: "Product not found",
              loading: false,
              currentProduct: null,
            });
            return null;
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Product not found",
            loading: false,
          });
          throw error;
        }
      },

      // Get price range
      fetchPriceRange: async () => {
        // No backend endpoint; derive simple defaults
        const products = get().products || [];
        if (products.length === 0)
          return { minPrice: 0, maxPrice: 1000, avgPrice: 0 };
        const prices = products.map((p) => Number(p.price) || 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const range = {
          minPrice,
          maxPrice,
          avgPrice: Math.round(avgPrice * 100) / 100,
        };
        set({ priceRange: range });
        return range;
      },

      // Create product (admin only)
      createProduct: async (productData) => {
        set({ loading: true, error: null });

        try {
          const formData = new FormData();

          // Add text fields
          Object.entries(productData).forEach(([key, value]) => {
            if (key !== "images" && value !== null && value !== undefined) {
              formData.append(key, value);
            }
          });

          // ✅ Convert FileList → Array before looping
          if (productData.images && productData.images.length > 0) {
            Array.from(productData.images).forEach((file) => {
              formData.append("images", file);
            });
          }

          const response = await api.post("/api/products/create", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.data.success || response.data.product) {
            set({ loading: false });
            return response.data;
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to create product",
            loading: false,
          });
          throw error;
        }
      },

      // Update product (admin only)
      updateProduct: async (id, productData) => {
        set({ loading: true, error: null });

        try {
          const formData = new FormData();

          Object.entries(productData).forEach(([key, value]) => {
            if (key !== "images" && value !== null && value !== undefined) {
              formData.append(key, value);
            }
          });

          if (productData.images && productData.images.length > 0) {
            productData.images.forEach((file) => {
              formData.append("images", file);
            });
          }

          const response = await api.put(`/api/products/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.data.success) {
            set({ loading: false });
            return response.data;
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to update product",
            loading: false,
          });
          throw error;
        }
      },

      // Delete product (admin only)
      deleteProduct: async (id) => {
        set({ loading: true, error: null });

        try {
          const response = await api.delete(`/api/products/${id}`);

          if (response.data.success) {
            // Remove from local state
            set((state) => ({
              products: state.products.filter((product) => product._id !== id),
              featuredProducts: state.featuredProducts.filter(
                (product) => product._id !== id
              ),
              loading: false,
            }));
            return response.data;
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to delete product",
            loading: false,
          });
          throw error;
        }
      },

      // Set filters
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      // Clear filters
      clearFilters: () => {
        set({
          filters: {
            category: null,
            priceRange: { min: null, max: null },
            search: null,
            isFeatured: null,
            inStock: null,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
        });
      },

      // Set current product
      setCurrentProduct: (product) => {
        set({ currentProduct: product });
      },

      // Clear current product
      clearCurrentProduct: () => {
        set({ currentProduct: null });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ loading });
      },

      // Update pagination
      updatePagination: (page) => {
        set((state) => ({
          pagination: { ...state.pagination, currentPage: page },
        }));
      },

      // Reset store
      reset: () => {
        set({
          products: [],
          currentProduct: null,
          featuredProducts: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalProducts: 0,
            pageSize: 10,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null,
          },
          filters: {
            category: null,
            priceRange: { min: null, max: null },
            search: null,
            isFeatured: null,
            inStock: null,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: "product-store", // Store name for devtools
    }
  )
);
