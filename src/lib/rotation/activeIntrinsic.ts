import { ANGLE_SYMBOL_LATEX, deg2rad, type RotationOrder, type Axis } from '../conventions';
import { activeRot, multiplyAll } from './elementary';
import { activeElementaryLatex, degLatex, mat3ToLatex } from '../format';
import type { ElementaryStep, RotationResult } from './types';

/**
 * Active intrinsic rotation.
 *
 *   R = R_{a1}(θ1) · R_{a2}(θ2) · R_{a3}(θ3)
 *
 * where (a1, a2, a3) are the axes in input order and (θ1, θ2, θ3) are the
 * corresponding angles. Each subsequent rotation is about the *current body
 * frame* axis after the previous rotations. The product is in input order
 * (leftmost factor is the first rotation applied to the body).
 */
export function activeIntrinsic(
  order: RotationOrder,
  anglesDeg: [number, number, number],
): RotationResult {
  const axes = order.split('') as Axis[];

  const steps: ElementaryStep[] = axes.map((axis, i) => {
    const sym = ANGLE_SYMBOL_LATEX[i];
    const m = activeRot(axis, deg2rad(anglesDeg[i]));
    return {
      axis,
      angleSymbol: sym,
      angleDeg: anglesDeg[i],
      block: 'active',
      symbolicLatex: activeElementaryLatex(axis, sym),
      numericLatex: mat3ToLatex(m),
      matrix: m,
    };
  });

  const finalMatrix = multiplyAll(steps.map((s) => s.matrix));

  const compositionSymbolic =
    `R \\;=\\; ` +
    axes.map((ax, i) => `R_${ax.toLowerCase()}(${ANGLE_SYMBOL_LATEX[i]})`).join('\\,');

  const compositionNumeric =
    `R \\;=\\; ` +
    axes.map((ax, i) => `R_${ax.toLowerCase()}(${degLatex(anglesDeg[i])})`).join('\\,');

  return {
    mode: 'active',
    composition: 'intrinsic',
    order,
    compositionSymbolic,
    compositionNumeric,
    steps,
    finalMatrix,
    finalMatrixLatex: mat3ToLatex(finalMatrix),
  };
}
