import type { Axis } from '../conventions';
import type { Mat3 } from './types';

export const IDENTITY: Mat3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export function activeRot(axis: Axis, rad: number): Mat3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  switch (axis) {
    case 'X': return [[1, 0, 0], [0, c, -s], [0, s, c]];
    case 'Y': return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
    case 'Z': return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
  }
}

export function passiveRot(axis: Axis, rad: number): Mat3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  switch (axis) {
    case 'X': return [[1, 0, 0], [0, c, s], [0, -s, c]];
    case 'Y': return [[c, 0, -s], [0, 1, 0], [s, 0, c]];
    case 'Z': return [[c, s, 0], [-s, c, 0], [0, 0, 1]];
  }
}

export function multiply(a: Mat3, b: Mat3): Mat3 {
  const r: Mat3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      r[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
    }
  }
  return r;
}

export function multiplyAll(mats: Mat3[]): Mat3 {
  return mats.reduce((acc, m) => multiply(acc, m), IDENTITY);
}
