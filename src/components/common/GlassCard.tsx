import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import clsx from 'clsx';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'featured' | 'flat' | 'card' | 'panel' | 'chip';
  radius?: 'large' | 'small'; // 28px or 20px
  hoverEffect?: boolean;
  spotlight?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className,
  variant = 'default',
  radius = 'large',
  hoverEffect = true,
  spotlight = true,
  onPointerMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}, ref) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (spotlight && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty('--mx', `${x}px`);
      cardRef.current.style.setProperty('--my', `${y}px`);
    }
    if (onPointerMove) onPointerMove(e);
  };

  const normalizedVariant = {
    card: 'default',
    panel: 'featured',
    chip: 'flat',
    default: 'default',
    featured: 'featured',
    flat: 'flat',
  }[variant] || 'default';

  const radiusClass = radius === 'small' || variant === 'chip' ? 'rounded-[20px]' : 'rounded-[28px]';
  const variantClass = {
    default: 'glass-card glass-card-border',
    featured: 'glass-card glass-card-featured glass-card-border',
    flat: 'glass-card glass-card-flat',
  }[normalizedVariant];

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx(
        'relative overflow-hidden p-7 sm:p-9 md:p-10',
        radiusClass,
        variantClass,
        hoverEffect && 'glass-card-interactive',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0C11]',
        className
      )}
      tabIndex={props.tabIndex ?? (hoverEffect ? 0 : undefined)}
      {...props}
    >
      {/* Cursor Spotlight Glow */}
      {spotlight && <div className="glass-card-spotlight" aria-hidden="true" />}

      {/* Card Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
});

GlassCard.displayName = 'GlassCard';
