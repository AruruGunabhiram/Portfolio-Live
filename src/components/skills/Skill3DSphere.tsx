import { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import type { Mesh, Group } from 'three';
import { isBrowser } from '../../utils';
import { SKILLS } from '../../data/skills';
import { SkillTooltip } from './SkillTooltip';

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

interface OrbitingBoxProps {
  index: number;
  isGeekMode: boolean;
}

// Loading spinner component
const LoadingSpinner = ({ isGeekMode }: { isGeekMode: boolean }) => (
  <div className="h-[500px] flex items-center justify-center">
    <div className="relative w-16 h-16">
      <div
        className={`absolute inset-0 rounded-full border-4 border-transparent ${
          isGeekMode ? 'border-t-cyber-cyan glow-cyan' : 'border-t-dark-accent'
        } animate-spin`}
      />
      <div className={`absolute inset-2 rounded-full ${isGeekMode ? 'bg-cyber-cyan/10' : 'bg-dark-accent/10'}`} />
    </div>
  </div>
);

// Central glowing sphere
const CentralSphere = ({ isGeekMode }: { isGeekMode: boolean }) => {
  const solidSphereRef = useRef<Mesh>(null);
  const wireframeSphereRef = useRef<Mesh>(null);

  useFrame(() => {
    if (solidSphereRef.current) {
      solidSphereRef.current.rotation.y += 0.003;
    }
    if (wireframeSphereRef.current) {
      wireframeSphereRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      {/* Solid glowing sphere */}
      <mesh ref={solidSphereRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={isGeekMode ? '#00f0ff' : '#646cff'}
          emissive={isGeekMode ? '#00f0ff' : '#646cff'}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Wireframe overlay with gradient effect */}
      <mesh ref={wireframeSphereRef}>
        <sphereGeometry args={[0.85, 16, 16]} />
        <meshStandardMaterial
          color={isGeekMode ? '#ff006e' : '#646cff'}
          wireframe
          transparent
          opacity={0.4}
          emissive={isGeekMode ? '#ff006e' : '#646cff'}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

// Orbiting box with trail
const OrbitingBox = ({ index, isGeekMode }: OrbitingBoxProps) => {
  const boxRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  // Different orbital parameters for each box
  const radius = 2 + (index % 3) * 0.5; // 2, 2.5, 3
  const speed = 0.5 + (index % 4) * 0.2; // Different speeds
  const offset = (index / 12) * Math.PI * 2; // Distribute around circle
  const verticalOffset = Math.sin(index) * 0.5; // Vary vertical position

  useFrame((state) => {
    if (groupRef.current && boxRef.current) {
      const time = state.clock.elapsedTime * speed;
      const x = Math.cos(time + offset) * radius;
      const z = Math.sin(time + offset) * radius;
      const y = verticalOffset + Math.sin(time * 0.5) * 0.3;

      groupRef.current.position.set(x, y, z);
      boxRef.current.rotation.x += 0.01;
      boxRef.current.rotation.y += 0.01;
    }
  });

  // Create trail path (circle)
  const trailPoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    trailPoints.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        verticalOffset,
        Math.sin(angle) * radius
      )
    );
  }
  const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);

  const boxColor = index % 2 === 0 ? (isGeekMode ? '#00f0ff' : '#646cff') : (isGeekMode ? '#ff006e' : '#646cff');

  return (
    <>
      {/* Orbital trail */}
      <primitive object={new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({
        color: isGeekMode ? '#00f0ff' : '#646cff',
        transparent: true,
        opacity: 0.15,
      }))} />

      {/* Orbiting box */}
      <group ref={groupRef}>
        <mesh ref={boxRef}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial
            color={boxColor}
            emissive={boxColor}
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>
    </>
  );
};

