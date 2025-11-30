/**
 * Seed script to create initial students and faculty in the database
 * Run this script to add users since there's no signup functionality
 *
 * Usage: npm run seed
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import eventsData from "../data/events.json";
import Event from "../models/Event";
import Faculty from "../models/Faculty";
import Student from "../models/Student";
import { CreateFacultyData, CreateStudentData } from "../types";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/dtmagic";

const seedStudents: CreateStudentData[] = [
  {
    email: "student@dtmagic.com",
    password: "student123",
    name: "John Student",
    rollNumber: "STU001",
  },
  {
    email: "alice@dtmagic.com",
    password: "alice123",
    name: "Alice Johnson",
    rollNumber: "STU002",
  },
  {
    email: "bob@dtmagic.com",
    password: "bob123",
    name: "Bob Smith",
    rollNumber: "STU003",
  },
];

const seedFaculty: CreateFacultyData[] = [
  {
    email: "faculty@dtmagic.com",
    password: "faculty123",
    name: "Dr. Jane Faculty",
    employeeId: "FAC001",
    department: "Computer Science",
  },
  {
    email: "professor@dtmagic.com",
    password: "prof123",
    name: "Prof. Michael Brown",
    employeeId: "FAC002",
    department: "Mathematics",
  },
];

async function seedDatabase(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Seed Students
  console.log("\n--- Seeding Students ---");
  for (const studentData of seedStudents) {
    const existingStudent = await Student.findOne({ email: studentData.email });

    if (existingStudent) {
      console.log(`Student ${studentData.email} already exists, skipping...`);
      continue;
    }

    const student = new Student(studentData);
    await student.save();
    console.log(`Created student: ${studentData.email} (${studentData.rollNumber})`);
  }

  // Seed Faculty
  console.log("\n--- Seeding Faculty ---");
  for (const facultyData of seedFaculty) {
    const existingFaculty = await Faculty.findOne({ email: facultyData.email });

    if (existingFaculty) {
      console.log(`Faculty ${facultyData.email} already exists, skipping...`);
      continue;
    }

    const faculty = new Faculty(facultyData);
    await faculty.save();
    console.log(`Created faculty: ${facultyData.email} (${facultyData.department})`);
  }

  // Seed Events from JSON
  console.log("\n--- Seeding Events ---");
  const existingEvents = await Event.countDocuments();
  if (existingEvents > 0) {
    console.log(`${existingEvents} events already exist, skipping...`);
  } else {
    const events = eventsData.events.map((event) => ({
      ...event,
      date: new Date(event.date),
    }));
    await Event.insertMany(events);
    console.log(`Created ${events.length} events`);
  }

  console.log("\n✅ Seeding completed!");
  console.log("\nDefault credentials:");
  console.log("  Student: student@dtmagic.com / student123");
  console.log("  Faculty: faculty@dtmagic.com / faculty123");
  
  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch((error: Error) => {
  console.error("Seeding error:", error.message);
  process.exit(1);
});
