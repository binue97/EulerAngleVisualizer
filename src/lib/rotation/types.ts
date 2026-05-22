import type { Axis, Composition, Mode, RotationOrder } from '../conventions';

export type Mat3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

export interface ElementaryStep {
  /** Which axis this elementary rotation is about. */
  axis: Axis;
  /** LaTeX symbol for the angle ("\\alpha" / "\\beta" / "\\gamma"). */
  angleSymbol: string;
  /** Angle value in degrees (for display). */
  angleDeg: number;
  /** Whether the block is the active elementary (R) or its transpose (R^T). */
  block: 'active' | 'passive';
  /** Symbolic LaTeX of this 3x3 block with cos/sin and the angle symbol. */
  symbolicLatex: string;
  /** Numeric LaTeX of this 3x3 block with substituted values. */
  numericLatex: string;
  /** Actual numeric 3x3 matrix. */
  matrix: Mat3;
}

export interface RotationResult {
  mode: Mode;
  composition: Composition;
  order: RotationOrder;

  /** Composition formula in symbolic form, e.g. "R = R_x(\\alpha)\\,R_y(\\beta)\\,R_z(\\gamma)". */
  compositionSymbolic: string;
  /** Composition formula with degree values substituted, e.g. "R = R_x(30°)\\,..." */
  compositionNumeric: string;

  /** Elementary steps in left-to-right multiplication order. */
  steps: ElementaryStep[];

  /** Final 3x3 rotation matrix. */
  finalMatrix: Mat3;
  /** Final matrix as LaTeX. */
  finalMatrixLatex: string;
}
