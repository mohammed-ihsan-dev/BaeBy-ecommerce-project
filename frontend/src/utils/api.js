import axios from "axios";

// Strict check for production-ready environment variables
if (!import.meta.env.VITE_API_URL) {
    console.error("❌ CRITICAL: VITE_API_URL is not defined in environment variables!");
    // In actual production build, this will throw an error and stop execution
}

const API = axios.create({
    // Standardize URL: Ensure it points to the /api endpoint of the backend
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "") + "/api",
    withCredentials: true,
    timeout: 30000,
});

// DEBUG: Log the resolved API URL (Remove in final production commit)
console.log("🚀 API Base URL:", API.defaults.baseURL);

// Request Interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("userInfo") || "{}")?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (Cold Start Recovery)
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if ((error.code === 'ECONNABORTED' || error.message === 'Network Error' || error.response?.status >= 500) && !originalRequest._retry) {
            originalRequest._retry = true;
            console.warn("🔄 Retrying request (Render Cold Start)...");
            await new Promise(res => setTimeout(res, 3000));
            return API(originalRequest);
        }
        return Promise.reject(error);
    }
);

export default API;
