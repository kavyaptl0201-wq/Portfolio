import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToSection } from '../../utils/scroll';
import {
  User,
  Layers,
  Sparkles,
  Briefcase,
  Mail,
  Award,
  MoreHorizontal,
  X,
  FileDown
} from 'lucide-react';

interface MobileNavProps {
  activeSection: string;
  onSelectSection?: (id: string) => void;
  preferredName: string;
  resumeUrl: string;
  onDownloadResume: () => void;
  hasHighlights?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeSection,
  onSelectSection,
  preferredName,
  resumeUrl,
  onDownloadResume,
  hasHighlights = false,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  // All navigation sections
  const allSections = [
    { id: 'about', label: 'About', href: '#about', icon: User },
    { id: 'projects', label: 'Projects', href: '#projects', icon: Briefcase },
    { id: 'skills', label: 'Skills', href: '#skills', icon: Layers },
    ...(hasHighlights ? [{ id: 'highlights', label: 'Highlights', href: '#highlights', icon: Award }] : []),
    { id: 'beyond-code', label: 'Beyond Code', href: '#beyond-code', icon: Sparkles },
    { id: 'contact', label: 'Contact', href: '#contact', icon: Mail },
  ];

  // Lock page scroll when sheet is open & listen for Esc key
  useEffect(() => {
    if (!sheetOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const lenis = window.__lenis;
    if (lenis) lenis.stop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      if (lenis) lenis.start();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sheetOpen]);

  // Auto-close if resized to desktop viewport width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && sheetOpen) {
        setSheetOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sheetOpen]);

  return (
    <>
      {/* Top Compact Mobile Bar with Quick Reachable Resume Button */}
      <header
        data-sound-group="nav"
        className="fixed top-3 left-2.5 right-[64px] sm:left-4 sm:right-[68px] z-50 md:hidden pointer-events-auto flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-pill glass-nav shadow-lg"
      >
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection?.('hero');
            scrollToSection('hero');
            window.history.pushState(null, '', '#hero');
          }}
          className="flex items-center gap-2 text-[14px] sm:text-[15px] font-medium tracking-[-0.01em] text-[#F5F5F7] min-h-[44px] py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-pill"
          aria-label={`${preferredName} home`}
        >
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
            {preferredName[0] || 'H'}
          </div>
          <span className="font-medium tracking-[-0.01em] truncate max-w-[100px] sm:max-w-none">{preferredName}</span>
        </a>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Reachable Resume Button */}
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDownloadResume}
            className="nav-resume-btn flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[14px] font-medium tracking-[-0.01em] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white select-none cursor-pointer"
            aria-label="View Resume"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span>Resume</span>
          </a>

          <button
            onClick={() => setSheetOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            aria-expanded={sheetOpen}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#9A9AA0] hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Expandable "More" Glass Sheet Menu mounted in Portal so it isn't trapped in transform/pointer-events container */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {sheetOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] md:hidden bg-black/70 backdrop-blur-md flex flex-col justify-end pointer-events-auto"
                onClick={() => setSheetOpen(false)}
              >
                <motion.div
                  data-sound-group="nav"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  className="bg-[#14161D]/95 backdrop-blur-2xl p-6 rounded-t-[28px] border-t border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-[15px] font-medium tracking-[-0.01em] text-[#F5F5F7]">
                      Navigation &amp; Sections
                    </span>
                    <button
                      onClick={() => setSheetOpen(false)}
                      className="p-2 rounded-full bg-white/10 text-[#9A9AA0] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-w-[36px] min-h-[36px] flex items-center justify-center"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="py-4 space-y-1">
                    {allSections.map((link) => {
                      const Icon = link.icon;
                      const isCurrent = activeSection === link.id;
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectSection?.(link.id);
                            setSheetOpen(false);
                            scrollToSection(link.id);
                            window.history.pushState(null, '', link.href);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-card text-[15px] font-medium tracking-[-0.01em] transition-colors ${
                            isCurrent
                              ? 'bg-white/15 text-white'
                              : 'text-[#D1D1D6] hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-white/70" />
                          <span>{link.label}</span>
                        </a>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        onDownloadResume();
                        setSheetOpen(false);
                      }}
                      className="nav-resume-btn group inline-flex items-center justify-center rounded-pill px-[22px] py-3 text-[15px] font-medium tracking-[-0.01em] gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer w-full"
                      aria-label="View Resume"
                    >
                      <FileDown className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span>Resume (PDF)</span>
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
