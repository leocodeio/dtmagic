import axiosInstance from "../utils/axios.instance";
import {
    clearSession,
    getToken,
    getUser,
    setToken,
    setUser,
} from "./session";

// Types
export interface User {
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthError {
  error: string;
}

/**
 * Login with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Login response with token and user data
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
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Login failed. Please try again.");
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint (optional, mainly for server-side cleanup)
    const token = await getToken();
    if (token) {
      await axiosInstance.post("/api/auth/logout");
    }
  } catch (error) {
    // Ignore errors during logout API call
    console.log("Logout API call failed, clearing local session anyway");
  } finally {
    // Always clear local session
    await clearSession();
  }
}

/**
 * Get current user profile from the server
 * @returns Current user data
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await axiosInstance.get<{ user: User }>("/api/auth/me");
    return response.data.user;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear session
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
    const response = await axiosInstance.get("/api/health");
    return response.data.status === "ok";
  } catch (error) {
    return false;
  }
}
