import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors globally
    if (error.response) {
      if (error.response.status === 401) {
        // Only redirect if not on auth pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signUp')) {
          console.log("Authentication required, redirecting to login");
          window.location.href = "/";
        }
      } else if (error.response.status === 500) {
        console.error("Server error:", error.response.data);
      } else if (error.response.status === 404) {
        console.log("Resource not found:", error.response.config.url);
      } else {
        console.error(`API Error (${error.response.status}):`, error.response.data);
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    } else if (error.request) {
      console.error("Network error - server may be down");
    } else {
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;