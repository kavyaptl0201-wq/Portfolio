import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(sectionIds: string[], offset = 120) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');
  const isClickScrollRef = useRef(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computeActiveSection = () => {
      if (isClickScrollRef.current) return;

      const threshold = window.innerHeight * 0.4;

      // 1. Bottom of page check (activate last section when reaching page bottom)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        if (sectionIds.length > 0) {
          const lastId = sectionIds[sectionIds.length - 1];
          setActiveSection(lastId);
          return;
        }
      }

      // 2. If at top of page or first content section hasn't reached the 40% mark, Hero is active
      const firstContentId = sectionIds.find((id) => id !== 'hero');
      if (firstContentId) {
        const firstEl = document.getElementById(firstContentId);
        if (firstEl) {
          const rect = firstEl.getBoundingClientRect();
          if (rect.top > threshold || window.scrollY < 100) {
            if (sectionIds.includes('hero')) {
              setActiveSection('hero');
              return;
            }
          }
        }
      } else if (window.scrollY < 100 && sectionIds.includes('hero')) {
        setActiveSection('hero');
        return;
      }

      // 3. Mark a section active when its top crosses about 40% of the viewport height
      let matchedSection = '';
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        if (id === 'hero') continue;
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          matchedSection = id;
          break;
        }
      }

      if (matchedSection) {
        setActiveSection(matchedSection);
      } else if (sectionIds.includes('hero')) {
        setActiveSection('hero');
      }
    };

    const handleScroll = () => {
      computeActiveSection();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    computeActiveSection();

    const lenis = (window as unknown as { __lenis?: { on: (event: string, fn: () => void) => void; off: (event: string, fn: () => void) => void } }).__lenis;
    if (lenis) {
      lenis.on('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (lenis) {
        lenis.off('scroll', handleScroll);
      }
    };
  }, [sectionIds, offset]);

  const setManualSection = (id: string) => {
    setActiveSection(id);
    isClickScrollRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollRef.current = false;
    }, 850);
  };

  return [activeSection, setManualSection] as const;
}
