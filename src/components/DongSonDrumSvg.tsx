interface DongSonDrumSvgProps {
  className?: string;
  size?: number | string;
  opacity?: number;
  color?: string;
}

export default function DongSonDrumSvg({
  className = '',
  size = 400,
  opacity = 0.08,
  color = '#d97706',
}: DongSonDrumSvgProps) {
  // 14-pointed star coordinates calculation
  const center = 200;
  const numPoints = 14;
  const outerRadius = 48;
  const innerRadius = 22;
  const starPoints: string[] = [];

  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    starPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  // Generate 8 stylized flying Lac birds (chim Lạc) flying counter-clockwise along a ring
  const birdRingRadius = 120;
  const numBirds = 8;
  const birds = Array.from({ length: numBirds }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / numBirds;
    const x = center + birdRingRadius * Math.cos(angle);
    const y = center + birdRingRadius * Math.sin(angle);
    const rotation = (angle * 180) / Math.PI + 90;
    return (
      <g key={i} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
        {/* Stylized flying Lac bird: long beak, sweeping wings, tail feathers */}
        <path
          d="M-14,-2 Q-8,-6 0,-2 Q8,-6 14,-2 Q10,4 0,2 Q-10,4 -14,-2 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
        />
        <path
          d="M0,-2 L0,-10 Q2,-12 4,-10 L1,-2"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
        />
        <path
          d="M0,2 Q-4,10 -10,12 M0,2 Q4,10 10,12"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
        />
      </g>
    );
  });

  // Sawtooth chevron points for ring r=84
  const sawtoothRadius = 84;
  const numTeeth = 28;
  const teethPoints: string[] = [];
  for (let i = 0; i < numTeeth * 2; i++) {
    const r = i % 2 === 0 ? sawtoothRadius + 4 : sawtoothRadius - 4;
    const angle = (i * Math.PI) / numTeeth;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    teethPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <svg
      className={`dong-son-drum-svg ${className}`}
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Outer borders */}
      <circle cx={center} cy={center} r="195" stroke={color} strokeWidth="2.5" />
      <circle cx={center} cy={center} r="188" stroke={color} strokeWidth="1.2" strokeDasharray="3 3" />
      <circle cx={center} cy={center} r="182" stroke={color} strokeWidth="2" />

      {/* Ring 5: Concentric tangent circles */}
      <circle cx={center} cy={center} r="162" stroke={color} strokeWidth="1.5" />
      <circle cx={center} cy={center} r="154" stroke={color} strokeWidth="1" strokeDasharray="4 2" />

      {/* Ring 4: Flying Lac birds */}
      <circle cx={center} cy={center} r="138" stroke={color} strokeWidth="1.5" />
      {birds}
      <circle cx={center} cy={center} r="102" stroke={color} strokeWidth="1.5" />

      {/* Ring 3: Sawtooth Chevron Pattern */}
      <polygon points={teethPoints.join(' ')} stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx={center} cy={center} r="74" stroke={color} strokeWidth="1.8" />

      {/* Ring 2: Dotted border around sun */}
      <circle cx={center} cy={center} r="58" stroke={color} strokeWidth="1.2" strokeDasharray="2 3" />
      <circle cx={center} cy={center} r="52" stroke={color} strokeWidth="1.5" />

      {/* Center 14-pointed Sun Star */}
      <polygon
        points={starPoints.join(' ')}
        stroke={color}
        strokeWidth="2"
        fill="rgba(245, 158, 11, 0.25)"
      />

      {/* Center Core dot */}
      <circle cx={center} cy={center} r="7" fill={color} />
    </svg>
  );
}
