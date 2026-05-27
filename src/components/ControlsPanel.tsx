import { useEffect } from 'react';
import { button, Leva, useControls } from 'leva';
import {
  ALL_CONVENTIONS,
  ORDERS,
  type AxisConvention,
  type Composition,
  type Mode,
  type RotationOrder,
} from '../lib/conventions';

export interface RotationInputs {
  mode: Mode;
  composition: Composition;
  order: RotationOrder;
  anglesDeg: [number, number, number];
  /** Spatial-direction labels for X, Y, Z (e.g. 'FLU', 'RDF'). */
  axisConvention: AxisConvention;
}

interface ControlsPanelProps {
  onChange: (inputs: RotationInputs) => void;
}

const conventionOptions = ALL_CONVENTIONS.reduce<Record<string, AxisConvention>>(
  (acc, c) => {
    acc[c] = c;
    return acc;
  },
  {},
);

const orderOptions = ORDERS.reduce<Record<string, RotationOrder>>((acc, o) => {
  acc[o] = o;
  return acc;
}, {});

export function ControlsPanel({ onChange }: ControlsPanelProps) {
  const [{ axisConvention, mode, composition, order, alpha, beta, gamma }, set] = useControls(
    () => ({
      axisConvention: {
        value: 'FLU' as AxisConvention,
        options: conventionOptions,
        label: 'XYZ ↦ spatial',
      },
      mode: {
        value: 'active' as Mode,
        options: { Active: 'active', Passive: 'passive' } as Record<string, Mode>,
      },
      composition: {
        value: 'intrinsic' as Composition,
        options: { Intrinsic: 'intrinsic', Extrinsic: 'extrinsic' } as Record<string, Composition>,
      },
      order: {
        value: 'XYZ' as RotationOrder,
        options: orderOptions,
      },
      alpha: { value: 0, min: -180, max: 180, step: 1, label: 'α (1st axis, °)' },
      beta: { value: 0, min: -180, max: 180, step: 1, label: 'β (2nd axis, °)' },
      gamma: { value: 0, min: -180, max: 180, step: 1, label: 'γ (3rd axis, °)' },
      Clear: button(() => set({ alpha: 0, beta: 0, gamma: 0 })),
    }),
  );

  useEffect(() => {
    onChange({
      axisConvention: axisConvention as AxisConvention,
      mode: mode as Mode,
      composition: composition as Composition,
      order: order as RotationOrder,
      anglesDeg: [alpha, beta, gamma],
    });
  }, [axisConvention, mode, composition, order, alpha, beta, gamma, onChange]);

  return <Leva fill flat titleBar={false} />;
}
