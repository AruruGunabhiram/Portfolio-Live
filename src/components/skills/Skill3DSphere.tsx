import { useRef, useState, Suspense, useEffect, Component, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import type { Group } from 'three';
import { isBrowser } from '../../utils';
import { SKILLS } from '../../data/skills';
import { SkillTooltip } from './SkillTooltip';

// Error Boundary for Three.js errors
class ThreeErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.warn('[3D Sphere] Three.js render error:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.warn('[3D Sphere] Error details:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Robust WebGL detection — checks webgl2, webgl, and experimental-webgl
function detectWebGL(): { supported: boolean; reason: string } {
  try {
    if (typeof window === 'undefined') return { supported: false, reason: 'no window (SSR)' };
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGLRenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return { supported: false, reason: 'context creation returned null' };
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
      console.log('[3D Sphere] WebGL renderer:', renderer);
    }
    return { supported: true, reason: 'ok' };
  } catch (e) {
    return { supported: false, reason: String(e) };
  }
}

interface Skill3DSphereProps {
  skills: Array<{ name: string; level: number }>;
  isGeekMode: boolean;
}

interface SkillLabelProps {
  skill: { name: string };
  position: [number, number, number];
  isGeekMode: boolean;
  onHover: (hovered: boolean) => void;
}

// Canvas2D particle fallback — intentional, visually consistent
const Canvas2DFallback = ({ isGeekMode, skills }: { isGeekMode: boolean; skills: Array<{ name: string; level: number }> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.offsetWidth || 800;
    const H = canvas.offsetHeight || 600;
    canvas.width = W;
    canvas.height = H;

    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.5 + 0.8,
      op: Math.random() * 0.4 + 0.15,
    }));

    let raf: number;
    const col = isGeekMode ? '91,168,196' : '100,108,255';

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${p.op})`;
        ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${col},${0.12 * (1 - d / 130)})`;
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [isGeekMode]);

  return (
    <div className="w-full h-[600px] relative rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Skill tags overlay */}
      <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-2 p-8">
        {skills.slice(0, 24).map(s => (
          <span
            key={s.name}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              isGeekMode
                ? 'border-[#5ba8c4]/40 text-[#8ec8dc] bg-[#0a0e27]/60'
                : 'border-[#646cff]/30 text-[#9ca3af] bg-[#1a1a2e]/60'
            }`}
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
};

// Loading spinner
const LoadingSpinner = ({ isGeekMode }: { isGeekMode: boolean }) => (
  <div className="h-[500px] flex items-center justify-center">
    <div className="relative w-12 h-12">
      <div
        className={`absolute inset-0 rounded-full border-2 border-transparent ${
          isGeekMode ? 'border-t-[#5ba8c4]' : 'border-t-dark-accent'
        } animate-spin`}
      />
    </div>
  </div>
);

// Central sphere — muted tones, no neon
const CentralSphere = ({ isGeekMode }: { isGeekMode: boolean }) => {
  const solidRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (solidRef.current) solidRef.current.rotation.y += 0.002;
    if (wireRef.current) wireRef.current.rotation.y += 0.003;
  });

  const baseColor = isGeekMode ? '#3a7a90' : '#4a5580';
  const wireColor = isGeekMode ? '#5ba8c4' : '#646cff';

  return (
    <group>
      <mesh ref={solidRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.15}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>
      <mesh ref={wireRef}>
        <sphereGeometry args={[0.85, 16, 16]} />
        <meshStandardMaterial
          color={wireColor}
          wireframe
          transparent
          opacity={0.25}
          emissive={wireColor}
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  );
};

// Tiny orbiting particle cloud — replaces the big boxes
const OrbitingParticles = ({ isGeekMode }: { isGeekMode: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds, radii, offsets, verticals } = (() => {
    const N = 120;
    const pos = new Float32Array(N * 3);
    const sp: number[] = [], ra: number[] = [], off: number[] = [], vert: number[] = [];
    for (let i = 0; i < N; i++) {
      ra.push(1.8 + Math.random() * 1.8);
      sp.push(0.3 + Math.random() * 0.5);
      off.push(Math.random() * Math.PI * 2);
      vert.push((Math.random() - 0.5) * 1.2);
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
    }
    return { positions: pos, speeds: sp, radii: ra, offsets: off, verticals: vert };
  })();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  useFrame(state => {
    if (!pointsRef.current) return;
    const pos = (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < radii.length; i++) {
      pos[i * 3] = Math.cos(t * speeds[i] + offsets[i]) * radii[i];
      pos[i * 3 + 1] = verticals[i] + Math.sin(t * 0.4 + offsets[i]) * 0.3;
      pos[i * 3 + 2] = Math.sin(t * speeds[i] + offsets[i]) * radii[i];
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={isGeekMode ? '#5ba8c4' : '#646cff'}
        size={0.04}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Skill label with hover
const SkillLabel = ({ skill, position, isGeekMode, onHover }: SkillLabelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.08;
    }
  });

  const handleHover = (v: boolean) => { setHovered(v); onHover(v); };
  const color = hovered
    ? (isGeekMode ? '#a8d4e6' : '#8b93ff')
    : (isGeekMode ? '#7ec0d6' : '#9ca3af');

  return (
    <group ref={meshRef as unknown as React.RefObject<Group>} position={position}>
      <Text
        fontSize={hovered ? 0.28 : 0.22}
        color={color}
        anchorX="center"
        anchorY="middle"
        onPointerOver={() => handleHover(true)}
        onPointerOut={() => handleHover(false)}
      >
        {skill.name}
      </Text>
    </group>
  );
};

// Main 3D scene
const Scene3DInner = ({
  skills,
  isGeekMode,
  onSkillHover,
}: {
  skills: Array<{ name: string; level: number }>;
  isGeekMode: boolean;
  onSkillHover: (skill: string | null) => void;
}) => {
  const groupRef = useRef<Group>(null);

  const positions: Array<[number, number, number]> = skills.map((_, i) => {
    const phi = Math.acos(-1 + (2 * i) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    const r = 3.5;
    return [r * Math.cos(theta) * Math.sin(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(phi)];
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color={isGeekMode ? '#4a8fa8' : '#5b6eb5'} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color={isGeekMode ? '#3a6a7a' : '#4a5280'} />

      <group ref={groupRef}>
        <CentralSphere isGeekMode={isGeekMode} />
        <OrbitingParticles isGeekMode={isGeekMode} />
        {skills.map((skill, i) => (
          <SkillLabel
            key={skill.name}
            skill={{ name: skill.name }}
            position={positions[i]}
            isGeekMode={isGeekMode}
            onHover={v => onSkillHover(v ? skill.name : null)}
          />
        ))}
      </group>

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.4}
        makeDefault
      />
    </>
  );
};

export const Skill3DSphere = ({ skills, isGeekMode }: Skill3DSphereProps) => {
  // --- All hooks at top, unconditionally ---
  const [webGLStatus, setWebGLStatus] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; skill: string | null }>({
    visible: false, x: 0, y: 0, skill: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect WebGL on mount (client only)
  useEffect(() => {
    const { supported, reason } = detectWebGL();
    if (!supported) console.warn('[3D Sphere] WebGL unavailable:', reason);
    setWebGLStatus(supported ? 'ok' : 'fail');
  }, []);

  // Mouse tracking for tooltip
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !tooltip.skill) return;
    const handler = (e: MouseEvent) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    el.addEventListener('mousemove', handler);
    return () => el.removeEventListener('mousemove', handler);
  }, [tooltip.skill]);

  // SSR guard (after hooks)
  if (!isBrowser) return null;

  if (webGLStatus === 'checking') return <LoadingSpinner isGeekMode={isGeekMode} />;

  // Intentional Canvas2D fallback when WebGL is unavailable
  if (webGLStatus === 'fail') {
    return <Canvas2DFallback isGeekMode={isGeekMode} skills={skills} />;
  }

  return (
    <ThreeErrorBoundary
      fallback={<Canvas2DFallback isGeekMode={isGeekMode} skills={skills} />}
    >
      <div ref={containerRef} className="w-full h-[600px] min-h-[600px] relative">
        <Suspense fallback={<LoadingSpinner isGeekMode={isGeekMode} />}>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 60 }}
            dpr={[1, 1.5]}
            gl={{
              powerPreference: 'high-performance',
              antialias: false,
              failIfMajorPerformanceCaveat: false,
              alpha: true,
            }}
            style={{ width: '100%', height: '600px' }}
            aria-label="3D sphere showing skills"
            role="img"
            onCreated={({ gl }) => {
              // Listen for WebGL context loss; fall back to Canvas2D
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                console.warn('[3D Sphere] WebGL context lost — switching to Canvas2D fallback');
                setWebGLStatus('fail');
              }, { once: true });
            }}
          >
            <PerformanceMonitor>
              <Scene3DInner
                skills={skills}
                isGeekMode={isGeekMode}
                onSkillHover={skill =>
                  setTooltip(prev => ({ ...prev, visible: !!skill, skill }))
                }
              />
            </PerformanceMonitor>
          </Canvas>
        </Suspense>

        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs ${
          isGeekMode ? 'text-[#5ba8c4]/70' : 'text-gray-500'
        }`}>
          <p>{isGeekMode ? '> ' : ''}Drag to rotate · Scroll to zoom · Auto-rotating</p>
          <p className="mt-0.5 opacity-60">Hover a skill to highlight</p>
        </div>

        <SkillTooltip
          skill={{ name: tooltip.skill || '', category: '' }}
          relatedSkills={tooltip.skill ? (SKILLS.find(s => s.name === tooltip.skill)?.relatedSkills || []) : []}
          isVisible={tooltip.visible && !!tooltip.skill}
          x={tooltip.x}
          y={tooltip.y}
          isGeekMode={isGeekMode}
        />
      </div>
    </ThreeErrorBoundary>
  );
};
