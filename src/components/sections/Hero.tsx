import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { PortfolioContent } from '../../data/content.schema';
import { markPortraitDone } from '../../utils/introState';
import { scrollToSection } from '../../utils/scroll';

interface HeroProps {
  personal: PortfolioContent['personal'];
  availability?: PortfolioContent['availability'];
  resumeUrl: string;
  onDownloadResume: () => void;
  onNavFadeIn?: () => void;
  onIntroComplete?: () => void;
  isIntroAlreadyDone?: boolean;
  onSelectSection?: (id: string) => void;
}

// v = 0: hairline and narrow, v = 1: heavy and full width. Weight follows v, width grows a little later (v^1.5).
// x shifts the echo copies.
const lastStyle = new WeakMap<HTMLElement, string>();
const setLetterStyle = (el: HTMLElement, v: number, x = 0) => {
  const w = Math.pow(v, 1.5);
  const font = `"wght" ${Math.round(100 + 780 * v)}, "wdth" ${Math.round(25 + 60 * w)}`;
  const transform = `translateX(${x.toFixed(1)}px) scaleX(${(0.42 + 0.43 * w).toFixed(3)})`;
  // Skip the write when nothing changed, so a resting name costs nothing
  const key = font + transform;
  if (lastStyle.get(el) === key) return;
  lastStyle.set(el, key);
  el.style.fontVariationSettings = font;
  el.style.transform = transform;
};

// Echo copies: opacity, how fast they follow the letter, and how far they trail the cursor's motion
const ECHOES = [
  { opacity: 0.25, follow: 0.14, trail: 0.5 },
  { opacity: 0.12, follow: 0.09, trail: 1 },
];

