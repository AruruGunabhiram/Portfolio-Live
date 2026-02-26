import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { CameraController } from './CameraController';
import { isBrowser } from '../../utils';

export const Scene3D = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isBrowser) return;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'default', antialias: false, failIfMajorPerformanceCaveat: false }}
    >
      {/* Soft ambient — no neon */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#4a8fa8" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#3a5a70" />

      <ParticleField count={200} mousePosition={mousePosition} />
      <CameraController mousePosition={mousePosition} />

      <fog attach="fog" args={['#080c1a', 12, 28]} />
    </Canvas>
  );
};
