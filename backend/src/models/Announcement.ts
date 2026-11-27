import mongoose, { Schema, type Document } from 'mongoose';

export type AnnouncementType = 'info' | 'update' | 'warning' | 'event';

export interface IAnnouncement extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: AnnouncementType;
  linkUrl: string;
  linkLabel: string;
  isActive: boolean;
  isPinned: boolean;
  expiresAt: Date | null;
  createdByEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    content: { type: String, required: true, trim: true, maxlength: 500 },
    type: { type: String, enum: ['info', 'update', 'warning', 'event'], default: 'info' },
    linkUrl: { type: String, default: '', trim: true, maxlength: 300 },
    linkLabel: { type: String, default: '', trim: true, maxlength: 60 },
    isActive: { type: Boolean, default: true, index: true },
    isPinned: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    createdByEmail: { type: String, default: '', trim: true },
  },
  {
    timestamps: true,
    collection: 'announcements',
  }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
