/**
 * Seed script to create initial user(s) in the database
 * Run this script to add users since there's no signup functionality
 *
 * Usage: node scripts/seedUser.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/dtmagic";

const seedUsers = [
  {
    email: "admin@dtmagic.com",
    password: "password123",
    name: "Admin User",
  },
  // Add more users as needed
];

async function seedDatabase() {
  try {
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
      console.log(`Created user: ${userData.email}`);
    }

    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
