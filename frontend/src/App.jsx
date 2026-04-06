import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Products from "./Pages/Products/Products";
import AllProducts from "./Pages/Products/AllProducts";
import Header from "./Components/Header";
import ProductDetails from "./Pages/ProductDetails/ProductDetails";
import Register from "./Components/Auth/Register";
import Login from "./Components/Auth/Login";
import ScrollToTop from "./Components/Scroll/ScrollToTop";
import Cart from "./Pages/Cart/Cart";
import WishlistPage from "./Pages/Wish/WishlistPage";
import ProtectedRoute from "./Components/ProtectRouter/ProtectedRoute";
import AdminProtectedRoute from "./Components/ProtectRouter/AdminProtectedRoute";

import { Toaster } from "react-hot-toast";
import GenzPicks from "./Pages/GenzPicks/Genz";
import Footer from "./Components/Footer";
import FAQ from "./Components/Footer/Faq";
import Contact from "./Components/Footer/Contact";
import Return from "./Components/Footer/Return";
import Payment from "./Pages/Payments/Payments";
import OrderSuccess from "./Pages/Payments/OrderSuccess";
import Orders from "./Pages/Orders/Order";
import Users from "./Pages/Admin/Users";
import Dashboard from "./Pages/Admin/Dashboard";
import AdminProducts from "./Pages/Admin/Products";
import AdminOrders from "./Pages/Admin/Orders";
import AdminNotifications from "./Pages/Admin/Notifications";
import AdminLayout from "./layouts/AdminLayout";
import NotAuthorized from "./Components/Auth/NotAuthorized";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          style: { zIndex: 99999999 },
        }}
      />
      <ScrollToTop />
      {!isAdminRoute && !isAuthRoute && <Header />}

      <Routes>
        {/*  Home Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/*  Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/*  Not Authorized */}
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/*  Protected Routes (User) */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />

        {/*  Products */}
        <Route path="/products" element={<Products />}>
          <Route index element={<AllProducts />} />
          <Route path=":category" element={<AllProducts />} />
        </Route>

        {/*  Payment & Orders */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/*  Other Pages */}
        <Route path="/gen-z-picks" element={<GenzPicks />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/returns" element={<Return />} />

        {/*  ADMIN SIDE (Protected) */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >

          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<Users />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>
      </Routes>

      {!isAdminRoute && !isAuthRoute && <Footer />}
    </>
  );
}
