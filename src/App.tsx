import { useEffect, useMemo, useRef, useState } from 'react';
import { Scene } from './components/scenes/Scene';
import { ControlsPanel, type RotationInputs } from './components/ControlsPanel';
import { MatrixPanel } from './components/MatrixPanel';
import { ViewControls } from './components/ViewControls';
import { computeRotation } from './lib/rotation';
import { activeIntrinsic } from './lib/rotation/activeIntrinsic';
import { activeExtrinsic } from './lib/rotation/activeExtrinsic';
import { multiply } from './lib/rotation/elementary';
import { conventionMatrix } from './lib/axisConvention';
import type { CameraHandle } from './components/scene-parts/CameraBridge';

const DEFAULT_INPUTS: RotationInputs = {
  mode: 'active',
  composition: 'intrinsic',
  order: 'XYZ',
  anglesDeg: [0, 0, 0],
  axisConvention: 'FLU',
};

const MIN_CONTROLS_WIDTH = 220;
const MAX_CONTROLS_WIDTH = 900;
const MIN_PANE_HEIGHT = 120;

export default function App() {
  const [inputs, setInputs] = useState<RotationInputs>(DEFAULT_INPUTS);
  const [syncView, setSyncView] = useState(false);
  const [controlsWidth, setControlsWidth] = useState(340);
  const [scenesHeight, setScenesHeight] = useState<number>(() =>
    typeof window === 'undefined' ? 480 : Math.round(window.innerHeight / 2),
  );
  const beforeCamRef = useRef<CameraHandle>(null);
  const afterCamRef = useRef<CameraHandle>(null);

  const startDrag = (
    e: React.MouseEvent,
    axis: 'x' | 'y',
    start: number,
    apply: (next: number) => void,
    min: number,
    max: number,
  ) => {
    e.preventDefault();
    const startPos = axis === 'x' ? e.clientX : e.clientY;
    const onMove = (ev: MouseEvent) => {
      const delta = (axis === 'x' ? ev.clientX : ev.clientY) - startPos;
      apply(Math.min(max, Math.max(min, start + delta)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startResize = (e: React.MouseEvent) =>
    startDrag(e, 'x', controlsWidth, setControlsWidth, MIN_CONTROLS_WIDTH, MAX_CONTROLS_WIDTH);

  const startVResize = (e: React.MouseEvent) => {
    const max = (typeof window === 'undefined' ? 1080 : window.innerHeight) - MIN_PANE_HEIGHT;
    startDrag(e, 'y', scenesHeight, setScenesHeight, MIN_PANE_HEIGHT, max);
  };

  // When Sync View is enabled, mirror the Before scene's camera into the After scene
  // on every OrbitControls 'change' event.
  useEffect(() => {
    if (!syncView) return;
    const left = beforeCamRef.current;
    const right = afterCamRef.current;
    if (!left || !right) return;
    const propagate = () => right.copyFrom(left);
    propagate(); // initial snap so they align immediately
    return left.onChange(propagate);
  }, [syncView]);

  /** Matrix displayed in the MatrixPanel — depends on mode/composition. */
  const result = useMemo(
    () => computeRotation(inputs.mode, inputs.composition, inputs.order, inputs.anglesDeg),
    [inputs.mode, inputs.composition, inputs.order, inputs.anglesDeg],
  );

  /** Geometric rotation R applied to the visualization (always the active form). */
  const R = useMemo(() => {
    const active =
      inputs.composition === 'intrinsic'
        ? activeIntrinsic(inputs.order, inputs.anglesDeg)
        : activeExtrinsic(inputs.order, inputs.anglesDeg);
    return active.finalMatrix;
  }, [inputs.composition, inputs.order, inputs.anglesDeg]);

  /**
   * Convention matrix M: math-frame (X, Y, Z) → screen-space direction.
   * Applied as the outermost transform to all body-frame visuals so the
   * displayed X/Y/Z axes point in the user-chosen spatial directions.
   */
  const M = useMemo(() => conventionMatrix(inputs.axisConvention), [inputs.axisConvention]);

  /** Per-scene matrices. All visuals are pre-multiplied by M for display. */
  const matrices = useMemo(() => {
    const isActive = inputs.mode === 'active';
    const MR = multiply(M, R);
    return {
      // World reference axes (gray) — represent the spatial frame, never rotate.
      worldFrame: M,
      // Before: object at math identity → displayed at M; body axes coincide with world axes.
      beforeObject: M,
      beforeFrame: M,
      // After: in active mode, both object and body axes rotate by R (composed with M).
      //        in passive mode, object stays put while the body-frame axes rotate by R.
      afterObject: isActive ? MR : M,
      afterFrame: MR,
    };
  }, [M, R, inputs.mode]);

  return (
    <div
      className="app"
      style={{ gridTemplateRows: `${scenesHeight}px 6px minmax(0, 1fr)` }}
    >
      <div className="scenes">
        <div className="scene-wrap">
          <div className="scene-label">Before</div>
          <ViewControls handleRef={beforeCamRef} />
          <Scene
            cameraRef={beforeCamRef}
            worldFrameMatrix={matrices.worldFrame}
            objectMatrix={matrices.beforeObject}
            frameMatrix={matrices.beforeFrame}
          />
        </div>
        <div className="scene-wrap">
          <div className="scene-label">
            After ({inputs.mode} · {inputs.composition} · {inputs.order})
          </div>
          <ViewControls
            handleRef={afterCamRef}
            sync={{ enabled: syncView, onToggle: () => setSyncView((v) => !v) }}
          />
          <Scene
            cameraRef={afterCamRef}
            worldFrameMatrix={matrices.worldFrame}
            objectMatrix={matrices.afterObject}
            frameMatrix={matrices.afterFrame}
          />
        </div>
      </div>
      <div
        className="resizer resizer-h"
        onMouseDown={startVResize}
        role="separator"
        aria-orientation="horizontal"
      />
      <div
        className="bottom"
        style={{ gridTemplateColumns: `${controlsWidth}px 6px minmax(0, 1fr)` }}
      >
        <div className="controls-pane">
          <ControlsPanel onChange={setInputs} />
        </div>
        <div
          className="resizer"
          onMouseDown={startResize}
          role="separator"
          aria-orientation="vertical"
        />
        <div className="matrix-pane">
          <MatrixPanel
            result={result}
            mode={inputs.mode}
            composition={inputs.composition}
            order={inputs.order}
          />
        </div>
      </div>
    </div>
  );
}
