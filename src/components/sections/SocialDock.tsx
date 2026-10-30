import React, { useState, useRef } from 'react';
import { SocialConfig, SocialBarConfig } from '../../data/content.schema';

interface SocialDockProps {
  social: SocialConfig;
  socialBar?: SocialBarConfig;
  className?: string;
}

interface SocialIconItem {
  id: keyof SocialConfig;
  label: string;
  url: string;
  enabled: boolean;
  isDemo?: boolean;
  svgPath: string;
}

// Brand SVG paths (self-contained from simple-icons, monochrome #F5F5F7)
const BRAND_SVGS = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  linkedin:
    'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.72a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
};

export const SocialDock: React.FC<SocialDockProps> = ({
  social,
  socialBar = { placement: 'section' },
  className = '',
}) => {
  const isSideRail = socialBar.placement === 'side-rail';

  // Ordered icons list: GitHub, Instagram, LinkedIn, Facebook
  const orderedItems: SocialIconItem[] = [
    {
      id: 'github',
      label: 'GitHub',
      url: social.github?.url || '',
      enabled: Boolean(social.github?.enabled),
      isDemo: social.github?.isDemo,
      svgPath: BRAND_SVGS.github,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      url: social.instagram?.url || '',
      enabled: Boolean(social.instagram?.enabled),
      isDemo: social.instagram?.isDemo,
      svgPath: BRAND_SVGS.instagram,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: social.linkedin?.url || '',
      enabled: Boolean(social.linkedin?.enabled),
      isDemo: social.linkedin?.isDemo,
      svgPath: BRAND_SVGS.linkedin,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      url: social.facebook?.url || '',
      enabled: Boolean(social.facebook?.enabled),
      isDemo: social.facebook?.isDemo,
      svgPath: BRAND_SVGS.facebook,
    },
  ];

  // In real mode, render an icon only if non-empty and enabled.
  // In demo mode, all 4 render as disabled demo links.
  const activeItems = orderedItems.filter((item) => item.enabled || item.isDemo);

  const dockRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [demoTooltipId, setDemoTooltipId] = useState<string | null>(null);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : focusedIndex;

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  if (activeItems.length === 0) return null;

  // Render side-rail dock (fixed on right edge, hidden below 1024px)
  if (isSideRail) {
    return (
      <aside
        data-sound-group="social"
        aria-label="Find me online"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center"
      >
        <span className="text-[13px] font-sans font-medium text-[#C9C9CF] mb-3 rotate-90 origin-bottom select-none">
          Online
        </span>
        <div
          ref={dockRef}
          onMouseLeave={handleMouseLeave}
          className="flex flex-col items-center gap-2 p-2 rounded-pill apple-glass-chip !shadow-2xl"
        >
          {activeItems.map((item, idx) => {
            const isTarget = activeIndex === idx;

            return (
              <div key={item.id} className="relative flex items-center justify-center">
                {/* Tooltip on left */}
                {isTarget && (
                  <div className="absolute right-full mr-3 px-3.5 py-1.5 rounded-pill apple-glass-chip text-[13px] font-medium text-[#F2F2F4] whitespace-nowrap shadow-xl pointer-events-none z-50">
                    {item.isDemo ? 'Demo link. Add yours in src/data/content.ts' : item.label}
                  </div>
                )}

                <a
                  href={item.isDemo ? '#demo-link' : item.url}
                  target={item.isDemo ? undefined : '_blank'}
                  rel={item.isDemo ? undefined : 'noopener noreferrer'}
                  aria-label={`Open ${item.label} profile`}
                  aria-disabled={item.isDemo ? 'true' : undefined}
                  tabIndex={0}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onFocus={() => setFocusedIndex(idx)}
                  onBlur={() => setFocusedIndex(null)}
                  onClick={(e) => {
                    if (item.isDemo) {
                      e.preventDefault();
                      setDemoTooltipId(item.id);
                      setTimeout(() => setDemoTooltipId(null), 2500);
                    }
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-[#F5F5F7] apple-glass-chip apple-glass-chip-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors duration-200 ${
                    item.isDemo ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-7 h-7 text-[#F5F5F7]"
                    aria-hidden="true"
                  >
                    <path d={item.svgPath} />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  // Default: Section band between Highlights and Beyond Code
  return (
    <section
      data-sound-group="social"
      aria-label="Find me online"
      className={`max-w-[1120px] mx-auto px-4 sm:px-6 md:px-8 mb-16 md:mb-24 flex flex-col items-center justify-center text-center ${className}`}
    >
      {/* Small subtle line above: "Find me online" */}
      <div className="mb-4 flex items-center gap-3">
        <div className="w-8 h-px bg-white/20" />
        <span className="text-[13px] font-sans text-[#C9C9CF] font-medium select-none">
          Find me online
        </span>
        <div className="w-8 h-px bg-white/20" />
      </div>

      {/* Glass Dock Pill */}
      <div
        ref={dockRef}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center gap-2.5 sm:gap-4 p-2 sm:p-3 rounded-pill apple-glass-chip !shadow-2xl relative max-w-full"
      >
        {activeItems.map((item, idx) => {
          const isTarget = activeIndex === idx;

          return (
            <div key={item.id} className="relative flex flex-col items-center">
              {/* Tooltip Label under hovered or focused icon */}
              {isTarget && (
                <div
                  role="tooltip"
                  className="absolute top-full mt-3 px-3.5 py-1.5 rounded-pill apple-glass-chip text-[13px] font-medium text-[#F2F2F4] whitespace-nowrap shadow-xl pointer-events-none z-50 animate-in fade-in duration-150"
                >
                  {item.isDemo ? 'Demo link. Add yours in src/data/content.ts' : item.label}
                </div>
              )}

              {/* Click tooltip notification for demo links */}
              {demoTooltipId === item.id && (
                <div className="absolute bottom-full mb-3 px-3.5 py-1.5 rounded-pill apple-glass-chip text-[13px] font-medium text-[#F2F2F4] whitespace-nowrap shadow-xl pointer-events-none z-50">
                  Demo link. Add yours in src/data/content.ts
                </div>
              )}

              <a
                href={item.isDemo ? '#demo-link' : item.url}
                target={item.isDemo ? undefined : '_blank'}
                rel={item.isDemo ? undefined : 'noopener noreferrer'}
                aria-label={`Open ${item.label} profile`}
                aria-disabled={item.isDemo ? 'true' : undefined}
                tabIndex={0}
                onMouseEnter={() => setHoveredIndex(idx)}
                onFocus={() => setFocusedIndex(idx)}
                onBlur={() => setFocusedIndex(null)}
                onClick={(e) => {
                  if (item.isDemo) {
                    e.preventDefault();
                    setDemoTooltipId(item.id);
                    setTimeout(() => setDemoTooltipId(null), 2500);
                  }
                }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-[#F5F5F7] apple-glass-chip apple-glass-chip-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors duration-200 ${
                  item.isDemo ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                }`}
              >
                {/* 24px icon on mobile, 28px on sm+ */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-[#F5F5F7]"
                  aria-hidden="true"
                >
                  <path d={item.svgPath} />
                </svg>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};
