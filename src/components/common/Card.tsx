import type { ReactElement, ReactNode } from 'react';
import {
  Card as BitCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/8bit/card.js';
import { cn } from '@/lib/utils.js';

interface CardProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly glow?: 'egg' | 'sizzle' | 'none';
  readonly children: ReactNode;
  readonly className?: string;
}

const GLOW_CLASSES = {
  egg: 'glow-egg',
  sizzle: 'glow-sizzle',
  none: '',
} as const;

function Card({
  title,
  subtitle,
  glow = 'none',
  children,
  className,
}: CardProps): ReactElement {
  const hasHeader = title !== undefined || subtitle !== undefined;

  return (
    <BitCard className={cn(GLOW_CLASSES[glow], className)} font="normal">
      {hasHeader && (
        <CardHeader font="normal">
          {title !== undefined && (
            <CardTitle font="normal" className="font-retro text-sm text-foreground">
              {title}
            </CardTitle>
          )}
          {subtitle !== undefined && (
            <CardDescription font="normal" className="text-muted-foreground">
              {subtitle}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent font="normal">{children}</CardContent>
    </BitCard>
  );
}

export { Card };
export type { CardProps };
