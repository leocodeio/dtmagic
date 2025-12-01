import express, { Response } from "express";
import eventsData from "../data/events.json";
import { authenticateToken } from "../middleware/auth";
import Event from "../models/Event";
import Participation from "../models/Participation";
import Student from "../models/Student";
import {
    AuthRequest,
    ErrorResponse,
    EventNiche,
    EventPayload,
    EventResponse,
    EventsResponse,
    MessageResponse,
    ParticipateBody,
    ParticipationResponse,
} from "../types";

const router = express.Router();

// Create a new event (faculty only)
router.post(
  "/",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<EventResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const user = req.user;

      // Only faculty can create events
      if (!user || user.role !== "faculty") {
        res.status(403).json({ error: "Only faculty can create events" });
        return;
      }

      const { name, description, niche, venue, date, time, capacity } = req.body as {
        name: string;
        description: string;
        niche: EventNiche;
        venue: string;
        date: string;
        time: string;
        capacity: number;
      };

      // Validate required fields
      if (!name || !description || !niche || !venue || !date || !time || !capacity) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const event = new Event({
        name,
        description,
        niche,
        venue,
        date: new Date(date),
        time,
        capacity,
        isActive: true,
      });

      await event.save();

      res.status(201).json({ event: event.toEventPayload(0) });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  }
);

// Update an event (faculty only)
router.put(
  "/:id",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<EventResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const user = req.user;
      const eventId = req.params.id;

      // Only faculty can update events
      if (!user || user.role !== "faculty") {
        res.status(403).json({ error: "Only faculty can update events" });
        return;
      }

      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      const { name, description, niche, venue, date, time, capacity, isActive } = req.body as {
        name?: string;
        description?: string;
        niche?: EventNiche;
        venue?: string;
        date?: string;
        time?: string;
        capacity?: number;
        isActive?: boolean;
      };

      // Update fields if provided
      if (name) event.name = name;
      if (description) event.description = description;
      if (niche) event.niche = niche;
      if (venue) event.venue = venue;
      if (date) event.date = new Date(date);
      if (time) event.time = time;
      if (capacity) event.capacity = capacity;
      if (typeof isActive === "boolean") event.isActive = isActive;

      await event.save();

      const participantCount = await Participation.countDocuments({
        eventId: event._id,
        status: { $ne: "cancelled" },
      });

      res.json({ event: event.toEventPayload(participantCount) });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

// Sync events from JSON file to database
router.post(
  "/sync",
  async (
    _req: AuthRequest,
    res: Response<MessageResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      // Clear existing events and add from JSON
      await Event.deleteMany({});

      const events = eventsData.events.map((event) => ({
        ...event,
        date: new Date(event.date),
      }));

      await Event.insertMany(events);

      res.json({ message: `Synced ${events.length} events from configuration` });
    } catch (error) {
      console.error("Error syncing events:", error);
      res.status(500).json({ error: "Failed to sync events" });
    }
  }
);

// Get all active events
router.get(
  "/",
  authenticateToken,
  async (
    _req: AuthRequest,
    res: Response<EventsResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const events = await Event.find({ isActive: true }).sort({ date: 1 });

      // Get participant count for each event
      const eventsWithCount: EventPayload[] = await Promise.all(
        events.map(async (event) => {
          const participantCount = await Participation.countDocuments({
            eventId: event._id,
            status: { $ne: "cancelled" },
          });
          return event.toEventPayload(participantCount);
        })
      );

      res.json({ events: eventsWithCount });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  }
);

// Get single event by ID
router.get(
  "/:id",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<EventResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      const participantCount = await Participation.countDocuments({
        eventId: event._id,
        status: { $ne: "cancelled" },
      });

      res.json({ event: event.toEventPayload(participantCount) });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  }
);

