import type { Composition, Mode, RotationOrder } from '../conventions';
import { activeIntrinsic } from './activeIntrinsic';
import { activeExtrinsic } from './activeExtrinsic';
import { passiveIntrinsic } from './passiveIntrinsic';
import { passiveExtrinsic } from './passiveExtrinsic';
import type { RotationResult } from './types';

export * from './types';
export { activeIntrinsic, activeExtrinsic, passiveIntrinsic, passiveExtrinsic };

export function computeRotation(
  mode: Mode,
  composition: Composition,
  order: RotationOrder,
  anglesDeg: [number, number, number],
): RotationResult {
  if (mode === 'active' && composition === 'intrinsic') return activeIntrinsic(order, anglesDeg);
  if (mode === 'active' && composition === 'extrinsic') return activeExtrinsic(order, anglesDeg);
  if (mode === 'passive' && composition === 'intrinsic') return passiveIntrinsic(order, anglesDeg);
  return passiveExtrinsic(order, anglesDeg);
}
