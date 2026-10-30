import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top of page"
      data-sound-group="nav"
      className="hidden md:flex fixed bottom-8 right-6 z-30 w-11 h-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-full glass-nav shadow-lg text-[#F5F5F7] hover:text-white hover:bg-white/12 hover:brightness-110 transition-[background-color,border-color,box-shadow,filter] duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
