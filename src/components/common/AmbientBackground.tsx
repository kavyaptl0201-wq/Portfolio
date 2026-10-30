import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  AMBIENT_BG,
  GRID,
  GRAIN,
  CURSOR_GLOW,
  DUST,
} from '../../config/design';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getPortraitDone, subscribePortraitDone } from '../../utils/introState';
import { startFluidSmoke } from './fluidSmoke';

interface DustParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const AmbientBackground: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortraitDone, setIsPortraitDone] = useState(() => {
    if (typeof window !== 'undefined') {
      return getPortraitDone();
    }
    return false;
  });
  const [scrollProgress, setScrollProgress] = useState(0);

  const smokeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isPortraitDone) return;
    const handleDone = () => setIsPortraitDone(true);
    const unsubscribe = subscribePortraitDone(handleDone);
    window.addEventListener('hero:portraitDone', handleDone);
    return () => {
      unsubscribe();
      window.removeEventListener('hero:portraitDone', handleDone);
    };
  }, [isPortraitDone]);

  // Track page scroll to fade grid out in lower 25% of the page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

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
  }, []);

  // Check pointer device & screen size
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMedia = () => {
      setIsPointerFine(window.matchMedia('(pointer: fine)').matches);
      setIsMobile(window.innerWidth < 768);
    };

    checkMedia();
    window.addEventListener('resize', checkMedia, { passive: true });
    return () => window.removeEventListener('resize', checkMedia);
  }, []);

  // Pause drifting when tab is hidden
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Red smoke following the cursor on pointer: fine devices
  useEffect(() => {
    // Starts once the intro has finished, so it never competes with the loader
    if (!CURSOR_GLOW || prefersReducedMotion || !isPointerFine || isMobile || !isPortraitDone || !smokeRef.current) return;
    return startFluidSmoke(smokeRef.current) || undefined;
  }, [prefersReducedMotion, isPointerFine, isMobile, isPortraitDone]);

  // Generate dust specks: 40 on desktop, 20 on mobile
  const dustParticles = useMemo<DustParticle[]>(() => {
    if (!DUST || prefersReducedMotion) return [];
    const count = isMobile ? 20 : 40;
    const items: DustParticle[] = [];

    // Deterministic pseudo-random generation to avoid SSR/hydration jitter
    for (let i = 0; i < count; i++) {
      const left = ((i * 17 + 7) % 100);
      const size = (i % 3 === 0) ? 2 : 1.5;
      const duration = 20 + ((i * 13) % 25); // 20s to 45s
      const delay = -((i * 7.5) % duration);
      const opacity = 0.10 + ((i % 5) * 0.025); // 10% to 20%
      items.push({ id: i, left, size, duration, delay, opacity });
    }

    return items;
  }, [isMobile, prefersReducedMotion]);

  if (!AMBIENT_BG) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden site-bg ${
        isTabHidden ? 'tab-hidden' : ''
      }`}
    >
      {/* a) SPOTLIGHTS: 3 huge radial gradients (60-80vw, 9% white) drifting slowly */}
      <div
        className="absolute inset-0 overflow-hidden transition-opacity duration-[1200ms] ease-out"
        style={{ opacity: isPortraitDone ? 1 : 0.10 }}
      >
        {/* Top-Center Spotlight */}
        <div
          className={`absolute left-1/2 -top-[10vw] w-[80vw] h-[80vw] max-w-[1400px] max-h-[1400px] rounded-full ${
            prefersReducedMotion ? '-translate-x-1/2' : 'ambient-spotlight-1'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.09) 0%, transparent 70%)',
          }}
        />

        {/* Right-Margin Spotlight: illuminates right margin prominently */}
        <div
          className={`absolute -right-[6vw] top-[22dvh] w-[70vw] h-[70vw] max-w-[1200px] max-h-[1200px] rounded-full ${
            prefersReducedMotion ? '' : 'ambient-spotlight-2'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.09) 0%, transparent 70%)',
          }}
        />

        {/* Left-Margin Spotlight: illuminates left margin prominently */}
        <div
          className={`absolute -left-[6vw] bottom-[15dvh] w-[70vw] h-[70vw] max-w-[1200px] max-h-[1200px] rounded-full ${
            prefersReducedMotion ? '' : 'ambient-spotlight-3'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.09) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* b) GRID: 1px lines rgba(255,255,255,0.035) every 64px, faded with vertical mask so it is gone in lower 25% of the page */}
      {GRID && (
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: isPortraitDone
              ? scrollProgress >= 0.75
                ? 0
                : scrollProgress > 0.60
                ? 1 - (scrollProgress - 0.60) / 0.15
                : 1
              : 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 75%)',
          }}
        />
      )}

      {/* c) GRAIN: tiled noise SVG feTurbulence at 4% opacity, mix-blend-mode overlay, static */}
      {GRAIN && (
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />
      )}

      {/* d) VIGNETTE: radial gradient to rgba(0,0,0,0.55) at the edges */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.55) 100%)',
        }}
      />

      {/* e) CURSOR SMOKE: red fluid simulation that follows the cursor */}
      {CURSOR_GLOW && !prefersReducedMotion && isPointerFine && !isMobile && (
        <canvas
          ref={smokeRef}
          className="absolute inset-0 w-full h-full transition-opacity duration-[1200ms] ease-out"
          style={{ opacity: isPortraitDone ? 1 : 0, filter: 'blur(10px)' }}
        />
      )}

      {/* f) DUST: tiny white specks at 10-20% opacity drifting upward */}
      {DUST && !prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden">
          {dustParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white will-change-transform"
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animation: `dustFloat ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
                '--dust-op': p.opacity,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
};
