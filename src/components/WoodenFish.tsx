import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playWoodFishSound, playTempleBellSound, type WoodFishTone } from '../utils/soundEffects';
import './WoodenFish.css';

interface FloatingItem {
  id: number;
  text: string;
  x: number;
  y: number;
}

const BLESSINGS = [
  '+1 Công đức 🪷',
  '+1 Cầu qua môn 🎓',
  '+1 Tịnh tâm an lạc 🌿',
  '+1 May mắn ngập tràn 🍀',
  '+1 Trí tuệ hanh thông 💡',
  '+1 Tâm bất biến 🧘',
  '+1 Vạn sự như ý ✨',
  '+1 Điểm A+ rực rỡ 🎯',
];

interface WoodenFishProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onOpenModal?: () => void;
  customMantra?: string;
}

export default function WoodenFish({
  isOpenModal = false,
  onCloseModal,
  onOpenModal,
  customMantra,
}: WoodenFishProps) {
  // Total Merit Count stored in localStorage
  const [merits, setMerits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('keyt_woodfish_merits');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(isOpenModal);
  const [isStruck, setIsStruck] = useState(false);
  const [isBubblePressed, setIsBubblePressed] = useState(false);
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [combo, setCombo] = useState(0);
  const [tone, setTone] = useState<WoodFishTone>('warm');
  const [selectedMantra, setSelectedMantra] = useState<string>('random');
  const [autoStrike, setAutoStrike] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1000); // 1000ms

  const comboTimerRef = useRef<number | null>(null);
  const autoStrikeTimerRef = useRef<number | null>(null);
  const strikeTimeoutRef = useRef<number | null>(null);

  // Sync external prop if provided
  useEffect(() => {
    setIsModalOpen(isOpenModal);
  }, [isOpenModal]);

  // Listen to global open event
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsModalOpen(true);
      if (onOpenModal) onOpenModal();
    };
    window.addEventListener('open-woodfish-modal', handleOpenEvent);
    return () => window.removeEventListener('open-woodfish-modal', handleOpenEvent);
  }, [onOpenModal]);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    if (onCloseModal) onCloseModal();
  }, [onCloseModal]);

  const handleOpen = useCallback(() => {
    setIsModalOpen(true);
    if (onOpenModal) onOpenModal();
  }, [onOpenModal]);

  // Perform a single strike
  const strike = useCallback((coords?: { x: number; y: number }) => {
    // 1. Audio
    playWoodFishSound(tone, true);

    // 2. Visual bounce animation
    setIsStruck(true);
    if (strikeTimeoutRef.current) clearTimeout(strikeTimeoutRef.current);
    strikeTimeoutRef.current = window.setTimeout(() => {
      setIsStruck(false);
    }, 180);

    // 3. Merits count
    setMerits((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('keyt_woodfish_merits', next.toString());
      } catch {
        // ignore
      }
      return next;
    });

    // 4. Combo
    setCombo((prev) => prev + 1);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = window.setTimeout(() => {
      setCombo(0);
    }, 2400);

    // 5. Floating blessing text
    let blessingText = customMantra;
    if (!blessingText) {
      if (selectedMantra === 'random') {
        const randIdx = Math.floor(Math.random() * BLESSINGS.length);
        blessingText = BLESSINGS[randIdx];
      } else {
        blessingText = selectedMantra;
      }
    }

    const newItem: FloatingItem = {
      id: Date.now() + Math.random(),
      text: blessingText || '+1 Công đức 🪷',
      x: coords ? coords.x : 130 + (Math.random() - 0.5) * 50,
      y: coords ? coords.y : 80 + (Math.random() - 0.5) * 30,
    };

    setFloatingItems((prev) => [...prev.slice(-12), newItem]);
  }, [tone, selectedMantra, customMantra]);

  // Clean up floating items
  useEffect(() => {
    if (floatingItems.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingItems((prev) => prev.slice(1));
    }, 1100);
    return () => clearTimeout(timer);
  }, [floatingItems]);

  // Auto-strike timer
  useEffect(() => {
    if (!autoStrike) {
      if (autoStrikeTimerRef.current) clearInterval(autoStrikeTimerRef.current);
      return;
    }

    autoStrikeTimerRef.current = window.setInterval(() => {
      strike();
    }, autoSpeed);

    return () => {
      if (autoStrikeTimerRef.current) clearInterval(autoStrikeTimerRef.current);
    };
  }, [autoStrike, autoSpeed, strike]);

  // Keyboard shortcut: Space / Enter to strike when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 'w' hotkey opens/toggles wooden fish if not typing in input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.key === 'w' || e.key === 'W') && !isModalOpen) {
        e.preventDefault();
        handleOpen();
        strike();
        return;
      }

      if (isModalOpen) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          strike();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, strike, handleClose, handleOpen]);

  // Trigger from floating bubble
  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBubblePressed(true);
    setTimeout(() => setIsBubblePressed(false), 150);

    const rect = e.currentTarget.getBoundingClientRect();
    strike({ x: rect.width / 2, y: -10 });
  };

  return (
    <>
      {/* ------------------------------------------------------------------
          1. FLOATING MINI WIDGET (LUÔN CÓ Ở GÓC DƯỚI BÊN PHẢI)
          ------------------------------------------------------------------ */}
      <div className="woodfish-float-container" aria-label="Gõ Mõ Tịnh Tâm">
        {/* Floating Merit Texts directly above the bubble */}
        <div className="woodfish-float-text-layer" style={{ position: 'relative', width: '100%', height: 0 }}>
          {floatingItems.slice(-3).map((item) => (
            <div
              key={item.id}
              className="woodfish-floating-item"
              style={{
                right: '10px',
                bottom: '70px',
              }}
            >
              {item.text}
            </div>
          ))}
        </div>

        {/* Floating Bubble */}
        <button
          type="button"
          className={`woodfish-float-bubble ${isBubblePressed ? 'is-pressed' : ''}`}
          onClick={handleBubbleClick}
          title="Bấm để Gõ Mõ · Nhấn icon góc để phóng to"
          aria-label="Gõ Mõ Cầu May"
        >
          {/* Mini Woodfish SVG */}
          <svg className="woodfish-bubble-svg" viewBox="0 0 100 90">
            <defs>
              <linearGradient id="bubble-cushion" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
              <radialGradient id="bubble-wood" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#c25e1a" />
                <stop offset="45%" stopColor="#85380c" />
                <stop offset="100%" stopColor="#3d1403" />
              </radialGradient>
            </defs>
            {/* Đệm lót */}
            <ellipse cx="50" cy="74" rx="34" ry="10" fill="url(#bubble-cushion)" />
            <path d="M 22 74 Q 50 82 78 74" stroke="#fbbf24" strokeWidth="1.2" fill="none" opacity="0.8" />
            <circle cx="18" cy="74" r="2.5" fill="#facc15" />
            <circle cx="82" cy="74" r="2.5" fill="#facc15" />

            {/* Thân mõ */}
            <path
              d="M 24 56 C 18 36, 30 18, 52 16 C 72 14, 86 28, 84 50 C 82 66, 68 72, 50 72 C 34 72, 26 66, 24 56 Z"
              fill="url(#bubble-wood)"
            />
            {/* Sống lưng ánh sáng */}
            <path d="M 38 18 Q 58 14 74 24" stroke="#fde68a" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
            {/* Khe há miệng */}
            <path
              d="M 42 50 C 54 46, 74 46, 82 53 C 76 58, 54 58, 42 50 Z"
              fill="#180502"
            />
            {/* Ngọc minh châu */}
            <circle cx="68" cy="52" r="2.5" fill="#f59e0b" />
            {/* Mắt cá */}
            <circle cx="72" cy="34" r="4" fill="#5c1d06" stroke="#b45309" strokeWidth="1" />
            <circle cx="72" cy="34" r="2" fill="#1a0601" />
            <circle cx="73" cy="33" r="0.8" fill="#fef08a" />
          </svg>

          {/* Badge hiển thị công đức */}
          <span className="woodfish-float-badge">
            {merits > 9999 ? `${(merits / 1000).toFixed(1)}k` : merits}
          </span>

          {/* Nút phóng to Chánh Điện */}
          <span
            className="woodfish-float-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            title="Mở Chánh Điện Gõ Mõ"
          >
            ⛶
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------------
          2. FULL MODAL CHÁNH ĐIỆN GÕ MÕ
          ------------------------------------------------------------------ */}
      {isModalOpen && (
        <div className="woodfish-modal-overlay" onClick={handleClose}>
          <div
            className="woodfish-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Hào quang nền */}
            <div className="woodfish-temple-halo" />

            {/* Header */}
            <div className="woodfish-modal-header">
              <div className="woodfish-modal-title">
                <span className="woodfish-modal-title-icon">🪷</span>
                <span>Gõ Mõ Cầu May & Tịnh Tâm</span>
              </div>
              <button
                type="button"
                className="woodfish-close-btn"
                onClick={handleClose}
                title="Đóng (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Stats Ribbon */}
            <div className="woodfish-stats-ribbon">
              <div className="woodfish-merit-counter">
                <span className="woodfish-merit-num">{merits.toLocaleString()}</span>
                <span className="woodfish-merit-label">Công đức tích lũy</span>
              </div>

              {combo > 2 && (
                <div className="woodfish-combo-pill">
                  <span>🔥</span>
                  <span>
                    COMBO x{combo}{' '}
                    {combo >= 20 ? '✨ ĐẠI CHÁNH NIỆM' : combo >= 10 ? '⚡ TÂM ĐẮC ĐẠO' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* KHU VỰC VẼ CÁI MÕ SVG VÀ CÂY DÙI */}
            <div
              className={`woodfish-stage ${isStruck ? 'is-struck' : ''}`}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                strike({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              title="Nhấn chuột hoặc phím Space để gõ mõ"
            >
              {/* Vòng sóng âm thanh tỏa ra */}
              <div className="woodfish-ripple-ring" />

              {/* Lớp chữ bay lên */}
              <div className="woodfish-float-text-layer">
                {floatingItems.map((item) => (
                  <div
                    key={item.id}
                    className="woodfish-floating-item"
                    style={{ left: `${item.x}px`, top: `${item.y}px` }}
                  >
                    {item.text}
                  </div>
                ))}
              </div>

              {/* BẢN VẼ CHI TIẾT CÁI MÕ (WOODEN FISH SVG) */}
              <svg className="woodfish-main-svg" viewBox="0 0 320 280">
                <defs>
                  {/* Bóng đổ */}
                  <filter id="wf-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.45" />
                  </filter>

                  {/* Gradient Đệm gấm đỏ hoàng gia */}
                  <linearGradient id="wf-cushion-base" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="35%" stopColor="#b91c1c" />
                    <stop offset="80%" stopColor="#7f1d1d" />
                    <stop offset="100%" stopColor="#450a0a" />
                  </linearGradient>

                  {/* Gradient Vàng thêu đệm */}
                  <linearGradient id="wf-gold-tassel" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  {/* Gradient Thân Mõ Gỗ Mahogany bóng bẩy */}
                  <radialGradient id="wf-wood-body" cx="42%" cy="38%" r="62%">
                    <stop offset="0%" stopColor="#c25e1a" />
                    <stop offset="25%" stopColor="#a34710" />
                    <stop offset="60%" stopColor="#78350f" />
                    <stop offset="85%" stopColor="#451a03" />
                    <stop offset="100%" stopColor="#240c02" />
                  </radialGradient>

                  {/* Vết bóng lóa trên thân mõ (Lacquer shine highlight) */}
                  <linearGradient id="wf-wood-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#fde68a" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>

                  {/* Gradient Cán dùi gỗ */}
                  <linearGradient id="wf-mallet-handle" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="50%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#451a03" />
                  </linearGradient>

                  {/* Gradient Đầu bọc dùi gõ */}
                  <radialGradient id="wf-mallet-head" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="40%" stopColor="#f59e0b" />
                    <stop offset="85%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                  </radialGradient>
                </defs>

                {/* 1. Bóng đổ dưới đáy */}
                <ellipse cx="160" cy="248" rx="105" ry="16" fill="rgba(0,0,0,0.55)" filter="blur(6px)" />

                {/* 2. ĐỆM GẤM ĐỎ (CUSHION / TOẠ CỤ) */}
                <g className="woodfish-cushion-group">
                  {/* Tua rua vàng hai bên đệm */}
                  <path d="M 46 226 C 36 240, 30 252, 28 262" stroke="url(#wf-gold-tassel)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  <circle cx="46" cy="225" r="4.5" fill="#facc15" />
                  <path d="M 274 226 C 284 240, 290 252, 292 262" stroke="url(#wf-gold-tassel)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  <circle cx="274" cy="225" r="4.5" fill="#facc15" />

                  {/* Thân đệm phồng tròn */}
                  <path
                    d="M 52 222 C 50 188, 270 188, 268 222 C 266 250, 54 250, 52 222 Z"
                    fill="url(#wf-cushion-base)"
                    filter="url(#wf-shadow)"
                  />
                  {/* Nếp gấp đệm thêu chỉ vàng */}
                  <path
                    d="M 68 218 Q 160 236 252 218"
                    stroke="#fbbf24"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                    fill="none"
                    opacity="0.75"
                  />
                  <path
                    d="M 90 226 Q 160 242 230 226"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  {/* Nút đính giữa đệm */}
                  <circle cx="160" cy="226" r="5" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="1.5" />
                </g>

                {/* 3. THÂN CÁI MÕ (WOODEN FISH BODY) */}
                <g className="woodfish-body-group">
                  {/* Khối chính thân mõ tròn bầu dục uốn lượn */}
                  <path
                    d="
                      M 82 178
                      C 62 145, 68 98, 122 78
                      C 172 60, 238 78, 262 126
                      C 278 160, 248 198, 185 204
                      C 128 208, 96 198, 82 178 Z
                    "
                    fill="url(#wf-wood-body)"
                    filter="url(#wf-shadow)"
                  />

                  {/* Quai cầm / Đuôi cá cuộn lại ở góc trên bên trái */}
                  <path
                    d="
                      M 108 92
                      C 86 86, 70 102, 75 125
                      C 80 142, 98 145, 110 134
                      C 118 126, 120 114, 116 104
                      Z
                    "
                    fill="#5e2106"
                  />
                  {/* Lỗ khoét quai cầm */}
                  <ellipse cx="94" cy="116" rx="9" ry="12" fill="#1c0702" />

                  {/* Sống lưng mõ chạm khắc (Dorsal crest) */}
                  <path
                    d="M 135 72 Q 185 64 225 82 Q 185 74 135 72 Z"
                    fill="#f59e0b"
                    opacity="0.4"
                  />

                  {/* Khe há miệng mõ (Rãnh âm thanh / Sound slit) */}
                  <path
                    d="
                      M 142 162
                      C 175 156, 222 156, 252 165
                      C 246 177, 182 178, 142 162 Z
                    "
                    fill="#150502"
                  />
                  {/* Ngọc minh châu ngậm trong miệng mõ */}
                  <circle cx="210" cy="166" r="7.5" fill="#d97706" stroke="#451a03" strokeWidth="1" />
                  <circle cx="208" cy="164" r="2" fill="#fef08a" />

                  {/* Mắt cá chạm khắc (Fish Eye) */}
                  <circle cx="236" cy="132" r="10.5" fill="#5c1d06" stroke="#b45309" strokeWidth="1.5" />
                  <circle cx="236" cy="132" r="6" fill="#1a0601" />
                  <circle cx="238" cy="130" r="2" fill="#fef08a" />

                  {/* Vảy cá chạm khắc nổi trên thân (Carved scales) */}
                  <path
                    d="M 152 110 Q 165 126 178 110"
                    stroke="#9a3412"
                    strokeWidth="2.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 174 116 Q 187 132 200 116"
                    stroke="#9a3412"
                    strokeWidth="2.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 160 132 Q 174 148 188 132"
                    stroke="#9a3412"
                    strokeWidth="2.4"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Vệt ánh sáng bóng vec-ni phản chiếu trên vòm lưng (Specular shine) */}
                  <path
                    d="
                      M 125 90
                      C 160 76, 212 90, 230 115
                      C 205 102, 160 92, 125 90 Z
                    "
                    fill="url(#wf-wood-highlight)"
                  />
                </g>

                {/* 4. CÂY DÙI GÕ MÕ (WOODEN MALLET) */}
                <g className="woodfish-mallet-group">
                  {/* Cán dùi bằng gỗ nhẵn bóng */}
                  <path
                    d="M 284 32 L 204 104 L 210 110 L 290 38 Z"
                    fill="url(#wf-mallet-handle)"
                    filter="url(#wf-shadow)"
                  />
                  {/* Khuyên đồng nối cán và đầu dùi */}
                  <rect x="202" y="99" width="7" height="6" transform="rotate(42 205 102)" fill="#f59e0b" />

                  {/* Đầu dùi gõ bọc vải ấm (Round mallet head) */}
                  <circle
                    cx="198"
                    cy="110"
                    r="13.5"
                    fill="url(#wf-mallet-head)"
                    filter="url(#wf-shadow)"
                  />
                  <circle cx="194" cy="106" r="4.5" fill="#fef08a" opacity="0.6" />
                </g>
              </svg>
            </div>

            {/* BỘ ĐIỀU KHIỂN & CÀI ĐẶT */}
            <div className="woodfish-controls-panel">
              {/* Hàng 1: Âm sắc & Tự động gõ */}
              <div className="woodfish-controls-row">
                <div className="woodfish-control-label">
                  <span>🔊 Âm sắc:</span>
                  <div className="woodfish-seg-group">
                    <button
                      type="button"
                      className={`woodfish-seg-btn ${tone === 'warm' ? 'is-active' : ''}`}
                      onClick={() => setTone('warm')}
                    >
                      Mõ Ấm
                    </button>
                    <button
                      type="button"
                      className={`woodfish-seg-btn ${tone === 'deep' ? 'is-active' : ''}`}
                      onClick={() => setTone('deep')}
                    >
                      Mõ Trầm
                    </button>
                    <button
                      type="button"
                      className={`woodfish-seg-btn ${tone === 'crisp' ? 'is-active' : ''}`}
                      onClick={() => setTone('crisp')}
                    >
                      Mõ Thanh
                    </button>
                  </div>
                </div>

                {/* Nút Chuông Bát Phụ */}
                <button
                  type="button"
                  className="woodfish-seg-btn"
                  onClick={() => playTempleBellSound(true)}
                  title="Thỉnh tiếng chuông bát"
                  style={{ border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.15)' }}
                >
                  🔔 Tiếng Chuông
                </button>
              </div>

              {/* Hàng 2: Tự động gõ mõ */}
              <div className="woodfish-controls-row">
                <div
                  className="woodfish-auto-toggle"
                  onClick={() => setAutoStrike((prev) => !prev)}
                >
                  <div className={`woodfish-toggle-track ${autoStrike ? 'is-on' : ''}`}>
                    <div className="woodfish-toggle-thumb" />
                  </div>
                  <span className="woodfish-control-label">
                    Tự động gõ ({autoSpeed === 1500 ? '1.5s' : autoSpeed === 1000 ? '1.0s' : '0.5s'})
                  </span>
                </div>

                {autoStrike && (
                  <div className="woodfish-seg-group">
                    <button
                      type="button"
                      className={`woodfish-seg-btn ${autoSpeed === 1500 ? 'is-active' : ''}`}
                      onClick={() => setAutoSpeed(1500)}
                    >
                      Thong thả
                    </button>
                    <button
                      type="button"
                      className={`woodfish-seg-btn ${autoSpeed === 1000 ? 'is-active' : ''}`}
                      onClick={() => setAutoSpeed(1000)}
                    >
                      Tịnh tâm
                    </button>
                    <button
                      type="button"
                      className={`woodfish-seg-btn ${autoSpeed === 500 ? 'is-active' : ''}`}
                      onClick={() => setAutoSpeed(500)}
                    >
                      Gấp gáp
                    </button>
                  </div>
                )}
              </div>

              {/* Hàng 3: Lời cầu nguyện */}
              <div className="woodfish-controls-row">
                <span className="woodfish-control-label">🙏 Lời nguyện:</span>
                <select
                  className="woodfish-mantra-select"
                  value={selectedMantra}
                  onChange={(e) => setSelectedMantra(e.target.value)}
                  aria-label="Chọn lời nguyện khi gõ mõ"
                >
                  <option value="random">🎲 Ngẫu nhiên lời chúc</option>
                  <option value="+1 Công đức 🪷">+1 Công đức 🪷</option>
                  <option value="+1 Cầu qua môn 🎓">+1 Cầu qua môn 🎓</option>
                  <option value="+1 Tịnh tâm an lạc 🌿">+1 Tịnh tâm an lạc 🌿</option>
                  <option value="+1 May mắn ngập tràn 🍀">+1 May mắn ngập tràn 🍀</option>
                  <option value="+1 Trí tuệ hanh thông 💡">+1 Trí tuệ hanh thông 💡</option>
                  <option value="+1 Điểm A+ rực rỡ 🎯">+1 Điểm A+ rực rỡ 🎯</option>
                </select>
              </div>
            </div>

            {/* Footer gợi ý */}
            <div className="woodfish-modal-footer">
              <span>Mẹo: Nhấn <kbd className="woodfish-kbd">Space</kbd> hoặc click chuột vào mõ để gõ</span>
              <span>·</span>
              <span><kbd className="woodfish-kbd">Esc</kbd> để đóng</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
