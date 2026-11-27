import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import './QuizAuthGate.css';

interface QuizAuthGateProps {
  mode: 'quiz' | 'new_quiz';
  course?: Course | null;
  quizSet?: QuizSetInfo | null;
  isBackendReady: boolean;
  authError: string | null;
  onLogin: () => void;
  onBack: () => void;
  onBackToLibrary: () => void;
}

export default function QuizAuthGate({
  mode,
  course,
  quizSet,
  isBackendReady,
  authError,
  onLogin,
  onBack,
  onBackToLibrary,
}: QuizAuthGateProps) {
  const isNewQuiz = mode === 'new_quiz';
  const targetTitle = isNewQuiz
    ? `Tạo đề thi mới${course ? ` · ${course.code}` : ''}`
    : quizSet?.title || 'Bộ đề trắc nghiệm';

  const targetMeta = isNewQuiz
    ? course?.name || 'Kho đề tự tạo cá nhân'
    : [
        course ? `${course.code} — ${course.name}` : quizSet?.category,
        quizSet?.badge,
      ]
        .filter(Boolean)
        .join(' · ');

  return (
    <section className="qag-shell" aria-label="Yêu cầu đăng nhập để xem quiz">
      <div className="qag-topbar">
        <button type="button" className="qag-back-btn" onClick={onBack}>
          ← {course ? `Quay lại ${course.code}` : 'Quay lại'}
        </button>
        <button type="button" className="qag-library-link" onClick={onBackToLibrary}>
          Thư viện môn học
        </button>
      </div>

      <div className="qag-card">
        <div className="qag-lock-badge" aria-hidden="true">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="11" width="16" height="10" rx="2.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            <circle cx="12" cy="16" r="1.25" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <span className="qag-eyebrow">🔒 NỘI DUNG DÀNH CHO THÀNH VIÊN</span>

        <h1 className="qag-title">Đăng nhập để mở khóa đề thi</h1>

        <p className="qag-subtitle">
          {isNewQuiz
            ? 'Bạn cần đăng nhập tài khoản Google để tạo và lưu bộ đề riêng trên KEYT.'
            : 'Bạn chưa đăng nhập nên chưa thể xem câu hỏi và đáp án của bộ đề này. Đăng nhập Google mất 3 giây để mở khóa ngay và tự động lưu toàn bộ tiến độ học.'}
        </p>

        <div className="qag-target-box">
          <div className="qag-target-icon" aria-hidden="true">
            {isNewQuiz ? '✨' : '📘'}
          </div>
          <div className="qag-target-info">
            <div className="qag-target-title">{targetTitle}</div>
            {targetMeta && <div className="qag-target-meta">{targetMeta}</div>}
          </div>
          <span className="qag-target-pill">Đang khóa</span>
        </div>

        <div className="qag-perks">
          <div className="qag-perk">
            <span aria-hidden="true">☁️</span>
            <span>Đồng bộ tiến độ &amp; câu đã thuộc trên mọi thiết bị</span>
          </div>
          <div className="qag-perk">
            <span aria-hidden="true">⚡</span>
            <span>Tích lũy XP thật, chuỗi ngày học (Streak) &amp; xếp hạng BXH</span>
          </div>
          <div className="qag-perk">
            <span aria-hidden="true">🎯</span>
            <span>Mở toàn bộ kho đề, chia nhóm kiến thức &amp; thi thử Mock Exam</span>
          </div>
        </div>

        {authError && (
          <div className="qag-error" role="alert">
            ⚠️ {authError}
          </div>
        )}

        <div className="qag-actions">
          {isBackendReady ? (
            <button
              type="button"
              className="qag-google-btn"
              data-no-shopee-redirect="true"
              onClick={onLogin}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1C6.23 6.87 8.88 4.76 12 4.76z"
                />
              </svg>
              <span>Đăng nhập bằng Google để mở khóa</span>
            </button>
          ) : (
            <div className="qag-error" role="status">
              Hệ thống xác thực hiện chưa sẵn sàng. Vui lòng thử lại sau.
            </div>
          )}

          <button type="button" className="qag-secondary-btn" onClick={onBack}>
            ← Quay lại xem danh sách đề
          </button>
        </div>
      </div>
    </section>
  );
}
