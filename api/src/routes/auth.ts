import express, { Response } from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth";
import User from "../models/User";
import {
    AuthRequest,
    ErrorResponse,
    LoginBody,
    LoginResponse,
    LogoutResponse,
    UserResponse,
} from "../types";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Login endpoint - No signup, only login with existing credentials
router.post(
  "/login",
  async (
    req: AuthRequest,
    res: Response<LoginResponse | ErrorResponse>
  ): Promise<void> => {
    const body = req.body as LoginBody;
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate JWT token with user payload
    const userPayload = user.toUserPayload();
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
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user: user.toUserPayload() });
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

export default router;
