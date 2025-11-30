import bcrypt from "bcryptjs";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { FacultyPayload, IFacultyDocument } from "../types";

/** Faculty instance methods */
interface FacultyMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toFacultyPayload(): FacultyPayload;
}

/** Faculty model type with methods */
type FacultyModel = Model<IFacultyDocument, object, FacultyMethods>;

/** Hydrated faculty document type */
export type FacultyDocument = HydratedDocument<IFacultyDocument, FacultyMethods>;

const facultySchema = new mongoose.Schema<IFacultyDocument, FacultyModel, FacultyMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    methods: {
      /** Compare provided password with stored hashed password */
      async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
      },
      /** Convert document to FacultyPayload (safe for JWT and responses) */
      toFacultyPayload(): FacultyPayload {
        return {
          _id: this._id.toString(),
          email: this.email,
          name: this.name,
          employeeId: this.employeeId,
          department: this.department,
          role: "faculty",
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    },
  }
);

// Hash password before saving
facultySchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Faculty = mongoose.model<IFacultyDocument, FacultyModel>("Faculty", facultySchema);

export default Faculty;
