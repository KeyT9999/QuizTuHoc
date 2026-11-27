import 'dotenv/config';

function trimTrailingSlash(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function parseOrigins(raw: string | undefined, fallback: string): string[] {
  const list = (raw || fallback)
    .split(',')
    .map((item) => trimTrailingSlash(item))
    .filter(Boolean);
  return Array.from(new Set(list));
}

const isProduction = process.env.NODE_ENV === 'production';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number.parseInt(process.env.PORT || '4000', 10) || 4000,
  trustProxy: Number.parseInt(process.env.TRUST_PROXY || '1', 10) || 1,
  mongodbUri:
    process.env.MONGODB_URI?.trim() ||
    process.env.MONGODB_URL?.trim() ||
    'mongodb://127.0.0.1:27017/quiztuhoc',
  jwtSecret: process.env.JWT_SECRET?.trim() || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '30d',
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL?.trim() || 'http://localhost:4000/api/auth/google/callback',
  frontendUrl: trimTrailingSlash(process.env.FRONTEND_URL || 'http://localhost:5173'),
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGINS,
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ),
  cookieDomain: process.env.COOKIE_DOMAIN?.trim() || undefined,
};

export function validateEnv(): void {
  const missing: string[] = [];

  if (!env.mongodbUri) missing.push('MONGODB_URI');
  if (!env.jwtSecret || env.jwtSecret.length < 16) {
    missing.push('JWT_SECRET (tối thiểu 16 ký tự)');
  }

  if (missing.length > 0) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${missing.join(', ')}`);
  }

  if (!env.googleClientId || !env.googleClientSecret) {
    console.warn(
      '[WARN] Chưa cấu hình GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET — tính năng đăng nhập Google sẽ trả lỗi 503 cho đến khi điền vào .env'
    );
  }
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleCallbackUrl);
}
