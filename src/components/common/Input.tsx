import type { ReactElement, ChangeEvent } from 'react';
import '../../styles/components/input.css';

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
  const hasSuffix = suffix !== undefined || maxButton;

  const inputClassNames = [
    'input-field__input',
    hasSuffix ? 'input-field__input--has-suffix' : '',
    error !== undefined ? 'input-field__input--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const suffixClassNames = [
    'input-field__suffix',
    maxButton ? 'input-field__suffix--with-max' : '',
  ]
    .filter(Boolean)
    .join(' ');

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    onChange(e.target.value);
  }

  return (
    <div className="input-field">
      {label !== undefined && (
        <label className="input-field__label">{label}</label>
      )}
      <div className="input-field__wrapper">
        <input
          className={inputClassNames}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
        />
        {suffix !== undefined && (
          <span className={suffixClassNames}>{suffix}</span>
        )}
        {maxButton && (
          <button
            className="input-field__max-btn"
            type="button"
            onClick={onMax}
          >
            MAX
          </button>
        )}
      </div>
      {error !== undefined && (
        <p className="input-field__error">{error}</p>
      )}
    </div>
  );
}

export { Input };
export type { InputProps };
