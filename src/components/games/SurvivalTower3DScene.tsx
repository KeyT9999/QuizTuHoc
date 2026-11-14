import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { AppTheme } from '../../context/ThemeContext';

export type TowerHeroId = 'scholar' | 'knight' | 'mage' | 'ninja' | 'cat' | 'mech';
export type TowerMotionType = 'idle' | 'leap_1' | 'leap_2' | 'fall' | 'shield_block' | 'victory';

export interface SurvivalTower3DSceneProps {
  theme: AppTheme;
  currentFloor: number;
  fromFloor: number;
  checkpointFloor: number;
  heroId: TowerHeroId;
  motionType: TowerMotionType;
  motionNonce: number;
  hasShield: boolean;
  isFrozen: boolean;
  isDangerTime: boolean;
  streak: number;
  hoveredOption: string | null;
  cameraMode: 'follow' | 'overview';
  previewMode?: boolean;
}

const TOTAL_FLOORS = 50;
const FLOOR_STEP_Y = 1.18;
const SPIRAL_STEP_RAD = 0.56;
const SPIRAL_RADIUS = 4.25;

interface BiomePalette {
  platformHex: number;
  emissiveHex: number;
  fogHex: number;
  lightHex: number;
}

function getBiomePalette(floor: number, theme: AppTheme): BiomePalette {
  if (floor === 50) {
    return {
      platformHex: 0xfbbf24,
      emissiveHex: 0xd97706,
      fogHex: theme === 'hon-viet' ? 0x2b0b0e : 0x1e1638,
      lightHex: 0xfef08a,
    };
  }
  if (floor >= 41) {
    return {
      platformHex: 0x7f1d1d,
      emissiveHex: 0xef4444,
      fogHex: 0x24090c,
      lightHex: 0xf97316,
    };
  }
  if (floor >= 31) {
    return {
      platformHex: 0x4c1d95,
      emissiveHex: 0xa855f7,
      fogHex: 0x170d30,
      lightHex: 0xc084fc,
    };
  }
  if (floor >= 21) {
    return {
      platformHex: 0x0e7490,
      emissiveHex: 0x06b6d4,
      fogHex: 0x082032,
      lightHex: 0x67e8f9,
    };
  }
  if (floor >= 11) {
    return {
      platformHex: 0x065f46,
      emissiveHex: 0x10b981,
      fogHex: 0x07221b,
      lightHex: 0x6ee7b7,
    };
  }
  if (theme === 'hon-viet') {
    return {
      platformHex: 0x78350f,
      emissiveHex: 0xd97706,
      fogHex: 0x230a0c,
      lightHex: 0xfde68a,
    };
  }
  if (theme === 'lotus-zen-sanctuary') {
    return {
      platformHex: 0x5c4033,
      emissiveHex: 0xd8b36a,
      fogHex: 0x1c140f,
      lightHex: 0xfef3c7,
    };
  }
  if (theme === 'fantasy-academy') {
    return {
      platformHex: 0x1f3a2e,
      emissiveHex: 0xf59e0b,
      fogHex: 0x0a1c15,
      lightHex: 0xfde68a,
    };
  }
  return {
    platformHex: 0x334155,
    emissiveHex: 0x6366f1,
    fogHex: 0x0b1124,
    lightHex: 0xa5b4fc,
  };
}

function getFloorPosition(floor: number): THREE.Vector3 {
  const clamped = Math.max(1, Math.min(TOTAL_FLOORS, floor));
  if (clamped === TOTAL_FLOORS) {
    return new THREE.Vector3(0, (TOTAL_FLOORS - 1) * FLOOR_STEP_Y + 1.5, 0);
  }
  const angle = (clamped - 1) * SPIRAL_STEP_RAD;
  const isCheckpoint = clamped % 10 === 0;
  const r = isCheckpoint ? SPIRAL_RADIUS + 0.35 : SPIRAL_RADIUS;
  return new THREE.Vector3(
    Math.cos(angle) * r,
    (clamped - 1) * FLOOR_STEP_Y,
    Math.sin(angle) * r
  );
}

