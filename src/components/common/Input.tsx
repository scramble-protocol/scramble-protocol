import type { ReactElement, ChangeEvent } from 'react';
import { Input as BitInput } from '@/components/ui/8bit/input.js';
import { cn } from '@/lib/utils.js';

interface InputProps {
  readonly label?: string;
  readonly error?: string;
  readonly suffix?: string;
  readonly maxButton?: boolean;
  readonly onMax?: () => void;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly type?: string;
}

function Input({
  label,
  error,
  suffix,
  maxButton = false,
  onMax,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = 'text',
}: InputProps): ReactElement {
  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    onChange(e.target.value);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label !== undefined && (
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      )}
      <div className="relative flex items-center">
        <BitInput
          className={cn(
            'w-full',
            (suffix !== undefined || maxButton) && 'pr-20',
            error !== undefined && 'border-destructive'
          )}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          font="normal"
        />
        {(suffix !== undefined || maxButton) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
            {maxButton && (
              <button
                className="px-2 py-0.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                type="button"
                onClick={onMax}
              >
                MAX
              </button>
            )}
            {suffix !== undefined && (
              <span className="text-sm text-muted-foreground">{suffix}</span>
            )}
          </div>
        )}
      </div>
      {error !== undefined && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

export { Input };
export type { InputProps };
