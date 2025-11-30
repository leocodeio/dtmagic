import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import incentiveRoutes from "./routes/incentives";
import { ErrorResponse, HealthResponse } from "./types";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/incentives", incentiveRoutes);

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
const HOST = process.env.HOST || "0.0.0.0"; // Listen on all interfaces for mobile access

// Start server only after successful database connection
async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}

startServer();
