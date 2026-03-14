import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import api from "../../utils/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { formatINR } from "../../utils/formatCurrency";


function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const { user } = useAuth();

  const [method, setMethod] = useState("cod");
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  /**
   * FIX: isProcessing prevents double-click / repeated submissions.
   * Without this, clicking "Pay with Razorpay" multiple times (or a fast
   * re-render cycle in StrictMode) causes rzp.open() to fire more than once,
   * triggering repeated lazy-chunk fetches from Razorpay CDN.
   */
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * FIX: Hold the Razorpay instance in a ref so we can close/cleanup if the
   * component unmounts mid-payment (e.g., navigation away).
   */
  const rzpInstanceRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Utility: strip currency symbols and return a clean float
  const cleanPrice = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0;
  };

  // Debug: log product on mount / when product changes — safe, no loop risk
  useEffect(() => {
    console.log("🧾 Product received in Payment.jsx:", product);
  }, [product]);

  /**
   * Cleanup on unmount:
   * 1. Close any open Razorpay modal so it stops lazy-loading chunks.
   * 2. Physically remove the Razorpay iframe from the DOM.
   *    Even after .close(), Razorpay leaves an <iframe> in the body;
   *    that iframe keeps firing network requests until it is removed.
   */
  useEffect(() => {
    return () => {
      // Close the SDK instance first
      if (rzpInstanceRef.current) {
        try {
          rzpInstanceRef.current.close();
        } catch (_) {
          // Swallow — instance may already be in a closed state
        }
        rzpInstanceRef.current = null;
      }

      // Remove every Razorpay iframe still attached to the document
      document
        .querySelectorAll('iframe[src*="razorpay"]')
        .forEach((el) => el.parentNode?.removeChild(el));
    };
  }, []);

  /**
   * FIX: Wrap handleSubmit in useCallback.
   * Without this, every re-render (e.g., typing in a form input causing
   * setForm → re-render) recreates the function. While not the primary
   * culprit, in React StrictMode this can compound double-invoke issues.
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      /**
       * FIX: Guard against re-entrancy.
       * If a payment is already in progress, silently ignore the second call.
       * This is the main fix for the infinite chunk loading: rzp.open() is
       * now guaranteed to be called EXACTLY ONCE per user action.
       */
      if (isProcessing) return;
      setIsProcessing(true);

      let orderItems = [];
      let totalAmount = 0;

      // Prepare items and total amount — existing business logic unchanged
      if (product && !Array.isArray(product)) {
        orderItems = [
          {
            name: product.name || product.title,
            quantity: 1,
            image: product.image,
            price: cleanPrice(product.price || product.amount),
            product: product.id || product._id,
          },
        ];
        totalAmount = cleanPrice(product.price || product.amount);
      } else if (Array.isArray(product)) {
        orderItems = product.map((p) => ({
          name: p.name || p.title,
          quantity: p.quantity || 1,
          image: p.image,
          price: cleanPrice(p.price || p.amount),
          product: p.id || p._id,
        }));
        totalAmount = product.reduce(
          (sum, p) =>
            sum + cleanPrice(p.price || p.amount) * (p.quantity || 1),
          0
        );
      }

      if (totalAmount <= 0) {
        alert("Error: Total amount is invalid.");
        setIsProcessing(false);
        return;
      }

      const shippingData = {
        address: form.address,
        city: form.city || "Default City",
        postalCode: form.postalCode || "000000",
        country: "India",
      };

      if (method === "cod") {
        // ── COD flow — unchanged ─────────────────────────────────────────
        try {
          const createdResponse = await api.post("/api/orders", {
            orderItems: orderItems,
            shippingAddress: shippingData,
            paymentMethod: "COD",
          });

          navigate("/order-success", {
            state: {
              order: {
                ...createdResponse.data,
                id: createdResponse.data._id,
                method: "cod",
              },
              fromPayment: true,
            },
          });
        } catch (error) {
          console.error("Error saving COD order:", error);
          alert("Something went wrong. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      } else {
        // ── Razorpay flow ────────────────────────────────────────────────
        try {
          /**
           * FIX: Verify window.Razorpay exists before using it.
           * The script tag in index.html loads checkout.js once globally.
           * If for any reason it hasn't loaded yet (slow network), we bail
           * gracefully instead of throwing a cryptic error.
           */
          if (typeof window.Razorpay === "undefined") {
            alert(
              "Payment gateway is not ready yet. Please refresh and try again."
            );
            setIsProcessing(false);
            return;
          }

          // 1. Create Razorpay order on backend
          const { data } = await api.post("/api/payment/create-order", {
            amount: totalAmount,
          });

          const options = {
            key: "rzp_test_SJr8psddTz1yjJ",
            amount: data.order.amount,
            currency: "INR",
            name: "BaeBy Store",
            description: "Purchase Description",
            order_id: data.order.id,

            handler: async function (response) {
              try {
                // 2. Verify payment on backend — existing logic unchanged
                const verifyData = {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items: orderItems,
                  totalAmount: totalAmount,
                  shippingAddress: shippingData,
                };

                const res = await api.post(
                  "/api/payment/verify-payment",
                  verifyData
                );

                if (res.data.success) {
                  /**
                   * FIX: Destroy the Razorpay instance and strip its iframe
                   * BEFORE navigating. Without this, the checkout iframe
                   * stays mounted after the route change and keeps requesting
                   * v2-entry-*.modern.js chunk files from the CDN.
                   */
                  if (rzpInstanceRef.current) {
                    try {
                      rzpInstanceRef.current.close();
                    } catch (_) { }
                    rzpInstanceRef.current = null;
                  }
                  document
                    .querySelectorAll('iframe[src*="razorpay"]')
                    .forEach((el) => el.parentNode?.removeChild(el));

                  navigate("/order-success", {
                    state: {
                      order: {
                        id: response.razorpay_order_id,
                        method: "razorpay",
                        status: "Paid",
                      },
                      fromPayment: true,
                    },
                  });
                }
              } catch (err) {
                console.error("Verification failed:", err);
                alert("Payment verification failed. Please contact support.");
              } finally {
                /**
                 * FIX: Always release the processing lock after the handler
                 * resolves, whether success or error, so the user can retry.
                 */
                setIsProcessing(false);
                rzpInstanceRef.current = null;
              }
            },

            prefill: {
              name: form.name,
              email: user?.email,
              contact: form.phone,
            },

            theme: {
              color: "#ec4899", // Pink-500
            },

            /**
             * FIX: Handle modal close / payment cancellation.
             * Without this, if the user closes the modal, isProcessing stays
             * true and the button stays permanently disabled.
             */
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
                rzpInstanceRef.current = null;
              },
            },
          };

          /**
           * FIX: Store instance in ref and open ONCE.
           * The ref ensures we never create a second instance while one is
           * already active, which is the direct cause of repeated chunk fetches.
           */
          // Guard: never create a second instance while one is already open
          if (!rzpInstanceRef.current) {
            rzpInstanceRef.current = new window.Razorpay(options);
            // Always open via the ref so we always operate on the stored instance
            rzpInstanceRef.current.open();
          }
        } catch (error) {
          console.error("Razorpay error:", error);
          alert("Could not initiate payment. Please try again.");
          setIsProcessing(false);
        }
      }
    },
    // Dependencies: only the values actually used inside handleSubmit
    [isProcessing, product, form, method, user, navigate]
  );

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-pink-100">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Complete Your <span className="text-pink-500">Payment</span>
        </h2>

        {/* Product Summary */}
        {product && (
          <div className="mb-6 text-center bg-pink-50 border border-pink-200 rounded-xl py-3">
            <h3 className="font-semibold text-gray-700">
              {Array.isArray(product)
                ? `${product.length} item(s) in your cart`
                : product.name || product.title}
            </h3>
            <p className="text-pink-600 font-bold">
              {Array.isArray(product)
                ? formatINR(product
                  .reduce(
                    (sum, p) =>
                      sum +
                      cleanPrice(p.price || p.amount) * (p.quantity || 1),
                    0
                  ))
                : formatINR(cleanPrice(product.price || product.amount))}
            </p>

          </div>
        )}

        {/* Payment Method Selection */}
        <div className="flex justify-around mb-6">
          {[
            { key: "cod", label: "Cash on Delivery" },
            { key: "razorpay", label: "Online (Razorpay)" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              disabled={isProcessing}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${method === opt.key
                ? "bg-pink-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => setMethod(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500"
          />
          <input
            type="text"
            name="address"
            placeholder="Full Address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500"
            />
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500"
            />
          </div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500"
          />

          {/*
           * FIX: Button is disabled while payment is processing.
           * This is the UI-level guard that prevents the user from firing
           * handleSubmit a second time before the first completes.
           */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-pink-500 text-white font-semibold py-3 rounded-xl hover:bg-pink-600 transition transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isProcessing
              ? "Processing..."
              : method === "cod"
                ? "Place Order"
                : "Pay with Razorpay"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;
