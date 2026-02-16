import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import { isBrowser } from '../../utils';

interface Skill3DSphereProps {
  skills: Array<{ name: string; level: number }>;
  isGeekMode: boolean;
}

interface SkillLabelProps {
  skill: { name: string; level: number };
  position: [number, number, number];
  isGeekMode: boolean;
}

const SkillLabel = ({ skill, position, isGeekMode }: SkillLabelProps) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  const color = isGeekMode ? '#00f0ff' : '#646cff';
  const scale = hovered ? 1.2 : 1;

  return (
    <group ref={meshRef} position={position}>
      <Text
        fontSize={0.3 * scale}
        color={color}
        anchorX="center"
        anchorY="middle"
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {skill.name}
      </Text>
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.2 * scale}
        color={color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.7}
      >
        {skill.level}%
      </Text>
    </group>
  );
};

const SkillSphere = ({ skills, isGeekMode }: { skills: Array<{ name: string; level: number }>; isGeekMode: boolean }) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  // Distribute skills in a sphere pattern
  const positions: Array<[number, number, number]> = skills.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    const radius = 3;

    return [
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi),
    ];
  });

  return (
    <group ref={groupRef}>
      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={isGeekMode ? '#00f0ff' : '#646cff'}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Outer sphere wireframe */}
      <mesh>
        <sphereGeometry args={[3.5, 16, 16]} />
        <meshStandardMaterial
          color={isGeekMode ? '#00f0ff' : '#646cff'}
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Skill labels */}
      {skills.map((skill, index) => (
        <SkillLabel
          key={skill.name}
          skill={skill}
          position={positions[index]}
          isGeekMode={isGeekMode}
        />
      ))}
    </group>
  );
};

export const Skill3DSphere = ({ skills, isGeekMode }: Skill3DSphereProps) => {
  if (!isBrowser) return null;

  return (
    <div className="w-full h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        aria-label="3D sphere showing skills in interactive 3D space"
        role="img"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={isGeekMode ? '#00f0ff' : '#646cff'} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={isGeekMode ? '#00f0ff' : '#646cff'} />

        <Suspense fallback={null}>
          <SkillSphere skills={skills} isGeekMode={isGeekMode} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={5}
            maxDistance={15}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>

      {/* Instructions */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm ${isGeekMode ? 'text-geek-text' : 'text-gray-400'}`}>
        <p>Drag to rotate • Scroll to zoom</p>
        <p className="text-xs mt-1">Hover over skills to highlight</p>
      </div>
    </div>
  );
};
