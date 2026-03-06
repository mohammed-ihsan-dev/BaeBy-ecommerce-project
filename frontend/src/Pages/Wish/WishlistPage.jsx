import React from "react";
import { useWishlist } from "../../Context/WishlistContext";
import { useCart } from "../../Context/CartContext";
import { formatINR } from "../../utils/formatCurrency";


function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { cart, addToCart } = useCart();

  if (!wishlist) return <div>Loading...</div>;

  // Function to check if item already in cart
  const isInCart = (id) => cart.some((item) => item.id === id);

  return (
    <div className="min-h-screen bg-pink-50 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Your Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          Low-key, your wishlist is giving... nothing.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
          {wishlist.map((item) => {
            const itemId = item.id || item._id;
            return (
              <div
                key={itemId}
                className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center transition-all hover:shadow-lg"
              >
                <img
                  src={item.image}
                  alt={item.name || item.title}
                  className="w-40 h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg text-gray-800">
                  {item.name || item.title}
                </h3>
                <p className="text-gray-600 mb-3">{formatINR(item.price)}</p>


                <div className="flex gap-3">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(itemId)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"
                  >
                    Remove
                  </button>

                  {/* Add to Cart / Already in Cart */}
                  {isInCart(itemId) ? (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-not-allowed"
                    >
                      Already in Cart
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg transition-all duration-200 shadow-md"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
