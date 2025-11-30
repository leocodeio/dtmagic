import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest, UserPayload } from "../types";

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

  req.user = {
    _id: decoded._id,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
    createdAt: decoded.createdAt,
    updatedAt: decoded.updatedAt,
  };

  next();
}
