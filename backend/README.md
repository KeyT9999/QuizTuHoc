# QUIZTUHOC Backend (Express + TypeScript + MongoDB + Google OAuth 2.0)

Backend lưu tài khoản Google OAuth 2.0, hồ sơ cá nhân và tiến độ học tập (% môn học, % từng bộ đề, câu đã thuộc, Flashcard, XP & chuỗi ngày học Streak) bằng **MongoDB**, sẵn sàng deploy lên **VPS**.

## 1. Cấu trúc Database MongoDB

| Collection | Mục đích |
| --- | --- |
| `users` | Thông tin Google (`googleId`, `email`, `name`, `avatar`), bio/MSSV/kỳ mục tiêu, `xp`, `level`, `streakDays`, `streakLastDate`, `recentCourseIds`, `lastLoginAt`, `lastSyncedAt` |
| `course_summaries` | Tổng hợp tiến độ theo từng môn (`courseId`, `courseCode`, `courseName`, `masteredQuestions`, `totalQuestions`, `percent`, `completedSets`, `totalSets`, `isPassed`, `lastStudiedAt`) |
| `set_progresses` | Chi tiết từng bộ đề đã học (`setId`, `courseId`, `setTitle`, `masteredIds`, `masteredCount`, `totalQuestions`, `percent`, `isCompleted`) |
| `flashcard_progresses` | Tiến độ từng bộ Flashcard (`flashcardSetId`, `title`, `knownIds`, `knownCount`, `totalCards`, `percent`) |
| `oauth_states` | Nonce chống CSRF cho Google OAuth (tự xóa sau 10 phút bằng TTL index) |
| `auth_tickets` | Mã đổi token 1 lần sau OAuth callback (tự xóa sau 60 giây bằng TTL index) |

## 2. Tạo Google OAuth Client ID (Login Google chuẩn)

1. Vào [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Cấu hình **OAuth consent screen** (External → điền tên app, email hỗ trợ; khi đang test thêm email test hoặc chuyển sang Production để mọi người đăng nhập).
3. Tạo **Create Credentials → OAuth client ID → Web application**.
4. Thêm **Authorized redirect URIs**:
   - Local dev: `http://localhost:4000/api/auth/google/callback`
   - Production VPS: `https://api.yourdomain.com/api/auth/google/callback`
5. Lấy `Client ID` và `Client Secret` điền vào `backend/.env`.

## 3. Chạy thử Local

```bash
cd backend
cp .env.example .env
# Điền MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET vào .env
npm install
npm run dev
```

Ở frontend (thư mục gốc repo), thêm vào `.env` hoặc `.env.local`:

```env
VITE_BACKEND_URL=http://localhost:4000
```

Chạy frontend bằng `npm run dev` tại thư mục gốc (`http://localhost:5173`).

## 4. Deploy lên VPS

### Cách 1: Docker Compose (Khuyên dùng — tự bật cả MongoDB 7 + Backend)

Trên VPS (đã cài Docker + Docker Compose + Nginx):

```bash
cd /opt/quiztuhoc/backend
cp .env.example .env
nano .env
```

Trong `.env` đặt các biến production:

```env
NODE_ENV=production
PORT=4000
TRUST_PROXY=1
MONGO_ROOT_USER=quizadmin
MONGO_ROOT_PASSWORD=MatKhauMongoRatManh123!
DOCKER_MONGODB_URI=mongodb://quizadmin:MatKhauMongoRatManh123!@mongodb:27017/quiztuhoc?authSource=admin
JWT_SECRET=tao_bang_lenh_openssl_rand_hex_32
JWT_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://quiz-tu-hoc.vercel.app
CORS_ORIGINS=https://quiz-tu-hoc.vercel.app
```

Khởi chạy container:

```bash
docker compose up -d --build
curl http://127.0.0.1:4000/api/health
```

### Cách 2: Node.js + PM2 + MongoDB cài trực tiếp (hoặc MongoDB Atlas)

```bash
cd /opt/quiztuhoc/backend
cp .env.example .env
nano .env
npm ci
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Cấu hình Nginx + HTTPS (Certbot)

Dùng file mẫu `deploy/nginx.conf.example`, đổi `api.yourdomain.com` thành domain backend của bạn rồi cấp SSL bằng Let's Encrypt:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### Kết nối Frontend trên Vercel

Vào **Vercel → Project Settings → Environment Variables**, thêm:

```env
VITE_BACKEND_URL=https://api.yourdomain.com
```

Sau đó **Redeploy** frontend.

## 5. Danh sách API Endpoints

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/api/health` | Kiểm tra trạng thái server & kết nối MongoDB |
| `GET` | `/api/auth/google?redirect=/profile` | Chuyển hướng sang màn hình đăng nhập Google |
| `GET` | `/api/auth/google/callback` | Nhận callback từ Google, upsert user vào MongoDB, trả về frontend qua ticket 1 lần |
| `POST` | `/api/auth/exchange` | Đổi `ticket` dùng 1 lần lấy JWT session + cookie |
| `GET` | `/api/auth/me` | Lấy thông tin cơ bản của tài khoản đang đăng nhập |
| `POST` | `/api/auth/logout` | Đăng xuất và xóa session cookie |
| `GET` | `/api/profile/me` | Lấy đầy đủ hồ sơ + tổng quan XP/Streak + % từng môn học, bộ đề, Flashcard |
| `PATCH` | `/api/profile/me` | Cập nhật tên hiển thị, bio, MSSV/ngành, kỳ học mục tiêu |
| `POST` | `/api/progress/merge` | Gộp dữ liệu học trên máy (localStorage) với MongoDB khi mới đăng nhập |
| `PUT` | `/api/progress/sync` | Đồng bộ tiến độ học tập mới nhất lên MongoDB |