function createFloorLabelTexture(floor: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const isApex = floor === 50;
  const isBoss = floor % 10 === 0;

  ctx.clearRect(0, 0, 128, 64);
  ctx.fillStyle = isApex
    ? 'rgba(217, 119, 6, 0.92)'
    : isBoss
    ? 'rgba(185, 28, 28, 0.9)'
    : 'rgba(15, 23, 42, 0.82)';
  ctx.strokeStyle = isApex ? '#fef08a' : isBoss ? '#fca5a5' : 'rgba(148, 163, 184, 0.65)';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(8, 10, 112, 44, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = isApex ? '👑 50' : isBoss ? `⚔️ ${floor}` : `${floor}`;
  ctx.fillText(label, 64, 33);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(253,224,71,0.85)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function buildHeroGroup(heroId: TowerHeroId): {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  shieldMesh: THREE.Mesh;
  comboHalo: THREE.Mesh;
} {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.45 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });

  if (heroId === 'scholar') {
    // Trang Nguyen: Crimson brocade robe + winged hat + jade scroll
    const robeMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      emissive: 0x450a0a,
      roughness: 0.38,
      metalness: 0.15,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0x92400e,
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.25,
    });

    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.88, 12), robeMat);
    robe.position.y = 0.44;
    bodyGroup.add(robe);

    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 8, 20), goldMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.52;
    bodyGroup.add(belt);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 16), skinMat);
    head.position.y = 1.04;
    bodyGroup.add(head);

    // Mao Trang Nguyen + 2 dragonfly wings
    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.26, 12), darkMat);
    hatCrown.position.y = 1.3;
    bodyGroup.add(hatCrown);

    const hatTop = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.22), goldMat);
    hatTop.position.set(0, 1.44, -0.04);
    bodyGroup.add(hatTop);

    const wingGeo = new THREE.BoxGeometry(0.55, 0.06, 0.12);
    const leftWing = new THREE.Mesh(wingGeo, goldMat);
    leftWing.position.set(-0.38, 1.32, -0.04);
    leftWing.rotation.z = 0.15;
    const rightWing = new THREE.Mesh(wingGeo, goldMat);
    rightWing.position.set(0.38, 1.32, -0.04);
    rightWing.rotation.z = -0.15;
    bodyGroup.add(leftWing, rightWing);

    // Glowing Jade Scroll
    const scroll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.42, 10),
      new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.6 })
    );
    scroll.rotation.z = Math.PI / 3;
    scroll.position.set(0.36, 0.68, 0.22);
    bodyGroup.add(scroll);
  } else if (heroId === 'knight') {
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.25,
      metalness: 0.75,
      roughness: 0.25,
    });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.82, 10), armorMat);
    torso.position.y = 0.44;
    bodyGroup.add(torso);

    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.29, 14, 14), armorMat);
    helm.position.y = 1.05;
    bodyGroup.add(helm);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.1, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.9 })
    );
    visor.position.set(0, 1.05, 0.18);
    bodyGroup.add(visor);

    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 8), goldMat);
    plume.position.set(0, 1.42, -0.05);
    plume.rotation.x = -0.3;
    bodyGroup.add(plume);

    // Glowing Sword
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.85, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
    );
    blade.position.set(0.42, 0.85, 0.15);
    blade.rotation.z = -0.25;
    bodyGroup.add(blade);
  } else if (heroId === 'mage') {
    const robeMat = new THREE.MeshStandardMaterial({
      color: 0x6d28d9,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    });
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.92, 12), robeMat);
    robe.position.y = 0.46;
    bodyGroup.add(robe);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 14), skinMat);
    head.position.y = 1.02;
    bodyGroup.add(head);

    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.05, 16), robeMat);
    brim.position.y = 1.22;
    bodyGroup.add(brim);

    const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.58, 12), robeMat);
    hatCone.position.y = 1.5;
    hatCone.rotation.z = 0.15;
    bodyGroup.add(hatCone);

    const staff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 1.25, 8),
      new THREE.MeshStandardMaterial({ color: 0xb45309 })
    );
    staff.position.set(0.42, 0.68, 0.12);
    bodyGroup.add(staff);

    const orb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.15, 0),
      new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 1.1 })
    );
    orb.position.set(0.42, 1.4, 0.12);
    bodyGroup.add(orb);
  } else if (heroId === 'ninja') {
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.3 });
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.6,
    });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.82, 10), suitMat);
    torso.position.y = 0.44;
    bodyGroup.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 14), suitMat);
    head.position.y = 1.03;
    bodyGroup.add(head);

    const headband = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.04, 8, 18), redMat);
    headband.rotation.x = Math.PI / 2;
    headband.position.y = 1.08;
    bodyGroup.add(headband);

    const tailRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.42), redMat);
    tailRibbon.position.set(0.1, 1.05, -0.35);
    tailRibbon.rotation.x = -0.35;
    bodyGroup.add(tailRibbon);

    const katana1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.95, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
    );
    katana1.position.set(0, 0.72, -0.24);
    katana1.rotation.z = 0.55;
    const katana2 = katana1.clone();
    katana2.rotation.z = -0.55;
    bodyGroup.add(katana1, katana2);
  } else if (heroId === 'cat') {
    const furMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.55 });
    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x312e81,
      emissiveIntensity: 0.3,
    });
    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
    });

    const hoodie = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.76, 12), hoodieMat);
    hoodie.position.y = 0.4;
    bodyGroup.add(hoodie);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), furMat);
    head.position.y = 1.02;
    bodyGroup.add(head);

    const earGeo = new THREE.ConeGeometry(0.11, 0.24, 4);
    const leftEar = new THREE.Mesh(earGeo, furMat);
    leftEar.position.set(-0.18, 1.3, 0);
    leftEar.rotation.z = 0.25;
    const rightEar = new THREE.Mesh(earGeo, furMat);
    rightEar.position.set(0.18, 1.3, 0);
    rightEar.rotation.z = -0.25;
    bodyGroup.add(leftEar, rightEar);

    // Lofi Headphones
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.035, 8, 18, Math.PI), cyanMat);
    band.position.y = 1.04;
    bodyGroup.add(band);
  } else {
    // mech
    const mechMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.8,
      roughness: 0.2,
    });
    const neonMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.0,
    });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.74, 0.44), mechMat);
    torso.position.y = 0.48;
    bodyGroup.add(torso);

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), neonMat);
    core.position.set(0, 0.52, 0.22);
    bodyGroup.add(core);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.4), mechMat);
    head.position.y = 1.08;
    bodyGroup.add(head);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.08), neonMat);
    visor.position.set(0, 1.08, 0.2);
    bodyGroup.add(visor);

    const wingGeo = new THREE.BoxGeometry(0.12, 0.68, 0.28);
    const leftWing = new THREE.Mesh(wingGeo, neonMat);
    leftWing.position.set(-0.44, 0.68, -0.22);
    leftWing.rotation.z = 0.35;
    const rightWing = new THREE.Mesh(wingGeo, neonMat);
    rightWing.position.set(0.44, 0.68, -0.22);
    rightWing.rotation.z = -0.35;
    bodyGroup.add(leftWing, rightWing);
  }

  // Energy Shield Sphere (toggled via hasShield)
  const shieldMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.95, 1),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    })
  );
  shieldMesh.position.y = 0.75;
  shieldMesh.visible = false;
  root.add(shieldMesh);

  // Combo Fire / Gold Halo Ring (visible when streak >= 2)
  const comboHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.04, 8, 28),
    new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.85,
    })
  );
  comboHalo.rotation.x = Math.PI / 2;
  comboHalo.position.y = 0.12;
  comboHalo.visible = false;
  root.add(comboHalo);

  return { root, bodyGroup, shieldMesh, comboHalo };
}

