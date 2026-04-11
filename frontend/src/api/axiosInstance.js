import axios from "axios";
import { API_BASE_URL } from "../config/constants";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15s timeout to handle Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */

axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from 'token' key first, then 'userInfo'
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null;

    const activeToken = token || userInfo?.token;

    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Retry for Render Cold Starts (ERR_CONNECTION_REFUSED or timeout)
    if (
      (error.code === 'ECONNABORTED' || error.message === 'Network Error' || error.response?.status >= 500) &&
      !originalRequest._retry &&
      originalRequest.url.includes('/api/')
    ) {
      originalRequest._retry = true;
      console.warn("🔄 Backend might be sleeping (Render Cold Start). Retrying request...");
      
      // Wait 3 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 3000));
      return axiosInstance(originalRequest);
    }

    if (error.response) {
      // Unauthorized
      if (error.response.status === 401) {
        console.warn("🔐 Unauthorized - Session expired");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userInfo");
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
        }
      }
      
      // Server Error
      if (error.response.status >= 500) {
        console.error("💥 Server Error:", error.response.data?.message || "Internal Server Error");
      }
    } else {
      console.error("🌐 Network Error - Check if backend is running:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;