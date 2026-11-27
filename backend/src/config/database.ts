import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10_000,
  });
  console.log(`[MongoDB] Kết nối thành công: ${mongoose.connection.name}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('[MongoDB] Đã đóng kết nối');
}

export function getDatabaseStatus(): 'connected' | 'connecting' | 'disconnected' {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    default:
      return 'disconnected';
  }
}
