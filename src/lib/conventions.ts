export type Axis = 'X' | 'Y' | 'Z';
export type Mode = 'active' | 'passive';
export type Composition = 'intrinsic' | 'extrinsic';

export type RotationOrder =
  | 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX'
  | 'XYX' | 'XZX' | 'YXY' | 'YZY' | 'ZXZ' | 'ZYZ';

export const ORDERS: RotationOrder[] = [
  'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX',
  'XYX', 'XZX', 'YXY', 'YZY', 'ZXZ', 'ZYZ',
];

export const deg2rad = (deg: number): number => (deg * Math.PI) / 180;

export const ANGLE_SYMBOL_LATEX = ['\\alpha', '\\beta', '\\gamma'] as const;
export const ANGLE_SYMBOL_PLAIN = ['α', 'β', 'γ'] as const;

// ---------------------------------------------------------------------------
// Axis convention: which spatial direction each of X, Y, Z represents.
//
// Each of X, Y, Z picks one of F (Forward), B (Back), L (Left), R (Right),
// U (Up), D (Down). The three directions must be mutually orthogonal AND
// form a right-handed system (so the rotation matrices remain proper
// rotations, not reflections).
// ---------------------------------------------------------------------------

export type Dir = 'F' | 'B' | 'L' | 'R' | 'U' | 'D';
export type AxisConvention = string; // three-letter string from {F,B,L,R,U,D}

/**
 * Spatial direction → unit vector in three.js screen space.
 * Up = +Y, Right = +X, Forward = -Z (into screen).
 */
export const SPATIAL_DIR: Record<Dir, [number, number, number]> = {
  F: [0, 0, -1],
  B: [0, 0, 1],
  L: [-1, 0, 0],
  R: [1, 0, 0],
  U: [0, 1, 0],
  D: [0, -1, 0],
};

const OPPOSITE: Record<Dir, Dir> = { F: 'B', B: 'F', L: 'R', R: 'L', U: 'D', D: 'U' };

function isRightHanded(x: Dir, y: Dir, z: Dir): boolean {
  const a = SPATIAL_DIR[x];
  const b = SPATIAL_DIR[y];
  const c = SPATIAL_DIR[z];
  const cross: [number, number, number] = [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  return cross[0] === c[0] && cross[1] === c[1] && cross[2] === c[2];
}

/** All 24 right-handed FBLRUD conventions. */
export const ALL_CONVENTIONS: AxisConvention[] = (() => {
  const dirs: Dir[] = ['F', 'B', 'L', 'R', 'U', 'D'];
  const out: AxisConvention[] = [];
  for (const x of dirs) {
    for (const y of dirs) {
      if (x === y || OPPOSITE[x] === y) continue;
      for (const z of dirs) {
        if (z === x || z === y || OPPOSITE[z] === x || OPPOSITE[z] === y) continue;
        if (isRightHanded(x, y, z)) out.push(`${x}${y}${z}`);
      }
    }
  }
  return out;
})();
