import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base: all buttons share these traits
  const base =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary ' +
    'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ' +
    'rounded-lg select-none whitespace-nowrap';

  const variants: Record<string, string> = {
    // teal bg, dark text for contrast – same on all screens
    primary:
      'bg-secondary text-slate-900 hover:bg-secondary/90 ' +
      'shadow-sm hover:shadow-md hover:shadow-secondary/20 border border-transparent',
    // subtle fill
    secondary:
      'bg-foreground/10 text-foreground hover:bg-foreground/15 border border-transparent',
    // bordered / ghost-like
    outline:
      'bg-transparent text-foreground border border-border hover:border-foreground/40 hover:bg-foreground/5',
    // fully transparent
    ghost:
      'bg-transparent text-muted hover:text-foreground hover:bg-foreground/10 border border-transparent',
    // danger action
    danger:
      'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20',
  };

  // Sizes use a single fixed size – no responsive shrinking so buttons look
  // identical on every device. Only xs is intentionally tiny (icon-only / compact).
  const sizes: Record<string, string> = {
    xs: 'h-7  px-2.5 text-xs  gap-1',
    sm: 'h-9  px-4   text-sm  gap-1.5',
    md: 'h-10 px-5   text-sm  gap-2',
    lg: 'h-11 px-6   text-base gap-2',
    xl: 'h-12 px-7   text-base gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin shrink-0 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
