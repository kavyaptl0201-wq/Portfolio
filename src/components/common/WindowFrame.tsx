import React from 'react';
import clsx from 'clsx';

interface WindowFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  urlBar?: string;
  onClick?: () => void;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  children,
  title,
  className,
  urlBar,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-[20px] border border-white/15 bg-[#0C0C0E]/90 backdrop-blur-xl',
        'shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_40px_rgba(255,255,255,0.05)] transition-all duration-300',
        className
      )}
    >
      {/* Monochrome macOS Title Bar & Traffic Lights */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03] select-none">
        <div className="flex items-center gap-2" aria-hidden="true">
          {/* Strictly Monochrome macOS traffic lights */}
          <span className="w-3 h-3 rounded-full bg-white/25 border border-white/15 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-white/20 border border-white/15 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-white/15 border border-white/10 inline-block shadow-sm" />
        </div>

        {/* Optional Title or URL Bar */}
        {urlBar ? (
          <div className="flex-1 max-w-xs mx-auto px-3 py-1 rounded-pill bg-white/5 border border-white/10 text-[13px] font-sans font-medium text-[#C9C9CF] text-center truncate">
            {urlBar}
          </div>
        ) : title ? (
          <span className="text-[13px] font-sans font-medium text-[#C9C9CF] truncate">
            {title}
          </span>
        ) : (
          <div className="w-12" />
        )}

        <div className="w-12" />
      </div>

      {/* Window Body: crisp, 100% full brightness, no dark overlay */}
      <div className="relative overflow-hidden w-full">{children}</div>
    </div>
  );
};
