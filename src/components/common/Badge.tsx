import type { ReactElement, ReactNode } from 'react';
import '../../styles/components/badge.css';

interface BadgeProps {
  readonly variant: 'success' | 'warning' | 'error' | 'info' | 'egg' | 'moto';
  readonly children: ReactNode;
}

function Badge({ variant, children }: BadgeProps): ReactElement {
  return (
    <span className={`badge badge--${variant}`}>
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps };
