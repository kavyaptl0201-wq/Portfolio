import { useEffect } from 'react';
import Lenis from 'lenis';
import { SMOOTH_SCROLL } from '../config/design';
import { scrollToSection } from '../utils/scroll';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!SMOOTH_SCROLL) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });

    window.__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Smoothly scroll to in-page anchors when clicked
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          scrollToSection(id);
          window.history.pushState(null, '', href);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
}
