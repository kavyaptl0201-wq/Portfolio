import React from 'react';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  maxDistance?: number;
  maxOffset?: number;
}

/**
 * Magnetic component: magnetic behavior disabled per specification.
 * Renders children cleanly without transform, translate, or movement.
 */
export const Magnetic: React.FC<MagneticProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`inline-block ${className}`}>
      {children}
    </div>
  );
};

