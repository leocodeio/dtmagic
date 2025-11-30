import { Request } from "express";
import mongoose from "mongoose";

// ============================================
// User Types
// ============================================

/** User roles in the application */
export type UserRole = "student" | "faculty";

/** Event niche categories */
export type EventNiche = "gaming" | "singing" | "dancing" | "coding";

// ============================================
// Student Types
// ============================================

/** Raw student document structure in MongoDB */
export interface IStudentDocument {
  email: string;
  password: string;
  name: string;
  rollNumber: string;
  incentivePoints: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Student payload for JWT and API responses (without password) */
export interface StudentPayload {
  _id: string;
  email: string;
  name: string;
  rollNumber: string;
  role: "student";
  incentivePoints: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Data required to create a new student */
export interface CreateStudentData {
  email: string;
  password: string;
  name: string;
  rollNumber: string;
}

// ============================================
// Faculty Types
// ============================================

/** Raw faculty document structure in MongoDB */
export interface IFacultyDocument {
  email: string;
  password: string;
  name: string;
  employeeId: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Faculty payload for JWT and API responses (without password) */
export interface FacultyPayload {
  _id: string;
  email: string;
  name: string;
  employeeId: string;
  department: string;
  role: "faculty";
  createdAt: Date;
  updatedAt: Date;
}

/** Data required to create a new faculty */
export interface CreateFacultyData {
  email: string;
  password: string;
  name: string;
  employeeId: string;
  department: string;
}

// ============================================
// Combined User Types
// ============================================

/** Union type for user payloads */
export type UserPayload = StudentPayload | FacultyPayload;

// ============================================
// Event Types
// ============================================

/** Raw event document structure in MongoDB */
export interface IEventDocument {
  name: string;
  description: string;
  niche: EventNiche;
  venue: string;
  date: Date;
  time: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Event payload for API responses */
export interface EventPayload {
  _id: string;
  name: string;
  description: string;
  niche: EventNiche;
  venue: string;
  date: Date;
  time: string;
  capacity: number;
  isActive: boolean;
  participantCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Participation Types
// ============================================

/** Raw participation document structure in MongoDB */
export interface IParticipationDocument {
  eventId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  participantType: UserRole;
  selectedNiche: EventNiche;
  status: "registered" | "attended" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

/** Participation payload for API responses */
export interface ParticipationPayload {
  _id: string;
  eventId: string;
  participantId: string;
  participantType: UserRole;
  selectedNiche: EventNiche;
  status: "registered" | "attended" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
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
  role: UserRole;
}

/** Event participation request body */
export interface ParticipateBody {
  eventId: string;
  selectedNiche: EventNiche;
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

/** Events list response */
export interface EventsResponse {
  events: EventPayload[];
}

/** Single event response */
export interface EventResponse {
  event: EventPayload;
}

/** Participation response */
export interface ParticipationResponse {
  message: string;
  participation: ParticipationPayload;
}

/** Incentive points response */
export interface IncentiveResponse {
  incentivePoints: number;
  participations: ParticipationPayload[];
}

/** Message response */
export interface MessageResponse {
  message: string;
}