// Skill label with hover effects
const SkillLabel = ({ skill, position, isGeekMode, onHover }: SkillLabelProps) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  const handleHover = (isHovered: boolean) => {
    setHovered(isHovered);
    onHover(isHovered);
  };

  const color = hovered ? (isGeekMode ? '#ff006e' : '#ff1744') : (isGeekMode ? '#00f0ff' : '#646cff');
  const scale = hovered ? 1.3 : 1;

  // Create line from skill to center when hovered
  const linePoints = [new THREE.Vector3(...position), new THREE.Vector3(0, 0, 0)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);

  return (
    <group ref={meshRef} position={position}>
      {/* Connecting line on hover */}
      {hovered && (
        <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
          color: isGeekMode ? '#ff006e' : '#ff1744',
          transparent: true,
          opacity: 0.6,
          linewidth: 2,
        }))} />
      )}

      {/* Skill name text */}
      <Text
        fontSize={0.25 * scale}
        color={color}
        anchorX="center"
        anchorY="middle"
        onPointerOver={() => handleHover(true)}
        onPointerOut={() => handleHover(false)}
        outlineWidth={hovered ? 0.01 : 0}
        outlineColor={isGeekMode ? '#ff006e' : '#ff1744'}
      >
        {skill.name}
      </Text>
    </group>
  );
};

// Main 3D scene
const Scene3D = ({
  skills,
  isGeekMode,
  onSkillHover
}: {
  skills: Array<{ name: string; level: number }>;
  isGeekMode: boolean;
  onSkillHover: (skill: string | null) => void;
}) => {
  const groupRef = useRef<Group>(null);

  // Distribute skills in a sphere pattern using spherical coordinates
  const positions: Array<[number, number, number]> = skills.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    const radius = 3.5;

    return [
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi),
    ];
  });

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1} color={isGeekMode ? '#00f0ff' : '#646cff'} />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color={isGeekMode ? '#ff006e' : '#ff1744'} />
      <pointLight position={[0, 5, -5]} intensity={0.6} color={isGeekMode ? '#b026ff' : '#7b2cbf'} />

      <group ref={groupRef}>
        {/* Central glowing sphere */}
        <CentralSphere isGeekMode={isGeekMode} />

        {/* Orbiting boxes with trails */}
        {Array.from({ length: 10 }).map((_, index) => (
          <OrbitingBox key={`box-${index}`} index={index} isGeekMode={isGeekMode} />
        ))}

        {/* Skill labels */}
        {skills.map((skill, index) => (
          <SkillLabel
            key={skill.name}
            skill={{ name: skill.name }}
            position={positions[index]}
            isGeekMode={isGeekMode}
            onHover={(hovered) => onSkillHover(hovered ? skill.name : null)}
          />
        ))}
      </group>

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

export const Skill3DSphere = ({ skills, isGeekMode }: Skill3DSphereProps) => {
  if (!isBrowser) return null;

  console.log('🎨 Skill3DSphere mounted with', skills.length, 'skills, isGeekMode:', isGeekMode);

  const [dpr, setDpr] = useState(1.5);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    skill: string | null;
  }>({ visible: false, x: 0, y: 0, skill: null });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltip.skill) {
        setTooltip((prev) => ({
          ...prev,
          x: e.clientX,
          y: e.clientY,
        }));
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [tooltip.skill]);

  return (
    <div ref={containerRef} className="w-full h-[500px] relative">
      <Suspense fallback={<LoadingSpinner isGeekMode={isGeekMode} />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={dpr}
          aria-label="3D sphere showing skills in interactive 3D space"
          role="img"
        >
          <PerformanceMonitor
            onIncline={() => setDpr(2)}
            onDecline={() => setDpr(1)}
          >
            <Scene3D
              skills={skills}
              isGeekMode={isGeekMode}
              onSkillHover={(skill) => {
                setTooltip((prev) => ({
                  ...prev,
                  visible: !!skill,
                  skill,
                }));
              }}
            />
          </PerformanceMonitor>
        </Canvas>
      </Suspense>

      {/* Instructions */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm ${
          isGeekMode ? 'text-cyber-text' : 'text-gray-400'
        }`}
      >
        <p className={isGeekMode ? 'text-glow-cyan' : ''}>
          {isGeekMode ? '> ' : ''}Drag to rotate • Scroll to zoom • Auto-rotating
        </p>
        <p className="text-xs mt-1 opacity-70">
          Hover over skills to highlight and connect to center
        </p>
      </div>

      {/* Tooltip */}
      <SkillTooltip
        skill={{
          name: tooltip.skill || '',
          category: '', // 3D view doesn't have category context
        }}
        relatedSkills={tooltip.skill ? (SKILLS.find(s => s.name === tooltip.skill)?.relatedSkills || []) : []}
        isVisible={tooltip.visible && !!tooltip.skill}
        x={tooltip.x}
        y={tooltip.y}
        isGeekMode={isGeekMode}
      />
    </div>
  );
};
