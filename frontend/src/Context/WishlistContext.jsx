import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  // init from localStorage
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("userInfo") || "{}")?.token;
    if (!token) return;

    try {
      const { data } = await api.get("/wishlist");
      if (data && data.products) {
        setWishlist(data.products);
        localStorage.setItem("wishlist", JSON.stringify(data.products));
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  // fetch from backend on mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  // keep in localStorage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  //  Add
  const addToWishlist = async (product) => {
    // Optimistic update
    setWishlist((prev) => {
      const exists = prev.find((item) => (item.id || item._id) === (product.id || product._id));
      if (exists) return prev;
      toast.success(`${product.name || product.title} added to wishlist!`);
      return [...prev, product];
    });

    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("userInfo") || "{}")?.token;
    if (token) {
      try {
        await api.post("/wishlist", { productId: product.id || product._id });
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      }
    }
  };

  //  Remove
  const removeFromWishlist = async (id) => {
    // Optimistic update
    setWishlist((prev) => {
      const removedItem = prev.find((item) => (item.id || item._id) === id);
      if (removedItem) {
        toast.success(`${removedItem.name || removedItem.title} removed from wishlist`);
      }
      return prev.filter((item) => (item.id || item._id) !== id);
    });

    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("userInfo") || "{}")?.token;
    if (token) {
      try {
        await api.delete(`/wishlist/${id}`);
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      }
    }
  };

  //  Toggle
  const toggleWishlist = async (product) => {
    const idToCheck = product.id || product._id;
    const exists = wishlist.find((item) => (item.id || item._id) === idToCheck);

    if (exists) {
      await removeFromWishlist(idToCheck);
    } else {
      await addToWishlist(product);
    }
  };

  //  Clear all (use on logout)
  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem("wishlist");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist, // ← important
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
export default WishlistContext;
