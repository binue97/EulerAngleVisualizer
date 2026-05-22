import { useMemo } from 'react';
import { Matrix4 } from 'three';
import type { Mat3 } from '../lib/rotation/types';

/** Convert a 3x3 row-major matrix to a THREE.Matrix4. */
export function useMatrix4(mat3: Mat3): Matrix4 {
  return useMemo(() => {
    const m = new Matrix4();
    m.set(
      mat3[0][0], mat3[0][1], mat3[0][2], 0,
      mat3[1][0], mat3[1][1], mat3[1][2], 0,
      mat3[2][0], mat3[2][1], mat3[2][2], 0,
      0, 0, 0, 1,
    );
    return m;
  }, [mat3]);
}
