import type { ReactElement } from 'react';
import { Spinner as BitSpinner } from '@/components/ui/8bit/spinner.js';
import { cn } from '@/lib/utils.js';

interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-10',
} as const;

function Spinner({ size = 'md' }: SpinnerProps): ReactElement {
  return (
    <BitSpinner
      variant="diamond"
      className={cn('text-primary', SIZE_CLASSES[size])}
    />
  );
}

export { Spinner };
export type { SpinnerProps };