export const Hero: React.FC<HeroProps> = ({
  personal,
  availability,
  resumeUrl,
  onDownloadResume,
  onNavFadeIn,
  onIntroComplete,
  isIntroAlreadyDone = false,
  onSelectSection,
}) => {
  const name = (personal.preferredName || personal.fullName || '').toUpperCase();
  const letters = name.split('');

  const sectionRef = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [loading, setLoading] = useState(!isIntroAlreadyDone);

  // 1. Loader: count 0 -> 100, fade out, then the dark panel slides up over the name
  useEffect(() => {
    document.getElementById('initial-intro-vignette')?.remove();
    const section = sectionRef.current;
    if (!section || isIntroAlreadyDone) return;
    const fadeEls = section.querySelectorAll('[data-hero-fade]');

    const showSmoke = () => {
      markPortraitDone();
      window.dispatchEvent(new CustomEvent('hero:portraitDone'));
    };
    const finish = () => {
      document.body.style.overflow = '';
      setLoading(false);
      showSmoke();
      onNavFadeIn?.();
      onIntroComplete?.();
    };

    document.body.style.overflow = 'hidden';
    gsap.set(fadeEls, { opacity: 0, y: 14 });
    gsap.set(labelRef.current, { opacity: 0 });
    gsap.set(countRef.current, { xPercent: -50, yPercent: -50 });

    const counter = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(counter, {
      v: 100,
      delay: 0.1,
      duration: 2.4,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(counter.v));
      },
    })
      .to(barRef.current, { scaleX: 1, duration: 2.4, ease: 'power3.inOut' }, 0.1)
      .to(labelRef.current, { opacity: 1, duration: 0.4 }, 0.55)
      .to(countRef.current, { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in' }, 2.65)
      .to([labelRef.current, lineRef.current], { opacity: 0, duration: 0.25 }, 2.85)
      .to(loaderRef.current, { yPercent: -100, duration: 0.3, ease: 'power2.inOut' }, 3.38)
      .call(showSmoke, [], 3.68)
      .call(() => onNavFadeIn?.(), [], 4.1)
      .to(fadeEls, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, 3.95);

    // Escape, wheel or touch-scroll skips straight to the end
    const skip = (e: Event) => {
      if (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Escape') return;
      tl.progress(1);
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });

    return () => {
      tl.kill();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
    };
    // Runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. The letter under the cursor swells (weight + width); echo copies lag behind and trail the motion
  useEffect(() => {
    const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slots.length === 0) return;
    const layers = slots.map((slot) => Array.from(slot.children) as HTMLElement[]); // [echo2, echo1, letter]

    const mid = (slots.length - 1) / 2;
    const rest = slots.map((_, i) => Math.min(1, Math.max(0, (2 - Math.abs(i - mid)) / 1.4)));
    const state = rest.map((v) => ({ v, echo: [v, v] }));
    layers.forEach((l, i) => l.forEach((el) => setLetterStyle(el, rest[i])));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hasMouse = window.matchMedia('(pointer: fine)').matches;
    let pointerX: number | null = null;
    let pointerY = 0;
    let prevX: number | null = null;
    let velocity = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointerX = e.clientX;
      pointerY = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (sectionRef.current) observer.observe(sectionRef.current);

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const rects = slots.map((slot) => slot.getBoundingClientRect());
      const slotW = rects[0].width || 1;
      const center = (rects[0].left + rects[rects.length - 1].right) / 2;
      const halfW = (rects[rects.length - 1].right - rects[0].left) / 2;

      // Before the mouse moves: rest in the middle. Touch screens: a slow sweep across the name.
      const focusX = pointerX ?? (hasMouse ? center : center + Math.sin((now - start) / 1400) * halfW);
      velocity += ((pointerX !== null && prevX !== null ? pointerX - prevX : 0) - velocity) * 0.25;
      prevX = pointerX;
      const trail = Math.max(-20, Math.min(20, velocity));

      rects.forEach((r, i) => {
        // Mostly horizontal distance; being above or below the name weakens it
        const dy = pointerX === null ? 0 : (pointerY - (r.top + r.height / 2)) * 0.6;
        const d = Math.hypot(focusX - (r.left + r.width / 2), dy) / slotW;
        // Full strength within ~0.6 letter of the cursor, fading out by 2 letters away
        const target = Math.min(1, Math.max(0, (2 - d) / 1.4));
        const s = state[i];
        // Swell quickly, thin out slowly
        s.v += (target - s.v) * (target > s.v ? 0.2 : 0.07);
        ECHOES.forEach((echo, k) => {
          s.echo[k] += ((k === 0 ? s.v : s.echo[0]) - s.echo[k]) * echo.follow;
          setLetterStyle(layers[i][1 - k], s.echo[k], -trail * echo.trail);
        });
        setLetterStyle(layers[i][2], s.v);
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, [name]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero Introduction"
      className="relative w-full h-[100dvh] min-h-[560px] overflow-hidden flex items-center justify-center"
    >
      {/* Top-left status line */}
      {availability?.isOpen && availability.statusText && (
        <p
          data-hero-fade
          className="absolute left-6 md:left-10 top-[14vh] flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E5E5EA]"
        >
          <span className="w-1 h-1 rounded-full bg-accent" />
          {availability.statusText}
        </p>
      )}

      <div className="relative select-none -mt-[3vh]" aria-hidden="true">
        {/* Red tagline running behind the middle of the name */}
        {personal.headline && (
          <p
            data-hero-fade
            className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-max max-w-[90vw] text-center text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
            style={{ textShadow: '0 0 12px rgba(232, 72, 79, 0.6)' }}
          >
            {personal.headline}
          </p>
        )}

        {/* Name: one fixed-width slot per letter, each with two echo copies under the letter */}
        <div className="hero-name relative">
          {letters.map((char, i) => (
            <div key={`${char}-${i}`} ref={(el) => (slotRefs.current[i] = el)} className="hero-name-slot">
              {ECHOES.map((_, k) => (
                <span
                  key={k}
                  className="hero-name-letter hero-name-echo"
                  style={{ opacity: ECHOES[ECHOES.length - 1 - k].opacity }}
                >
                  {char}
                </span>
              ))}
              <span className="hero-name-letter">{char}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: name + role on the left, stacked actions on the right */}
      <div className="absolute bottom-10 md:bottom-12 left-0 right-0 px-6 md:px-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div data-hero-fade className="max-w-[440px]">
          <h1 className="text-[20px] sm:text-[24px] font-semibold text-white leading-tight">{personal.fullName}</h1>
          <p className="mt-1 text-[13px] sm:text-[14px] text-[#C9C9CF] leading-relaxed">{personal.roleLine}</p>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
          <a
            data-hero-fade
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection?.('projects');
              scrollToSection('projects');
              window.history.pushState(null, '', '#projects');
            }}
            className="apple-button-primary inline-flex items-center gap-2.5 min-h-[58px] px-8 rounded-full text-[14px] font-semibold"
            style={{ filter: 'drop-shadow(0 0 16px rgba(232, 72, 79, 0.5))' }}
          >
            <ArrowUpRight className="w-4 h-4" />
            View my work
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            data-hero-fade
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDownloadResume}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-6 rounded-full border border-white/25 text-[13px] font-semibold text-[#F5F5F7] hover:border-white/60 hover:text-white transition-colors"
          >
            Resume
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      <span data-hero-fade className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-[0.4em] text-[#9A9AA0]">
        Scroll
      </span>

      {/* Loader panel */}
      {loading && (
        <div ref={loaderRef} className="fixed inset-0 z-[200] site-bg">
          <span ref={countRef} className="hero-counter absolute left-1/2 top-[47%]">
            0
          </span>
          <div
            ref={labelRef}
            className="absolute left-1/2 top-[59%] -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.4em] text-[#C9C9CF]"
          >
            {personal.fullName}
          </div>
          <div ref={lineRef} className="absolute left-1/2 top-[64%] -translate-x-1/2 w-[18vw] min-w-[160px] h-px bg-white/20">
            <div ref={barRef} className="h-full bg-accent origin-left scale-x-0" />
          </div>
        </div>
      )}
    </section>
  );
};
