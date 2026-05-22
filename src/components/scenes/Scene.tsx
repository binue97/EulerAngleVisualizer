import type { Ref } from 'react';
import { SceneShell } from '../scene-parts/SceneShell';
import { Axes } from '../scene-parts/Axes';
import { RotatingObject } from '../scene-parts/RotatingObject';
import { useMatrix4 } from '../../hooks/useMatrix4';
import type { Mat3 } from '../../lib/rotation/types';
import type { CameraHandle } from '../scene-parts/CameraBridge';

interface SceneProps {
  /** Convention matrix M (math frame → screen space). Applied to the gray world axes. */
  worldFrameMatrix: Mat3;
  /** Pose of the colored box (already pre-multiplied by M in App). */
  objectMatrix: Mat3;
  /** Pose of the vivid RGB body / new-frame axes (already pre-multiplied by M in App). */
  frameMatrix: Mat3;
  /** Optional ref to access the scene's camera imperatively (presets, copy-from). */
  cameraRef?: Ref<CameraHandle>;
}

export function Scene({ worldFrameMatrix, objectMatrix, frameMatrix, cameraRef }: SceneProps) {
  const worldM4 = useMatrix4(worldFrameMatrix);
  const objM4 = useMatrix4(objectMatrix);
  const frameM4 = useMatrix4(frameMatrix);

  return (
    <SceneShell cameraRef={cameraRef}>
      {/* Gray reference axes — represent the spatial frame implied by the convention. */}
      <group matrixAutoUpdate={false} matrix={worldM4}>
        <Axes length={2.2} opacity={0.35} colors={['#9aa0a6', '#9aa0a6', '#9aa0a6']} lineWidth={1.5} />
      </group>

      {/* Body / new-frame axes — vivid RGB, rotated by R when applicable. */}
      <group matrixAutoUpdate={false} matrix={frameM4}>
        <Axes length={1.5} labels={['X', 'Y', 'Z']} />
      </group>

      {/* The object. */}
      <group matrixAutoUpdate={false} matrix={objM4}>
        <RotatingObject />
      </group>
    </SceneShell>
  );
}
