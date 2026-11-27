import { Router, type Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { env, isGoogleAuthConfigured } from '../config/env.js';
import { User } from '../models/User.js';
import { OAuthState } from '../models/OAuthState.js';
import { AuthTicket } from '../models/AuthTicket.js';
import {
  requireAuth,
  SESSION_COOKIE_NAME,
  type AuthenticatedRequest,
} from '../middleware/auth.js';
import { createRandomToken, hashSecretToken, signSessionToken } from '../utils/jwt.js';
import { serializeUserBasics } from '../services/profileService.js';

const router = Router();

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const TICKET_TTL_MS = 60 * 1000; // 60 seconds
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function createGoogleClient(): OAuth2Client {
  return new OAuth2Client(env.googleClientId, env.googleClientSecret, env.googleCallbackUrl);
}

function sanitizeRedirectPath(raw: unknown): string {
  if (typeof raw !== 'string') return '/profile';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return '/profile';
  }
  return trimmed.slice(0, 200);
}

function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
    ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
  });
}

function redirectToFrontendError(res: Response, code: string): void {
  const url = new URL('/auth/callback', env.frontendUrl);
  url.searchParams.set('error', code);
  res.redirect(302, url.toString());
}

/**
 * GET /api/auth/google?redirect=/profile
 * Bắt đầu luồng Google OAuth 2.0 chuẩn
 */
router.get('/google', async (req, res) => {
  if (!isGoogleAuthConfigured()) {
    res.status(503).json({
      error: {
        code: 'GOOGLE_AUTH_NOT_CONFIGURED',
        message: 'Máy chủ chưa cấu hình GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.',
      },
    });
    return;
  }

  try {
    const rawState = createRandomToken(24);
    const redirectPath = sanitizeRedirectPath(req.query.redirect);

    await OAuthState.create({
      stateHash: hashSecretToken(rawState),
      redirectPath,
      expiresAt: new Date(Date.now() + STATE_TTL_MS),
    });

    const client = createGoogleClient();
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'online',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      state: rawState,
    });

    res.redirect(302, authorizeUrl);
  } catch (error) {
    console.error('[Auth] Google OAuth init failed:', error);
    redirectToFrontendError(res, 'oauth_init_failed');
  }
});

/**
 * GET /api/auth/google/callback
 * Google gọi về endpoint này sau khi người dùng xác nhận đăng nhập
 */
router.get('/google/callback', async (req, res) => {
  if (!isGoogleAuthConfigured()) {
    redirectToFrontendError(res, 'google_not_configured');
    return;
  }

  const oauthError = typeof req.query.error === 'string' ? req.query.error : '';
  if (oauthError) {
    redirectToFrontendError(res, oauthError === 'access_denied' ? 'cancelled' : 'google_error');
    return;
  }

  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';

  if (!code || !state) {
    redirectToFrontendError(res, 'missing_params');
    return;
  }

  try {
    // 1. Verify and consume OAuth state nonce (CSRF protection)
    const stateRecord = await OAuthState.findOneAndDelete({
      stateHash: hashSecretToken(state),
      expiresAt: { $gt: new Date() },
    });

    if (!stateRecord) {
      redirectToFrontendError(res, 'invalid_state');
      return;
    }

    // 2. Exchange authorization code with Google
    const client = createGoogleClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      redirectToFrontendError(res, 'missing_id_token');
      return;
    }

    // 3. Cryptographically verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      redirectToFrontendError(res, 'invalid_google_profile');
      return;
    }

    if (payload.email_verified === false) {
      redirectToFrontendError(res, 'email_not_verified');
      return;
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const googleName = payload.name?.trim() || email.split('@')[0];
    const givenName = payload.given_name?.trim() || '';
    const avatar = payload.picture?.trim() || '';
    const now = new Date();

    // 4. Upsert user in MongoDB (preserve custom display name if already edited)
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      user.googleId = googleId;
      user.email = email;
      user.googleName = googleName;
      if (!user.name) user.name = googleName;
      if (givenName) user.givenName = givenName;
      if (avatar) user.avatar = avatar;
      user.lastLoginAt = now;
      await user.save();
    } else {
      user = await User.create({
        googleId,
        email,
        googleName,
        name: googleName,
        givenName,
        avatar,
        lastLoginAt: now,
      });
    }

    // 5. Issue single-use 60-second auth ticket (safe for cross-domain Vercel <-> VPS)
    const rawExchangeTicket = createRandomToken(32);
    await AuthTicket.create({
      ticketHash: hashSecretToken(rawExchangeTicket),
      userId: user._id,
      expiresAt: new Date(Date.now() + TICKET_TTL_MS),
    });

    const redirectUrl = new URL('/auth/callback', env.frontendUrl);
    redirectUrl.searchParams.set('ticket', rawExchangeTicket);
    redirectUrl.searchParams.set('redirect', sanitizeRedirectPath(stateRecord.redirectPath));

    res.redirect(302, redirectUrl.toString());
  } catch (error) {
    console.error('[Auth] Google OAuth callback error:', error);
    redirectToFrontendError(res, 'oauth_callback_failed');
  }
});

const exchangeBodySchema = z.object({
  ticket: z.string().trim().min(10).max(200),
});

/**
 * POST /api/auth/exchange
 * Đổi mã ticket dùng 1 lần lấy JWT session token + thiết lập HttpOnly cookie
 */
router.post('/exchange', async (req, res) => {
  const parsed = exchangeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_TICKET',
        message: 'Mã xác thực không hợp lệ.',
      },
    });
    return;
  }

  try {
    const record = await AuthTicket.findOneAndDelete({
      ticketHash: hashSecretToken(parsed.data.ticket),
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      res.status(401).json({
        error: {
          code: 'TICKET_EXPIRED',
          message: 'Mã xác thực đã hết hạn hoặc đã được sử dụng. Vui lòng đăng nhập lại.',
        },
      });
      return;
    }

    const user = await User.findById(record.userId);
    if (!user) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Không tìm thấy tài khoản.',
        },
      });
      return;
    }

    const token = signSessionToken({ sub: user._id.toString(), email: user.email });
    setSessionCookie(res, token);

    res.status(200).json({
      token,
      user: serializeUserBasics(user),
    });
  } catch (error) {
    console.error('[Auth] Exchange error:', error);
    res.status(500).json({
      error: {
        code: 'EXCHANGE_FAILED',
        message: 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.',
      },
    });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    user: serializeUserBasics(req.authUser!),
  });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
    ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
  });
  res.status(200).json({ ok: true });
});

export default router;
