import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

export type ChipVariant = 'default' | 'badge' | 'status' | 'button';
export type ChipStatus = 'live' | 'in-development' | 'completed';

export interface ChipProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  variant?: ChipVariant;
  status?: ChipStatus;
  icon?: React.ReactNode;
  interactive?: boolean;
  as?: React.ElementType;
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  status,
  icon,
  interactive,
  as: Component = 'span',
  className,
  ...props
}) => {
  const isInteractive =
    interactive !== undefined
      ? interactive
      : Component === 'button' || Component === 'a' || Boolean(props.onClick) || Boolean(props.href);

  // Variant size/style class
  const variantClass = {
    default: 'apple-glass-chip-default',
    badge: 'apple-glass-chip-badge',
    status: 'apple-glass-chip-status',
    button: 'apple-glass-chip-button',
  }[variant];

  // Normalized status resolver if variant is 'status' or status prop is given
  const normalizedStatus =
    status ||
    (typeof children === 'string'
      ? children.toLowerCase().includes('live')
        ? 'live'
        : children.toLowerCase().includes('develop') || children.toLowerCase().includes('progress')
        ? 'in-development'
        : children.toLowerCase().includes('complete')
        ? 'completed'
        : undefined
      : undefined);

  return (
    <Component
      className={clsx(
        'apple-glass-chip',
        variantClass,
        isInteractive && 'apple-glass-chip-interactive',
        className
      )}
      {...props}
    >
      {/* Status indicator: 8px dot or small checkmark */}
      {variant === 'status' && normalizedStatus === 'live' && (
        <span className="status-dot-live" aria-hidden="true" />
      )}
      {variant === 'status' && normalizedStatus === 'in-development' && (
        <span className="status-dot-dev" aria-hidden="true" />
      )}
      {variant === 'status' && normalizedStatus === 'completed' && (
        <Check className="status-check-icon" aria-hidden="true" />
      )}

      {/* Leading icon if provided (16px, stroke 1.75, #D4D4D8) */}
      {icon && (
        <span className="apple-glass-chip-icon" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Label */}
      {children && <span>{children}</span>}
    </Component>
  );
};
