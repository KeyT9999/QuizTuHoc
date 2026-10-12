interface ZenHangingLanternProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export default function ZenHangingLantern({
  size = 72,
  className = '',
  glow = true,
}: ZenHangingLanternProps) {
  return (
    <div
      className={`zen-hanging-lantern-wrap ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: glow ? 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.45))' : 'none',
      }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size * 2.2}
        viewBox="0 0 80 176"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bronzeChain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          <radialGradient id="lanternFlameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
            <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#D97706" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="lanternRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#451A03" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="40%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* 1. Hanging Chain (Hanging from pagoda roof) */}
        <g stroke="url(#bronzeChain)" strokeWidth="2.5">
          <line x1="40" y1="0" x2="40" y2="44" strokeDasharray="4 2" />
          <circle cx="40" cy="12" r="3" fill="none" strokeWidth="1.8" />
          <circle cx="40" cy="24" r="3" fill="none" strokeWidth="1.8" />
          <circle cx="40" cy="36" r="3" fill="none" strokeWidth="1.8" />
        </g>
        <circle cx="40" cy="45" r="4.5" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />

        {/* 2. Lantern Eave Roof (Mái Lầu Đèn Cong) */}
        <path
          d="M12 58 C22 55 30 52 40 48 C50 52 58 55 68 58 C64 61 58 63 40 63 C22 63 16 61 12 58 Z"
          fill="url(#lanternRoofGrad)"
          stroke="#D8B36A"
          strokeWidth="1.5"
        />
        {/* Curled roof horns (Đầu đao mái lồng đèn) */}
        <path d="M12 58 Q8 54 6 49 Q10 52 14 56" stroke="#D8B36A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M68 58 Q72 54 74 49 Q70 52 66 56" stroke="#D8B36A" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* 3. Lantern Core Frame & Luminous Paper Chamber */}
        {/* Ambient flame glow circle */}
        <circle cx="40" cy="88" r="28" fill="url(#lanternFlameGlow)" className="lantern-pulse-glow" />

        {/* Outer glass/silk chamber */}
        <rect
          x="20"
          y="63"
          width="40"
          height="48"
          rx="6"
          fill="#FEF3C7"
          fillOpacity="0.22"
          stroke="#A77636"
          strokeWidth="2"
        />

        {/* Wood lattice / Lotus filigree window cutout */}
        <line x1="20" y1="87" x2="60" y2="87" stroke="#A77636" strokeWidth="1.5" />
        <line x1="40" y1="63" x2="40" y2="111" stroke="#A77636" strokeWidth="1.5" />

        {/* Central Sacred Lotus Silhouette in Lantern */}
        <path
          d="M40 76 C42 81 46 84 48 88 C44 89 42 88 40 93 C38 88 36 89 32 88 C34 84 38 81 40 76 Z"
          fill="#D97706"
          opacity="0.85"
        />
        <circle cx="40" cy="88" r="3.5" fill="#FFFBEB" className="lantern-candle-core" />

        {/* Corner brass rivets */}
        <circle cx="23" cy="66" r="1.8" fill="#FDE047" />
        <circle cx="57" cy="66" r="1.8" fill="#FDE047" />
        <circle cx="23" cy="108" r="1.8" fill="#FDE047" />
        <circle cx="57" cy="108" r="1.8" fill="#FDE047" />

        {/* 4. Lantern Bottom Base (Đế Đèn Gỗ Chạm Khắc) */}
        <path
          d="M18 111 L62 111 L56 119 L24 119 Z"
          fill="url(#lanternRoofGrad)"
          stroke="#D8B36A"
          strokeWidth="1.2"
        />
        <circle cx="40" cy="122" r="3.5" fill="#D97706" />

        {/* 5. Silk Brocade Tassels (Tua Rua Lụa Đỏ & Vàng Kim) */}
        <g stroke="url(#tasselGrad)" strokeWidth="1.6" strokeLinecap="round">
          <line x1="40" y1="125" x2="40" y2="168" />
          <line x1="36" y1="125" x2="34" y2="162" strokeWidth="1.2" opacity="0.8" />
          <line x1="44" y1="125" x2="46" y2="162" strokeWidth="1.2" opacity="0.8" />
          <line x1="38" y1="125" x2="37" y2="165" strokeWidth="1.2" opacity="0.9" />
          <line x1="42" y1="125" x2="43" y2="165" strokeWidth="1.2" opacity="0.9" />
        </g>
        {/* Tassel golden tie ring */}
        <circle cx="40" cy="132" r="2.5" fill="#FDE047" />
      </svg>
    </div>
  );
}
