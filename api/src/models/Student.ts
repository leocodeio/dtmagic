import bcrypt from "bcryptjs";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IStudentDocument, StudentPayload } from "../types";

/** Student instance methods */
interface StudentMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toStudentPayload(): StudentPayload;
}

/** Student model type with methods */
type StudentModel = Model<IStudentDocument, object, StudentMethods>;

/** Hydrated student document type */
export type StudentDocument = HydratedDocument<IStudentDocument, StudentMethods>;

const studentSchema = new mongoose.Schema<IStudentDocument, StudentModel, StudentMethods>(
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
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    incentivePoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    methods: {
      /** Compare provided password with stored hashed password */
      async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
      },
      /** Convert document to StudentPayload (safe for JWT and responses) */
      toStudentPayload(): StudentPayload {
        return {
          _id: this._id.toString(),
          email: this.email,
          name: this.name,
          rollNumber: this.rollNumber,
          role: "student",
          incentivePoints: this.incentivePoints,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    },
  }
);

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Student = mongoose.model<IStudentDocument, StudentModel>("Student", studentSchema);

export default Student;
