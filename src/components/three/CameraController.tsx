/* eslint-disable react-hooks/immutability */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';

interface CameraControllerProps {
  mousePosition: { x: number; y: number };
}

export const CameraController = ({ mousePosition }: CameraControllerProps) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!controlsRef.current) return;

    // Smoothly move camera based on mouse position
    const targetX = mousePosition.x * 2;
    const targetY = mousePosition.y * 2;

    // Lerp camera position for smooth following
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;

    // Update controls
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      enableRotate={false}
      enabled={false} // Disable user control
    />
  );
};
