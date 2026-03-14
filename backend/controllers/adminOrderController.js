import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// @desc    Get all orders with filtering and search
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, search } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== "all") {
        query.status = status;
    }

    // Search logic
    if (search) {
        const searchRegex = { $regex: search, $options: "i" };

        const users = await User.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        }).select("_id");

        const userIds = users.map(u => u._id);

        query.$or = [
            { orderId: searchRegex },
            { status: searchRegex },
            { user: { $in: userIds } }
        ];

        if (mongoose.isValidObjectId(search)) {
            query.$or.push({ _id: search });
        }
    }

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({
        status: "success",
        page,
        totalPages,
        totalOrders,
        data: orders
    });
});

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (req.body.status !== undefined) {
        order.status = req.body.status;
    }

    const updatedOrder = await order.save();

    res.json({
        status: "success",
        message: "Order status updated successfully",
        data: updatedOrder
    });
});
