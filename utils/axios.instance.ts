import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import { getToken } from "../server/session";

// Base URL for the API - change this based on your environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - adds auth token to requests
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/auth/login");
      
      // Handle specific error status codes
      switch (error.response.status) {
        case 401:
          // Only log token expiry for non-auth endpoints
          if (!isAuthEndpoint) {
            console.log("Unauthorized - token may be expired");
          }
          break;
        case 403:
          console.log("Forbidden - access denied");
          break;
        case 500:
          console.log("Server error");
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.log("Network error - no response received");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
