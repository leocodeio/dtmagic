import express, { Response } from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth";
import Faculty from "../models/Faculty";
import Student from "../models/Student";
import {
  AuthRequest,
  ErrorResponse,
  LoginBody,
  LoginResponse,
  LogoutResponse,
  UserPayload,
  UserResponse,
  VerifyResponse,
} from "../types";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Login endpoint - Role-based login with separate tables
router.post(
  "/login",
  async (
    req: AuthRequest,
    res: Response<LoginResponse | ErrorResponse>
  ): Promise<void> => {
    const body = req.body as LoginBody;
    const { email, password, role } = body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (!role || (role !== "student" && role !== "faculty")) {
      res.status(400).json({ error: "Valid role (student/faculty) is required" });
      return;
    }

    let userPayload: UserPayload;

    if (role === "student") {
      // Find student by email
      const student = await Student.findOne({ email: email.toLowerCase() });
      if (!student) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Check password
      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      userPayload = student.toStudentPayload();
    } else {
      // Find faculty by email
      const faculty = await Faculty.findOne({ email: email.toLowerCase() });
      if (!faculty) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Check password
      const isMatch = await faculty.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      userPayload = faculty.toFacultyPayload();
    }

    // Generate JWT token with user payload
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: userPayload,
    });
  }
);

// Get current user profile (protected route)
router.get(
  "/me",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<UserResponse | ErrorResponse>
  ): Promise<void> => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Fetch fresh data from the appropriate collection
    if (user.role === "student") {
      const student = await Student.findById(user._id);
      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }
      res.json({ user: student.toStudentPayload() });
    } else {
      const faculty = await Faculty.findById(user._id);
      if (!faculty) {
        res.status(404).json({ error: "Faculty not found" });
        return;
      }
      res.json({ user: faculty.toFacultyPayload() });
    }
  }
);

// Logout endpoint (optional - mainly for client-side token cleanup)
router.post(
  "/logout",
  authenticateToken,
  (_req: AuthRequest, res: Response<LogoutResponse>): void => {
    // In a stateless JWT setup, logout is handled client-side
    // This endpoint is for any server-side cleanup if needed
    res.json({ message: "Logout successful" });
  }
);

// Verify token endpoint - Check if the token is still valid
router.get(
  "/verify",
  authenticateToken,
  (req: AuthRequest, res: Response<VerifyResponse | ErrorResponse>): void => {
    if (!req.user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    res.json({
      valid: true,
      user: req.user,
    });
  }
);

export default router;
