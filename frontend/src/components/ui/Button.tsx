import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    return (
      <button
        className={clsx(
          'btn transition-transform active:scale-95',
          {
            'btn-primary': variant === 'primary',
            'btn-secondary': variant === 'secondary',
            'btn-success': variant === 'success',
            'btn-danger': variant === 'danger',
            'btn-ghost': variant === 'ghost',
            'btn-xs': size === 'xs',
            'btn-sm': size === 'sm',
            'btn-md': size === 'md',
            'btn-lg': size === 'lg',
            'btn-xl': size === 'xl',
            'w-full': fullWidth,
            'opacity-50 cursor-not-allowed': disabled || loading,
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="loading-spinner w-4 h-4 mr-2" />
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
