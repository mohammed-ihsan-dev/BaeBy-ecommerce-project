import React, { createContext, useContext, useState } from "react";
import api from "../utils/api";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
// const API_URL = "http://localhost:5001/api/auth"; // API interceptor handles base URL

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { clearWishlist } = useWishlist();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    // const savedToken = localStorage.getItem("token"); 
    // No need to set default headers manually since interceptor handles it
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  });

  // Register
  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      return { success: true, message: data.message };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.errors?.[0] || "Registration failed"
      };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      // Use the global api instance (though interceptor won't have token yet, that's fine for login)
      const { data } = await api.post("/auth/login", { email, password });

      const { token, user: userData } = data;

      // Create userInfo object as requested
      const userInfo = { ...userData, token };

      setUser(userData);

      // Save consistent storage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      return { success: true, user: userData };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.errors?.[0] || "Login failed"
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed at backend:", err);
    }

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");

    // Interceptor reads directly from localStorage, so no need to clean headers manually

    if (clearCart) clearCart();
    if (clearWishlist) clearWishlist();

    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, register, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
