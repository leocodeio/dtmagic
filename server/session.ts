import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

// For web, we'll use localStorage as a fallback
const isWeb = Platform.OS === "web";

/**
 * Store the authentication token
 */
export async function setToken(token: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

/**
 * Get the stored authentication token
 */
export async function getToken(): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Remove the stored authentication token
 */
export async function removeToken(): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

/**
 * Store user data
 */
export async function setUser(user: object): Promise<void> {
  const userData = JSON.stringify(user);
  if (isWeb) {
    localStorage.setItem(USER_KEY, userData);
  } else {
    await SecureStore.setItemAsync(USER_KEY, userData);
  }
}

/**
 * Get stored user data
 */
export async function getUser(): Promise<object | null> {
  let userData: string | null;
  if (isWeb) {
    userData = localStorage.getItem(USER_KEY);
  } else {
    userData = await SecureStore.getItemAsync(USER_KEY);
  }
  return userData ? JSON.parse(userData) : null;
}

/**
 * Remove stored user data
 */
export async function removeUser(): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

/**
 * Clear all session data (logout)
 */
export async function clearSession(): Promise<void> {
  await removeToken();
  await removeUser();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}
