/**
 * Scroll Utility for Portfolio
 * Smoothly scrolls to a section using Lenis, landing with the section heading
 * just below the fixed navbar: offset: -(navbar height + 24).
 * Adjusts and settles accurately even when reveal animations change page height.
 */

export function scrollToSection(sectionId: string, options: { immediate?: boolean } = {}) {
  const lenis = typeof window !== 'undefined' ? window.__lenis : undefined;

  if (sectionId === 'hero') {
    if (lenis) {
      lenis.scrollTo(0);
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  const el = document.getElementById(sectionId);
  if (!el) return;

  // Land with the section heading just below the fixed navbar
  const target = el.querySelector('h2') || el;

  const getOffset = () => {
    // Use the bottom of whichever fixed top bar is visible (desktop pill or mobile bar)
    let navBottom = 0;
    document.querySelectorAll('header').forEach((h) => {
      const rect = h.getBoundingClientRect();
      if (rect.height > 0 && rect.top < 40 && getComputedStyle(h).position === 'fixed') {
        navBottom = Math.max(navBottom, rect.bottom);
      }
    });
    if (!navBottom) navBottom = window.innerWidth < 768 ? 60 : 72;
    return -(navBottom + 24);
  };

  const offset = getOffset();

  if (lenis) {
    const settle = () => {
      const currentOffset = getOffset();
      const desiredTop = -currentOffset;
      const actualTop = target.getBoundingClientRect().top;
      // If reveal animations shifted the element, readjust immediately
      if (Math.abs(actualTop - desiredTop) > 3) {
        lenis.scrollTo(target, { offset: currentOffset, immediate: true });
      }
    };

    lenis.scrollTo(target, {
      offset,
      immediate: options.immediate,
      onComplete: settle,
    });

    // Settle after reveal animations progress
    setTimeout(settle, 300);
    setTimeout(settle, 750);
  } else {
    const navOffset = -getOffset();
    const targetY = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: targetY, behavior: options.immediate ? 'auto' : 'smooth' });
  }
}
