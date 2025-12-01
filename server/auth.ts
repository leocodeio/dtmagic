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

/** Event niche categories */
export type EventNiche = "gaming" | "singing" | "dancing" | "coding";

/** Base user data structure */
interface BaseUser {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** Student user data structure */
export interface StudentUser extends BaseUser {
  role: "student";
  rollNumber: string;
  incentivePoints: number;
}

/** Faculty user data structure */
export interface FacultyUser extends BaseUser {
  role: "faculty";
  employeeId: string;
  department: string;
}

/** Combined user type */
export type User = StudentUser | FacultyUser;

/** Event data structure */
export interface Event {
  _id: string;
  name: string;
  description: string;
  niche: EventNiche;
  venue: string;
  date: string;
  time: string;
  capacity: number;
  isActive: boolean;
  participantCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Participation data structure */
export interface Participation {
  _id: string;
  eventId: string;
  participantId: string;
  participantType: UserRole;
  selectedNiche: EventNiche;
  status: "registered" | "attended" | "cancelled";
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

/** Events list response from API */
interface EventsResponse {
  events: Event[];
}

/** Participation response from API */
interface ParticipationResponse {
  message: string;
  participation: Participation;
}

/** Incentive response from API */
interface IncentiveResponse {
  incentivePoints: number;
  participations: Participation[];
}

/** Leaderboard response from API */
interface LeaderboardResponse {
  leaderboard: {
    name: string;
    rollNumber: string;
    incentivePoints: number;
  }[];
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
 * Login with email, password and role
 * @param email - User's email address
 * @param password - User's password
 * @param role - User's role (student/faculty)
 * @returns Login response with token and user data
 * @throws Error if login fails
 */
export async function login(
  email: string,
  password: string,
  role: UserRole
): Promise<LoginResponse> {
  try {
    const response = await axiosInstance.post<LoginResponse>("/api/auth/login", {
      email,
      password,
      role,
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

// ============================================
// Events Functions
// ============================================

/**
 * Get all active events
 * @returns List of events
 */
export async function getEvents(): Promise<Event[]> {
  try {
    const response = await axiosInstance.get<EventsResponse>("/api/events");
    return response.data.events;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to fetch events");
  }
}

/**
 * Register for an event
 * @param eventId - Event ID to register for
 * @param selectedNiche - Selected niche category
 * @returns Participation data
 */
export async function participateInEvent(
  eventId: string,
  selectedNiche: EventNiche
): Promise<Participation> {
  try {
    const response = await axiosInstance.post<ParticipationResponse>(
      `/api/events/${eventId}/participate`,
      { selectedNiche }
    );
    return response.data.participation;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to register for event");
  }
}

/**
 * Cancel participation in an event
 * @param eventId - Event ID to cancel participation
 */
export async function cancelParticipation(eventId: string): Promise<void> {
  try {
    await axiosInstance.delete(`/api/events/${eventId}/participate`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to cancel participation");
  }
}

/**
 * Get user's participations
 * @returns List of user's participations
 */
export async function getMyParticipations(): Promise<Participation[]> {
  try {
    const response = await axiosInstance.get<{ participations: Participation[] }>(
      "/api/events/my/participations"
    );
    return response.data.participations;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to fetch participations");
  }
}

/** Event participant data structure */
export interface EventParticipant {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
  status: "registered" | "attended";
  selectedNiche: EventNiche;
}

/**
 * Get participants for an event (faculty only)
 * @param eventId - Event ID
 * @returns List of participants
 */
export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  try {
    const response = await axiosInstance.get<{ participants: EventParticipant[] }>(
      `/api/events/${eventId}/participants`
    );
    return response.data.participants;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to fetch participants");
  }
}

/**
 * Mark attendance for a participant (faculty only)
 * @param eventId - Event ID
 * @param participantId - Participant ID
 * @param points - Optional custom points to award (default 10)
 */
export async function markAttendance(eventId: string, participantId: string, points?: number): Promise<void> {
  try {
    await axiosInstance.post(`/api/events/${eventId}/attend/${participantId}`, { points });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to mark attendance");
  }
}

/** Create event data structure */
export interface CreateEventData {
  name: string;
  description: string;
  niche: EventNiche;
  venue: string;
  date: string;
  time: string;
  capacity: number;
}

/** Update event data structure */
export interface UpdateEventData {
  name?: string;
  description?: string;
  niche?: EventNiche;
  venue?: string;
  date?: string;
  time?: string;
  capacity?: number;
  isActive?: boolean;
}

/**
 * Create a new event (faculty only)
 * @param eventData - Event data
 * @returns Created event
 */
export async function createEvent(eventData: CreateEventData): Promise<Event> {
  try {
    const response = await axiosInstance.post<{ event: Event }>("/api/events", eventData);
    return response.data.event;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to create event");
  }
}

/**
 * Update an event (faculty only)
 * @param eventId - Event ID
 * @param eventData - Updated event data
 * @returns Updated event
 */
export async function updateEvent(eventId: string, eventData: UpdateEventData): Promise<Event> {
  try {
    const response = await axiosInstance.put<{ event: Event }>(`/api/events/${eventId}`, eventData);
    return response.data.event;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to update event");
  }
}

// ============================================
// Incentives Functions
// ============================================

/**
 * Get student's incentive points (students only)
 * @returns Incentive data with points and participated events
 */
export async function getMyIncentives(): Promise<IncentiveResponse> {
  try {
    const response = await axiosInstance.get<IncentiveResponse>("/api/incentives/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to fetch incentive points");
  }
}

/**
 * Get leaderboard (top students by incentive points)
 * @returns Leaderboard data
 */
export async function getLeaderboard(): Promise<LeaderboardResponse["leaderboard"]> {
  try {
    const response = await axiosInstance.get<LeaderboardResponse>("/api/incentives/leaderboard");
    return response.data.leaderboard;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("Failed to fetch leaderboard");
  }
}
