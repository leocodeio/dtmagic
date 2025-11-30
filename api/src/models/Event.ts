import mongoose, { HydratedDocument, Model } from "mongoose";
import { EventNiche, EventPayload, IEventDocument } from "../types";

/** Event instance methods */
interface EventMethods {
  toEventPayload(participantCount?: number): EventPayload;
}

/** Event model type with methods */
type EventModel = Model<IEventDocument, object, EventMethods>;

/** Hydrated event document type */
export type EventDocument = HydratedDocument<IEventDocument, EventMethods>;

const NICHES: EventNiche[] = ["gaming", "singing", "dancing", "coding"];

const eventSchema = new mongoose.Schema<IEventDocument, EventModel, EventMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    niche: {
      type: String,
      enum: NICHES,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    methods: {
      /** Convert document to EventPayload */
      toEventPayload(participantCount?: number): EventPayload {
        return {
          _id: this._id.toString(),
          name: this.name,
          description: this.description,
          niche: this.niche,
          venue: this.venue,
          date: this.date,
          time: this.time,
          capacity: this.capacity,
          isActive: this.isActive,
          participantCount,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    },
  }
);

const Event = mongoose.model<IEventDocument, EventModel>("Event", eventSchema);

export default Event;
