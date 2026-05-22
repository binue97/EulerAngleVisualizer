import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ReactNode, Ref } from 'react';
import { CameraBridge, type CameraHandle } from './CameraBridge';

interface SceneShellProps {
  children: ReactNode;
  cameraRef?: Ref<CameraHandle>;
}

/** Common Canvas wrapper: camera, lighting, ground grid, orbit controls. */
export function SceneShell({ children, cameraRef }: SceneShellProps) {
  return (
    <Canvas camera={{ position: [3, 2.4, 3.4], fov: 50 }} shadows>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 4]} intensity={0.9} castShadow />
      <gridHelper args={[10, 20, '#3a3f47', '#23272e']} position={[0, -0.001, 0]} />
      {children}
      <OrbitControls makeDefault enableDamping />
      <CameraBridge ref={cameraRef} />
    </Canvas>
  );
}
