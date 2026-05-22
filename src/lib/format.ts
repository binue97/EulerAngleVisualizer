import type { Axis } from './conventions';
import type { Mat3 } from './rotation/types';

const PREC = 3;

function fmt(n: number): string {
  if (Math.abs(n) < 1e-10) return '0';
  const s = n.toFixed(PREC);
  // collapse "-0.000" → "0"
  if (parseFloat(s) === 0) return '0';
  return s;
}

export function mat3ToLatex(m: Mat3): string {
  const rows = m.map((row) => row.map(fmt).join(' & ')).join(' \\\\ ');
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

export function activeElementaryLatex(axis: Axis, sym: string): string {
  const c = `\\cos ${sym}`;
  const s = `\\sin ${sym}`;
  switch (axis) {
    case 'X':
      return `\\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & ${c} & -${s} \\\\ 0 & ${s} & ${c} \\end{bmatrix}`;
    case 'Y':
      return `\\begin{bmatrix} ${c} & 0 & ${s} \\\\ 0 & 1 & 0 \\\\ -${s} & 0 & ${c} \\end{bmatrix}`;
    case 'Z':
      return `\\begin{bmatrix} ${c} & -${s} & 0 \\\\ ${s} & ${c} & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}`;
  }
}

export function passiveElementaryLatex(axis: Axis, sym: string): string {
  const c = `\\cos ${sym}`;
  const s = `\\sin ${sym}`;
  switch (axis) {
    case 'X':
      return `\\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & ${c} & ${s} \\\\ 0 & -${s} & ${c} \\end{bmatrix}`;
    case 'Y':
      return `\\begin{bmatrix} ${c} & 0 & -${s} \\\\ 0 & 1 & 0 \\\\ ${s} & 0 & ${c} \\end{bmatrix}`;
    case 'Z':
      return `\\begin{bmatrix} ${c} & ${s} & 0 \\\\ -${s} & ${c} & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}`;
  }
}

/** Render a degree value as LaTeX, e.g. "30°" → "30^{\\circ}". */
export function degLatex(deg: number): string {
  const trimmed = Number.isInteger(deg) ? deg.toFixed(0) : deg.toFixed(1);
  return `${trimmed}^{\\circ}`;
}