// Register for an event
router.post(
  "/:id/participate",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<ParticipationResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const { selectedNiche } = req.body as ParticipateBody;
      const eventId = req.params.id;
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      if (!event.isActive) {
        res.status(400).json({ error: "Event is not active" });
        return;
      }

      // Check capacity
      const currentParticipants = await Participation.countDocuments({
        eventId: event._id,
        status: { $ne: "cancelled" },
      });

      if (currentParticipants >= event.capacity) {
        res.status(400).json({ error: "Event is at full capacity" });
        return;
      }

      // Check if already registered
      const existingParticipation = await Participation.findOne({
        eventId: event._id,
        participantId: user._id,
      });

      if (existingParticipation) {
        if (existingParticipation.status === "cancelled") {
          // Re-register
          existingParticipation.status = "registered";
          existingParticipation.selectedNiche = selectedNiche;
          await existingParticipation.save();

          res.json({
            message: "Re-registered for event successfully",
            participation: existingParticipation.toParticipationPayload(),
          });
          return;
        }
        res.status(400).json({ error: "Already registered for this event" });
        return;
      }

      // Create participation
      const participation = new Participation({
        eventId: event._id,
        participantId: user._id,
        participantType: user.role,
        selectedNiche,
        status: "registered",
      });

      await participation.save();

      res.status(201).json({
        message: "Registered for event successfully",
        participation: participation.toParticipationPayload(),
      });
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ error: "Failed to register for event" });
    }
  }
);

// Cancel participation
router.delete(
  "/:id/participate",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<MessageResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const eventId = req.params.id;
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const participation = await Participation.findOne({
        eventId,
        participantId: user._id,
      });

      if (!participation) {
        res.status(404).json({ error: "Participation not found" });
        return;
      }

      participation.status = "cancelled";
      await participation.save();

      res.json({ message: "Participation cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling participation:", error);
      res.status(500).json({ error: "Failed to cancel participation" });
    }
  }
);

// Get user's participations
router.get(
  "/my/participations",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<{ participations: ParticipationResponse["participation"][] } | ErrorResponse>
  ): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const participations = await Participation.find({
        participantId: user._id,
        status: { $ne: "cancelled" },
      }).populate("eventId");

      res.json({
        participations: participations.map((p) => p.toParticipationPayload()),
      });
    } catch (error) {
      console.error("Error fetching participations:", error);
      res.status(500).json({ error: "Failed to fetch participations" });
    }
  }
);

// Get event participants (faculty only)
router.get(
  "/:id/participants",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<{ participants: { _id: string; name: string; email: string; rollNumber?: string; status: string; selectedNiche: string }[] } | ErrorResponse>
  ): Promise<void> => {
    try {
      const eventId = req.params.id;
      const user = req.user;

      // Only faculty can view participants
      if (!user || user.role !== "faculty") {
        res.status(403).json({ error: "Only faculty can view participants" });
        return;
      }

      const participations = await Participation.find({
        eventId,
        status: { $ne: "cancelled" },
      });

      // Get participant details
      const participants = await Promise.all(
        participations.map(async (p) => {
          const student = await Student.findById(p.participantId);
          if (!student) return null;
          return {
            _id: student._id.toString(),
            name: student.name,
            email: student.email,
            rollNumber: student.rollNumber,
            status: p.status,
            selectedNiche: p.selectedNiche,
          };
        })
      );

      res.json({
        participants: participants.filter((p): p is NonNullable<typeof p> => p !== null),
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  }
);

// Mark attendance and award points (admin/faculty use)
router.post(
  "/:id/attend/:participantId",
  authenticateToken,
  async (
    req: AuthRequest,
    res: Response<MessageResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const { id: eventId, participantId } = req.params;
      const { points } = req.body as { points?: number };
      const user = req.user;

      // Only faculty can mark attendance
      if (!user || user.role !== "faculty") {
        res.status(403).json({ error: "Only faculty can mark attendance" });
        return;
      }

      const participation = await Participation.findOne({
        eventId,
        participantId,
        status: "registered",
      });

      if (!participation) {
        res.status(404).json({ error: "Participation not found" });
        return;
      }

      participation.status = "attended";
      await participation.save();

      // Award incentive points to students (default 10, or custom amount)
      const pointsToAward = points && points > 0 ? points : 10;
      if (participation.participantType === "student") {
        await Student.findByIdAndUpdate(participantId, {
          $inc: { incentivePoints: pointsToAward },
        });
      }

      res.json({ message: `Attendance marked and ${pointsToAward} points awarded` });
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ error: "Failed to mark attendance" });
    }
  }
);

export default router;
