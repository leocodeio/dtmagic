/**
 * Seed script to create initial user(s) in the database
 * Run this script to add users since there's no signup functionality
 *
 * Usage: npm run seed
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User";
import { CreateUserData } from "../types";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/dtmagic";

const seedUsers: CreateUserData[] = [
  {
    email: "student@dtmagic.com",
    password: "student123",
    name: "John Student",
    role: "student",
  },
  {
    email: "faculty@dtmagic.com",
    password: "faculty123",
    name: "Dr. Jane Faculty",
    role: "faculty",
  },
];

async function seedDatabase(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const userData of seedUsers) {
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`);
      continue;
    }

    const user = new User(userData);
    await user.save();
    console.log(`Created user: ${userData.email} (${userData.role})`);
  }

  console.log("Seeding completed!");
  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch((error: Error) => {
  console.error("Seeding error:", error.message);
  process.exit(1);
});
