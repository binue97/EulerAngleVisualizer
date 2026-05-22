import { ANGLE_SYMBOL_LATEX, deg2rad, type RotationOrder, type Axis } from '../conventions';
import { passiveRot, multiplyAll } from './elementary';
import { passiveElementaryLatex, degLatex, mat3ToLatex } from '../format';
import type { ElementaryStep, RotationResult } from './types';

/**
 * Passive intrinsic rotation.
 *
 *   R = R_{a3}^{T}(θ3) · R_{a2}^{T}(θ2) · R_{a1}^{T}(θ1)
 *
 * Numerically equal to (active intrinsic)ᵀ. Interpretation: the *frame*
 * rotates intrinsically about its current axes (a1, a2, a3) in order, while
 * the vector stays fixed in space. The displayed coordinates of the fixed
 * vector in the rotated frame are obtained by left-multiplying with this R.
 *
 * Each elementary block is the *transpose* of the corresponding active block
 * (i.e., the same rotation but with the angle negated). Factor order is the
 * reverse of input order, mirroring the transpose of active intrinsic.
 */
export function passiveIntrinsic(
  order: RotationOrder,
  anglesDeg: [number, number, number],
): RotationResult {
  const axes = order.split('') as Axis[];

  // Multiplication order: reversed.
  const idx = [2, 1, 0];
  const steps: ElementaryStep[] = idx.map((i) => {
    const axis = axes[i];
    const sym = ANGLE_SYMBOL_LATEX[i];
    const m = passiveRot(axis, deg2rad(anglesDeg[i]));
    return {
      axis,
      angleSymbol: sym,
      angleDeg: anglesDeg[i],
      block: 'passive',
      symbolicLatex: passiveElementaryLatex(axis, sym),
      numericLatex: mat3ToLatex(m),
      matrix: m,
    };
  });

  const finalMatrix = multiplyAll(steps.map((s) => s.matrix));

  const compositionSymbolic =
    `R \\;=\\; ` +
    idx.map((i) => `R^{T}_${axes[i].toLowerCase()}(${ANGLE_SYMBOL_LATEX[i]})`).join('\\,');

  const compositionNumeric =
    `R \\;=\\; ` +
    idx.map((i) => `R^{T}_${axes[i].toLowerCase()}(${degLatex(anglesDeg[i])})`).join('\\,');

  return {
    mode: 'passive',
    composition: 'intrinsic',
    order,
    compositionSymbolic,
    compositionNumeric,
    steps,
    finalMatrix,
    finalMatrixLatex: mat3ToLatex(finalMatrix),
  };
}
