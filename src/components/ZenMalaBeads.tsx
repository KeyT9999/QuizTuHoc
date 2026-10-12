interface ZenMalaBeadsProps {
  count?: number;
  activeIndex?: number;
  className?: string;
}

export default function ZenMalaBeads({
  count = 14,
  activeIndex = 0,
  className = '',
}: ZenMalaBeadsProps) {
  const beads = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={`zen-mala-beads-wrap ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '6px 0',
        position: 'relative',
      }}
      aria-label="Tràng hạt Bồ Đề tiến độ"
    >
      {/* Golden Silk Cord connecting the beads */}
      <div
        style={{
          position: 'absolute',
          left: '20%',
          right: '20%',
          top: '50%',
          height: 1.5,
          background: 'linear-gradient(90deg, transparent, rgba(216, 179, 106, 0.6) 20%, rgba(216, 179, 106, 0.6) 80%, transparent)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Left Guru Knot / Tua Rua Vàng */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ zIndex: 1, flexShrink: 0 }}>
        <circle cx="12" cy="7" r="4.5" fill="url(#mala-gold-guru)" stroke="#B45309" strokeWidth="1" />
        <path d="M12 11.5L9 21M12 11.5L12 22M12 11.5L15 21" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
        <defs>
          <radialGradient id="mala-gold-guru" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </radialGradient>
        </defs>
      </svg>

      {/* Beads Sequence */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, zIndex: 1 }}>
        {beads.map((idx) => {
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <span
              key={idx}
              className={`zen-mala-bead ${isCompleted ? 'is-lit' : ''} ${isCurrent ? 'is-active' : ''}`}
              title={`Hạt bồ đề ${idx + 1}`}
              style={{
                width: isCurrent ? 12 : 9,
                height: isCurrent ? 12 : 9,
                borderRadius: '50%',
                background: isCurrent
                  ? 'radial-gradient(circle at 35% 30%, #FEF08A 0%, #F59E0B 45%, #92400E 85%, #451A03 100%)'
                  : isCompleted
                  ? 'radial-gradient(circle at 35% 30%, #FCD34D 0%, #D97706 55%, #78350F 90%, #290E02 100%)'
                  : 'radial-gradient(circle at 35% 30%, #854D0E 0%, #451A03 60%, #1C0B02 100%)',
                border: isCurrent
                  ? '1.5px solid #FDE047'
                  : isCompleted
                  ? '1px solid rgba(217, 119, 6, 0.7)'
                  : '1px solid rgba(120, 53, 15, 0.5)',
                boxShadow: isCurrent
                  ? '0 0 10px #F59E0B, 0 0 3px #FEF08A, inset 0 1px 2px #FEF08A'
                  : isCompleted
                  ? '0 0 5px rgba(245, 158, 11, 0.45)'
                  : 'inset 0 1px 2px rgba(0,0,0,0.6)',
                transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'inline-block',
                cursor: 'default',
              }}
            />
          );
        })}
      </div>

      {/* Right Golden Lotus Blossom Terminal */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ zIndex: 1, flexShrink: 0 }}>
        <path
          d="M12 4C10.5 8 9 12 9 14.5C9 16.5 10.3 18 12 18C13.7 18 15 16.5 15 14.5C15 12 13.5 8 12 4Z"
          fill="#F59E0B"
        />
        <path
          d="M7 10C6.5 13 6 15 7.5 16.5C8.8 17.8 10.5 17.5 11 17C10 15 9 12.5 7 10Z"
          fill="#D97706"
        />
        <path
          d="M17 10C17.5 13 18 15 16.5 16.5C15.2 17.8 13.5 17.5 13 17C14 15 15 12.5 17 10Z"
          fill="#D97706"
        />
        <circle cx="12" cy="18" r="2" fill="#B45309" />
      </svg>
    </div>
  );
}
