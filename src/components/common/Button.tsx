import type { ReactElement, ReactNode } from 'react';
import { Button as BitButton } from '@/components/ui/8bit/button.js';
import { cn } from '@/lib/utils.js';

interface ButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit';
}

const VARIANT_MAP = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'destructive',
  ghost: 'ghost',
} as const;

const SIZE_MAP = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
} as const;

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
}: ButtonProps): ReactElement {
  return (
    <BitButton
      variant={VARIANT_MAP[variant]}
      size={SIZE_MAP[size]}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={cn(fullWidth && 'w-full')}
    >
      {loading && (
        <span className="inline-block size-4 animate-spin border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
      )}
      {children}
    </BitButton>
  );
}

export { Button };
export type { ButtonProps };
