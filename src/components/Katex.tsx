import { useEffect, useRef } from 'react';
import katex from 'katex';

interface KatexProps {
  tex: string;
  displayMode?: boolean;
  className?: string;
}

export function Katex({ tex, displayMode = false, className }: KatexProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    katex.render(tex, ref.current, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
  }, [tex, displayMode]);

  return <span ref={ref} className={className} />;
}
