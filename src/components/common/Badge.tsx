import type { ReactElement, ReactNode } from 'react';
import { Badge as BitBadge } from '@/components/ui/8bit/badge.js';
import { cn } from '@/lib/utils.js';

interface BadgeProps {
  readonly variant: 'success' | 'warning' | 'error' | 'info' | 'egg' | 'moto';
  readonly children: ReactNode;
}

const VARIANT_CLASSES: Record<BadgeProps['variant'], string> = {
  success: 'bg-green-500 border-green-500 text-white',
  warning: 'bg-amber-500 border-amber-500 text-black',
  error: 'bg-destructive border-destructive text-white',
  info: 'bg-blue-500 border-blue-500 text-white',
  egg: 'bg-egg border-egg text-black',
  moto: 'bg-moto border-moto text-white',
} as const;

function Badge({ variant, children }: BadgeProps): ReactElement {
  return (
    <BitBadge className={cn(VARIANT_CLASSES[variant])} font="normal">
      {children}
    </BitBadge>
  );
}

export { Badge };
export type { BadgeProps };
