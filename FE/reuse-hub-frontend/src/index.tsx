import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Desktop } from "./screens/Desktop/Desktop";
import { CategoryPage } from "./screens/CategoryPage/CategoryPage";
import { ProductDetailPage } from "./screens/ProductDetailPage/ProductDetailPage";
import { LoginPage } from "./screens/LoginPage/LoginPage";
import RegisterPage from "./screens/RegisterPage/RegisterPage"; // Import RegisterPage
import VerifyEmailPage from "./screens/VerifyEmailPage/VerifyEmailPage"; // Import VerifyEmailPage
import { ProfilePage } from "./screens/ProfilePage/ProfilePage";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Desktop />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* Add Register Route */}
          <Route path="/verify-email" element={<VerifyEmailPage />} /> {/* Add Verify Email Route */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
