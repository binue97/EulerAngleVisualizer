import { SPATIAL_DIR, type AxisConvention, type Dir } from './conventions';
import type { Mat3 } from './rotation/types';

/**
 * Build the matrix M that maps a vector in math frame (X, Y, Z) to its
 * representation in screen space (three.js native), given the user-chosen
 * axis convention.
 *
 *   M = [ xv | yv | zv ]   (columns are spatial unit vectors for X, Y, Z)
 *
 * Multiplying a math-frame vector by M yields the on-screen direction.
 */
export function conventionMatrix(conv: AxisConvention): Mat3 {
  const [x, y, z] = conv.split('') as [Dir, Dir, Dir];
  const xv = SPATIAL_DIR[x];
  const yv = SPATIAL_DIR[y];
  const zv = SPATIAL_DIR[z];
  return [
    [xv[0], yv[0], zv[0]],
    [xv[1], yv[1], zv[1]],
    [xv[2], yv[2], zv[2]],
  ];
}
