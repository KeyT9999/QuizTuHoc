interface ZenCornerFiligreeProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  color?: string;
  className?: string;
}

export default function ZenCornerFiligree({
  position = 'top-left',
  size = 48,
  color = '#A77636',
  className = '',
}: ZenCornerFiligreeProps) {
  let transform = '';
  switch (position) {
    case 'top-right':
      transform = 'scaleX(-1)';
      break;
    case 'bottom-left':
      transform = 'scaleY(-1)';
      break;
    case 'bottom-right':
      transform = 'scale(-1, -1)';
      break;
    default:
      transform = 'none';
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`zen-corner-filigree ${className}`}
      style={{ transform, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`zenCornerGold-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D8B36A" />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor="#7B3026" />
        </linearGradient>
      </defs>

      {/* Main outer right-angle bracket */}
      <path
        d="M2 32 L2 6 C2 3.79 3.79 2 6 2 L32 2"
        stroke={`url(#zenCornerGold-${position})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Inner decorative parallel eave line */}
      <path
        d="M8 28 L8 9 C8 8.45 8.45 8 9 8 L28 8"
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />

      {/* Traditional Pagoda Eave Cloud Motif (Đao Mái Mây Cát Tường) */}
      <path
        d="M2 14 C6 14 10 10 10 6 C10 2 14 2 14 2"
        stroke="#D8B36A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Sacred Lotus Petal Corner Node */}
      <path
        d="M12 12 Q18 6 24 12 Q18 18 12 12 Z"
        fill={`url(#zenCornerGold-${position})`}
        opacity="0.9"
      />
      <circle cx="18" cy="18" r="2" fill="#FDE047" />

      {/* Auspicious spiral curling cloud flourish */}
      <path
        d="M14 2 C18 4 22 8 20 12 C18 16 12 14 14 10"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 14 C4 18 8 22 12 20 C16 18 14 12 10 14"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Outer corner jewel dot */}
      <circle cx="5" cy="5" r="2.5" fill="#D8B36A" />
      <circle cx="5" cy="5" r="1" fill="#FFF8EC" />
    </svg>
  );
}
