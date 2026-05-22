import { Katex } from './Katex';
import type { RotationResult } from '../lib/rotation/types';

interface MatrixPanelProps {
  result: RotationResult;
}

export function MatrixPanel({ result }: MatrixPanelProps) {
  const { steps, finalMatrixLatex, compositionSymbolic, compositionNumeric } = result;

  // Build the chain "<block0> · <block1> · <block2>" for symbolic & numeric.
  const cdot = '\\;\\cdot\\;';
  const symbolicChain = steps.map((s) => s.symbolicLatex).join(cdot);
  const numericChain = steps.map((s) => s.numericLatex).join(cdot);

  return (
    <div>
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
    </div>
  );
}