interface BurstParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

export default function SurvivalTower3DScene({
  theme,
  currentFloor,
  fromFloor,
  checkpointFloor,
  heroId,
  motionType,
  motionNonce,
  hasShield,
  isFrozen,
  isDangerTime,
  streak,
  hoveredOption,
  cameraMode,
  previewMode = false,
}: SurvivalTower3DSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Store latest reactive props inside a ref so the 60fps animation loop never tears down WebGL
  const stateRef = useRef({
    theme,
    currentFloor,
    fromFloor,
    checkpointFloor,
    heroId,
    motionType,
    motionNonce,
    hasShield,
    isFrozen,
    isDangerTime,
    streak,
    hoveredOption,
    cameraMode,
    previewMode,
  });

  useEffect(() => {
    stateRef.current = {
      theme,
      currentFloor,
      fromFloor,
      checkpointFloor,
      heroId,
      motionType,
      motionNonce,
      hasShield,
      isFrozen,
      isDangerTime,
      streak,
      hoveredOption,
      cameraMode,
      previewMode,
    };
  }, [
    theme,
    currentFloor,
    fromFloor,
    checkpointFloor,
    heroId,
    motionType,
    motionNonce,
    hasShield,
    isFrozen,
    isDangerTime,
    streak,
    hoveredOption,
    cameraMode,
    previewMode,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const initW = Math.max(260, container.clientWidth);
    const initH = Math.max(200, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initW, initH);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const initialPalette = getBiomePalette(stateRef.current.currentFloor, stateRef.current.theme);
    const bgFogColor = new THREE.Color(initialPalette.fogHex);
    scene.background = bgFogColor.clone();
    scene.fog = new THREE.FogExp2(initialPalette.fogHex, 0.014);

    const camera = new THREE.PerspectiveCamera(54, initW / initH, 0.1, 180);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e1b4b, 0.95);
    scene.add(hemiLight);

    const mainDirLight = new THREE.DirectionalLight(initialPalette.lightHex, 1.85);
    mainDirLight.position.set(12, 26, 16);
    scene.add(mainDirLight);

    const rimLight = new THREE.PointLight(0xfbbf24, 2.8, 26);
    scene.add(rimLight);

    // Central Architectural Citadel Core + Glowing Energy Lattice
    const towerHeight = TOTAL_FLOORS * FLOOR_STEP_Y + 4;
    const coreColor =
      stateRef.current.theme === 'hon-viet'
        ? 0x6b141a
        : stateRef.current.theme === 'lotus-zen-sanctuary'
        ? 0x4e342e
        : stateRef.current.theme === 'fantasy-academy'
        ? 0x065f46
        : 0x262466;

    const coreEmissive =
      stateRef.current.theme === 'hon-viet'
        ? 0x7c2d12
        : stateRef.current.theme === 'fantasy-academy'
        ? 0x047857
        : 0x312e81;

    const coreMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      emissive: coreEmissive,
      emissiveIntensity: 0.35,
      roughness: 0.42,
      metalness: 0.45,
    });
    const coreMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.12, 1.58, towerHeight, 8, 24),
      coreMat
    );
    coreMesh.position.y = towerHeight / 2 - 2;
    scene.add(coreMesh);

    const latticeMat = new THREE.MeshBasicMaterial({
      color: initialPalette.emissiveHex,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const latticeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.22, 1.68, towerHeight, 8, 20),
      latticeMat
    );
    latticeMesh.position.y = towerHeight / 2 - 2;
    scene.add(latticeMesh);

    // Decorative glowing tier rings around central spire every 3 floors
    const spireRingMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
      metalness: 0.75,
      roughness: 0.2,
    });
    for (let f = 1; f <= TOTAL_FLOORS; f += 3) {
      const tRatio = (f - 1) / TOTAL_FLOORS;
      const ringR = THREE.MathUtils.lerp(1.66, 1.2, tRatio);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.065, 8, 24), spireRingMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = (f - 1) * FLOOR_STEP_Y;
      scene.add(ring);
    }

    // Build 50 Spiral Stepping Platforms + Boss Constructs + Labels
    const platformMeshes: THREE.Mesh[] = [];
    const platformMaterials: THREE.MeshStandardMaterial[] = [];
    const bossGroups = new Map<number, THREE.Group>();
    const checkpointBeacons = new Map<number, THREE.Mesh>();
    const disposableTextures: THREE.Texture[] = [];
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    const stdPlatGeo = new THREE.CylinderGeometry(0.95, 0.78, 0.34, 8);
    const bossPlatGeo = new THREE.CylinderGeometry(1.38, 1.12, 0.46, 8);
    const apexPlatGeo = new THREE.CylinderGeometry(2.5, 2.1, 0.65, 12);
    const stepStoneGeo = new THREE.BoxGeometry(0.32, 0.14, 0.32);
    disposableGeometries.push(stdPlatGeo, bossPlatGeo, apexPlatGeo, stepStoneGeo);

    const stepStoneMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      emissive: 0x475569,
      emissiveIntensity: 0.25,
      roughness: 0.5,
    });
    disposableMaterials.push(stepStoneMat);

    for (let f = 1; f <= TOTAL_FLOORS; f++) {
      const pos = getFloorPosition(f);
      const pal = getBiomePalette(f, stateRef.current.theme);
      const isApex = f === TOTAL_FLOORS;
      const isBoss = f % 10 === 0;

      const mat = new THREE.MeshStandardMaterial({
        color: pal.platformHex,
        emissive: pal.emissiveHex,
        emissiveIntensity: isApex ? 0.65 : isBoss ? 0.42 : 0.2,
        roughness: 0.35,
        metalness: 0.4,
      });
      platformMaterials.push(mat);
      disposableMaterials.push(mat);

      const mesh = new THREE.Mesh(
        isApex ? apexPlatGeo : isBoss ? bossPlatGeo : stdPlatGeo,
        mat
      );
      mesh.position.copy(pos);
      mesh.position.y -= isApex ? 0.32 : 0.18;
      scene.add(mesh);
      platformMeshes.push(mesh);

      // Connecting mini stepping stones between f and f+1
      if (f < TOTAL_FLOORS) {
        const nextPos = getFloorPosition(f + 1);
        for (let s = 1; s <= 2; s++) {
          const t = s / 3;
          const stepMesh = new THREE.Mesh(stepStoneGeo, stepStoneMat);
          stepMesh.position.lerpVectors(pos, nextPos, t);
          stepMesh.position.y -= 0.22;
          stepMesh.rotation.y = f * 0.6 + s;
          scene.add(stepMesh);
        }
      }

      // Floating Floor Number Sprite (every floor!)
      const labelTex = createFloorLabelTexture(f);
      disposableTextures.push(labelTex);
      const spriteMat = new THREE.SpriteMaterial({
        map: labelTex,
        transparent: true,
        depthWrite: false,
      });
      disposableMaterials.push(spriteMat);
      const sprite = new THREE.Sprite(spriteMat);
      const radialOut = pos.clone().setY(0).normalize();
      if (isApex) {
        sprite.position.set(0, pos.y + 2.5, 0);
        sprite.scale.set(1.9, 0.95, 1);
      } else {
        sprite.position.set(
          pos.x + radialOut.x * 1.15,
          pos.y + 0.55,
          pos.z + radialOut.z * 1.15
        );
        sprite.scale.set(isBoss ? 1.45 : 1.05, isBoss ? 0.72 : 0.52, 1);
      }
      scene.add(sprite);

      // Sanctuary Checkpoint Arch & Boss Sentinel on 10, 20, 30, 40, 50
      if (isBoss) {
        if (!isApex) {
          const pillarMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            emissive: 0xb45309,
            emissiveIntensity: 0.4,
            metalness: 0.7,
            roughness: 0.25,
          });
          disposableMaterials.push(pillarMat);
          const archGroup = new THREE.Group();
          archGroup.position.copy(pos);
          archGroup.lookAt(0, pos.y, 0);

          const pGeo = new THREE.CylinderGeometry(0.09, 0.11, 1.9, 8);
          disposableGeometries.push(pGeo);
          const pLeft = new THREE.Mesh(pGeo, pillarMat);
          pLeft.position.set(-0.95, 0.95, 0);
          const pRight = new THREE.Mesh(pGeo, pillarMat);
          pRight.position.set(0.95, 0.95, 0);
          const topBeam = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.22), pillarMat);
          topBeam.position.set(0, 1.92, 0);
          archGroup.add(pLeft, pRight, topBeam);

          const beacon = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.24, 0),
            new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 0.9,
            })
          );
          beacon.position.set(0, 2.3, 0);
          archGroup.add(beacon);
          checkpointBeacons.set(f, beacon);
          scene.add(archGroup);
        }

        // Floating Boss Sentinel Construct
        const bossGrp = new THREE.Group();
        bossGrp.position.copy(pos);
        bossGrp.position.y += isApex ? 1.35 : 1.15;

        const bossCore = new THREE.Mesh(
          new THREE.OctahedronGeometry(isApex ? 0.65 : 0.42, 0),
          new THREE.MeshStandardMaterial({
            color: isApex ? 0xfef08a : 0xf43f5e,
            emissive: isApex ? 0xf59e0b : 0xe11d48,
            emissiveIntensity: 0.95,
            metalness: 0.6,
            roughness: 0.2,
          })
        );
        const bossRing = new THREE.Mesh(
          new THREE.TorusGeometry(isApex ? 0.95 : 0.65, 0.045, 8, 24),
          new THREE.MeshBasicMaterial({ color: isApex ? 0xfde047 : 0xfb7185 })
        );
        bossGrp.add(bossCore, bossRing);
        scene.add(bossGrp);
        bossGroups.set(f, bossGrp);
      }
    }

    // Apex Pillar of Light at Floor 50
    const apexPos = getFloorPosition(TOTAL_FLOORS);
    const lightBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 1.6, 14, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    lightBeam.position.set(apexPos.x, apexPos.y + 6.5, apexPos.z);
    scene.add(lightBeam);

    // Targeting Arc Beam (lights up when player hovers Option A/B/C/D!)
    const targetBeamGeo = new THREE.BufferGeometry();
    const targetBeamPositions = new Float32Array(24 * 3);
    targetBeamGeo.setAttribute('position', new THREE.BufferAttribute(targetBeamPositions, 3));
    const targetBeamLine = new THREE.Line(
      targetBeamGeo,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 })
    );
    targetBeamLine.visible = false;
    scene.add(targetBeamLine);

    // Landing Shockwave Ring
    const shockwaveMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.58, 28),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      })
    );
    shockwaveMesh.rotation.x = -Math.PI / 2;
    shockwaveMesh.visible = false;
    scene.add(shockwaveMesh);

    // Ambient Floating Star / Ember Dust
    const starCount = 220;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 6.2 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      starPositions[i * 3] = Math.cos(theta) * r;
      starPositions[i * 3 + 1] = Math.random() * (towerHeight + 8) - 2;
      starPositions[i * 3 + 2] = Math.sin(theta) * r;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const glowTex = createGlowTexture();
    disposableTextures.push(glowTex);
    const starMat = new THREE.PointsMaterial({
      size: 0.42,
      map: glowTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Hero Mesh Container (rebuilt cleanly when heroId changes)
    let activeHeroId = stateRef.current.heroId;
    let heroRig = buildHeroGroup(activeHeroId);
    const startFloorPos = getFloorPosition(stateRef.current.currentFloor);
    heroRig.root.position.copy(startFloorPos);
    scene.add(heroRig.root);

    // Dynamic 3D Burst Particles Pool
    const burstParticles: BurstParticle[] = [];
    const burstGeo = new THREE.OctahedronGeometry(0.11, 0);
    disposableGeometries.push(burstGeo);

    const spawnBurst = (origin: THREE.Vector3, colorHex: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const pMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 1,
        });
        const m = new THREE.Mesh(burstGeo, pMat);
        m.position.copy(origin);
        m.position.y += 0.4;
        const speed = 2.2 + Math.random() * 4.5;
        const angle = Math.random() * Math.PI * 2;
        const vy = 1.8 + Math.random() * 4.2;
        scene.add(m);
        burstParticles.push({
          mesh: m,
          vel: new THREE.Vector3(Math.cos(angle) * speed, vy, Math.sin(angle) * speed),
          life: 0,
          maxLife: 0.55 + Math.random() * 0.35,
        });
      }
    };

    // Interactive Pointer Drag Orbit + Overview Pan
    let userYawOffset = 0;
    let userPanY = 0;
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPointerX;
      const dy = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      userYawOffset -= dx * 0.008;
      if (stateRef.current.cameraMode === 'overview') {
        userPanY = Math.max(-6, Math.min(towerHeight, userPanY + dy * 0.08));
      }
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.style.touchAction = 'none';
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Motion & Camera Animation State
    let lastHandledNonce = stateRef.current.motionNonce;
    let animElapsed = 0;
    let animDuration = 0.68;
    let isAnimatingMove = false;
    let moveStartPos = startFloorPos.clone();
    let moveEndPos = startFloorPos.clone();
    let activeMotion: TowerMotionType = 'idle';
    let shakeIntensity = 0;
    let shockwaveProgress = -1;

    const currentCamPos = new THREE.Vector3(
      startFloorPos.x * 1.9,
      startFloorPos.y + 3.2,
      startFloorPos.z * 1.9 + 5
    );
    const currentLookAt = startFloorPos.clone().add(new THREE.Vector3(0, 1.0, 0));

    let prevTime = performance.now();
    let rafId = 0;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;
      const tSec = now * 0.001;
      const st = stateRef.current;

      // Rebuild 3D Hero live if user picks another avatar in Lobby
      if (st.heroId !== activeHeroId) {
        const oldPos = heroRig.root.position.clone();
        scene.remove(heroRig.root);
        activeHeroId = st.heroId;
        heroRig = buildHeroGroup(activeHeroId);
        heroRig.root.position.copy(oldPos);
        scene.add(heroRig.root);
        spawnBurst(oldPos, 0xfde047, 18);
      }

      // Detect new climb / double-jump / fall / shield_block / victory trigger
      if (st.motionNonce !== lastHandledNonce) {
        lastHandledNonce = st.motionNonce;
        activeMotion = st.motionType;

        if (activeMotion === 'leap_1' || activeMotion === 'leap_2') {
          moveStartPos = getFloorPosition(st.fromFloor);
          moveEndPos = getFloorPosition(st.currentFloor);
          animElapsed = 0;
          animDuration = activeMotion === 'leap_2' ? 0.78 : 0.58;
          isAnimatingMove = true;
          userYawOffset *= 0.35; // Gently recenter camera behind hero
        } else if (activeMotion === 'fall') {
          moveStartPos = getFloorPosition(st.fromFloor);
          moveEndPos = getFloorPosition(st.currentFloor);
          animElapsed = 0;
          animDuration = 0.72;
          isAnimatingMove = true;
          shakeIntensity = 0.45;
          spawnBurst(moveStartPos, 0xef4444, 28);
        } else if (activeMotion === 'shield_block') {
          shakeIntensity = 0.24;
          spawnBurst(heroRig.root.position, 0x38bdf8, 30);
        } else if (activeMotion === 'victory') {
          spawnBurst(getFloorPosition(TOTAL_FLOORS), 0xfde047, 55);
        }
      }

      // Update Hero Position & Parabolic Trajectory
      const targetFloorPos = getFloorPosition(st.currentFloor);
      if (isAnimatingMove) {
        animElapsed += dt;
        const p = Math.min(1, animElapsed / animDuration);
        const eased = 1 - Math.pow(1 - p, 3);

        heroRig.root.position.lerpVectors(moveStartPos, moveEndPos, eased);

        if (activeMotion === 'leap_1' || activeMotion === 'leap_2') {
          const arcHeight = activeMotion === 'leap_2' ? 2.65 : 1.55;
          heroRig.root.position.y += Math.sin(p * Math.PI) * arcHeight;
          // Somersault on Combo Double Jump!
          heroRig.bodyGroup.rotation.x =
            activeMotion === 'leap_2' ? p * Math.PI * 2 : Math.sin(p * Math.PI) * 0.35;
        } else if (activeMotion === 'fall') {
          heroRig.root.position.y += Math.sin(p * Math.PI) * 0.65;
          heroRig.bodyGroup.rotation.z = Math.sin(p * Math.PI * 4) * 0.55;
        }

        // Face movement direction
        const dir = moveEndPos.clone().sub(moveStartPos);
        if (dir.lengthSq() > 0.01) {
          heroRig.root.rotation.y = Math.atan2(dir.x, dir.z);
        }

        if (p >= 1) {
          isAnimatingMove = false;
          heroRig.bodyGroup.rotation.set(0, 0, 0);
          heroRig.root.position.copy(targetFloorPos);

          if (activeMotion === 'leap_1' || activeMotion === 'leap_2') {
            shockwaveMesh.position.set(targetFloorPos.x, targetFloorPos.y + 0.04, targetFloorPos.z);
            shockwaveProgress = 0;
            shockwaveMesh.visible = true;
            spawnBurst(
              targetFloorPos,
              activeMotion === 'leap_2' ? 0xfbbf24 : 0x34d399,
              activeMotion === 'leap_2' ? 36 : 22
            );
          }
        }
      } else {
        heroRig.root.position.lerp(targetFloorPos, 0.18);
        heroRig.bodyGroup.position.y = Math.sin(tSec * 3.4) * 0.07;
        heroRig.bodyGroup.rotation.y = st.previewMode ? tSec * 0.9 : Math.sin(tSec * 1.6) * 0.15;

        if (!st.previewMode && st.currentFloor < TOTAL_FLOORS) {
          const nextP = getFloorPosition(st.currentFloor + 1);
          const lookVec = nextP.clone().sub(targetFloorPos);
          heroRig.root.rotation.y = Math.atan2(lookVec.x, lookVec.z);
        }
      }

      // Update Shield & Combo Aura
      heroRig.shieldMesh.visible = st.hasShield;
      if (st.hasShield) {
        heroRig.shieldMesh.rotation.y = tSec * 1.8;
        heroRig.shieldMesh.rotation.x = tSec * 0.9;
      }

      heroRig.comboHalo.visible = st.streak >= 2;
      if (st.streak >= 2) {
        const pulse = 1 + Math.sin(tSec * 7) * 0.1;
        heroRig.comboHalo.scale.set(pulse, pulse, 1);
      }

      // Platform States: Cleared Glow, Danger Tremor, Boss Construct Rotation
      for (let i = 0; i < TOTAL_FLOORS; i++) {
        const f = i + 1;
        const pMesh = platformMeshes[i];
        const pMat = platformMaterials[i];
        const basePos = getFloorPosition(f);

        if (f === st.currentFloor && st.isDangerTime && !isAnimatingMove) {
          pMesh.position.x = basePos.x + Math.sin(tSec * 42) * 0.08;
          pMesh.position.z = basePos.z + Math.cos(tSec * 38) * 0.08;
          pMat.emissive.setHex(0xef4444);
          pMat.emissiveIntensity = 0.65 + Math.sin(tSec * 14) * 0.3;
        } else {
          pMesh.position.x = basePos.x;
          pMesh.position.z = basePos.z;
          const pal = getBiomePalette(f, st.theme);
          if (f < st.currentFloor) {
            pMat.emissive.setHex(0x10b981);
            pMat.emissiveIntensity = 0.45;
          } else if (f === st.currentFloor) {
            pMat.emissive.setHex(st.isFrozen ? 0x38bdf8 : 0xfbbf24);
            pMat.emissiveIntensity = 0.72;
          } else {
            pMat.emissive.setHex(pal.emissiveHex);
            pMat.emissiveIntensity = f === 50 ? 0.65 : f % 10 === 0 ? 0.38 : 0.18;
          }
        }
      }

      // Boss Sentinels & Checkpoint Beacons
      bossGroups.forEach((grp, bossFloor) => {
        const defeated = st.currentFloor > bossFloor || st.motionType === 'victory';
        grp.visible = !defeated;
        if (!defeated) {
          grp.rotation.y = tSec * 1.5;
          grp.children[1].rotation.x = tSec * 2.4;
          const base = getFloorPosition(bossFloor);
          grp.position.y =
            base.y + (bossFloor === 50 ? 1.45 : 1.15) + Math.sin(tSec * 2.8 + bossFloor) * 0.16;
        }
      });

      checkpointBeacons.forEach((beacon, cpFloor) => {
        beacon.rotation.y = tSec * 2.2;
        const mat = beacon.material as THREE.MeshStandardMaterial;
        if (st.checkpointFloor >= cpFloor) {
          mat.color.setHex(0x34d399);
          mat.emissive.setHex(0x10b981);
        }
      });

      // Targeting Arc Beam when hovering A / B / C / D
      if (st.hoveredOption && !st.previewMode && !isAnimatingMove && st.currentFloor < TOTAL_FLOORS) {
        const jumpSteps = (st.streak + 1) % 3 === 0 ? 2 : 1;
        const destPos = getFloorPosition(Math.min(TOTAL_FLOORS, st.currentFloor + jumpSteps));
        const origPos = heroRig.root.position;
        const arr = targetBeamGeo.attributes.position.array as Float32Array;
        for (let k = 0; k < 24; k++) {
          const u = k / 23;
          arr[k * 3] = THREE.MathUtils.lerp(origPos.x, destPos.x, u);
          arr[k * 3 + 1] =
            THREE.MathUtils.lerp(origPos.y + 0.6, destPos.y + 0.15, u) +
            Math.sin(u * Math.PI) * (jumpSteps === 2 ? 2.2 : 1.3);
          arr[k * 3 + 2] = THREE.MathUtils.lerp(origPos.z, destPos.z, u);
        }
        targetBeamGeo.attributes.position.needsUpdate = true;
        (targetBeamLine.material as THREE.LineBasicMaterial).color.setHex(
          jumpSteps === 2 ? 0xfbbf24 : 0x38bdf8
        );
        targetBeamLine.visible = true;
      } else {
        targetBeamLine.visible = false;
      }

      // Shockwave Ring expansion
      if (shockwaveProgress >= 0) {
        shockwaveProgress += dt * 2.4;
        if (shockwaveProgress >= 1) {
          shockwaveProgress = -1;
          shockwaveMesh.visible = false;
        } else {
          const scale = 1 + shockwaveProgress * 2.6;
          shockwaveMesh.scale.set(scale, scale, 1);
          (shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - shockwaveProgress);
        }
      }

      // Update Burst Particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.life += dt;
        if (bp.life >= bp.maxLife) {
          scene.remove(bp.mesh);
          (bp.mesh.material as THREE.Material).dispose();
          burstParticles.splice(i, 1);
        } else {
          bp.vel.y -= 9.2 * dt;
          bp.mesh.position.addScaledVector(bp.vel, dt);
          bp.mesh.rotation.x += 5 * dt;
          bp.mesh.rotation.y += 4 * dt;
          (bp.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - bp.life / bp.maxLife;
        }
      }

      // Ambient Starfield gentle upward drift
      starField.rotation.y = tSec * (st.isFrozen ? 0.015 : 0.05);

      // Smooth Biome Sky / Fog Transition
      const activeBiome = getBiomePalette(st.currentFloor, st.theme);
      const targetSky = new THREE.Color(st.isFrozen ? 0x082f49 : activeBiome.fogHex);
      (scene.background as THREE.Color).lerp(targetSky, 0.04);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(targetSky, 0.04);
      }
      mainDirLight.color.lerp(new THREE.Color(activeBiome.lightHex), 0.05);
      rimLight.position.set(
        heroRig.root.position.x * 1.2,
        heroRig.root.position.y + 2.8,
        heroRig.root.position.z * 1.2
      );

      // Smooth Spring Camera (Follow vs Overview vs Lobby Preview)
      const heroPos = heroRig.root.position;
      let desiredCamPos: THREE.Vector3;
      let desiredLookAt: THREE.Vector3;

      if (st.previewMode) {
        const orbitAngle = tSec * 0.38 + userYawOffset;
        desiredCamPos = new THREE.Vector3(
          heroPos.x + Math.cos(orbitAngle) * 4.4,
          heroPos.y + 2.1,
          heroPos.z + Math.sin(orbitAngle) * 4.4
        );
        desiredLookAt = new THREE.Vector3(heroPos.x * 0.5, heroPos.y + 1.0, heroPos.z * 0.5);
      } else if (st.cameraMode === 'overview') {
        const baseAngle = (st.currentFloor - 1) * SPIRAL_STEP_RAD + userYawOffset + 0.6;
        const focusY = Math.max(2, Math.min(towerHeight - 4, heroPos.y + userPanY));
        desiredCamPos = new THREE.Vector3(
          Math.cos(baseAngle) * 15.5,
          focusY + 5.5,
          Math.sin(baseAngle) * 15.5
        );
        desiredLookAt = new THREE.Vector3(0, focusY + 1.2, 0);
      } else {
        const floorAngle =
          st.currentFloor === TOTAL_FLOORS
            ? tSec * 0.45 + userYawOffset
            : (st.currentFloor - 1) * SPIRAL_STEP_RAD - 0.55 + userYawOffset;
        const camDist = 11.2;
        desiredCamPos = new THREE.Vector3(
          Math.cos(floorAngle) * camDist,
          heroPos.y + 4.3,
          Math.sin(floorAngle) * camDist
        );
        desiredLookAt = new THREE.Vector3(
          heroPos.x * 0.35,
          heroPos.y + 2.15,
          heroPos.z * 0.35
        );
      }

      if (shakeIntensity > 0.005) {
        desiredCamPos.x += (Math.random() - 0.5) * shakeIntensity;
        desiredCamPos.y += (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= 0.88;
      }

      currentCamPos.lerp(desiredCamPos, 0.085);
      currentLookAt.lerp(desiredLookAt, 0.11);
      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(240, Math.floor(entry.contentRect.width));
        const h = Math.max(180, Math.floor(entry.contentRect.height));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      burstParticles.forEach((bp) => {
        (bp.mesh.material as THREE.Material).dispose();
      });
      disposableTextures.forEach((t) => t.dispose());
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      starGeo.dispose();
      starMat.dispose();
      targetBeamGeo.dispose();
      coreMat.dispose();
      spireRingMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="tower3d-fallback">
        <div className="tower3d-fallback-icon">🏰</div>
        <div>Đang hiển thị chế độ tiết kiệm đồ họa — Tầng {currentFloor}/50</div>
      </div>
    );
  }

  return <div ref={containerRef} className="tower3d-canvas-host" />;
}
