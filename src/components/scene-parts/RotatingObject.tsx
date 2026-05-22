/**
 * Asymmetric box with distinctly-colored faces so the rotation is unambiguous.
 *
 * Three.js BoxGeometry face order:
 *   0: +X   1: -X   2: +Y   3: -Y   4: +Z   5: -Z
 */
export function RotatingObject() {
  return (
    <mesh castShadow>
      <boxGeometry args={[1.1, 0.85, 0.6]} />
      <meshStandardMaterial attach="material-0" color="#ef4444" />
      <meshStandardMaterial attach="material-1" color="#7f1d1d" />
      <meshStandardMaterial attach="material-2" color="#22c55e" />
      <meshStandardMaterial attach="material-3" color="#14532d" />
      <meshStandardMaterial attach="material-4" color="#3b82f6" />
      <meshStandardMaterial attach="material-5" color="#1e3a8a" />
    </mesh>
  );
}
