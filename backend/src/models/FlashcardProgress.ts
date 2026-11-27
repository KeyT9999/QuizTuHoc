import mongoose, { Schema, type Document } from 'mongoose';

export interface IFlashcardProgress extends Document {
  userId: mongoose.Types.ObjectId;
  flashcardSetId: string;
  title: string;
  totalCards: number;
  knownIds: number[];
  knownCount: number;
  percent: number;
  lastStudiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const flashcardProgressSchema = new Schema<IFlashcardProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    flashcardSetId: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: String, default: '', trim: true, maxlength: 200 },
    totalCards: { type: Number, default: 0, min: 0 },
    knownIds: { type: [Number], default: [] },
    knownCount: { type: Number, default: 0, min: 0 },
    percent: { type: Number, default: 0, min: 0, max: 100 },
    lastStudiedAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
    collection: 'flashcard_progresses',
  }
);

flashcardProgressSchema.index({ userId: 1, flashcardSetId: 1 }, { unique: true });

export const FlashcardProgress = mongoose.model<IFlashcardProgress>(
  'FlashcardProgress',
  flashcardProgressSchema
);
