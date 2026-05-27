import { useMemo, useState } from 'react';
import { Katex } from './Katex';
import type { RotationResult } from '../lib/rotation/types';
import type { Mat3 } from '../lib/rotation/types';
import type { Composition, Mode, RotationOrder } from '../lib/conventions';
import { ANGLE_SYMBOL_PLAIN } from '../lib/conventions';
import { decomposeRotation } from '../lib/rotation/decompose';

interface MatrixPanelProps {
  result: RotationResult;
  mode: Mode;
  composition: Composition;
  order: RotationOrder;
}

type View = 'composition' | 'decomposition';

const IDENTITY_STRINGS: string[][] = [
  ['1', '0', '0'],
  ['0', '1', '0'],
  ['0', '0', '1'],
];

function parseMatrix(cells: string[][]): { matrix: Mat3 | null; invalid: boolean } {
  const m: number[][] = [];
  let invalid = false;
  for (let i = 0; i < 3; i++) {
    const row: number[] = [];
    for (let j = 0; j < 3; j++) {
      const v = parseFloat(cells[i][j]);
      if (!Number.isFinite(v)) {
        invalid = true;
        row.push(0);
      } else {
        row.push(v);
      }
    }
    m.push(row);
  }
  if (invalid) return { matrix: null, invalid: true };
  return { matrix: m as Mat3, invalid: false };
}

/** Frobenius norm of (RᵀR − I) — small for proper rotation matrices. */
function orthogonalityError(R: Mat3): number {
  let acc = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const dot = R[0][i] * R[0][j] + R[1][i] * R[1][j] + R[2][i] * R[2][j];
      const target = i === j ? 1 : 0;
      acc += (dot - target) ** 2;
    }
  }
  return Math.sqrt(acc);
}

function det3(R: Mat3): number {
  return (
    R[0][0] * (R[1][1] * R[2][2] - R[1][2] * R[2][1]) -
    R[0][1] * (R[1][0] * R[2][2] - R[1][2] * R[2][0]) +
    R[0][2] * (R[1][0] * R[2][1] - R[1][1] * R[2][0])
  );
}

function fmtAngle(deg: number): string {
  if (!Number.isFinite(deg)) return '—';
  if (Math.abs(deg) < 1e-4) return '0.00';
  return deg.toFixed(2);
}

