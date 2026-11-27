import mongoose, { Schema, type Document } from 'mongoose';

export interface IOAuthState extends Document {
  stateHash: string;
  redirectPath: string;
  expiresAt: Date;
}

const oauthStateSchema = new Schema<IOAuthState>(
  {
    stateHash: { type: String, required: true, unique: true, index: true },
    redirectPath: { type: String, default: '/profile' },
    expiresAt: { type: Date, required: true },
  },
  {
    collection: 'oauth_states',
  }
);

oauthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthState = mongoose.model<IOAuthState>('OAuthState', oauthStateSchema);
