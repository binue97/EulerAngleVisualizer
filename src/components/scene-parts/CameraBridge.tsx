import { forwardRef, useImperativeHandle } from 'react';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type PresetView = 'top' | 'front' | 'side' | 'perspective';

export interface CameraState {
  pos: [number, number, number];
  tgt: [number, number, number];
  up: [number, number, number];
}

export interface CameraHandle {
  setView: (view: PresetView) => void;
  copyFrom: (other: CameraHandle) => void;
  getState: () => CameraState;
  setState: (state: CameraState) => void;
  /** Subscribe to camera changes (OrbitControls 'change' event). Returns unsubscribe. */
  onChange: (cb: () => void) => () => void;
}

const D = 5; // default camera distance for axis-aligned views

export const PRESET_VIEWS: Record<PresetView, CameraState> = {
  // Look down from above. Screen-up = spatial Forward (-Z) so the forward direction
  // points to the top of the screen, which matches the usual "map" orientation.
  top: { pos: [0, D, 0.0001], tgt: [0, 0, 0], up: [0, 0, -1] },
  // Look from behind toward the spatial forward (-Z). Screen-up = spatial Up.
  front: { pos: [0, 0, D], tgt: [0, 0, 0], up: [0, 1, 0] },
  // Look from the +X (Right) side.
  side: { pos: [D, 0, 0], tgt: [0, 0, 0], up: [0, 1, 0] },
  // Default 3/4 perspective.
  perspective: { pos: [3, 2.4, 3.4], tgt: [0, 0, 0], up: [0, 1, 0] },
};

/**
 * Lives inside a Canvas. Exposes an imperative handle (via ref) so external UI
 * can change camera viewpoints or copy state between scenes.
 */
export const CameraBridge = forwardRef<CameraHandle>((_, ref) => {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  useImperativeHandle(
    ref,
    () => {
      const apply = (s: CameraState) => {
        camera.position.set(s.pos[0], s.pos[1], s.pos[2]);
        camera.up.set(s.up[0], s.up[1], s.up[2]);
        if (controls?.target) {
          controls.target.set(s.tgt[0], s.tgt[1], s.tgt[2]);
        }
        camera.lookAt(s.tgt[0], s.tgt[1], s.tgt[2]);
        controls?.update?.();
      };

      return {
        setView: (view) => apply(PRESET_VIEWS[view]),
        copyFrom: (other) => apply(other.getState()),
        getState: () => {
          const t = controls?.target;
          return {
            pos: [camera.position.x, camera.position.y, camera.position.z],
            tgt: t ? [t.x, t.y, t.z] : [0, 0, 0],
            up: [camera.up.x, camera.up.y, camera.up.z],
          };
        },
        setState: apply,
        onChange: (cb) => {
          if (!controls) return () => {};
          controls.addEventListener('change', cb);
          return () => controls.removeEventListener('change', cb);
        },
      };
    },
    [camera, controls],
  );

  return null;
});
CameraBridge.displayName = 'CameraBridge';
