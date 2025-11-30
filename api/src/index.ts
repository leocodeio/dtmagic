import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import { ErrorResponse, HealthResponse } from "./types";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/dtmagic";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err: Error) => {
    console.error("MongoDB connection error:", err.message);
  });

// Routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get(
  "/api/health",
  (_req: Request, res: Response<HealthResponse>): void => {
    res.json({ status: "ok", message: "Server is running" });
  }
);

// Error handling middleware
app.use(
  (
    err: Error,
    _req: Request,
    res: Response<ErrorResponse>,
    _next: NextFunction
  ): void => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

const PORT = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
