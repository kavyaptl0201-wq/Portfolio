import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToSection } from '../../utils/scroll';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

interface PillNavProps {
  activeSection: string;
  onSelectSection?: (id: string) => void;
  preferredName: string;
  resumeUrl: string;
  onDownloadResume: () => void;
  hasHighlights?: boolean;
}

export const PillNav: React.FC<PillNavProps> = ({
  activeSection,
  onSelectSection,
  preferredName,
  resumeUrl,
  onDownloadResume,
  hasHighlights = false,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const baseNavItems: NavItem[] = [
    { id: 'about', label: 'About', href: '#about' },
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'skills', label: 'Skills', href: '#skills' },
    { id: 'highlights', label: 'Highlights', href: '#highlights' },
    { id: 'beyond-code', label: 'Beyond Code', href: '#beyond-code' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ];

  const navItems = hasHighlights
    ? baseNavItems
    : baseNavItems.filter((item) => item.id !== 'highlights');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine which nav item is active (highlight nothing while at hero/top)
  const activeNavId = navItems.some((item) => item.id === activeSection)
    ? activeSection
    : null;

  // The bubble sits on the hovered link if hovered; on mouse leave it springs back to active link
  const currentBubbleId = hoveredId || activeNavId;
  const isHoverBubble = hoveredId !== null && (activeNavId === null || hoveredId !== activeNavId);

  const springConfig = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 30 };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 hidden md:flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Primary Navigation"
        data-sound-group="nav"
        className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-pill glass-nav transition-all duration-300 ${
          scrolled ? 'py-1.5 px-3 shadow-2xl scale-95' : 'py-2 px-4 shadow-xl'
        }`}
      >
        {/* Monogram Brandmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection?.('hero');
            scrollToSection('hero');
            window.history.pushState(null, '', '#hero');
          }}
          className="flex items-center gap-2 pl-2 pr-2 py-1 text-[15px] font-medium tracking-[-0.01em] text-[#F5F5F7] rounded-pill hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`${preferredName} home`}
        >
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-[12px] font-semibold shadow-sm">
            {preferredName[0] || 'H'}
          </div>
          <span className="hidden lg:inline text-[15px] font-medium tracking-[-0.01em]">
            {preferredName}
          </span>
        </a>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* 6 Links with Single Shared Sliding Bubble Indicator */}
        <div
          className="flex items-center gap-1 relative"
          onMouseLeave={() => setHoveredId(null)}
        >
          {navItems.map((item) => {
            const isActive = activeNavId === item.id;
            const isHovered = hoveredId === item.id;
            const isCurrentBubble = currentBubbleId === item.id;
            const isHighlighted = isActive || isHovered;

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSection?.(item.id);
                  scrollToSection(item.id);
                  window.history.pushState(null, '', item.href);
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onFocus={() => setHoveredId(item.id)}
                onBlur={() => setHoveredId(null)}
                aria-current={isActive ? 'true' : undefined}
                className={`relative px-3.5 py-2 text-[14px] lg:text-[15px] font-medium tracking-[-0.01em] rounded-pill transition-colors duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isHighlighted
                    ? 'text-[#F5F5F7]'
                    : 'text-[#9A9AA0] hover:text-[#F5F5F7]'
                }`}
              >
                {/* Single shared bubble element animated via Framer Motion layoutId */}
                {isCurrentBubble && (
                  <motion.div
                    layoutId="slidingNavBubble"
                    className={`absolute inset-0 rounded-pill pointer-events-none transition-colors duration-200 ${
                      isHoverBubble
                        ? 'bg-white/[0.08] border border-white/10 backdrop-blur-md'
                        : 'nav-glass-bubble-active'
                    }`}
                    transition={springConfig}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Actions: Quiet Glass Resume Button opening /resume.pdf in new tab */}
        <div className="flex items-center gap-1.5">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDownloadResume}
            className="nav-resume-btn group inline-flex items-center justify-center rounded-pill px-4 lg:px-[22px] py-2 lg:py-2.5 text-[14px] lg:text-[15px] font-medium tracking-[-0.01em] gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 cursor-pointer"
            aria-label="View Resume"
          >
            <FileDown className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <span>Resume</span>
          </a>
        </div>
      </nav>
    </header>
  );
};
