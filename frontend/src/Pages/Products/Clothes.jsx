import React, { useMemo } from "react";
import useProducts from "../../hooks/useProducts";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useWishlist } from "../../Context/WishlistContext";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";
import { formatINR } from "../../utils/formatCurrency";


function Clothes() {
  const { products, loading, error } = useProducts("clothes");
  const { cart, addToCart, removeFromCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const { user } = useAuth();

  //  Check if item is already in cart
  const isInCart = (id) => cart.some((item) => item.id === id);

  //  Sorting and Filtering
  const { sortType, filterType } = useOutletContext();

  const filteredAndSortedProducts = useMemo(() => {
    let updatedProducts = [...products];

    // 1️ Filter
    if (filterType === "under1800") {
      updatedProducts = updatedProducts.filter((p) => p.price < 1800);
    } else if (filterType === "1800to3600") {
      updatedProducts = updatedProducts.filter((p) => p.price >= 1800 && p.price <= 3600);
    } else if (filterType === "above3600") {
      updatedProducts = updatedProducts.filter((p) => p.price > 3600);
    }


    // 2️ Sort
    if (sortType === "lowToHigh") {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortType === "highToLow") {
      updatedProducts.sort((a, b) => b.price - a.price);
    }

    return updatedProducts;
  }, [products, sortType, filterType]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Baby Clothes
      </h2>

      {filteredAndSortedProducts.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product) => {
            const isWishlisted = wishlist.some((item) => item.id === product.id);

            return (
              <div
                key={product.id}
                className="relative bg-white shadow-md rounded-2xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                {/*  Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-3 right-3 text-xl transition-all ${isWishlisted
                    ? "text-pink-600 scale-125"
                    : "text-gray-400 hover:text-pink-500"
                    }`}
                >
                  <FaHeart />
                </button>

                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-cover"
                />

                {/*  Product Info */}
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {product.name || product.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-pink-600 font-bold text-lg">{formatINR(product.price)}</p>


                  {/*  Buttons */}
                  <div className="flex justify-center gap-3 mt-3">
                    {isInCart(product.id) ? (
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full transition-all duration-200 shadow-md"
                      >
                        Takeout
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!user) {
                            navigate("/login");
                            return;
                          }
                          addToCart(product);
                        }}
                        className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-full transition-all duration-200 shadow-md "
                      >
                        Add to Cart
                      </button>
                    )}


                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-full transition-all duration-200 shadow-md"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Clothes;
