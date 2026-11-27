import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigateTo } from '../utils/router';
import './UserAccountMenu.css';

interface UserAccountMenuProps {
  onOpenProfile?: () => void;
}

function GoogleIcon() {
  return (
    <svg className="uam-google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export default function UserAccountMenu({ onOpenProfile }: UserAccountMenuProps) {
  const { user, isAuthenticated, isLoading, isSyncing, loginWithGoogle, logout, syncNow } =
    useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatar]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  const handleGoProfile = () => {
    setMenuOpen(false);
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      navigateTo('/profile');
    }
  };

  if (isLoading) {
    return (
      <div className="uam-root">
        <div className="uam-skeleton" aria-label="Đang tải tài khoản" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="uam-root">
        <button
          type="button"
          className="uam-login-btn"
          onClick={() => loginWithGoogle('/profile')}
          title="Đăng nhập Google để lưu và đồng bộ tiến độ học tập"
        >
          <GoogleIcon />
          <span className="uam-login-label">Đăng nhập</span>
        </button>
      </div>
    );
  }

  const initial = (user.name || user.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="uam-root" ref={containerRef}>
      <button
        type="button"
        className={`uam-trigger ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title={`${user.name} (${user.email})`}
      >
        <div className="uam-avatar-wrap">
          {user.avatar && !avatarFailed ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="uam-avatar-img"
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className="uam-avatar-fallback">{initial}</span>
          )}
          <span
            className={`uam-sync-dot ${isSyncing ? 'is-syncing' : ''}`}
            title={isSyncing ? 'Đang đồng bộ lên đám mây...' : 'Đã kết nối đám mây'}
          />
        </div>
        <span className="uam-user-name">{user.givenName || user.name.split(' ')[0]}</span>
        <svg
          className="uam-chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {menuOpen && (
        <div className="uam-dropdown" role="menu">
          <div className="uam-dropdown-header">
            <div className="uam-dropdown-name">{user.name}</div>
            <div className="uam-dropdown-email">{user.email}</div>
            <div className="uam-dropdown-badges">
              <span className="uam-badge-pill">⭐ Lv.{user.level}</span>
              <span className="uam-badge-pill">⚡ {user.xp.toLocaleString('vi-VN')} XP</span>
              <span className="uam-badge-pill">🔥 {user.streakDays} ngày</span>
            </div>
          </div>

          <div className="uam-dropdown-actions">
            <button
              type="button"
              className="uam-menu-item"
              role="menuitem"
              onClick={handleGoProfile}
            >
              <span>👤</span>
              <span>Hồ sơ & Tiến độ học</span>
            </button>

            <button
              type="button"
              className="uam-menu-item"
              role="menuitem"
              disabled={isSyncing}
              onClick={() => {
                void syncNow();
                setMenuOpen(false);
              }}
            >
              <span>{isSyncing ? '⏳' : '☁️'}</span>
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
            </button>

            <div className="uam-menu-divider" />

            <button
              type="button"
              className="uam-menu-item is-danger"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                void logout();
              }}
            >
              <span>🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
