import React, { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { formatINR } from "../../utils/formatCurrency";


function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/api/orders/myorders");
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading your orders...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">

        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          You haven’t placed any orders yet
        </h2>
        <p className="text-gray-500 mb-6">
          Once you order something, you’ll see it here.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full shadow-md transition"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        My Orders
      </h1>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition"
          >
            {/* Order header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  Order #{order._id.substring(0, 10).toUpperCase()}...
                </h3>
                <p className="text-xs text-gray-400">
                  Placed on: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : order.status?.includes("Pending")
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                  }`}
              >
                {order.status?.toUpperCase() || "PENDING"}
              </span>
            </div>

            {/* Product section */}
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-pink-50" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-800">{formatINR(item.price)}</p>

                </div>
              ))}
            </div>

            {/* Order details */}
            <div className="mt-6 border-t border-gray-50 pt-4 flex flex-col md:flex-row justify-between gap-4">
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">Shipping Address:</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-xl flex items-center justify-between md:min-w-[200px]">
                <span className="text-pink-800 font-medium">Total Amount</span>
                <span className="text-2xl font-extrabold text-pink-600">{formatINR(order.totalAmount)}</span>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
