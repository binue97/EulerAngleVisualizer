import { ANGLE_SYMBOL_LATEX, deg2rad, type RotationOrder, type Axis } from '../conventions';
import { passiveRot, multiplyAll } from './elementary';
import { passiveElementaryLatex, degLatex, mat3ToLatex } from '../format';
import type { ElementaryStep, RotationResult } from './types';

/**
 * Passive extrinsic rotation.
 *
 *   R = R_{a1}^{T}(θ1) · R_{a2}^{T}(θ2) · R_{a3}^{T}(θ3)
 *
 * Numerically equal to (active extrinsic)ᵀ. Interpretation: the *frame*
 * rotates about *fixed world-frame axes* (a1, a2, a3) in order. Factor
 * order is the input order, mirroring the transpose of active extrinsic
 * (where factor order was reversed).
 */
export function passiveExtrinsic(
  order: RotationOrder,
  anglesDeg: [number, number, number],
): RotationResult {
  const axes = order.split('') as Axis[];

  const steps: ElementaryStep[] = axes.map((axis, i) => {
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
    axes.map((ax, i) => `R^{T}_${ax.toLowerCase()}(${ANGLE_SYMBOL_LATEX[i]})`).join('\\,');

  const compositionNumeric =
    `R \\;=\\; ` +
    axes.map((ax, i) => `R^{T}_${ax.toLowerCase()}(${degLatex(anglesDeg[i])})`).join('\\,');

  return {
    mode: 'passive',
    composition: 'extrinsic',
    order,
    compositionSymbolic,
    compositionNumeric,
    steps,
    finalMatrix,
    finalMatrixLatex: mat3ToLatex(finalMatrix),
  };
}
