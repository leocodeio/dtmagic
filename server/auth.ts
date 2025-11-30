import axios, { AxiosError } from "axios";
import axiosInstance from "../utils/axios.instance";
import {
    clearSession,
    getToken,
    getUser,
    setToken,
    setUser,
} from "./session";

// ============================================
// Types
// ============================================

/** User roles in the application */
export type UserRole = "student" | "faculty";

/** User data structure */
export interface User {
  _id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** Successful login response from API */
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

/** User profile response from API */
interface UserResponse {
  user: User;
}

/** Verify token response from API */
interface VerifyResponse {
  valid: boolean;
  user: User;
}

/** Health check response from API */
interface HealthResponse {
  status: string;
  message: string;
}

/** Error response from API */
interface ApiErrorResponse {
  error: string;
}

// ============================================
// Auth Functions
// ============================================

/**
 * Login with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Login response with token and user data
 * @throws Error if login fails
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await axiosInstance.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    // Store token and user data in secure storage
    await setToken(token);
    await setUser(user);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Login failed. Please try again.");
  }
}

/**
 * Logout the current user
 * Clears local session regardless of API call success
 */
export async function logout(): Promise<void> {
  try {
    const token = await getToken();
    if (token) {
      await axiosInstance.post("/api/auth/logout");
    }
  } catch {
    // Ignore errors during logout API call
    console.log("Logout API call failed, clearing local session anyway");
  } finally {
    await clearSession();
  }
}

/**
 * Get current user profile from the server
 * @returns Current user data or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await axiosInstance.get<UserResponse>("/api/auth/me");
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearSession();
    }
    return null;
  }
}

/**
 * Get locally stored user data
 * @returns Stored user data or null
 */
export async function getStoredUser(): Promise<User | null> {
  const user = await getUser();
  return user as User | null;
}

/**
 * Check health of the API server
 * @returns true if server is healthy
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await axiosInstance.get<HealthResponse>("/api/health");
    return response.data.status === "ok";
  } catch {
    return false;
  }
}

/**
 * Verify if the stored token is still valid
 * @returns User data if token is valid, null otherwise
 */
export async function verifyToken(): Promise<User | null> {
  try {
    const token = await getToken();
    if (!token) {
      return null;
    }

    const response = await axiosInstance.get<VerifyResponse>("/api/auth/verify");

    if (response.data.valid) {
      // Update stored user data with fresh data from server
      await setUser(response.data.user);
      return response.data.user;
    }

    return null;
  } catch {
    // Token is invalid or expired, clear session
    await clearSession();
    return null;
  }
}
