import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

export function hashSecretToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function createRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function signSessionToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifySessionToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.sub === 'string' &&
      typeof (decoded as Record<string, unknown>).email === 'string'
    ) {
      return {
        sub: decoded.sub,
        email: (decoded as Record<string, unknown>).email as string,
      };
    }
    return null;
  } catch {
    return null;
  }
}
