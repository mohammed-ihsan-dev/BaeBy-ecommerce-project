import axios from "axios";

import { API_BASE_URL } from "../config/constants";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
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
        if (
            (error.code === 'ECONNABORTED' || error.message === 'Network Error') &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            console.warn("🔄 Retrying request due to network error or timeout...");
            await new Promise(resolve => setTimeout(resolve, 3000));
            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);

export default api;
