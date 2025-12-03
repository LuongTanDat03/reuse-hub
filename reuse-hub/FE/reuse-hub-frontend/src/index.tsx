// Polyfill for global (needed by sockjs-client)
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Desktop } from "./screens/Desktop/Desktop";
import "./styles/globals.css";
import { CategoryPage } from "./screens/CategoryPage/CategoryPage";
import { ProductDetailPage } from "./screens/ProductDetailPage/ProductDetailPage";
import { LoginPage } from "./screens/LoginPage/LoginPage";
import RegisterPage from "./screens/RegisterPage/RegisterPage"; // Import RegisterPage
import VerifyEmailPage from "./screens/VerifyEmailPage/VerifyEmailPage"; // Import VerifyEmailPage
import { ProfilePage } from "./screens/ProfilePage/ProfilePage";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";

import RequireAuth from "./components/RequireAuth";
import MapPage from "./screens/MapPage/MapPage";
import ChatPage from "./screens/ChatPage/ChatPage";
import PostCreatePage from "./screens/PostCreatePage/PostCreatePage";
import { AdminPage } from "./screens/AdminPage/AdminPage";
import { AdminDashboard } from "./screens/AdminPage/AdminDashboard";
import { TransactionPage } from "./screens/TransactionPage/TransactionPage";
import MyPosts from "./screens/MyPosts/MyPosts";
import { PaymentPage } from "./screens/PaymentPage";
import { PaymentSuccessPage } from "./screens/PaymentSuccessPage";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Toaster position="top-right" richColors />
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Desktop />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* Add Register Route */}
          <Route path="/verify-email" element={<VerifyEmailPage />} /> {/* Add Verify Email Route */}
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/category/tags/:tagName" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route
            path="/admin"
            element={
                <RequireAuth>
                  <AdminPage />
                </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
            }
          />
          <Route path="/map" element={<Layout><MapPage /></Layout>} />
          <Route path="/chat/:targetUserId" element={<Layout><ChatPage /></Layout>} />
          <Route
            path="/dang-tin"
            element={
              <Layout>
                <RequireAuth>
                  <PostCreatePage />
                </RequireAuth>
              </Layout>
            }
          />
          <Route
            path="/transactions"
            element={
              <RequireAuth>
                <TransactionPage />
              </RequireAuth>
            }
          />
          <Route
            path="/quan-ly-tin"
            element={
              <Layout>
                <RequireAuth>
                  <MyPosts />
                </RequireAuth>
              </Layout>
            }
          />
          <Route
            path="/payment"
            element={
              <RequireAuth>
                <PaymentPage />
              </RequireAuth>
            }
          />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
