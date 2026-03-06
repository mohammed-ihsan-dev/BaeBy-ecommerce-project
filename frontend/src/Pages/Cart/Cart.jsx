import React from "react";
import { useCart } from "../../Context/CartContext";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../../utils/formatCurrency";


function Cart() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();

  const navigate = useNavigate()

  // Calculate total amount
  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );



  //  Checkout function
  const handleCheckout = () => {
    if (cart.length === 0) return;
    showToast("Redirecting to payment...");

    // Pass the cart data to Payment page
    navigate("/payment", { state: { product: cart } });
  };


  //  Simple toast for checkout message
  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className =
      "fixed bottom-8 right-8 bg-pink-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 opacity-0 transition-opacity duration-300";
    document.body.appendChild(toast);

    setTimeout(() => (toast.style.opacity = "1"), 50);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  //  Empty cart display
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-pink-50 py-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Your Cart is empty
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Big yikes. You forgot.
        </p>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 drop-shadow-sm">
        Your Cart
      </h1>

      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-md p-6">
        {/*  Cart Items */}
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row justify-between items-center border-b py-4 gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name || item.title}
                className="w-50 h-50 object-cover rounded-2xl shadow-sm"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{item.name || item.title}</h3>
                <p className="text-gray-600">{formatINR(item.price)}</p>

              </div>
            </div>

            {/* Counter */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.id, "decrease")}
                className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full font-bold hover:bg-pink-200 transition-all"
              >
                −
              </button>
              <span className="font-semibold text-gray-700">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, "increase")}
                className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full font-bold hover:bg-pink-200 transition-all"
              >
                +
              </button>
            </div>

            {/*  Remove Button */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all font-medium shadow-sm"
            >
              Remove
            </button>
          </div>
        ))}

        {/*  Total & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 text-lg font-semibold gap-4">
          <p className="text-gray-800">
            Total:{" "}
            <span className="text-pink-600 font-bold">
              {formatINR(total)}
            </span>

          </p>



          <div className="flex gap-4">
            <button
              onClick={clearCart}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-400 transition-all"
            >
              Clear Cart
            </button>
            <button
              onClick={handleCheckout}
              className="bg-pink-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-pink-700 transition-all"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
