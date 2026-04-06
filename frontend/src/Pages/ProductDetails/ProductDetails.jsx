

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { formatINR } from "../../utils/formatCurrency";


function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const { user } = useAuth();
  const { cart, addToCart, updateQuantity, clearCart } = useCart();

  //  Fetch single product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const res = await axios.get(`${apiUrl}/api/products/${id}`);
        // Handle both old direct object returning and the new `{ success: true, data: {...} }` format
        const productData = res.data.data || res.data;
        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  //  Check if product already in cart
  const cartItem = cart.find((item) => item.id === product?.id);

  //  Add to Cart handler
  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name || product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  //  Buy Now handler
  const handleBuyNow = () => {
    navigate("/payment", { state: { product } });
  };

  // Loading / Error / Not found states
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading product details...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600">
        {error}
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600">
        Product not found.
      </div>
    );

  //  UI
  return (
    <div className="min-h-screen bg-[#FDF8F9] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start bg-white p-6 sm:p-10 lg:p-12 rounded-[32px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] selection:bg-pink-100">

        {/* Left: Product Image Container */}
        <div className="w-full lg:w-1/2 flex justify-center items-center bg-gray-50/50 rounded-[24px] p-8 lg:p-12 group overflow-hidden border border-gray-50">
          <img
            src={product.image}
            alt={product.name || product.title}
            className="w-full max-w-[320px] lg:max-w-[400px] object-cover rounded-[20px] shadow-sm transform group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center py-2 lg:py-6">
          <div className="space-y-4">
            {/* Category / Tag */}
            {product.category && (
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-pink-50 text-pink-600 font-semibold text-xs uppercase tracking-wider">
                {product.category}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
              {product.name || product.title}
            </h1>

            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-lg mt-4">
              {product.description || "Experience the perfect blend of style and comfort with this premium piece from our exclusive collection."}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <span className="text-3xl md:text-4xl font-black text-pink-500 tracking-tight">
              {formatINR(product.price)}
            </span>
          </div>


          <hr className="border-gray-100 my-8" />

          {/* Actions - Add to Cart / Quantity / Buy Now */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {cartItem ? (
              <div className="flex items-center justify-between w-full sm:w-auto bg-gray-50/80 p-1.5 rounded-[16px] border border-gray-100 shadow-sm">
                <button
                  onClick={() => updateQuantity(product.id, "decrease")}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-gray-700 text-xl font-bold shadow-sm hover:bg-pink-50 hover:text-pink-600 transition-all duration-200"
                >
                  −
                </button>
                <span className="font-bold text-lg w-14 text-center text-[#0F172A]">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, "increase")}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-gray-700 text-xl font-bold shadow-sm hover:bg-pink-50 hover:text-pink-600 transition-all duration-200"
                >
                  +
                </button>
                <div className="pl-4 pr-3 border-l border-gray-200 ml-2">
                  <button
                    onClick={() => clearCart()}
                    className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`w-full sm:w-[220px] flex items-center justify-center px-8 py-4 rounded-[16px] font-bold text-[15px] tracking-wide border-2 transition-all duration-300 ${added
                  ? "bg-pink-500 border-pink-500 text-white scale-[1.02] shadow-lg shadow-pink-500/25"
                  : "border-pink-200 text-pink-600 bg-transparent hover:bg-pink-50 hover:border-pink-400 hover:text-pink-600"
                  }`}
              >
                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>
            )}

            <button
              onClick={handleBuyNow}
              className="w-full sm:w-[220px] px-8 py-4 flex justify-center items-center bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-[16px] font-bold text-[15px] tracking-wide shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Buy Now
            </button>
          </div>

          {/* Product Meta Info (Optional Extra) */}
          <div className="pt-6 mt-8 border-t border-gray-100 flex flex-col space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              </span>
              In Stock & Ready to Ship
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </span>
              Fast 2-4 day delivery
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 text-purple-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </span>
              Secure Checkout
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
