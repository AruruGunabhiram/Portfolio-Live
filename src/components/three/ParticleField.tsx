/* eslint-disable react-hooks/purity */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  mousePosition: { x: number; y: number };
}

export const ParticleField = ({ count = 100, mousePosition }: ParticleFieldProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate random positions and scales for particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      const scale = Math.random() * 0.3 + 0.1;
      const rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      };
      const floatSpeed = Math.random() * 0.5 + 0.2;
      const floatOffset = Math.random() * Math.PI * 2;
      temp.push({ position, scale, rotationSpeed, floatSpeed, floatOffset });
    }
    return temp;
  }, [count]);

  // Animate particles
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      // Float animation
      const floatY = Math.sin(time * particle.floatSpeed + particle.floatOffset) * 0.5;

      // Apply mouse influence
      const mouseInfluenceX = mousePosition.x * 2;
      const mouseInfluenceY = mousePosition.y * 2;

      dummy.position.set(
        particle.position.x + mouseInfluenceX * 0.3,
        particle.position.y + floatY + mouseInfluenceY * 0.3,
        particle.position.z
      );

      // Rotate
      dummy.rotation.x += particle.rotationSpeed.x;
      dummy.rotation.y += particle.rotationSpeed.y;
      dummy.rotation.z += particle.rotationSpeed.z;

      dummy.scale.set(particle.scale, particle.scale, particle.scale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Geometry - mix of different shapes */}
      <boxGeometry args={[1, 1, 1]} />
      {/* Material with geek mode terminal green */}
      <meshStandardMaterial
        color="#00ff00"
        emissive="#00ff00"
        emissiveIntensity={0.5}
        wireframe
        transparent
        opacity={0.6}
      />
    </instancedMesh>
  );
};
