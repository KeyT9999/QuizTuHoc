import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { AppTheme } from '../context/ThemeContext';

interface ThemeHero3DDioramaProps {
  theme: AppTheme;
  height?: number;
  className?: string;
}

/**
 * Generates a soft circular glow sprite texture in memory (no external asset needed).
 */
function createGlowSpriteTexture(primaryHex: string, secondaryHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.28, primaryHex);
  grad.addColorStop(0.65, secondaryHex);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a procedural Dong Son Bronze Drum relief texture.
 */
function createDongSonDrumTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  // Base dark bronze background
  const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, cx);
  bgGrad.addColorStop(0, '#f59e0b');
  bgGrad.addColorStop(0.35, '#b45309');
  bgGrad.addColorStop(0.75, '#78350f');
  bgGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#fef08a';
  ctx.fillStyle = '#fef08a';

  // Concentric decorative rings
  const radii = [52, 82, 118, 162, 198, 228, 246];
  radii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = idx % 2 === 0 ? 3.5 : 2;
    ctx.stroke();
  });

  // 14-point Dong Son Sun Star in center
  const rays = 14;
  ctx.beginPath();
  for (let i = 0; i < rays * 2; i++) {
    const angle = (i * Math.PI) / rays;
    const r = i % 2 === 0 ? 48 : 18;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Sawtooth geometric pattern band (between 82 and 118)
  const teeth = 36;
  ctx.beginPath();
  for (let i = 0; i <= teeth * 2; i++) {
    const angle = (i * Math.PI) / teeth;
    const r = i % 2 === 0 ? 86 : 114;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineWidth = 2;
  ctx.stroke();

  // Stylized Lac Birds ring (between 122 and 158)
  const birds = 8;
  for (let b = 0; b < birds; b++) {
    const baseAngle = (b / birds) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(baseAngle);
    ctx.beginPath();
    ctx.moveTo(138, -14);
    ctx.quadraticCurveTo(152, 0, 134, 18);
    ctx.quadraticCurveTo(142, 2, 124, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Outer dotted bead ring (between 200 and 226)
  const beads = 48;
  for (let i = 0; i < beads; i++) {
    const a = (i / beads) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 213, cy + Math.sin(a) * 213, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates an Arcane Rune Circle texture for Fantasy Academy.
 */
function createArcaneRuneTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = '#fbbf24';
  ctx.fillStyle = '#34d399';

  // Outer & inner magic circles
  [230, 212, 165, 152, 95].forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = idx === 0 || idx === 2 ? 3 : 1.5;
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(251, 191, 36, 0.85)' : 'rgba(52, 211, 153, 0.75)';
    ctx.stroke();
  });

  // Hexagram (two interlocking triangles)
  for (let t = 0; t < 2; t++) {
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i * (Math.PI * 2)) / 3 + (t * Math.PI) / 3;
      const x = cx + Math.cos(a) * 165;
      const y = cy + Math.sin(a) * 165;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = t === 0 ? 'rgba(251, 191, 36, 0.75)' : 'rgba(52, 211, 153, 0.75)';
    ctx.stroke();
  }

  // Arcane rune glyphs around ring
  const glyphs = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ'];
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
  glyphs.forEach((g, idx) => {
    const a = (idx / glyphs.length) * Math.PI * 2;
    const x = cx + Math.cos(a) * 188;
    const y = cy + Math.sin(a) * 188;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(g, 0, 0);
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Parametric curved lotus petal geometry with smooth normals (no flat plane clipping).
 */
function createSmoothLotusPetalGeometry(width: number, length: number, cupDepth: number, tipCurl: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, length, 16, 20);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // v goes from 0 at base to 1 at tip; clamp effective v to [0.05, 0.94] so tip/base triangles never collapse to 0 width
    const v = (y + length / 2) / length;
    const vEff = 0.05 + v * 0.89;
    const u = x / (width / 2); // -1 to 1

    // Natural lotus petal profile: narrow base, wide belly at v=0.58, graceful rounded point at tip
    const profile = Math.pow(Math.sin(vEff * Math.PI), 0.72) * (1 - 0.12 * Math.pow(vEff, 3));
    const nx = x * profile;

    // Cupping curve across width + S-curve along length
    const cup = (1 - u * u) * Math.sin(vEff * Math.PI) * cupDepth;
    const curl = Math.pow(v, 2.2) * tipCurl;
    const nz = cup - curl;

    pos.setXYZ(i, nx, v * length, nz);
  }

  geo.computeVertexNormals();
  return geo;
}

export default function ThemeHero3DDiorama({
  theme,
  height = 250,
  className = '',
}: ThemeHero3DDioramaProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [pulseCount, setPulseCount] = useState(0);
  const spinBoostRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const renderHeight = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / renderHeight, 0.1, 100);
    camera.position.set(0, 2.1, 5.6);
    camera.lookAt(0, 0.15, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, renderHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Shared Interactive Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4d6, 2.6);
    keyLight.position.set(3, 6, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.4);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    const cursorLight = new THREE.PointLight(0xfbbf24, 3.2, 9);
    cursorLight.position.set(0, 1.8, 2.5);
    scene.add(cursorLight);

    // Animation callbacks per theme
    const updaters: Array<(t: number, dt: number) => void> = [];

    // =========================================================================
    // SCENE 1: LIÊN HOA PHẬT QUỐC (SACRED GOLDEN-JADE LOTUS & LANTERNS)
    // =========================================================================
    if (theme === 'lotus-zen-sanctuary') {
      camera.position.set(0, 2.35, 5.3);
      camera.lookAt(0, 0.1, 0);
      keyLight.color.setHex(0xffe8b0);
      rimLight.color.setHex(0x34d399);
      cursorLight.color.setHex(0xf59e0b);

      const lotusGroup = new THREE.Group();
      lotusGroup.position.y = -0.35;
      rootGroup.add(lotusGroup);

      const innerMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0xfff3d1,
          emissive: 0x8a5212,
          emissiveIntensity: 0.38,
          roughness: 0.22,
          metalness: 0.18,
          clearcoat: 1.0,
          clearcoatRoughness: 0.15,
          side: THREE.DoubleSide,
        })
      );

      const midMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0xf3c06b,
          emissive: 0x5c3108,
          emissiveIntensity: 0.28,
          roughness: 0.28,
          metalness: 0.32,
          clearcoat: 0.85,
          side: THREE.DoubleSide,
        })
      );

      const outerMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0xc88a32,
          emissive: 0x3b1d06,
          emissiveIntensity: 0.22,
          roughness: 0.34,
          metalness: 0.45,
          clearcoat: 0.7,
          side: THREE.DoubleSide,
        })
      );

      const leafMat = track(
        new THREE.MeshStandardMaterial({
          color: 0x1e4d3b,
          emissive: 0x092218,
          roughness: 0.55,
          metalness: 0.15,
          side: THREE.DoubleSide,
        })
      );

      const petalLayers = [
        { count: 8, radius: 0.18, tilt: 0.34, scale: 0.72, mat: innerMat, y: 0.12, offset: 0 },
        { count: 10, radius: 0.32, tilt: 0.68, scale: 0.92, mat: innerMat, y: 0.06, offset: 0.3 },
        { count: 12, radius: 0.48, tilt: 1.04, scale: 1.08, mat: midMat, y: 0.02, offset: 0.15 },
        { count: 14, radius: 0.64, tilt: 1.36, scale: 1.18, mat: outerMat, y: -0.04, offset: 0.42 },
      ];

      const petalGeo = track(createSmoothLotusPetalGeometry(0.68, 1.48, 0.22, 0.16));
      const animatedPetals: Array<{ mesh: THREE.Mesh; baseTilt: number; phase: number }> = [];

      petalLayers.forEach((layer, lIdx) => {
        for (let i = 0; i < layer.count; i++) {
          const angle = (i / layer.count) * Math.PI * 2 + layer.offset;
          const pivot = new THREE.Group();
          pivot.rotation.y = angle;

          const petal = new THREE.Mesh(petalGeo, layer.mat);
          petal.position.set(0, layer.y, layer.radius);
          petal.rotation.x = layer.tilt;
          petal.scale.setScalar(layer.scale);

          pivot.add(petal);
          lotusGroup.add(pivot);
          animatedPetals.push({ mesh: petal, baseTilt: layer.tilt, phase: lIdx * 0.8 + i * 0.5 });
        }
      });

      // Lotus Pad Leaves resting gently on the water
      const padGeo = track(new THREE.CircleGeometry(1.65, 48));
      const padMesh = new THREE.Mesh(padGeo, leafMat);
      padMesh.rotation.x = -Math.PI / 2;
      padMesh.position.y = -0.12;
      lotusGroup.add(padMesh);

      // Golden Seed Pod & Levitating Dharma Pearl
      const podGeo = track(new THREE.CylinderGeometry(0.28, 0.16, 0.28, 24));
      const podMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xb45309,
          emissiveIntensity: 0.6,
          roughness: 0.25,
          metalness: 0.6,
        })
      );
      const pod = new THREE.Mesh(podGeo, podMat);
      pod.position.y = 0.25;
      lotusGroup.add(pod);

      const pearlGeo = track(new THREE.SphereGeometry(0.18, 32, 32));
      const pearlMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xfffbeb,
          emissive: 0xfbbf24,
          emissiveIntensity: 1.4,
          roughness: 0.1,
        })
      );
      const pearl = new THREE.Mesh(pearlGeo, pearlMat);
      pearl.position.y = 0.72;
      lotusGroup.add(pearl);

      // Translucent Golden Water Ripple Rings (Fades smoothly to transparent, NO black disc!)
      const rippleRings: THREE.Mesh[] = [];
      for (let r = 0; r < 4; r++) {
        const rGeo = track(new THREE.RingGeometry(0.8 + r * 0.45, 0.85 + r * 0.45, 64));
        const rMat = track(
          new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.35 - r * 0.07,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          })
        );
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.rotation.x = -Math.PI / 2;
        rMesh.position.y = -0.14;
        rootGroup.add(rMesh);
        rippleRings.push(rMesh);
      }

      // Floating Sky Lanterns
      const lanternGeo = track(new THREE.CylinderGeometry(0.09, 0.07, 0.22, 12));
      const lanternMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xffedd5,
          emissive: 0xf97316,
          emissiveIntensity: 1.2,
          roughness: 0.3,
        })
      );
      const lanterns: Array<{ mesh: THREE.Mesh; speed: number; angle: number; radius: number; yOffset: number }> = [];
      for (let i = 0; i < 7; i++) {
        const lMesh = new THREE.Mesh(lanternGeo, lanternMat);
        const angle = (i / 7) * Math.PI * 2;
        const radius = 1.65 + (i % 3) * 0.45;
        const yOffset = (i % 4) * 0.45 - 0.2;
        lMesh.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius);
        rootGroup.add(lMesh);
        lanterns.push({ mesh: lMesh, speed: 0.22 + (i % 3) * 0.08, angle, radius, yOffset });
      }

      updaters.push((t) => {
        lotusGroup.rotation.y = t * 0.22;
        pearl.position.y = 0.72 + Math.sin(t * 2.4) * 0.08;

        animatedPetals.forEach((p) => {
          p.mesh.rotation.x = p.baseTilt + Math.sin(t * 1.5 + p.phase) * 0.045;
        });

        rippleRings.forEach((ring, idx) => {
          const cycle = (t * 0.45 + idx * 0.25) % 1;
          const s = 0.65 + cycle * 1.45;
          ring.scale.setScalar(s);
          (ring.material as THREE.MeshBasicMaterial).opacity = (1 - cycle) * 0.38;
        });

        lanterns.forEach((l, idx) => {
          const a = l.angle + t * 0.15;
          l.mesh.position.x = Math.cos(a) * l.radius;
          l.mesh.position.z = Math.sin(a) * l.radius;
          l.mesh.position.y = ((l.yOffset + t * l.speed) % 2.4) - 0.5;
          l.mesh.rotation.z = Math.sin(t * 1.5 + idx) * 0.08;
        });
      });
    }

    // =========================================================================
    // SCENE 2: HỒN VIỆT NGÀN NĂM (3D ĐÔNG SƠN BRONZE DRUM & GOLDEN HALO)
    // =========================================================================
    else if (theme === 'hon-viet') {
      camera.position.set(0, 0.4, 5.4);
      camera.lookAt(0, 0, 0);
      keyLight.color.setHex(0xfef08a);
      rimLight.color.setHex(0xef4444);
      cursorLight.color.setHex(0xf59e0b);

      const drumGroup = new THREE.Group();
      drumGroup.rotation.x = 0.62; // Tilted toward viewer to showcase the Dong Son star relief
      rootGroup.add(drumGroup);

      const drumTex = track(createDongSonDrumTexture());
      const drumFaceMat = track(
        new THREE.MeshStandardMaterial({
          map: drumTex,
          bumpMap: drumTex,
          bumpScale: 0.08,
          emissiveMap: drumTex,
          emissive: new THREE.Color(0xd97706),
          emissiveIntensity: 0.28,
          metalness: 0.85,
          roughness: 0.24,
        })
      );

      const bronzeSideMat = track(
        new THREE.MeshStandardMaterial({
          color: 0x92400e,
          emissive: 0x451a03,
          emissiveIntensity: 0.25,
          metalness: 0.88,
          roughness: 0.28,
        })
      );

      // Main Drum Tympanum (Top Face + Mantle Cylinder)
      const drumGeo = track(new THREE.CylinderGeometry(1.62, 1.38, 0.52, 64));
      const drumMesh = new THREE.Mesh(drumGeo, [bronzeSideMat, drumFaceMat, bronzeSideMat]);
      drumGroup.add(drumMesh);

      // Raised Central 3D Sun Star Emblem
      const starGeo = track(new THREE.OctahedronGeometry(0.28, 0));
      const goldMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xd97706,
          emissiveIntensity: 0.65,
          metalness: 0.92,
          roughness: 0.14,
        })
      );
      const starMesh = new THREE.Mesh(starGeo, goldMat);
      starMesh.scale.set(1, 0.35, 1);
      starMesh.position.y = 0.28;
      drumGroup.add(starMesh);

      // Two Counter-Rotating Golden Filigree Halo Rings
      const innerHaloGeo = track(new THREE.TorusGeometry(1.88, 0.032, 16, 96));
      const innerHalo = new THREE.Mesh(innerHaloGeo, goldMat);
      innerHalo.rotation.x = Math.PI / 2;
      innerHalo.position.y = 0.18;
      drumGroup.add(innerHalo);

      const outerHaloGeo = track(new THREE.TorusGeometry(2.18, 0.02, 16, 96));
      const crimsonGoldMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xb91c1c,
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2,
        })
      );
      const outerHalo = new THREE.Mesh(outerHaloGeo, crimsonGoldMat);
      outerHalo.rotation.x = Math.PI / 2;
      outerHalo.position.y = 0.1;
      drumGroup.add(outerHalo);

      // Orbiting Golden Orbs along outer halo
      const orbGeo = track(new THREE.SphereGeometry(0.075, 16, 16));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const orb = new THREE.Mesh(orbGeo, goldMat);
        orb.position.set(Math.cos(a) * 2.18, Math.sin(a) * 2.18, 0);
        outerHalo.add(orb);
      }

      updaters.push((t) => {
        drumMesh.rotation.y = t * 0.28;
        starMesh.rotation.y = -t * 0.6;
        innerHalo.rotation.z = -t * 0.35;
        outerHalo.rotation.z = t * 0.22;
        drumGroup.position.y = Math.sin(t * 1.6) * 0.08;
      });
    }

    // =========================================================================
    // SCENE 3: HỌC VIỆN MA PHÁP (3D ARCANE CRYSTAL & RUNE ASTROLABE)
    // =========================================================================
    else if (theme === 'fantasy-academy') {
      camera.position.set(0, 0.8, 5.5);
      camera.lookAt(0, 0, 0);
      keyLight.color.setHex(0x6ee7b7);
      rimLight.color.setHex(0xfbbf24);
      cursorLight.color.setHex(0x10b981);

      const arcaneGroup = new THREE.Group();
      rootGroup.add(arcaneGroup);

      // Central Multi-Faceted Mana Crystal
      const crystalGeo = track(new THREE.OctahedronGeometry(0.88, 0));
      const crystalMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0x10b981,
          emissive: 0x047857,
          emissiveIntensity: 0.65,
          roughness: 0.12,
          metalness: 0.15,
          clearcoat: 1.0,
          flatShading: true,
        })
      );
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.scale.set(0.78, 1.32, 0.78);
      arcaneGroup.add(crystalMesh);

      // Golden Wireframe Cage around Crystal
      const wireGeo = track(new THREE.OctahedronGeometry(0.96, 0));
      const wireMat = track(
        new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          wireframe: true,
          transparent: true,
          opacity: 0.55,
        })
      );
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.scale.set(0.82, 1.36, 0.82);
      arcaneGroup.add(wireMesh);

      // 3 Gimbal-Rotating Astrolabe Rings
      const goldRingMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          emissive: 0xb45309,
          emissiveIntensity: 0.45,
          metalness: 0.88,
          roughness: 0.2,
        })
      );
      const emeraldRingMat = track(
        new THREE.MeshStandardMaterial({
          color: 0x34d399,
          emissive: 0x059669,
          emissiveIntensity: 0.55,
          metalness: 0.75,
          roughness: 0.22,
        })
      );

      const ring1 = new THREE.Mesh(track(new THREE.TorusGeometry(1.42, 0.032, 16, 84)), goldRingMat);
      const ring2 = new THREE.Mesh(track(new THREE.TorusGeometry(1.72, 0.026, 16, 84)), emeraldRingMat);
      const ring3 = new THREE.Mesh(track(new THREE.TorusGeometry(2.02, 0.022, 16, 84)), goldRingMat);
      arcaneGroup.add(ring1, ring2, ring3);

      // Glowing Arcane Rune Circle Plane beneath
      const runeTex = track(createArcaneRuneTexture());
      const runePlaneGeo = track(new THREE.PlaneGeometry(3.8, 3.8));
      const runePlaneMat = track(
        new THREE.MeshBasicMaterial({
          map: runeTex,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const runePlane = new THREE.Mesh(runePlaneGeo, runePlaneMat);
      runePlane.rotation.x = -Math.PI / 2;
      runePlane.position.y = -1.05;
      arcaneGroup.add(runePlane);

      // Orbiting Floating Crystal Shards
      const shardGeo = track(new THREE.OctahedronGeometry(0.14, 0));
      const shards: Array<{ mesh: THREE.Mesh; angle: number; radius: number; speed: number }> = [];
      for (let i = 0; i < 6; i++) {
        const shard = new THREE.Mesh(shardGeo, i % 2 === 0 ? crystalMat : goldRingMat);
        shard.scale.set(0.6, 1.5, 0.6);
        const angle = (i / 6) * Math.PI * 2;
        const radius = 1.85;
        arcaneGroup.add(shard);
        shards.push({ mesh: shard, angle, radius, speed: 0.5 + (i % 2) * 0.25 });
      }

      updaters.push((t) => {
        crystalMesh.rotation.y = t * 0.65;
        crystalMesh.position.y = Math.sin(t * 2.1) * 0.1;
        wireMesh.rotation.y = -t * 0.45;
        wireMesh.position.y = crystalMesh.position.y;

        ring1.rotation.x = t * 0.55;
        ring1.rotation.y = t * 0.35;
        ring2.rotation.y = -t * 0.48;
        ring2.rotation.z = t * 0.3;
        ring3.rotation.x = Math.PI / 3 + Math.sin(t * 0.5) * 0.25;
        ring3.rotation.z = -t * 0.25;

        runePlane.rotation.z = t * 0.2;

        shards.forEach((s, idx) => {
          const a = s.angle + t * s.speed;
          s.mesh.position.set(
            Math.cos(a) * s.radius,
            Math.sin(t * 2.2 + idx) * 0.35,
            Math.sin(a) * s.radius
          );
          s.mesh.rotation.y = t * 1.4;
          s.mesh.rotation.x = Math.sin(t + idx) * 0.4;
        });
      });
    }

    // =========================================================================
    // SCENE 4: COZY NIGHT LOFI (3D NEON SYNTH PLANET, VINYL HALOS & STAR CONSTELLATION)
    // =========================================================================
    else if (theme === 'cozy-night') {
      camera.position.set(0, 0.65, 5.4);
      camera.lookAt(0, 0, 0);
      keyLight.color.setHex(0x818cf8);
      rimLight.color.setHex(0x38bdf8);
      cursorLight.color.setHex(0xf472b6);

      const cozyGroup = new THREE.Group();
      cozyGroup.rotation.z = -0.22;
      cozyGroup.rotation.x = 0.28;
      rootGroup.add(cozyGroup);

      // Dreamy Lofi Core Planet
      const planetGeo = track(new THREE.SphereGeometry(0.92, 48, 48));
      const planetMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0x312e81,
          emissive: 0x4338ca,
          emissiveIntensity: 0.55,
          roughness: 0.18,
          metalness: 0.25,
          clearcoat: 1.0,
        })
      );
      const planet = new THREE.Mesh(planetGeo, planetMat);
      cozyGroup.add(planet);

      // Glowing Wireframe Latitude/Longitude Grid over Planet
      const gridGeo = track(new THREE.SphereGeometry(0.935, 20, 14));
      const gridMat = track(
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.25,
        })
      );
      const gridMesh = new THREE.Mesh(gridGeo, gridMat);
      cozyGroup.add(gridMesh);

      // Grooved Vinyl / Neon Saturn Rings
      const ringColors = [0x38bdf8, 0x818cf8, 0xc084fc, 0xf472b6];
      const vinylRings: THREE.Mesh[] = [];
      ringColors.forEach((col, idx) => {
        const rGeo = track(new THREE.TorusGeometry(1.32 + idx * 0.24, 0.025 - idx * 0.003, 16, 96));
        const rMat = track(
          new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.75,
            roughness: 0.2,
            metalness: 0.6,
          })
        );
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.rotation.x = Math.PI / 2;
        cozyGroup.add(rMesh);
        vinylRings.push(rMesh);
      });

      // Orbiting Warm Lamp Moon & Star Satellites
      const moonGeo = track(new THREE.SphereGeometry(0.16, 24, 24));
      const moonMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 1.2,
          roughness: 0.15,
        })
      );
      const moon = new THREE.Mesh(moonGeo, moonMat);
      cozyGroup.add(moon);

      // 3D Star Constellation Lines around the planet
      const starNodes: THREE.Vector3[] = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const r = 1.95 + (i % 3) * 0.32;
        const y = ((i % 5) - 2) * 0.42;
        starNodes.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      const linePoints: THREE.Vector3[] = [];
      for (let i = 0; i < starNodes.length; i++) {
        linePoints.push(starNodes[i], starNodes[(i + 1) % starNodes.length]);
        if (i % 2 === 0) {
          linePoints.push(starNodes[i], starNodes[(i + 3) % starNodes.length]);
        }
      }
      const constGeo = track(new THREE.BufferGeometry().setFromPoints(linePoints));
      const constMat = track(
        new THREE.LineBasicMaterial({
          color: 0x93c5fd,
          transparent: true,
          opacity: 0.35,
        })
      );
      const constellation = new THREE.LineSegments(constGeo, constMat);
      rootGroup.add(constellation);

      updaters.push((t) => {
        planet.rotation.y = t * 0.25;
        gridMesh.rotation.y = t * 0.25;
        vinylRings.forEach((r, idx) => {
          r.rotation.z = t * (0.3 + idx * 0.08) * (idx % 2 === 0 ? 1 : -1);
          r.rotation.y = Math.sin(t * 0.8 + idx) * 0.08;
        });
        moon.position.set(Math.cos(t * 0.85) * 1.65, Math.sin(t * 1.7) * 0.25, Math.sin(t * 0.85) * 1.65);
        constellation.rotation.y = -t * 0.12;
        cozyGroup.position.y = Math.sin(t * 1.5) * 0.09;
      });
    }

    // =========================================================================
    // SCENE 5: CLASSIC DEFAULT (3D INTERACTIVE FROSTED GLASS BENTO SCULPTURE)
    // =========================================================================
    else {
      camera.position.set(0, 0.3, 5.4);
      camera.lookAt(0, 0, 0);
      keyLight.color.setHex(0xffffff);
      rimLight.color.setHex(0x38bdf8);
      cursorLight.color.setHex(0x6366f1);

      const sculptureGroup = new THREE.Group();
      rootGroup.add(sculptureGroup);

      // Center Glossy Indigo-Violet Torus Knot
      const knotGeo = track(new THREE.TorusKnotGeometry(0.82, 0.24, 128, 32));
      const knotMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0x4f46e5,
          emissive: 0x312e81,
          emissiveIntensity: 0.35,
          roughness: 0.14,
          metalness: 0.25,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        })
      );
      const knotMesh = new THREE.Mesh(knotGeo, knotMat);
      sculptureGroup.add(knotMesh);

      // Orbiting Cyan & Amber Glass Rings
      const cyanRingGeo = track(new THREE.TorusGeometry(1.62, 0.035, 24, 96));
      const cyanRingMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.35,
          roughness: 0.15,
          metalness: 0.4,
          clearcoat: 1.0,
        })
      );
      const cyanRing = new THREE.Mesh(cyanRingGeo, cyanRingMat);
      cyanRing.rotation.x = 1.1;
      sculptureGroup.add(cyanRing);

      // Floating Geometric Satellites (Icosahedrons & Spheres)
      const icoGeo = track(new THREE.IcosahedronGeometry(0.22, 0));
      const sphGeo = track(new THREE.SphereGeometry(0.18, 24, 24));
      const accentMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0x8b5cf6,
          emissive: 0x4c1d95,
          emissiveIntensity: 0.3,
          roughness: 0.12,
          metalness: 0.3,
          clearcoat: 1.0,
        })
      );
      const goldOrbMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0xf59e0b,
          emissive: 0xb45309,
          emissiveIntensity: 0.35,
          roughness: 0.15,
          metalness: 0.4,
          clearcoat: 1.0,
        })
      );

      const satellites: Array<{ mesh: THREE.Mesh; angle: number; radius: number; yAmp: number }> = [];
      for (let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(
          i % 2 === 0 ? icoGeo : sphGeo,
          i % 3 === 0 ? goldOrbMat : i % 2 === 0 ? accentMat : cyanRingMat
        );
        const angle = (i / 6) * Math.PI * 2;
        sculptureGroup.add(mesh);
        satellites.push({ mesh, angle, radius: 1.78 + (i % 2) * 0.25, yAmp: 0.45 });
      }

      updaters.push((t) => {
        knotMesh.rotation.x = t * 0.35;
        knotMesh.rotation.y = t * 0.48;
        cyanRing.rotation.z = -t * 0.32;
        cyanRing.rotation.y = Math.sin(t * 0.6) * 0.35;

        satellites.forEach((s, idx) => {
          const a = s.angle + t * 0.42;
          s.mesh.position.set(
            Math.cos(a) * s.radius,
            Math.sin(t * 1.8 + idx) * s.yAmp,
            Math.sin(a) * s.radius
          );
          s.mesh.rotation.x = t * 1.1;
          s.mesh.rotation.y = t * 0.9;
        });
      });
    }

    // =========================================================================
    // SHARED LUMINOUS PARTICLE FIELD (THEME-COLORED)
    // =========================================================================
    const paletteMap: Record<AppTheme, [string, string, number]> = {
      'lotus-zen-sanctuary': ['#fef08a', '#d97706', 0xfbbf24],
      'hon-viet': ['#fef08a', '#dc2626', 0xf59e0b],
      'fantasy-academy': ['#6ee7b7', '#f59e0b', 0x34d399],
      'cozy-night': ['#38bdf8', '#c084fc', 0x818cf8],
      default: ['#818cf8', '#06b6d4', 0x6366f1],
    };
    const [pHex1, pHex2, pColorNum] = paletteMap[theme] || paletteMap.default;

    const spriteTex = track(createGlowSpriteTexture(pHex1, pHex2));
    const particleCount = 72;
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 2.2;
      pPositions[i * 3] = Math.cos(a) * r;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      pPositions[i * 3 + 2] = Math.sin(a) * r;
      pSpeeds[i] = 0.25 + Math.random() * 0.45;
    }
    const pGeo = track(new THREE.BufferGeometry());
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = track(
      new THREE.PointsMaterial({
        size: 0.16,
        map: spriteTex,
        color: pColorNum,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    const particleSystem = new THREE.Points(pGeo, pMat);
    rootGroup.add(particleSystem);

    // Mouse Parallax & Interactive Light Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let targetLightX = 0;
    let targetLightY = 1.8;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      // Clamp for smooth feel even when moving outside the container
      const cx = Math.max(-1.5, Math.min(1.5, nx));
      const cy = Math.max(-1.5, Math.min(1.5, ny));
      targetRotY = cx * 0.42;
      targetRotX = cy * 0.24;
      targetLightX = cx * 3.0;
      targetLightY = 1.5 - cy * 2.0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      camera.aspect = w / renderHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(w, renderHeight);
    };
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    let prevTime = performance.now() * 0.001;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now() * 0.001;
      const dt = Math.min(0.05, now - prevTime);
      prevTime = now;

      // Apply spin boost from click interaction
      if (spinBoostRef.current > 0.001) {
        rootGroup.rotation.y += spinBoostRef.current * dt * 8;
        spinBoostRef.current *= 0.92;
      }

      // Smooth mouse parallax interpolation
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.06;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.06;

      cursorLight.position.x += (targetLightX - cursorLight.position.x) * 0.1;
      cursorLight.position.y += (targetLightY - cursorLight.position.y) * 0.1;

      // Update rising particles
      const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let py = posAttr.getY(i) + pSpeeds[i] * dt;
        if (py > 1.6) py = -1.4;
        posAttr.setY(i, py);
      }
      posAttr.needsUpdate = true;
      particleSystem.rotation.y = now * 0.12;

      updaters.forEach((fn) => fn(now, dt));
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [theme, height]);

  const handleInteractClick = () => {
    spinBoostRef.current = 1.35;
    setPulseCount((c) => c + 1);
    window.dispatchEvent(new CustomEvent('theme-particle-burst'));
  };

  const hintLabel: Record<AppTheme, string> = {
    'lotus-zen-sanctuary': '🪷 Di chuột xoay Liên Hoa · Chạm kích hoạt hào quang',
    'hon-viet': '🥁 Di chuột nghiêng Trống Đồng · Chạm tỏa hào quang Lạc Việt',
    'fantasy-academy': '🔮 Di chuột xoay Tinh Thể Cổ Ngữ · Chạm phóng ma pháp',
    'cozy-night': '🌙 Di chuột xoay Tinh Cầu Lofi · Chạm tạo sóng sao đêm',
    default: '✨ Di chuột xoay Khối Pha Lê 3D · Chạm tạo xung ánh sáng',
  };

  return (
    <div
      className={`theme-hero-3d-diorama theme-diorama-${theme} ${className}`}
      onClick={handleInteractClick}
      role="button"
      tabIndex={0}
      aria-label={hintLabel[theme]}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleInteractClick();
      }}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 380,
        height,
        cursor: 'grab',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ambient radial backlight behind the 3D WebGL canvas */}
      <div className={`theme-diorama-aura aura-${theme} ${pulseCount > 0 ? 'is-pulsing' : ''}`} key={pulseCount} />
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 2,
          maskImage: 'radial-gradient(ellipse 76% 74% at 50% 50%, #000 62%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 76% 74% at 50% 50%, #000 62%, transparent 100%)',
        }}
      />
      <span className="theme-diorama-interactive-hint">{hintLabel[theme]}</span>
    </div>
  );
}
