import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_BE_API_URL;

export const api = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/admin";
};

// --- Request Interceptor ---
// This runs BEFORE every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- Response Interceptor ---
// This runs AFTER every response
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Corrected the typo "respons" to "response"
        if (error.response && error.response.status === 401) {
            logout();
        }
        // Crucial: Reject the promise so the calling code knows it failed
        return Promise.reject(error);
    }
);