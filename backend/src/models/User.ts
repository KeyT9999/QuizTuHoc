import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  googleId: string;
  email: string;
  googleName: string;
  name: string;
  givenName: string;
  avatar: string;
  bio: string;
  studentId: string;
  targetSemester: string;
  xp: number;
  level: number;
  streakDays: number;
  streakLastDate: string;
  recentCourseIds: string[];
  totalCatalogQuestions: number;
  lastLoginAt: Date;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    googleName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    givenName: { type: String, default: '', trim: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', trim: true, maxlength: 240 },
    studentId: { type: String, default: '', trim: true, maxlength: 40 },
    targetSemester: { type: String, default: '', trim: true, maxlength: 40 },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    streakDays: { type: Number, default: 0, min: 0 },
    streakLastDate: { type: String, default: '' },
    recentCourseIds: { type: [String], default: [] },
    totalCatalogQuestions: { type: Number, default: 0, min: 0 },
    lastLoginAt: { type: Date, default: () => new Date() },
    lastSyncedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
