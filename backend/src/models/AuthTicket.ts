import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuthTicket extends Document {
  ticketHash: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const authTicketSchema = new Schema<IAuthTicket>(
  {
    ticketHash: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    collection: 'auth_tickets',
  }
);

authTicketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthTicket = mongoose.model<IAuthTicket>('AuthTicket', authTicketSchema);
