import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [clothes, setClothes] = useState([]);
  const [toys, setToys] = useState([]);
  const [skinCare, setSkinCare] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Active Category
  const [activeCategory, setActiveCategory] = useState("Clothes");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?limit=1000");

        let allProducts = [];
        if (res.data && Array.isArray(res.data.data)) {
          allProducts = res.data.data;
        } else if (res.data && Array.isArray(res.data.products)) {
          allProducts = res.data.products;
        } else if (Array.isArray(res.data)) {
          allProducts = res.data;
        }

        setClothes(allProducts.filter(item => item.category === "clothes"));
        setToys(allProducts.filter(item => item.category === "toys"));
        setSkinCare(allProducts.filter(item => item.category === "skinCare"));

      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  return (
    <ProductsContext.Provider
      value={{
        clothes,
        toys,
        skinCare,
        loading,
        error,
        activeCategory,
        setActiveCategory,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
