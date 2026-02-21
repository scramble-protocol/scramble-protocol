import type { ReactElement } from 'react';
import '../../styles/components/spinner.css';

interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
}

function Spinner({ size = 'md' }: SpinnerProps): ReactElement {
  return (
    <span
      className={`spinner spinner--${size}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export { Spinner };
export type { SpinnerProps };