export function MatrixPanel({ result, mode, composition, order }: MatrixPanelProps) {
  const [view, setView] = useState<View>('composition');
  const [showHelp, setShowHelp] = useState(false);
  const [cells, setCells] = useState<string[][]>(() =>
    IDENTITY_STRINGS.map((row) => [...row]),
  );

  const { steps, finalMatrixLatex, compositionSymbolic, compositionNumeric } = result;
  const cdot = '\\;\\cdot\\;';
  const symbolicChain = steps.map((s) => s.symbolicLatex).join(cdot);
  const numericChain = steps.map((s) => s.numericLatex).join(cdot);

  const parsed = useMemo(() => parseMatrix(cells), [cells]);
  const decomposition = useMemo(() => {
    if (!parsed.matrix) return null;
    const angles = decomposeRotation(mode, composition, order, parsed.matrix);
    return {
      angles,
      orthoErr: orthogonalityError(parsed.matrix),
      det: det3(parsed.matrix),
    };
  }, [parsed, mode, composition, order]);

  const onCellChange = (i: number, j: number, v: string) => {
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      next[i][j] = v;
      return next;
    });
  };

  const resetToIdentity = () => setCells(IDENTITY_STRINGS.map((row) => [...row]));

  return (
    <div>
      <div className="toggle-row">
        <div className="view-toggle">
          <button
            className={view === 'composition' ? 'active' : ''}
            onClick={() => {
              setView('composition');
              setShowHelp(false);
            }}
            type="button"
          >
            Matrix composition
          </button>
          <button
            className={view === 'decomposition' ? 'active' : ''}
            onClick={() => setView('decomposition')}
            type="button"
          >
            Matrix decomposition
          </button>
        </div>
        {view === 'decomposition' && (
          <div className="help-wrap">
            <button
              type="button"
              className="help-btn"
              onClick={() => setShowHelp((v) => !v)}
              aria-label="Decomposition help"
              aria-expanded={showHelp}
            >
              ?
            </button>
            {showHelp && (
              <div className="help-popover" role="tooltip">
                <div className="help-popover-arrow" aria-hidden="true" />
                <button
                  type="button"
                  className="help-close"
                  onClick={() => setShowHelp(false)}
                  aria-label="Close help"
                >
                  ×
                </button>
                <h4>Range of β</h4>
                <p>
                  To make the (α, β, γ) triple unique, β is restricted to a
                  principal range:
                </p>
                <ul>
                  <li>
                    Tait-Bryan (XYZ, ZYX, …):{' '}
                    <strong>β ∈ [−90°, 90°]</strong>
                  </li>
                  <li>
                    Proper Euler (XYX, ZXZ, …):{' '}
                    <strong>β ∈ [0°, 180°]</strong>
                  </li>
                </ul>
                <h4>Gimbal lock</h4>
                <p>
                  When β hits a boundary value, only α + γ (or α − γ) is
                  determined — infinitely many individual α and γ pairs give
                  the same matrix. In this case we fix{' '}
                  <strong>γ = 0</strong> and absorb the combined rotation
                  into α.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {view === 'composition' ? (
        <>
          <div className="block">
            <h3>1. Composition (symbolic)</h3>
            <div className="composition"><Katex tex={compositionSymbolic} /></div>
          </div>
          <div className="block">
            <h3>2. Composition (with angle values)</h3>
            <div className="composition"><Katex tex={compositionNumeric} /></div>
          </div>
          <div className="block">
            <h3>3. Elementary matrices (symbolic)</h3>
            <div className="row"><Katex tex={`R = ${symbolicChain}`} displayMode /></div>
          </div>
          <div className="block">
            <h3>4. Elementary matrices (numeric)</h3>
            <div className="row"><Katex tex={`R = ${numericChain}`} displayMode /></div>
          </div>
          <div className="block">
            <h3>5. Final rotation matrix</h3>
            <div className="row"><Katex tex={`R = ${finalMatrixLatex}`} displayMode /></div>
          </div>
        </>
      ) : (
        <>
          <div className="block">
            <h3>1. Rotation matrix input</h3>
            <div className="matrix-input-wrap">
              <span className="matrix-bracket left" aria-hidden="true" />
              <div className="matrix-input">
                {cells.map((row, i) =>
                  row.map((v, j) => (
                    <input
                      key={`${i}-${j}`}
                      type="text"
                      inputMode="decimal"
                      value={v}
                      onChange={(e) => onCellChange(i, j, e.target.value)}
                      aria-label={`R[${i + 1},${j + 1}]`}
                    />
                  )),
                )}
              </div>
              <span className="matrix-bracket right" aria-hidden="true" />
              <button type="button" className="reset-btn" onClick={resetToIdentity}>
                Reset
              </button>
            </div>
            {parsed.invalid && (
              <div className="hint warn">Some cells aren't valid numbers.</div>
            )}
            {decomposition && (
              <div className="hint">
                det R = {decomposition.det.toFixed(4)} &nbsp;·&nbsp; ‖RᵀR − I‖ ={' '}
                {decomposition.orthoErr.toFixed(4)}
                {(Math.abs(decomposition.det - 1) > 1e-3 || decomposition.orthoErr > 1e-3) && (
                  <span className="warn">
                    {' '}— not a proper rotation; angles are an approximation.
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="block">
            <h3>
              2. Decomposed Euler angles ({mode} · {composition} · {order})
            </h3>
            {decomposition ? (
              <div className="angle-list">
                {decomposition.angles.map((deg, i) => (
                  <div className="angle-row" key={i}>
                    <span className="angle-sym">{ANGLE_SYMBOL_PLAIN[i]}</span>
                    <span className="angle-val">{fmtAngle(deg)}°</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hint warn">Enter valid numbers above to see angles.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
