import React, { useEffect, Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/authStore";
import Protected from "./components/Protected";
import LoadingSpinner from "./components/LoadingSpinner"; // You'll need to create this component

// Lazy load components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Cart = lazy(() => import("./pages/Cart"));
const Product = lazy(() => import("./pages/Product"));
const CreateProduct = lazy(() => import("./pages/CreateProduct"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const App = () => {
  const { initializeAuth, user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route
            path="/"
            element={
              user && user.role === "admin" ? <Dashboard /> : <Product />
            }
          />
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Login />
              </Suspense>
            } 
          />
          <Route 
            path="/register" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Register />
              </Suspense>
            } 
          />
          <Route 
            path="/products" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Product />
              </Suspense>
            } 
          />
          <Route
            path="/products/:id"
            element={
              <Protected>
                <Suspense fallback={<LoadingSpinner />}>
                  <ProductDetailPage />
                </Suspense>
              </Protected>
            }
          />
          <Route
            path="/create-product"
            element={
              <Protected>
                <Suspense fallback={<LoadingSpinner />}>
                  <CreateProduct />
                </Suspense>
              </Protected>
            }
          />
          <Route
            path="/cart"
            element={
              <Protected>
                <Suspense fallback={<LoadingSpinner />}>
                  <Cart />
                </Suspense>
              </Protected>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              </Protected>
            }
          />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;