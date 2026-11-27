import mongoose, { Schema, type Document } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'banned';

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
  role: UserRole;
  status: UserStatus;
  bannedReason: string;
  bannedAt: Date | null;
  adminNote: string;
  xp: number;
  level: number;
  streakDays: number;
  longestStreakDays: number;
  streakLastDate: string;
  studyDates: string[];
  recentCourseIds: string[];
  totalCatalogQuestions: number;
  lastLoginAt: Date | null;
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
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    status: { type: String, enum: ['active', 'banned'], default: 'active', index: true },
    bannedReason: { type: String, default: '', trim: true, maxlength: 300 },
    bannedAt: { type: Date, default: null },
    adminNote: { type: String, default: '', trim: true, maxlength: 500 },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    streakDays: { type: Number, default: 0, min: 0 },
    longestStreakDays: { type: Number, default: 0, min: 0 },
    streakLastDate: { type: String, default: '' },
    studyDates: { type: [String], default: [] },
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
