import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { ParticleField } from './ParticleField';
import { CameraController } from './CameraController';
import { isBrowser } from '../../utils';

export const Scene3D = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isBrowser) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
        frameloop="demand" // Optimize: only render when needed
        dpr={[1, 2]} // Pixel ratio for better performance
      >
        {/* Ambient light for overall illumination */}
        <ambientLight intensity={0.2} />

        {/* Cyberpunk tri-color lighting setup */}
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#00f0ff" /> {/* Cyan */}
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ff006e" /> {/* Pink */}
        <pointLight position={[0, 15, -5]} intensity={0.6} color="#b026ff" /> {/* Purple */}

        {/* Particle field */}
        <ParticleField count={80} mousePosition={mousePosition} />

        {/* Camera controller */}
        <CameraController mousePosition={mousePosition} />

        {/* Fog for depth */}
        <fog attach="fog" args={['#000000', 10, 25]} />
      </Canvas>

      {/* Loading fallback */}
      <Loader
        containerStyles={{
          backgroundColor: 'transparent',
        }}
        dataStyles={{
          color: '#00f0ff',
          fontSize: '14px',
        }}
      />
    </>
  );
};
