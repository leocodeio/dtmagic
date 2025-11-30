import express, { Response } from "express";
import { authenticateToken } from "../middleware/auth";
import Participation from "../models/Participation";
import Student from "../models/Student";
import {
    AuthRequest,
    ErrorResponse,
    IncentiveResponse,
} from "../types";

const router = express.Router();

// Get current user's incentive points (students only)
router.get(
  "/me",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<IncentiveResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      if (user.role !== "student") {
        res.status(403).json({ error: "Incentive points are only for students" });
        return;
      }

      const student = await Student.findById(user._id);
      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      const participations = await Participation.find({
        participantId: user._id,
        status: "attended",
      });

      res.json({
        incentivePoints: student.incentivePoints,
        participations: participations.map((p) => p.toParticipationPayload()),
      });
    } catch (error) {
      console.error("Error fetching incentives:", error);
      res.status(500).json({ error: "Failed to fetch incentives" });
    }
  }
);

// Get leaderboard (top students by incentive points)
router.get(
  "/leaderboard",
  authenticateToken,
  async (
    _req: AuthRequest,
    res: Response<{ leaderboard: { name: string; rollNumber: string; incentivePoints: number }[] } | ErrorResponse>
  ): Promise<void> => {
    try {
      const topStudents = await Student.find()
        .sort({ incentivePoints: -1 })
        .limit(10)
        .select("name rollNumber incentivePoints");

      res.json({
        leaderboard: topStudents.map((s) => ({
          name: s.name,
          rollNumber: s.rollNumber,
          incentivePoints: s.incentivePoints,
        })),
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  }
);

export default router;
