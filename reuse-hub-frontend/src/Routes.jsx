import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products"; // Import trang sản phẩm
import ProductDetail from "./pages/ProductDetail"; // Import trang chi tiết sản phẩm
import Cart from "./pages/Cart"; // Import trang giỏ hàng
import Checkout from "./pages/Checkout"; // Import trang thanh toán
import OrderSuccess from "./pages/OrderSuccess"; // Import trang đặt hàng thành công
import Admin from "./pages/Admin"; // Import trang admin
import NotFound from "./pages/NotFound";

const ProjectRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} /> {/* Route trang sản phẩm */}
        <Route path="/products/:id" element={<ProductDetail />} /> {/* Route chi tiết sản phẩm */}
        <Route path="/cart" element={<Cart />} /> {/* Route trang giỏ hàng */}
        <Route path="/checkout" element={<Checkout />} /> {/* Route trang thanh toán */}
        <Route path="/order-success/:orderId" element={<OrderSuccess />} /> {/* Route trang đặt hàng thành công */}
        <Route path="/admin" element={<Admin />} /> {/* Thêm route admin */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default ProjectRoutes;