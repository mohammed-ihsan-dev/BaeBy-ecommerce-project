import axios from "axios";

// DEBUG: This will show in the production console to confirm the environment variable is picked up
console.log("🌐 INITIALIZING API WITH BASE URL:", import.meta.env.VITE_API_URL || "NOT DEFINED (falling back to localhost)");

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const api = axios.create({
    baseURL: API_URL.replace(/\/$/, "") + "/api", // Ensure clean base URL + /api prefix
    withCredentials: true,
    timeout: 35000, // 35s to handle Render cold starts
});

// Request Interceptor: Attach JWT if present
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

// Response Interceptor: Handle Render Cold Starts and Global Errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Retry logic for Render Free Tier (ERR_CONNECTION_REFUSED or timeout during boot)
        const shouldRetry = (
            error.code === 'ECONNABORTED' || 
            error.message === 'Network Error' || 
            (error.response && error.response.status >= 500)
        );

        if (shouldRetry && !originalRequest._retry && originalRequest.url.includes('/api/')) {
            originalRequest._retry = true;
            console.warn("🔄 Backend waking up (Render Cold Start)... retrying in 4s");
            await new Promise(resolve => setTimeout(resolve, 4000));
            return api(originalRequest);
        }

        // Global 401 Unauthorized handling
        if (error.response?.status === 401) {
            console.warn("🔐 Session expired - Redirecting to login");
            localStorage.clear();
            if (!window.location.pathname.includes('/login')) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
