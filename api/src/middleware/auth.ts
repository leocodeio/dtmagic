import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest, FacultyPayload, StudentPayload, UserPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/** Validates JWT token and attaches user payload to request */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & UserPayload;

  // Reconstruct the appropriate payload based on role
  if (decoded.role === "student") {
    const studentPayload = decoded as JwtPayload & StudentPayload;
    req.user = {
      _id: studentPayload._id,
      email: studentPayload.email,
      name: studentPayload.name,
      rollNumber: studentPayload.rollNumber,
      role: "student",
      incentivePoints: studentPayload.incentivePoints,
      createdAt: studentPayload.createdAt,
      updatedAt: studentPayload.updatedAt,
    };
  } else {
    const facultyPayload = decoded as JwtPayload & FacultyPayload;
    req.user = {
      _id: facultyPayload._id,
      email: facultyPayload.email,
      name: facultyPayload.name,
      employeeId: facultyPayload.employeeId,
      department: facultyPayload.department,
      role: "faculty",
      createdAt: facultyPayload.createdAt,
      updatedAt: facultyPayload.updatedAt,
    };
  }

  next();
}
