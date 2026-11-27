import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, type IUser } from '../models/User.js';
import { verifySessionToken } from '../utils/jwt.js';

export const SESSION_COOKIE_NAME = 'keyt_session';

export interface AuthenticatedRequest extends Request {
  authUser?: IUser;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.trim()) {
    return cookieToken.trim();
  }

  return null;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập bằng Google.',
        },
      });
      return;
    }

    const payload = verifySessionToken(token);
    if (!payload || !mongoose.Types.ObjectId.isValid(payload.sub)) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
        },
      });
      return;
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Tài khoản không tồn tại hoặc đã bị xóa.',
        },
      });
      return;
    }

    req.authUser = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware]', error);
    res.status(500).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Lỗi xác thực phiên đăng nhập.',
      },
    });
  }
}
