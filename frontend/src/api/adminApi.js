import api from "./axiosInstance";


/* ================= DASHBOARD ================= */

/**
 * Get dashboard stats (Total Users, Products, Orders, Revenue)
 */
export const getStats = async () => {
  return await api.get("/api/admin/stats");
};

/* ================= USERS ================= */

export const getUsers = async (params) => {
  return await api.get("/api/admin/users", { params });
};

export const deleteUser = async (id) => {
  return await api.delete(`/api/admin/users/${id}`);
};

export const updateUser = async (id, data) => {
  return await api.patch(`/api/admin/users/${id}`, data);
};

/* ================= PRODUCTS ================= */

export const getProducts = async (params) => {
  return await api.get("/api/admin/products", { params });
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

export const getOrders = async (params) => {
  return await api.get("/api/admin/orders", { params });
};

export const updateOrderStatus = async (id, data) => {
  return await api.patch(`/api/admin/orders/${id}`, data);
};

/* ================= SEARCH ================= */

export const globalSearch = async (q) => {
  return await api.get("/api/admin/search", { params: { q } });
};

/* ================= NOTIFICATIONS ================= */

export const getNotifications = async () => {
  return await api.get("/api/admin/notifications");
};

export const getUnreadCount = async () => {
  return await api.get("/api/admin/notifications/unread-count");
};

export const markNotificationAsRead = async (id) => {
  return await api.patch(`/api/admin/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  return await api.patch("/api/admin/notifications/read-all");
};