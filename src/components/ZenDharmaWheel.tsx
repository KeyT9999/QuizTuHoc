export default function ZenDharmaWheel({
  size = 80,
  progress = 0,
  className = '',
}: {
  size?: number;
  progress?: number;
  className?: string;
}) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`zen-dharma-wheel-container ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Dharmachakra 8-spoke SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.28,
          pointerEvents: 'none',
        }}
      >
        <circle cx="50" cy="50" r="42" stroke="#D8B36A" strokeWidth="2" fill="none" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="32" stroke="#D8B36A" strokeWidth="1.5" fill="none" />
        <circle cx="50" cy="50" r="10" stroke="#D8B36A" strokeWidth="2" fill="#3B2014" />
        {/* 8 spokes (Bát Chánh Đạo) */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="50"
            y1="50"
            x2={50 + 32 * Math.cos((angle * Math.PI) / 180)}
            y2={50 + 32 * Math.sin((angle * Math.PI) / 180)}
            stroke="#D8B36A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Circular Progress Arc */}
      <svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)',
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(167, 118, 54, 0.25)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Glowing Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#zen-gold-progress-grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: 'drop-shadow(0 0 6px rgba(216, 179, 106, 0.6))',
          }}
        />
        <defs>
          <linearGradient id="zen-gold-progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>

      {/* Central Progress Value */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: size * 0.28,
            fontWeight: 900,
            color: '#FDE047',
            fontFamily: 'var(--theme-font-heading)',
            textShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
          }}
        >
          {progress}%
        </span>
      </div>
    </div>
  );
}
