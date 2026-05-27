import type { Composition, Mode, RotationOrder } from '../conventions';
import type { Mat3 } from './types';

const AXIS_INDEX: Record<string, 0 | 1 | 2> = { X: 0, Y: 1, Z: 2 };
const RAD2DEG = 180 / Math.PI;

function transpose(m: Mat3): Mat3 {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]],
  ];
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** Sign of the permutation of (a, b, c) relative to (0, 1, 2). */
function permSign(a: number, b: number, c: number): 1 | -1 {
  const p = [a, b, c];
  let s: 1 | -1 = 1;
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      if (p[i] > p[j]) s = (s === 1 ? -1 : 1);
    }
  }
  return s;
}

/**
 * Decompose R into active-intrinsic Euler angles for the given order.
 * Returns [α, β, γ] in radians.
 *
 * Convention: R = R_{a1}(α) · R_{a2}(β) · R_{a3}(γ).
 * Singularities (cβ ≈ 0 for Tait-Bryan, sβ ≈ 0 for proper Euler) are
 * resolved by setting γ = 0 and folding the remaining DoF into α.
 */
function decomposeActiveIntrinsicRad(
  order: RotationOrder,
  R: Mat3,
): [number, number, number] {
  const [a, b, c] = (order.split('') as Array<keyof typeof AXIS_INDEX>).map(
    (k) => AXIS_INDEX[k],
  ) as [number, number, number];

  // Tait-Bryan: three distinct axes (a ≠ c).
  if (a !== c) {
    const eps = permSign(a, b, c);
    const i = a, j = b, k = c;
    const beta = Math.asin(clamp(eps * R[i][k], -1, 1));
    const cBeta = Math.cos(beta);
    if (Math.abs(cBeta) > 1e-7) {
      const alpha = Math.atan2(-eps * R[j][k], R[k][k]);
      const gamma = Math.atan2(-eps * R[i][j], R[i][i]);
      return [alpha, beta, gamma];
    }
    // Gimbal lock: only α + sign(sβ)·γ is determined; pin γ = 0.
    const sBeta = eps * R[i][k] >= 0 ? 1 : -1;
    const alpha = Math.atan2(sBeta * R[j][i], R[j][j]);
    return [alpha, beta, 0];
  }

  // Proper Euler: first and last axes coincide (a = c). Third index is l.
  const i = a, j = b, l = (3 - a - b) as 0 | 1 | 2;
  const eps = permSign(i, j, l);
  const beta = Math.acos(clamp(R[i][i], -1, 1));
  const sBeta = Math.sin(beta);
  if (Math.abs(sBeta) > 1e-7) {
    const alpha = Math.atan2(R[j][i], -eps * R[l][i]);
    const gamma = Math.atan2(R[i][j], eps * R[i][l]);
    return [alpha, beta, gamma];
  }
  // Gimbal lock: β ≈ 0 or π. Fold γ into α.
  if (R[i][i] > 0) {
    // β = 0: net rotation is R_i(α + γ). Pin γ = 0.
    const alpha = Math.atan2(-eps * R[j][l], R[j][j]);
    return [alpha, 0, 0];
  }
  // β = π
  const alpha = Math.atan2(eps * R[j][l], -R[j][j]);
  return [alpha, Math.PI, 0];
}

/**
 * Decompose a 3×3 rotation matrix into Euler angles (α, β, γ) in degrees,
 * matching the user's (mode, composition, order) convention.
 *
 * Identities used to reduce every case to active-intrinsic decomposition:
 *   - passive R                ≡ (active R)ᵀ
 *   - extrinsic order O angles ≡ intrinsic reverse(O) with reversed angles
 */
export function decomposeRotation(
  mode: Mode,
  composition: Composition,
  order: RotationOrder,
  R: Mat3,
): [number, number, number] {
  const M = mode === 'passive' ? transpose(R) : R;
  if (composition === 'extrinsic') {
    const reversed = order.split('').reverse().join('') as RotationOrder;
    const [a, b, c] = decomposeActiveIntrinsicRad(reversed, M);
    return [c * RAD2DEG, b * RAD2DEG, a * RAD2DEG];
  }
  const [a, b, c] = decomposeActiveIntrinsicRad(order, M);
  return [a * RAD2DEG, b * RAD2DEG, c * RAD2DEG];
}
