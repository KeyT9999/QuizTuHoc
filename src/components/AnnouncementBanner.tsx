import { useEffect, useState } from 'react';
import {
  fetchActiveAnnouncements,
  isBackendConfigured,
  type PublicAnnouncement,
} from '../utils/backendApi';
import './AnnouncementBanner.css';

const DISMISSED_KEY = 'keyt_dismissed_announcements';

function loadDismissedIds(): string[] {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function AnnouncementBanner() {
  const [items, setItems] = useState<PublicAnnouncement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => loadDismissedIds());

  useEffect(() => {
    if (!isBackendConfigured()) return;
    let cancelled = false;
    fetchActiveAnnouncements()
      .then((res) => {
        if (!cancelled) setItems(res.announcements || []);
      })
      .catch(() => {
        // Silent fail if backend unreachable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = items.filter((item) => !dismissedIds.includes(item.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const typeIcon: Record<PublicAnnouncement['type'], string> = {
    info: '📢',
    update: '🚀',
    warning: '⚠️',
    event: '🎉',
  };

  return (
    <div className="ann-stack" role="region" aria-label="Thông báo hệ thống">
      {visible.slice(0, 2).map((item) => (
        <div key={item.id} className={`ann-banner ann-type-${item.type}`}>
          <div className="ann-content">
            <span className="ann-icon" aria-hidden="true">
              {item.isPinned ? '📌' : typeIcon[item.type]}
            </span>
            <div className="ann-text">
              <strong>{item.title}:</strong> <span>{item.content}</span>
              {item.linkUrl && (
                <a
                  href={item.linkUrl}
                  target={item.linkUrl.startsWith('http') ? '_blank' : undefined}
                  rel={item.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                  className="ann-link"
                >
                  {item.linkLabel || 'Xem thêm →'}
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            className="ann-close"
            onClick={() => dismiss(item.id)}
            aria-label="Ẩn thông báo"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
