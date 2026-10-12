interface ZenTempleWatermarkProps {
  size?: number;
  className?: string;
  color?: string;
  opacity?: number;
}

export default function ZenTempleWatermark({
  size = 500,
  className = '',
  color = '#A77636',
  opacity = 0.04,
}: ZenTempleWatermarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Outer Sacred Concentric Zen Circles */}
      <circle cx="250" cy="250" r="235" stroke={color} strokeWidth="2.5" />
      <circle cx="250" cy="250" r="215" stroke={color} strokeWidth="1.5" strokeDasharray="6 6" />
      <circle cx="250" cy="250" r="185" stroke={color} strokeWidth="1.2" />

      {/* Pagoda Silhouette (Vietnamese Temple Multi-tiered Roofline) */}
      {/* Apex Finial / Bảo tháp đỉnh */}
      <path d="M250 80 L250 115" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="250" cy="80" r="5" fill={color} />
      <circle cx="250" cy="98" r="3.5" fill={color} />

      {/* Top Roof Tier */}
      <path
        d="M250 115 C230 135 190 142 165 145 C190 148 240 146 250 146 C260 146 310 148 335 145 C310 142 270 135 250 115 Z"
        fill={color}
      />
      {/* Mid Roof Tier */}
      <path
        d="M250 152 C225 178 170 186 135 190 C170 194 235 191 250 191 C265 191 330 194 365 190 C330 186 275 178 250 152 Z"
        fill={color}
      />
      {/* Base Roof Tier (Broad Curved eaves) */}
      <path
        d="M250 198 C215 230 140 242 95 248 C145 252 230 248 250 248 C270 248 355 252 405 248 C360 242 285 230 250 198 Z"
        fill={color}
      />

      {/* Temple Pillar Columns */}
      <rect x="180" y="248" width="12" height="70" fill={color} rx="2" />
      <rect x="308" y="248" width="12" height="70" fill={color} rx="2" />
      <rect x="220" y="248" width="8" height="70" fill={color} rx="2" />
      <rect x="272" y="248" width="8" height="70" fill={color} rx="2" />

      {/* Temple Base Balustrade */}
      <rect x="140" y="318" width="220" height="12" fill={color} rx="3" />
      <rect x="120" y="330" width="260" height="10" fill={color} rx="2" />

      {/* Large Sacred Lotus Underneath */}
      <g transform="translate(250, 390)">
        {/* Base Lotus Petals */}
        <path d="M0 -30 C-35 -15 -55 10 -40 35 C-20 20 0 10 0 -30 Z" fill={color} />
        <path d="M0 -30 C35 -15 55 10 40 35 C20 20 0 10 0 -30 Z" fill={color} />
        <path d="M0 -45 C-20 -20 -30 15 0 25 C30 15 20 -20 0 -45 Z" fill={color} />
      </g>
    </svg>
  );
}
