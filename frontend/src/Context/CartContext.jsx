import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch cart from backend if logged in
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("userInfo");
      if (token) {
        try {
          const { data } = await api.get("/cart");
          const formattedCart = data.map((item) => ({
            ...item.product,
            id: item.product.id,
            dbId: item.id,
            quantity: item.quantity,
          }));
          setCart(formattedCart);
        } catch (err) {
          console.error("Failed to fetch cart:", err);
        }
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback(async (item) => {
    const token = localStorage.getItem("token") || localStorage.getItem("userInfo");

    // Optimistic UI Update first
    const existing = cart.find((p) => p.id === item.id);
    if (existing) {
      toast.error(`${item.name || item.title} is already in your cart`);
      return;
    }

    // Add to local state immediately
    const newItem = { ...item, quantity: 1 };
    setCart((prev) => [...prev, newItem]);
    toast.success(`${item.name || item.title} added to cart!`);

    if (token) {
      try {
        const res = await api.post("/cart", {
          productId: item.id,
        });

        if (res.status === 200 && res.data.message === "Product already in cart") {
          // If backend says duplicate, we are good (we handled it locally already mostly)
          return;
        }
      } catch (err) {
        console.error("Add to cart error:", err);
        toast.error("Failed to sync cart with server");
        // Revert local state if server fails
        setCart((prev) => prev.filter((p) => p.id !== item.id));
      }
    }
  }, [cart]);

  const removeFromCart = useCallback(async (id) => {
    const token = localStorage.getItem("token") || localStorage.getItem("userInfo");
    const removedItem = cart.find((i) => i.id === id);

    // Optimistic UI Update
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    toast.success(`${removedItem?.name || removedItem?.title || "Item"} removed from cart`);

    if (token) {
      try {
        await api.delete(`/cart/${id}`);
      } catch (err) {
        console.error("Remove from cart error:", err);
        // Optionally revert state here if strict sync is needed
      }
    }
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    toast.success("Cart cleared");
  }, []);

  const updateQuantity = useCallback(async (id, action) => {
    const token = localStorage.getItem("token") || localStorage.getItem("userInfo");
    let newQuantity = 1;

    // Calculate new quantity based on current state
    const currentItem = cart.find(item => item.id === id);
    if (!currentItem) return;

    if (action === "increase") {
      newQuantity = currentItem.quantity + 1;
    } else {
      newQuantity = Math.max(1, currentItem.quantity - 1);
    }

    // Optimistic UI Update
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );

    if (action === "increase") toast.success("Quantity increased");
    else toast.success("Quantity decreased");

    if (token) {
      try {
        await api.put("/cart", {
          productId: id,
          quantity: newQuantity, // Send the calculated value
        });
      } catch (err) {
        console.error("Update quantity error:", err);
        // Revert on error?
      }
    }
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity
  }), [cart, addToCart, removeFromCart, clearCart, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

//  Hook for easy access
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
