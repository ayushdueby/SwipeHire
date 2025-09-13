import { forwardRef, SelectHTMLAttributes, useId } from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helpText, 
    fullWidth = true, 
    options,
    placeholder,
    id, 
    ...props 
  }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className={clsx('form-group', { 'w-full': fullWidth })}>
        {label && (
          <label htmlFor={selectId} className="form-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'form-select',
            {
              'border-danger-300 focus:border-danger-500 focus:ring-danger-500': error,
            },
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="form-error">{error}</p>}
        {helpText && !error && <p className="form-help">{helpText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
