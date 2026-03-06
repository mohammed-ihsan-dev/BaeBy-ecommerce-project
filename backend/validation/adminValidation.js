import Joi from "joi";

/* ---------------- ADMIN LOGIN ---------------- */

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/* ---------------- CREATE PRODUCT ---------------- */

export const createProductSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),

  description: Joi.string().allow("").optional(),

  // Image is optional in the form — backend/frontend sends a placeholder if empty
  image: Joi.string().allow("").optional(),

  price: Joi.number().min(0).required(),

  category: Joi.string().min(2).required(),
});

/* ---------------- UPDATE PRODUCT ---------------- */

export const updateProductSchema = Joi.object({
  title: Joi.string().min(2).max(100).optional(),

  description: Joi.string().allow("").optional(),

  image: Joi.string().allow("").optional(),

  price: Joi.number().min(0).optional(),

  category: Joi.string().min(2).optional(),
});

/* ---------------- UPDATE USER ---------------- */

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("user", "admin").optional(),
  status: Joi.string().valid("active", "inactive").optional(),
});

/* ---------------- UPDATE ORDER STATUS ---------------- */

export const updateOrderSchema = Joi.object({
  status: Joi.string().valid("Pending COD", "Paid", "Delivered", "Cancelled").required(),
});