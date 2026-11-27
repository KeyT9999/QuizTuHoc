import mongoose, { Schema, type Document } from 'mongoose';

export interface IAdminAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'announcement' | 'system';
  targetId: string;
  targetLabel: string;
  details: string;
  createdAt: Date;
}

const adminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminEmail: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true, maxlength: 60 },
    targetType: { type: String, enum: ['user', 'announcement', 'system'], required: true },
    targetId: { type: String, default: '', trim: true },
    targetLabel: { type: String, default: '', trim: true, maxlength: 180 },
    details: { type: String, default: '', trim: true, maxlength: 600 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'admin_audit_logs',
  }
);

adminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLog = mongoose.model<IAdminAuditLog>('AdminAuditLog', adminAuditLogSchema);
