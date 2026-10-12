interface LotusFlowerSvgProps {
  size?: number;
  className?: string;
  color?: string;
  opacity?: number;
  glow?: boolean;
}

export default function LotusFlowerSvg({
  size = 64,
  className = '',
  color = '#A77636',
  opacity = 1,
  glow = false,
}: LotusFlowerSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
    >
      <defs>
        <radialGradient id="lotusGoldAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D8B36A" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#A77636" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#A77636" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lotusPetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F9D288" />
          <stop offset="40%" stopColor="#D8B36A" />
          <stop offset="100%" stopColor="#A77636" />
        </linearGradient>
        <linearGradient id="lotusSoftPinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Aura Glow */}
      {glow && (
        <circle cx="60" cy="65" r="48" fill="url(#lotusGoldAura)" />
      )}

      {/* Base Lotus Pad / Water Ripples */}
      <ellipse cx="60" cy="98" rx="42" ry="7" fill="none" stroke={color} strokeWidth="1.2" opacity="0.3" strokeDasharray="3 3" />
      <ellipse cx="60" cy="98" rx="26" ry="4.5" fill="none" stroke={color} strokeWidth="1.5" opacity="0.45" />

      {/* Outer Lower Petals (Left & Right) */}
      <path
        d="M60 92 C32 90 14 74 20 54 C32 64 48 78 60 92 Z"
        fill="url(#lotusSoftPinkGrad)"
        opacity="0.85"
        stroke={color}
        strokeWidth="1"
      />
      <path
        d="M60 92 C88 90 106 74 100 54 C88 64 72 78 60 92 Z"
        fill="url(#lotusSoftPinkGrad)"
        opacity="0.85"
        stroke={color}
        strokeWidth="1"
      />

      {/* Mid Petals */}
      <path
        d="M60 90 C40 82 28 62 38 42 C48 54 55 72 60 90 Z"
        fill="url(#lotusPetalGrad)"
        opacity="0.9"
        stroke={color}
        strokeWidth="1.2"
      />
      <path
        d="M60 90 C80 82 92 62 82 42 C72 54 65 72 60 90 Z"
        fill="url(#lotusPetalGrad)"
        opacity="0.9"
        stroke={color}
        strokeWidth="1.2"
      />

      {/* Inner Raised Petals */}
      <path
        d="M60 88 C46 76 40 50 48 30 C56 46 58 68 60 88 Z"
        fill="url(#lotusPetalGrad)"
        stroke="#FDE68A"
        strokeWidth="1.2"
      />
      <path
        d="M60 88 C74 76 80 50 72 30 C64 46 62 68 60 88 Z"
        fill="url(#lotusPetalGrad)"
        stroke="#FDE68A"
        strokeWidth="1.2"
      />

      {/* Center Pinnacle Sacred Petal */}
      <path
        d="M60 22 C52 42 50 68 60 86 C70 68 68 42 60 22 Z"
        fill="url(#lotusPetalGrad)"
        stroke="#FFFBEB"
        strokeWidth="1.4"
      />

      {/* Golden Lotus Stamen & Core Jewel */}
      <circle cx="60" cy="72" r="6" fill="#FDE047" opacity="0.9" />
      <circle cx="60" cy="72" r="3.5" fill="#FFFFFF" />

      {/* Sacred Light Radiance Dot */}
      <circle cx="60" cy="18" r="2" fill="#D8B36A" opacity="0.8" />
    </svg>
  );
}
