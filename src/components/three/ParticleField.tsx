import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  mousePosition: { x: number; y: number };
}

export const ParticleField = ({ count = 200, mousePosition }: ParticleFieldProps) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle data once
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities: Array<{ x: number; y: number; z: number }> = [];
    const floatSpeeds: number[] = [];
    const floatOffsets: number[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
      velocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.004,
      });
      floatSpeeds.push(Math.random() * 0.3 + 0.1);
      floatOffsets.push(Math.random() * Math.PI * 2);
    }
    return { positions, velocities, floatSpeeds, floatOffsets };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particles.positions.slice(), 3));
    return geo;
  }, [particles]);

  useFrame(state => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.getElapsedTime();
    const mx = mousePosition.x * 1.2;
    const my = mousePosition.y * 1.2;

    for (let i = 0; i < count; i++) {
      // Slow drift
      pos[i * 3] += particles.velocities[i].x + mx * 0.015;
      pos[i * 3 + 1] += particles.velocities[i].y + my * 0.015 +
        Math.sin(t * particles.floatSpeeds[i] + particles.floatOffsets[i]) * 0.003;
      pos[i * 3 + 2] += particles.velocities[i].z;

      // Wrap around bounds
      if (pos[i * 3] > 12) pos[i * 3] = -12;
      if (pos[i * 3] < -12) pos[i * 3] = 12;
      if (pos[i * 3 + 1] > 12) pos[i * 3 + 1] = -12;
      if (pos[i * 3 + 1] < -12) pos[i * 3 + 1] = 12;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#4a8fa8"
        size={0.05}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};
