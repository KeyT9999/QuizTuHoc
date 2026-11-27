import mongoose, { Schema, type Document } from 'mongoose';

export interface ICourseSummary extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: string;
  courseCode: string;
  courseName: string;
  totalSets: number;
  startedSets: number;
  completedSets: number;
  totalQuestions: number;
  masteredQuestions: number;
  percent: number;
  isPassed: boolean;
  lastStudiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const courseSummarySchema = new Schema<ICourseSummary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: String, required: true, trim: true, maxlength: 80 },
    courseCode: { type: String, default: '', trim: true, maxlength: 40 },
    courseName: { type: String, default: '', trim: true, maxlength: 180 },
    totalSets: { type: Number, default: 0, min: 0 },
    startedSets: { type: Number, default: 0, min: 0 },
    completedSets: { type: Number, default: 0, min: 0 },
    totalQuestions: { type: Number, default: 0, min: 0 },
    masteredQuestions: { type: Number, default: 0, min: 0 },
    percent: { type: Number, default: 0, min: 0, max: 100 },
    isPassed: { type: Boolean, default: false },
    lastStudiedAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
    collection: 'course_summaries',
  }
);

courseSummarySchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const CourseSummary = mongoose.model<ICourseSummary>('CourseSummary', courseSummarySchema);
