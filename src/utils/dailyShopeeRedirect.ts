import { useEffect } from 'react';

const SHOPEE_AFFILIATE_URL = 'https://s.shopee.vn/9pfvIGv7oO';
const STORAGE_DAILY_SHOPEE_KEY = 'keyt_daily_shopee_redirect_date';
const STORAGE_DAILY_TARGET_TS_KEY = 'keyt_daily_shopee_target_ts';

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hasTriggeredToday(): boolean {
  try {
    return localStorage.getItem(STORAGE_DAILY_SHOPEE_KEY) === getTodayDateKey();
  } catch {
    return false;
  }
}

function markTriggeredToday(): void {
  try {
    localStorage.setItem(STORAGE_DAILY_SHOPEE_KEY, getTodayDateKey());
    sessionStorage.removeItem(STORAGE_DAILY_TARGET_TS_KEY);
  } catch {
    // ignore storage errors
  }
}

function getOrCreateRandomTriggerTimestamp(): number {
  try {
    const existing = sessionStorage.getItem(STORAGE_DAILY_TARGET_TS_KEY);
    if (existing) {
      const parsed = Number(existing);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    // Random thời điểm từ 15 giây đến 75 giây kể từ khi người dùng bắt đầu vào học
    const randomDelayMs = (15 + Math.floor(Math.random() * 61)) * 1000;
    const targetTs = Date.now() + randomDelayMs;
    sessionStorage.setItem(STORAGE_DAILY_TARGET_TS_KEY, String(targetTs));
    return targetTs;
  } catch {
    return Date.now() + 30_000;
  }
}

/**
 * Hook tự động mở link Shopee 1 ngày / 1 lần / 1 thiết bị
 * vào một thời điểm ngẫu nhiên khi người dùng đang thao tác học tập.
 */
export function useDailyShopeeRedirect(): void {
  useEffect(() => {
    if (hasTriggeredToday()) {
      return;
    }

    const targetTimestamp = getOrCreateRandomTriggerTimestamp();

    const handleUserInteraction = () => {
      if (hasTriggeredToday()) {
        window.removeEventListener('click', handleUserInteraction, true);
        return;
      }

      // Chờ tới đúng thời điểm random khi người dùng đang sử dụng
      if (Date.now() < targetTimestamp) {
        return;
      }

      // Đánh dấu đã mở hôm nay trên thiết bị này (1 ngày 1 lần 1 thiết bị)
      markTriggeredToday();
      window.removeEventListener('click', handleUserInteraction, true);

      // Mở link Shopee trong tab mới ngay trên thao tác click để không bị trình duyệt chặn popup
      // và không làm mất tiến độ bài thi đang làm
      const newWin = window.open(SHOPEE_AFFILIATE_URL, '_blank', 'noopener,noreferrer');
      if (!newWin) {
        window.location.href = SHOPEE_AFFILIATE_URL;
      }
    };

    window.addEventListener('click', handleUserInteraction, true);

    return () => {
      window.removeEventListener('click', handleUserInteraction, true);
    };
  }, []);
}
