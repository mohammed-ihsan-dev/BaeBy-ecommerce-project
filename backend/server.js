import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js"
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

import adminRoutes from "./routes/adminRoutes.js"

dotenv.config();

// Environment Variables check
if (!process.env.MONGO_URI) {
  console.warn("WARNING: MONGO_URI is not defined in .env file. Database connection might fail.");
}

// Database Connection
connectDB();

const app = express();

// Security & Base Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "https://baeby-ecommerce-store.vercel.app",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : []),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy", timestamp: new Date() });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Server is firing up!
📡 Mode: ${process.env.NODE_ENV || 'development'}
🔌 Port: ${PORT}
🔗 Health Check: http://localhost:${PORT}/health
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
