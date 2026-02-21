import type { ReactElement } from 'react';
import '../../styles/components/progress-bar.css';

interface ProgressBarProps {
  readonly value: number;
  readonly max: number;
  readonly variant?: 'accent' | 'egg' | 'sizzle' | 'moto';
  readonly showLabel?: boolean;
  readonly label?: string;
  readonly size?: 'sm' | 'md';
}

function ProgressBar({
  value,
  max,
  variant = 'accent',
  showLabel = false,
  label,
  size = 'md',
}: ProgressBarProps): ReactElement {
  const clamped = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? Math.round((clamped / max) * 100) : 0;
  const displayLabel = label !== undefined ? label : `${String(percentage)}%`;

  return (
    <div className="progress">
      {showLabel && (
        <div className="progress__label">
          <span>{displayLabel}</span>
        </div>
      )}
      <div
        className={`progress__track progress__track--${size}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`progress__fill progress__fill--${variant}`}
          style={{ width: `${String(percentage)}%` }}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
export type { ProgressBarProps };
