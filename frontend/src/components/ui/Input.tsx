import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, fullWidth = true, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={clsx('form-group', { 'w-full': fullWidth })}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'form-input',
            {
              'border-danger-300 focus:border-danger-500 focus:ring-danger-500': error,
            },
            className
          )}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
        {helpText && !error && <p className="form-help">{helpText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
