import type { ReactElement } from 'react';
import { Progress } from '@/components/ui/8bit/progress.js';
import { cn } from '@/lib/utils.js';

interface ProgressBarProps {
  readonly value: number;
  readonly max: number;
  readonly variant?: 'accent' | 'egg' | 'sizzle' | 'moto';
  readonly showLabel?: boolean;
  readonly label?: string;
  readonly size?: 'sm' | 'md';
}

const COLOR_MAP: Record<string, string> = {
  accent: 'bg-primary',
  egg: 'bg-egg',
  sizzle: 'bg-sizzle',
  moto: 'bg-moto',
} as const;

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
    <div className="flex flex-col gap-1">
      {showLabel && (
        <span className="text-xs text-muted-foreground">{displayLabel}</span>
      )}
      <Progress
        value={percentage}
        variant="retro"
        progressBg={COLOR_MAP[variant]}
        className={cn(size === 'sm' ? 'h-2' : 'h-4')}
        font="normal"
      />
    </div>
  );
}

export { ProgressBar };
export type { ProgressBarProps };
