import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env, isGoogleAuthConfigured } from './config/env.js';
import { getDatabaseStatus } from './config/database.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import progressRoutes from './routes/progress.js';
import announcementsRoutes from './routes/announcements.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', env.trustProxy);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Cho phép server-to-server / health check / curl không có Origin header
        if (!origin) {
          callback(null, true);
          return;
        }
        const normalized = origin.replace(/\/+$/, '');
        if (env.corsOrigins.includes(normalized)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} không nằm trong danh sách CORS_ORIGINS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau ít phút.',
      },
    },
  });

  const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 240,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Bạn đang đồng bộ quá nhanh. Vui lòng đợi một lát.',
      },
    },
  });

  app.get('/api/health', (_req, res) => {
    const dbStatus = getDatabaseStatus();
    const isHealthy = dbStatus === 'connected';
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      service: 'quiztuhoc-backend',
      mongodb: dbStatus,
      googleAuthConfigured: isGoogleAuthConfigured(),
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/profile', apiLimiter, profileRoutes);
  app.use('/api/progress', apiLimiter, progressRoutes);
  app.use('/api/announcements', apiLimiter, announcementsRoutes);
  app.use('/api/admin', apiLimiter, adminRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Không tìm thấy endpoint API này.',
      },
    });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err.message.includes('CORS_ORIGINS')) {
      res.status(403).json({
        error: {
          code: 'CORS_FORBIDDEN',
          message: err.message,
        },
      });
      return;
    }

    console.error('[Unhandled Error]', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Có lỗi hệ thống xảy ra trên máy chủ.',
      },
    });
  });

  return app;
}
