import api from "./axiosInstance";

/* ================= USERS ================= */

export const getUsers = async () => {
  return await api.get("/api/admin/users");
};

export const deleteUser = async (id) => {
  return await api.delete(`/api/admin/users/${id}`);
};

export const updateUser = async (id, data) => {
  return await api.patch(`/api/admin/users/${id}`, data);
};

/* ================= PRODUCTS ================= */

export const getProducts = async () => {
  return await api.get("/api/admin/products");
};

export const createProduct = async (data) => {
  return await api.post("/api/admin/products", data);
};

export const updateProduct = async (id, data) => {
  return await api.put(`/api/admin/products/${id}`, data);
};

export const deleteProduct = async (id) => {
  return await api.delete(`/api/admin/products/${id}`);
};

/* ================= ORDERS ================= */

export const getOrders = async () => {
  return await api.get("/api/admin/orders");
};

export const updateOrderStatus = async (id, data) => {
  return await api.patch(`/api/admin/orders/${id}`, data);
};

/* ================= AUTH ================= */

export const adminLogin = async (data) => {
  return await api.post("/api/admin/login", data);
};