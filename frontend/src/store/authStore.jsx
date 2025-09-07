// store/authStore.js
import { create } from "zustand";
import axios from "axios";
import { backendUrl } from "../utils/backendUrl";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth state on app load
  initializeAuth: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(`${backendUrl}/api/user/profile`, {
        withCredentials: true,
      });
      set({ user: res.data, loading: false });
    } catch (error) {
      // User is not authenticated
      set({ user: null, loading: false });
    }
  },

  registerUser: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${backendUrl}/api/user/register`, data, {
        withCredentials: true,
      });
      // Don't set user here - just clear loading and error
      set({ loading: false, error: null });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error(
        "Error in register user store:",
        error?.response?.data?.message || error?.message
      );
      set({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
      return { success: false, error: error?.response?.data?.message || error?.message };
    }
  },

  loginUser: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${backendUrl}/api/user/login`, data, {
        withCredentials: true,
      });
      set({ user: res.data.user, loading: false });
    } catch (error) {
      console.error(
        "Error in login user store:",
        error?.response?.data?.message || error?.message
      );
      set({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
    }
  },

  logoutUser: async () => {
    try {
      set({ loading: true, error: null });
      await axios.post(
        `${backendUrl}/api/user/logout`,
        {},
        { withCredentials: true }
      );
      set({ user: null, loading: false });
    } catch (error) {
      console.error(
        "Error in logout user store:",
        error?.response?.data?.message || error?.message
      );
      set({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
    }
  },

  getProfileUser: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${backendUrl}/api/user/profile`, {
        withCredentials: true,
      });
      set({ user: res.data, loading: false });
    } catch (error) {
      console.error(
        "Error in get profile user store:",
        error?.response?.data?.message || error?.message
      );
      set({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
    }
  },
}));
