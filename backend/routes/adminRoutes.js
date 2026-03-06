import express from "express";
import {
    adminLogin,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
    getStats
} from "../controllers/adminController.js";
import adminOnly from "../middlewares/adminMiddleware.js";
import protect from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validationMiddleware.js";
import {
    adminLoginSchema,
    createProductSchema,
    updateProductSchema,
    updateUserSchema,
    updateOrderSchema
} from "../validation/adminValidation.js";


const router = express.Router();

// Public route for admin login
router.post("/login", validateRequest(adminLoginSchema), adminLogin);

// Protect all following routes
router.use(protect, adminOnly);

// Users management
router.route("/users")
    .get(getUsers);

router.route("/users/:id")
    .get(getUserById)
    .patch(validateRequest(updateUserSchema), updateUser)
    .delete(deleteUser);


// Products management
router.route("/products")
    .get(getProducts)
    .post(validateRequest(createProductSchema), createProduct);

router.route("/products/:id")
    .get(getProductById)
    .put(validateRequest(updateProductSchema), updateProduct)
    .delete(deleteProduct);

// Orders management
router.route("/orders")
    .get(getOrders);

router.route("/orders/:id")
    .patch(validateRequest(updateOrderSchema), updateOrderStatus);


// Dashboard stats
router.route("/stats")
    .get(getStats);

export default router;
