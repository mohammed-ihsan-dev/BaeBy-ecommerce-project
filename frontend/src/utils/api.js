import axios from "axios";

import { API_BASE_URL } from "../config/constants";

const api = axios.create({
    baseURL: API_BASE_URL.replace(/\/$/, ""),
    withCredentials: true,
    timeout: 35000, // 35s to handle Render cold starts
});

api.interceptors.request.use(
    (config) => {
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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Retry on Timeout (cold start), Network Error, or Server Error (booting)
        const shouldRetry = (
            error.code === 'ECONNABORTED' || 
            error.message === 'Network Error' || 
            (error.response && error.response.status >= 500)
        );

        if (shouldRetry && !originalRequest._retry) {
            originalRequest._retry = true;
            console.warn("🔄 Backend is waking up... retrying in 4 seconds");
            await new Promise(resolve => setTimeout(resolve, 4000));
            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);

export default api;
