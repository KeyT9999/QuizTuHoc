import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import LotusFlowerSvg from './LotusFlowerSvg';

interface Lotus3DExperienceProps {
  className?: string;
  height?: number | string;
  enableInteractiveParallax?: boolean;
}

export default function Lotus3DExperience({
  className = '',
  height = 360,
  enableInteractiveParallax = true,
}: Lotus3DExperienceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL capability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 400;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 360;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1e120d, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 100);
    camera.position.set(0, 2.2, 5.2);
    camera.lookAt(0, 0.4, 0);

    // Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(width, heightPx);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      return;
    }

    // Lighting (Warm Sanctuary Sunlight + Golden Lantern Ambiance)
    const ambientLight = new THREE.AmbientLight(0xffecd1, 0.9);
    scene.add(ambientLight);

    const mainSunLight = new THREE.DirectionalLight(0xfff3d6, 2.0);
    mainSunLight.position.set(3, 6, 4);
    scene.add(mainSunLight);

    const goldPointLight = new THREE.PointLight(0xd8b36a, 3.5, 12);
    goldPointLight.position.set(0, 1.2, 0);
    scene.add(goldPointLight);

    // Group for the 3D Lotus Blossom
    const lotusGroup = new THREE.Group();
    scene.add(lotusGroup);

    // Materials
    const goldPetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.65,
      roughness: 0.28,
      emissive: 0x78350f,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });

    const innerPetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      metalness: 0.5,
      roughness: 0.35,
      emissive: 0x92400e,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide,
    });

    // Helper to generate a curved 3D petal mesh
    const createPetalMesh = (scaleX: number, scaleY: number, bendZ: number, material: THREE.Material) => {
      const geom = new THREE.PlaneGeometry(scaleX, scaleY, 8, 8);
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const normY = (y + scaleY / 2) / scaleY;
        const curve = Math.sin(normY * Math.PI) * bendZ;
        pos.setZ(i, curve);
      }
      geom.computeVertexNormals();
      return new THREE.Mesh(geom, material);
    };

    // Layer 1: Outer Petals (8 petals)
    const outerCount = 8;
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2;
      const petal = createPetalMesh(0.75, 1.35, 0.35, goldPetalMaterial);
      petal.rotation.x = -Math.PI / 3;
      petal.rotation.y = angle;
      petal.position.set(Math.sin(angle) * 0.45, 0.2, Math.cos(angle) * 0.45);
      lotusGroup.add(petal);
    }

    // Layer 2: Mid Petals (8 petals, rotated offset)
    const midCount = 8;
    for (let i = 0; i < midCount; i++) {
      const angle = (i / midCount) * Math.PI * 2 + Math.PI / midCount;
      const petal = createPetalMesh(0.65, 1.15, 0.45, innerPetalMaterial);
      petal.rotation.x = -Math.PI / 4.2;
      petal.rotation.y = angle;
      petal.position.set(Math.sin(angle) * 0.3, 0.3, Math.cos(angle) * 0.3);
      lotusGroup.add(petal);
    }

    // Layer 3: Inner Blooming Petals (6 petals)
    const innerCount = 6;
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2;
      const petal = createPetalMesh(0.5, 0.95, 0.35, innerPetalMaterial);
      petal.rotation.x = -Math.PI / 6;
      petal.rotation.y = angle;
      petal.position.set(Math.sin(angle) * 0.18, 0.4, Math.cos(angle) * 0.18);
      lotusGroup.add(petal);
    }

    // Lotus Heart / Golden Stamen Sphere
    const stamenGeom = new THREE.SphereGeometry(0.28, 16, 16);
    const stamenMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.3,
    });
    const stamen = new THREE.Mesh(stamenGeom, stamenMat);
    stamen.position.set(0, 0.48, 0);
    lotusGroup.add(stamen);

    // Reflecting Pond Disc
    const pondGeom = new THREE.CircleGeometry(3.5, 32);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x1e120d,
      roughness: 0.1,
      metalness: 0.9,
    });
    const pond = new THREE.Mesh(pondGeom, pondMat);
    pond.rotation.x = -Math.PI / 2;
    pond.position.y = 0;
    scene.add(pond);

    // Floating Golden Wisdom Petal Particles
    const particleCount = 45;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = Math.random() * 3 + 0.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      particleSpeeds[i] = 0.003 + Math.random() * 0.006;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Simple sparkling particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(254, 240, 138, 1)');
      grad.addColorStop(0.4, 'rgba(217, 119, 6, 0.8)');
      grad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeom, particleMaterial);
    scene.add(particles);

    // Parallax & Motion Variables
    let targetRotationY = 0;
    let targetRotationX = 0;
    let animId: number;
    let isVisible = true;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!enableInteractiveParallax || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.45;
      targetRotationX = y * 0.2;
    };

    if (enableInteractiveParallax) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Visibility observer to save battery & CPU
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    // Animation Loop
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible || document.hidden) return;

      clock += 0.012;

      // Gentle continuous rotation
      if (!prefersReducedMotion) {
        lotusGroup.rotation.y += 0.003;
        lotusGroup.position.y = Math.sin(clock * 1.5) * 0.06;

        // Smooth camera tilt towards target
        camera.position.x += (targetRotationY * 1.2 - camera.position.x) * 0.05;
        camera.position.y += (2.2 + targetRotationX * 0.6 - camera.position.y) * 0.05;
        camera.lookAt(0, 0.4, 0);

        // Animate particles rising gently
        const posAttr = particleGeom.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] += particleSpeeds[i];
          arr[i * 3] += Math.sin(clock + i) * 0.002;
          if (arr[i * 3 + 1] > 3.8) {
            arr[i * 3 + 1] = 0.2;
            arr[i * 3] = (Math.random() - 0.5) * 6;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer?.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth || 400;
      const newH = typeof height === 'number' ? height : container.clientHeight || 360;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
      lotusGroup.clear();
      scene.clear();
    };
  }, [height, enableInteractiveParallax]);

  return (
    <div
      ref={mountRef}
      className={`lotus-3d-experience-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* Graceful Fallback for non-WebGL devices */}
      {!hasWebGL && (
        <div className="lotus-fallback-zen-art">
          <LotusFlowerSvg size={140} glow color="#D8B36A" />
        </div>
      )}
    </div>
  );
}
