import { Request } from "express";

// ============================================
// User Types
// ============================================

/** User roles in the application */
export type UserRole = "student" | "faculty";

/** Raw user document structure in MongoDB (without Mongoose internals) */
export interface IUserDocument {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** User payload for JWT and API responses (without password) */
export interface UserPayload {
  _id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** Data required to create a new user */
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

// ============================================
// Request Types
// ============================================

/** Extended Express Request with authenticated user info */
export interface AuthRequest extends Request {
  user?: UserPayload;
}

/** Login request body */
export interface LoginBody {
  email: string;
  password: string;
}

// ============================================
// Response Types
// ============================================

/** Successful login response */
export interface LoginResponse {
  message: string;
  token: string;
  user: UserPayload;
}

/** Error response */
export interface ErrorResponse {
  error: string;
}

/** Health check response */
export interface HealthResponse {
  status: string;
  message: string;
}

/** User profile response */
export interface UserResponse {
  user: UserPayload;
}

/** Logout response */
export interface LogoutResponse {
  message: string;
}

/** Verify token response */
export interface VerifyResponse {
  valid: boolean;
  user: UserPayload;
}
