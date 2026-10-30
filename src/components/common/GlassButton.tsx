import React from 'react';
import clsx from 'clsx';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  isExternal?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  isExternal = false,
  className,
  icon,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-[22px] py-3 text-[15px] font-medium tracking-[-0.01em] gap-2',
    md: 'px-[22px] py-3 text-[15px] font-medium tracking-[-0.01em] gap-2',
    lg: 'px-6 py-3.5 text-[16px] font-medium tracking-[-0.01em] gap-2',
  }[size];

  const variantClasses = {
    primary: 'apple-button-primary text-white',
    secondary: 'apple-button-secondary',
    ghost: 'bg-transparent text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10',
  }[variant];

  const baseClasses = clsx(
    'inline-flex items-center justify-center rounded-full cursor-pointer transition-[background-color,border-color,box-shadow,filter] duration-[180ms] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
    sizeClasses,
    variantClasses,
    className
  );

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
