import type { RefObject } from 'react';
import type { CameraHandle, PresetView } from './scene-parts/CameraBridge';

interface ViewControlsProps {
  handleRef: RefObject<CameraHandle | null>;
  /** If provided, a toggleable "Sync View" button appears. */
  sync?: {
    enabled: boolean;
    onToggle: () => void;
  };
}

const PRESETS: { key: PresetView; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'front', label: 'Front' },
  { key: 'side', label: 'Side' },
  { key: 'perspective', label: '3D' },
];

export function ViewControls({ handleRef, sync }: ViewControlsProps) {
  const setView = (v: PresetView) => handleRef.current?.setView(v);

  return (
    <div className="scene-controls">
      {PRESETS.map((p) => (
        <button key={p.key} onClick={() => setView(p.key)} title={`${p.label} view`}>
          {p.label}
        </button>
      ))}
      {sync && (
        <button
          onClick={sync.onToggle}
          title="Mirror the left scene's viewpoint in real time"
          className={`sync-button${sync.enabled ? ' active' : ''}`}
          aria-pressed={sync.enabled}
        >
          ⇆ Sync View {sync.enabled ? '●' : '○'}
        </button>
      )}
    </div>
  );
}
