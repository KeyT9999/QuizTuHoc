import type { AppTheme } from '../utils/studyStats';
import './ThemeSelectorModal.css';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export default function ThemeSelectorModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}: ThemeSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="theme-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="theme-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="theme-modal-header">
          <div className="theme-modal-title-group">
            <span className="theme-modal-icon">🎨</span>
            <div>
              <h3 className="theme-modal-title">Chọn Giao Diện Học Tập</h3>
              <p className="theme-modal-subtitle">
                Tùy biến không gian để bạn có cảm hứng học tập và cày đề tốt nhất
              </p>
            </div>
          </div>
          <button
            type="button"
            className="theme-modal-close-btn"
            onClick={onClose}
            aria-label="Đóng bảng chọn giao diện"
          >
            ✕
          </button>
        </div>

        <div className="theme-grid">
          {/* Option: Liên Hoa Phật Quốc (Zen Sanctuary) */}
          <div
            className={`theme-card ${currentTheme === 'lotus-zen-sanctuary' ? 'is-active' : ''}`}
            onClick={() => {
              onSelectTheme('lotus-zen-sanctuary');
              onClose();
            }}
          >
            <div className="theme-card-preview lotus-preview">
              <div className="theme-preview-overlay">
                <span className="theme-preview-badge lotus">🪷 Siêu Phẩm · Liên Hoa Phật Quốc</span>
              </div>
              <div className="theme-preview-mockup">
                <div className="mockup-sidebar-left lotus-sidebar"></div>
                <div className="mockup-card-center lotus-card">
                  <div className="mockup-line-title lotus-title"></div>
                  <div className="mockup-line-option lotus-option"></div>
                  <div className="mockup-line-option lotus-option active"></div>
                </div>
                <div className="mockup-sidebar-right lotus-sidebar"></div>
              </div>
            </div>

            <div className="theme-card-info">
              <div className="theme-card-header">
                <h4 className="theme-card-name">Liên Hoa Phật Quốc (Zen Sanctuary)</h4>
                {currentTheme === 'lotus-zen-sanctuary' && (
                  <span className="theme-active-tag">✓ Đang dùng</span>
                )}
              </div>
              <p className="theme-card-desc">
                Không gian học tập lấy cảm hứng từ kiến trúc Phật giáo Việt Nam, kết hợp hoa sen, thiền viện, vàng đồng, hiệu ứng điện ảnh và trải nghiệm 3D tinh tế.
              </p>
              <div className="theme-card-tags">
                <span className="theme-tag">Di Sản Phật Quốc</span>
                <span className="theme-tag">Liên Hoa 3D</span>
                <span className="theme-tag">Vàng Kim & Gỗ Trầm</span>
                <span className="theme-tag">Mõ Gỗ Tu Tâm</span>
                <span className="theme-tag">Zen Focus</span>
              </div>
            </div>
          </div>

          {/* Option 1: Hồn Việt Study Dashboard */}
          <div
            className={`theme-card ${currentTheme === 'hon-viet' ? 'is-active' : ''}`}
            onClick={() => {
              onSelectTheme('hon-viet');
              onClose();
            }}
          >
            <div className="theme-card-preview hon-viet-preview">
              <div className="theme-preview-overlay">
                <span className="theme-preview-badge hon-viet">⭐ Mới · Hồn Việt</span>
              </div>
              <div className="theme-preview-mockup">
                <div className="mockup-sidebar-left hon-viet-sidebar"></div>
                <div className="mockup-card-center hon-viet-card">
                  <div className="mockup-line-title hon-viet-title"></div>
                  <div className="mockup-line-option hon-viet-option"></div>
                  <div className="mockup-line-option hon-viet-option active"></div>
                </div>
                <div className="mockup-sidebar-right hon-viet-sidebar"></div>
              </div>
            </div>

            <div className="theme-card-info">
              <div className="theme-card-header">
                <h4 className="theme-card-name">Hồn Việt (Study Dashboard)</h4>
                {currentTheme === 'hon-viet' && (
                  <span className="theme-active-tag">✓ Đang dùng</span>
                )}
              </div>
              <p className="theme-card-desc">
                Cờ Tổ quốc, đỏ son & vàng kim, hoa văn trống đồng, hoa sen, bản đồ Việt Nam và trích dẫn truyền cảm hứng học tập dựng xây đất nước.
              </p>
              <div className="theme-card-tags">
                <span className="theme-tag">Đỏ Son & Vàng Kim</span>
                <span className="theme-tag">Trống Đồng</span>
                <span className="theme-tag">Hoa Sen</span>
                <span className="theme-tag">Bản Đồ Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Option 2: Fantasy Academy / Medieval RPG */}
          <div
            className={`theme-card ${currentTheme === 'fantasy-academy' ? 'is-active' : ''}`}
            onClick={() => {
              onSelectTheme('fantasy-academy');
              onClose();
            }}
          >
            <div className="theme-card-preview fantasy-preview">
              <div className="theme-preview-overlay">
                <span className="theme-preview-badge fantasy">📜 Mới · Fantasy RPG</span>
              </div>
              <div className="theme-preview-mockup">
                <div className="mockup-sidebar-left fantasy-sidebar"></div>
                <div className="mockup-card-center fantasy-card">
                  <div className="mockup-line-title fantasy-title"></div>
                  <div className="mockup-line-option fantasy-option"></div>
                  <div className="mockup-line-option fantasy-option active"></div>
                </div>
                <div className="mockup-sidebar-right fantasy-sidebar"></div>
              </div>
            </div>

            <div className="theme-card-info">
              <div className="theme-card-header">
                <h4 className="theme-card-name">Học Viện Ma Pháp (Fantasy RPG)</h4>
                {currentTheme === 'fantasy-academy' && (
                  <span className="theme-active-tag">✓ Đang dùng</span>
                )}
              </div>
              <p className="theme-card-desc">
                Bản đồ học tập cây kỹ năng, thẻ giấy da cổ viền vàng, nhiệm vụ mở rương báu và Cú pháp sư đồng hành nhắc nhở học tập.
              </p>
              <div className="theme-card-tags">
                <span className="theme-tag">Giấy da Cổ</span>
                <span className="theme-tag">Bản Đồ Cây</span>
                <span className="theme-tag">Rương Báu</span>
                <span className="theme-tag">Cú Pháp Sư</span>
              </div>
            </div>
          </div>

          {/* Option 2: Cozy Night Lofi Study Room */}
          <div
            className={`theme-card ${currentTheme === 'cozy-night' ? 'is-active' : ''}`}
            onClick={() => {
              onSelectTheme('cozy-night');
              onClose();
            }}
          >
            <div className="theme-card-preview cozy-preview">
              <div className="theme-preview-overlay">
                <span className="theme-preview-badge">🌙 Cozy Night</span>
              </div>
              <div className="theme-preview-mockup">
                <div className="mockup-sidebar-left"></div>
                <div className="mockup-card-center">
                  <div className="mockup-line-title"></div>
                  <div className="mockup-line-option"></div>
                  <div className="mockup-line-option active"></div>
                </div>
                <div className="mockup-sidebar-right"></div>
              </div>
            </div>

            <div className="theme-card-info">
              <div className="theme-card-header">
                <h4 className="theme-card-name">Phòng Học Cozy Night (Lofi Anime)</h4>
                {currentTheme === 'cozy-night' && (
                  <span className="theme-active-tag">✓ Đang dùng</span>
                )}
              </div>
              <p className="theme-card-desc">
                Layout 3 cột Glassmorphism, phòng học đêm ấm cúng, widget XP mèo cưng, Chuỗi học tập và Focus Mode chống phân tâm.
              </p>
              <div className="theme-card-tags">
                <span className="theme-tag">Kính mờ Glass</span>
                <span className="theme-tag">Anime Lofi</span>
                <span className="theme-tag">Dark Mode</span>
                <span className="theme-tag">Focus Mode</span>
              </div>
            </div>
          </div>

          {/* Option 3: Default Classic Exam View */}
          <div
            className={`theme-card ${currentTheme === 'default' ? 'is-active' : ''}`}
            onClick={() => {
              onSelectTheme('default');
              onClose();
            }}
          >
            <div className="theme-card-preview default-preview">
              <div className="theme-preview-overlay">
                <span className="theme-preview-badge light">☀️ Chuẩn Thi Cử</span>
              </div>
              <div className="theme-preview-mockup default-mockup">
                <div className="mockup-header-strip"></div>
                <div className="mockup-card-center light">
                  <div className="mockup-line-title dark"></div>
                  <div className="mockup-line-option light"></div>
                  <div className="mockup-line-option light"></div>
                </div>
              </div>
            </div>

            <div className="theme-card-info">
              <div className="theme-card-header">
                <h4 className="theme-card-name">Giao Diện Mặc Định (Classic PMG)</h4>
                {currentTheme === 'default' && (
                  <span className="theme-active-tag">✓ Đang dùng</span>
                )}
              </div>
              <p className="theme-card-desc">
                Giao diện trắng/xanh nguyên bản, gọn gàng và trực quan, tối ưu cho tốc độ ôn bài thi đại học chuẩn mực.
              </p>
              <div className="theme-card-tags">
                <span className="theme-tag">Gọn gàng</span>
                <span className="theme-tag">Nền sáng</span>
                <span className="theme-tag">Tốc độ cao</span>
              </div>
            </div>
          </div>
        </div>

        <div className="theme-modal-footer">
          <p className="theme-footer-hint">
            💡 Gợi ý: Bạn có thể đổi lại bất cứ lúc nào bằng nút <strong>🎨 Giao diện</strong> trên thanh điều khiển.
          </p>
          <button type="button" className="theme-done-btn" onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}
