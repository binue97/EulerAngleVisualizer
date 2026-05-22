import { ANGLE_SYMBOL_LATEX, deg2rad, type RotationOrder, type Axis } from '../conventions';
import { activeRot, multiplyAll } from './elementary';
import { activeElementaryLatex, degLatex, mat3ToLatex } from '../format';
import type { ElementaryStep, RotationResult } from './types';

/**
 * Active extrinsic rotation.
 *
 *   R = R_{a3}(θ3) · R_{a2}(θ2) · R_{a1}(θ1)
 *
 * where (a1, a2, a3) are axes in input order and (θ1, θ2, θ3) are the
 * corresponding angles. Each rotation is about a *fixed world-frame axis*,
 * applied left-to-right in input order. Because each rotation is pre-applied
 * in the world frame, the matrix product is written in *reverse* order — the
 * last (rightmost) factor is the first rotation applied to the vector.
 *
 * Equivalent identity: active intrinsic XYZ ≡ active extrinsic ZYX.
 */
export function activeExtrinsic(
  order: RotationOrder,
  anglesDeg: [number, number, number],
): RotationResult {
  const axes = order.split('') as Axis[];

  // Build steps in *multiplication* order (reverse of input order).
  const idx = [2, 1, 0];
  const steps: ElementaryStep[] = idx.map((i) => {
    const axis = axes[i];
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
    idx.map((i) => `R_${axes[i].toLowerCase()}(${ANGLE_SYMBOL_LATEX[i]})`).join('\\,');

  const compositionNumeric =
    `R \\;=\\; ` +
    idx.map((i) => `R_${axes[i].toLowerCase()}(${degLatex(anglesDeg[i])})`).join('\\,');

  return {
    mode: 'active',
    composition: 'extrinsic',
    order,
    compositionSymbolic,
    compositionNumeric,
    steps,
    finalMatrix,
    finalMatrixLatex: mat3ToLatex(finalMatrix),
  };
}
