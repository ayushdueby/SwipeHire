import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ 
  className, 
  variant = 'default', 
  size = 'md',
  children, 
  ...props 
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        {
          // Variants
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-primary-100 text-primary-800': variant === 'primary',
          'bg-secondary-100 text-secondary-800': variant === 'secondary',
          'bg-success-100 text-success-800': variant === 'success',
          'bg-danger-100 text-danger-800': variant === 'danger',
          'bg-warning-100 text-warning-800': variant === 'warning',
          
          // Sizes
          'px-2 py-1 text-xs': size === 'sm',
          'px-2.5 py-1.5 text-sm': size === 'md',
          'px-3 py-2 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
