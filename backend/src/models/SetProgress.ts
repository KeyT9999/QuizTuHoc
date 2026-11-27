import mongoose, { Schema, type Document } from 'mongoose';

export interface ISetProgress extends Document {
  userId: mongoose.Types.ObjectId;
  setId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  setTitle: string;
  kind: 'text' | 'image';
  isKnowledgeGroup: boolean;
  totalQuestions: number;
  masteredIds: number[];
  masteredCount: number;
  percent: number;
  isCompleted: boolean;
  lastStudiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const setProgressSchema = new Schema<ISetProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    setId: { type: String, required: true, trim: true, maxlength: 160 },
    courseId: { type: String, default: '', trim: true, maxlength: 80, index: true },
    courseCode: { type: String, default: '', trim: true, maxlength: 40 },
    courseName: { type: String, default: '', trim: true, maxlength: 180 },
    setTitle: { type: String, default: '', trim: true, maxlength: 240 },
    kind: { type: String, enum: ['text', 'image'], default: 'text' },
    isKnowledgeGroup: { type: Boolean, default: false },
    totalQuestions: { type: Number, default: 0, min: 0 },
    masteredIds: { type: [Number], default: [] },
    masteredCount: { type: Number, default: 0, min: 0 },
    percent: { type: Number, default: 0, min: 0, max: 100 },
    isCompleted: { type: Boolean, default: false },
    lastStudiedAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
    collection: 'set_progresses',
  }
);

setProgressSchema.index({ userId: 1, setId: 1 }, { unique: true });
setProgressSchema.index({ userId: 1, courseId: 1 });

export const SetProgress = mongoose.model<ISetProgress>('SetProgress', setProgressSchema);
