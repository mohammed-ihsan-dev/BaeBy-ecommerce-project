import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        items: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "Product",
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            default: 0.0,
        },
        paymentId: {
            type: String,
        },
        orderId: {
            type: String,
        },
        status: {
            type: String,
            default: "pending",
        },
        shippingAddress: {
            address: { type: String },
            city: { type: String },
            postalCode: { type: String },
            country: { type: String },
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
        toObject: { virtuals: true },
    }
);


const Order = mongoose.model("Order", orderSchema);

export default Order;
