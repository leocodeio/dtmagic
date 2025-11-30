import mongoose, { HydratedDocument, Model } from "mongoose";
import { EventNiche, IParticipationDocument, ParticipationPayload, UserRole } from "../types";

/** Participation instance methods */
interface ParticipationMethods {
  toParticipationPayload(): ParticipationPayload;
}

/** Participation model type with methods */
type ParticipationModel = Model<IParticipationDocument, object, ParticipationMethods>;

/** Hydrated participation document type */
export type ParticipationDocument = HydratedDocument<IParticipationDocument, ParticipationMethods>;

const NICHES: EventNiche[] = ["gaming", "singing", "dancing", "coding"];
const PARTICIPANT_TYPES: UserRole[] = ["student", "faculty"];

const participationSchema = new mongoose.Schema<IParticipationDocument, ParticipationModel, ParticipationMethods>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "participantType",
    },
    participantType: {
      type: String,
      enum: PARTICIPANT_TYPES,
      required: true,
    },
    selectedNiche: {
      type: String,
      enum: NICHES,
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "attended", "cancelled"],
      default: "registered",
    },
  },
  {
    timestamps: true,
    methods: {
      /** Convert document to ParticipationPayload */
      toParticipationPayload(): ParticipationPayload {
        return {
          _id: this._id.toString(),
          eventId: this.eventId.toString(),
          participantId: this.participantId.toString(),
          participantType: this.participantType,
          selectedNiche: this.selectedNiche,
          status: this.status,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    },
  }
);

// Compound index to prevent duplicate participation
participationSchema.index({ eventId: 1, participantId: 1 }, { unique: true });

const Participation = mongoose.model<IParticipationDocument, ParticipationModel>(
  "Participation",
  participationSchema
);

export default Participation;
