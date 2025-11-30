import bcrypt from "bcryptjs";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IUserDocument, UserPayload } from "../types";

/** User instance methods */
interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toUserPayload(): UserPayload;
}

/** User model type with methods */
type UserModel = Model<IUserDocument, object, UserMethods>;

/** Hydrated user document type */
export type UserDocument = HydratedDocument<IUserDocument, UserMethods>;

const userSchema = new mongoose.Schema<IUserDocument, UserModel, UserMethods>(
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
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "faculty"] as const,
      required: true,
      default: "student",
    },
  },
  {
    timestamps: true,
    methods: {
      /** Compare provided password with stored hashed password */
      async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
      },
      /** Convert document to UserPayload (safe for JWT and responses) */
      toUserPayload(): UserPayload {
        return {
          _id: this._id.toString(),
          email: this.email,
          name: this.name,
          role: this.role,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model<IUserDocument, UserModel>("User", userSchema);

export default User;
