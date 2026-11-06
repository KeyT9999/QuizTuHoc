import { useEffect, useRef } from 'react';
import type { AppTheme } from '../context/ThemeContext';

interface ThemeAmbientCanvasProps {
  theme: AppTheme;
}

interface AmbientMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  phase: number;
  glyph?: string;
}

interface TrailSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

const THEME_CONFIG: Record<
  AppTheme,
  {
    colors: string[];
    glowColor: string;
    glyphs?: string[];
    isRain?: boolean;
    moteCount: number;
  }
> = {
  'lotus-zen-sanctuary': {
    colors: ['#fef08a', '#f59e0b', '#d8b36a', '#fde68a'],
    glowColor: 'rgba(216, 179, 106, 0.14)',
    glyphs: ['🪷', '✦', '•'],
    moteCount: 38,
  },
  'hon-viet': {
    colors: ['#fef08a', '#f59e0b', '#ef4444', '#fbbf24'],
    glowColor: 'rgba(245, 158, 11, 0.14)',
    glyphs: ['✦', '❖', '•'],
    moteCount: 38,
  },
  'fantasy-academy': {
    colors: ['#34d399', '#fbbf24', '#6ee7b7', '#f59e0b'],
    glowColor: 'rgba(16, 185, 129, 0.15)',
    glyphs: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', '✦', '✧'],
    moteCount: 42,
  },
  'cozy-night': {
    colors: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fef08a'],
    glowColor: 'rgba(56, 189, 248, 0.14)',
    isRain: true,
    moteCount: 46,
  },
  default: {
    colors: ['#6366f1', '#06b6d4', '#8b5cf6', '#3b82f6'],
    glowColor: 'rgba(99, 102, 241, 0.09)',
    moteCount: 28,
  },
};

export default function ThemeAmbientCanvas({ theme }: ThemeAmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const cfg = THEME_CONFIG[theme] || THEME_CONFIG.default;

    // Initialize ambient motes
    const motes: AmbientMote[] = Array.from({ length: cfg.moteCount }, (_, i) => {
      const color = cfg.colors[i % cfg.colors.length];
      const isRainDrop = cfg.isRain && i < cfg.moteCount * 0.55;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: isRainDrop ? -0.65 : (Math.random() - 0.5) * 0.35,
        vy: isRainDrop ? 3.2 + Math.random() * 2.2 : -0.35 - Math.random() * 0.55,
        size: isRainDrop ? 1.5 : 2 + Math.random() * 3.2,
        alpha: 0.2 + Math.random() * 0.55,
        color,
        phase: Math.random() * Math.PI * 2,
        glyph:
          cfg.glyphs && i % 5 === 0
            ? cfg.glyphs[i % cfg.glyphs.length]
            : undefined,
      };
    });

    const trailSparks: TrailSpark[] = [];

    let mouseX = width * 0.5;
    let mouseY = height * 0.35;
    let smoothMouseX = mouseX;
    let smoothMouseY = mouseY;
    let lastSpawnX = mouseX;
    let lastSpawnY = mouseY;
    let isPointerActive = false;

    const spawnBurst = (bx: number, by: number, count = 22) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const speed = 1.6 + Math.random() * 4.2;
        trailSparks.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          size: 2.2 + Math.random() * 3.2,
          life: 0,
          maxLife: 28 + Math.random() * 20,
          color: cfg.colors[i % cfg.colors.length],
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isPointerActive = true;

      const dx = mouseX - lastSpawnX;
      const dy = mouseY - lastSpawnY;
      if (dx * dx + dy * dy > 196) {
        lastSpawnX = mouseX;
        lastSpawnY = mouseY;
        if (trailSparks.length < 90) {
          trailSparks.push({
            x: mouseX + (Math.random() - 0.5) * 10,
            y: mouseY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.1,
            vy: -0.6 - Math.random() * 0.9,
            size: 2 + Math.random() * 2.5,
            life: 0,
            maxLife: 24 + Math.random() * 14,
            color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
          });
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      spawnBurst(e.clientX, e.clientY, 14);
    };

    const handleCustomBurst = () => {
      spawnBurst(smoothMouseX, smoothMouseY, 26);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('theme-particle-burst', handleCustomBurst);
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    let tick = 0;

    const render = () => {
      frameId = requestAnimationFrame(render);
      tick += 0.016;

      ctx.clearRect(0, 0, width, height);

      // Smooth cursor follower
      smoothMouseX += (mouseX - smoothMouseX) * 0.14;
      smoothMouseY += (mouseY - smoothMouseY) * 0.14;

      if (isPointerActive) {
        const cursorGrad = ctx.createRadialGradient(
          smoothMouseX,
          smoothMouseY,
          4,
          smoothMouseX,
          smoothMouseY,
          170
        );
        cursorGrad.addColorStop(0, cfg.glowColor);
        cursorGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cursorGrad;
        ctx.beginPath();
        ctx.arc(smoothMouseX, smoothMouseY, 170, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update & draw ambient motes
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        const isRainDrop = cfg.isRain && i < cfg.moteCount * 0.55;

        // Gentle cursor repulsion/swirl
        const dx = m.x - smoothMouseX;
        const dy = m.y - smoothMouseY;
        const distSq = dx * dx + dy * dy;
        if (!isRainDrop && distSq < 19600 && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const force = (140 - dist) / 140;
          m.x += (dx / dist) * force * 1.1;
          m.y += (dy / dist) * force * 1.1;
        }

        m.x += m.vx + (isRainDrop ? 0 : Math.sin(tick * 1.2 + m.phase) * 0.25);
        m.y += m.vy;

        if (m.y < -20) {
          m.y = height + 15;
          m.x = Math.random() * width;
        } else if (m.y > height + 20) {
          m.y = -15;
          m.x = Math.random() * width;
        }
        if (m.x < -20) m.x = width + 15;
        if (m.x > width + 20) m.x = -15;

        const pulseAlpha = m.alpha * (0.65 + 0.35 * Math.sin(tick * 2.2 + m.phase));
        ctx.save();
        ctx.globalAlpha = pulseAlpha;

        if (isRainDrop) {
          // Lofi diagonal rain streak
          ctx.strokeStyle = m.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + m.vx * 4.5, m.y + m.vy * 4.5);
          ctx.stroke();
        } else if (m.glyph && m.glyph !== '🪷') {
          ctx.font = `${Math.round(m.size * 4.2)}px serif`;
          ctx.fillStyle = m.color;
          ctx.fillText(m.glyph, m.x, m.y);
        } else {
          ctx.fillStyle = m.color;
          ctx.shadowColor = m.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Update & draw interactive cursor trail & burst sparks
      for (let i = trailSparks.length - 1; i >= 0; i--) {
        const s = trailSparks[i];
        s.life += 1;
        if (s.life >= s.maxLife) {
          trailSparks.splice(i, 1);
          continue;
        }
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;

        const progress = s.life / s.maxLife;
        const alpha = (1 - progress) * 0.85;
        const radius = s.size * (1 - progress * 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('theme-particle-burst', handleCustomBurst);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="theme-ambient-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 45,
      }}
    />
  );
}
