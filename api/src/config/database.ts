import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/dtmagic";

export async function connectDatabase(): Promise<boolean> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    const err = error as Error;
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

export function disconnectDatabase(): Promise<void> {
  return mongoose.disconnect();
}
