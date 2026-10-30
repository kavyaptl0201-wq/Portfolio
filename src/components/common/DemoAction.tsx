import React, { useState } from 'react';

interface DemoActionProps {
  isDemo?: boolean;
  href?: string;
  download?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  target?: string;
  rel?: string;
  title?: string;
}

/**
 * Renders an interactive anchor or button, but if isDemo is true,
 * prevents navigation, marks it as aria-disabled, and shows a clean
 * tooltip: "Demo link. Add yours in src/data/content.ts".
 */
export const DemoAction: React.FC<DemoActionProps> = ({
  isDemo = false,
  href,
  download,
  onClick,
  className = '',
  children,
  ariaLabel,
  target = '_blank',
  rel = 'noopener noreferrer',
  title,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (isDemo) {
    const isFullWidth = className.includes('w-full');
    return (
      <div className={`relative ${isFullWidth ? 'w-full flex' : 'inline-flex'} items-center`}>
        <a
          href="#demo-link"
          role="link"
          aria-disabled="true"
          tabIndex={0}
          aria-label={ariaLabel ? `${ariaLabel} (Demo)` : 'Demo link'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 3000);
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={`cursor-not-allowed ${className}`}
        >
          {children}
        </a>

        {/* Apple-style floating tooltip positioned ABOVE the button */}
        {showTooltip && (
          <div
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 rounded-card bg-[#1C1C1E]/95 border border-white/15 text-[12px] font-medium text-[#F5F5F7] whitespace-nowrap shadow-2xl backdrop-blur-md pointer-events-none z-50 animate-in fade-in duration-150"
          >
            Demo link. Add yours in src/data/content.ts
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1C1C1E]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={href}
      download={download}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
      title={title}
    >
      {children}
    </a>
  );
};
