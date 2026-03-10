import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

/* =====================================
   GET ALL PRODUCTS (WITH SEARCH)
===================================== */

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin

export const getProducts = asyncHandler(async (req, res) => {

    const { search } = req.query;

    let query = {};

    // Search products
    if (search && search.trim() !== "") {

        const searchRegex = new RegExp(search, "i");

        query.$or = [
            { title: searchRegex },
            { category: searchRegex },
            { description: searchRegex }
        ];
    }

    const products = await Product.find(query)
        .sort({ createdAt: -1 });

    res.json({
        status: "success",
        count: products.length,
        data: products
    });

});


/* =====================================
   CREATE PRODUCT
===================================== */

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin

export const createProduct = asyncHandler(async (req, res) => {

    const { title, description, price, image, category } = req.body;

    const product = new Product({
        title,
        description,
        price,
        image,
        category
    });

    const createdProduct = await product.save();

    res.status(201).json({
        status: "success",
        message: "Product created successfully",
        data: createdProduct
    });

});


/* =====================================
   UPDATE PRODUCT
===================================== */

// @desc    Update product
// @route   PATCH /api/admin/products/:id
// @access  Private/Admin

export const updateProduct = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    const { title, description, price, image, category } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (image) product.image = image;
    if (category) product.category = category;

    const updatedProduct = await product.save();

    res.json({
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct
    });

});


/* =====================================
   DELETE PRODUCT
===================================== */

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin

export const deleteProduct = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    await product.deleteOne();

    res.json({
        status: "success",
        message: "Product deleted successfully"
    });

});