import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { portfolioContent } from '../data/content';
import { ArtCraftItem } from '../data/content.schema';
import { demoArtCraftItems } from '../data/artcraft.demo';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useReducedMotion } from '../hooks/useReducedMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
  try {
    CustomEase.create('carouselEase', '0.22, 1, 0.36, 1');
  } catch {
    // Already created
  }
}

// Known aspect ratios for demo items (width / height) for immediate layout stability
const KNOWN_ASPECT_RATIOS: Record<string, number> = {
  '/images/artcraft/demo-01.webp': 0.75,
  '/images/artcraft/demo-02.webp': 0.75,
  '/images/artcraft/demo-03.webp': 0.75,
  '/images/artcraft/demo-04.webp': 1.333,
  '/images/artcraft/demo-05.webp': 0.5625,
  '/images/artcraft/demo-06.webp': 0.748,
  '/images/artcraft/demo-07.webp': 0.75,
  '/images/artcraft/demo-08.webp': 0.75,
  '/images/artcraft/demo-09.webp': 0.5625,
};

function getDiff(idx: number, prog: number, totalCount: number): number {
  let d = ((idx - prog) % totalCount + totalCount) % totalCount;
  if (d > totalCount / 2) d -= totalCount;
  return d;
}

export const ArtCraftPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const { creative } = portfolioContent;

  const rawArtCraft = creative?.artCraft;
  const realItems: ArtCraftItem[] = Array.isArray(rawArtCraft)
    ? rawArtCraft
    : Array.isArray(rawArtCraft?.items)
    ? rawArtCraft.items
    : [];

  // In development, preview with demo items if real items are empty.
  // In production builds (import.meta.env.DEV is false), only realItems is used.
  const items: ArtCraftItem[] =
    import.meta.env.DEV && realItems.length === 0
      ? demoArtCraftItems
      : realItems;

  const total = items.length;
  const hasItems = total > 0;

  // Viewport tracking for responsive spacing
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  });

  // Aspect ratio cache
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>(KNOWN_ASPECT_RATIOS);

  // Fullscreen modal state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Continuous animation and progress state
  const progressRef = useRef<{ value: number }>({ value: 0 });
  const targetProgressRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const isAnimatingRef = useRef(false);

  // Pointer drag tracking
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartProgressRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Filmstrip references
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const slidingRingRef = useRef<HTMLDivElement>(null);
  const isFirstRingRender = useRef(true);

  // Current center index (integer)
  const currentCenterIndex = useMemo(() => {
    if (total === 0) return 0;
    return ((Math.round(progress) % total) + total) % total;
  }, [progress, total]);

  const currentPiece = hasItems ? items[currentCenterIndex] : null;

  // SEO & Head configuration
  useDocumentHead({
    title: 'Art & craft — Kavya',
    description: 'Paintings and handmade pieces by Kavya.',
  });

  // Scroll to top on initial page mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Remove top-center home-page intro dot/vignette if present
  useEffect(() => {
    const initialDot = document.getElementById('initial-intro-dot');
    if (initialDot) initialDot.remove();
    const initialVignette = document.getElementById('initial-intro-vignette');
    if (initialVignette) initialVignette.remove();
  }, []);

  // Window resize listener
  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Preload center and next two pieces on each side
  useEffect(() => {
    if (total <= 1) return;
    const toPreloadIndices = [
      ((currentCenterIndex - 2) % total + total) % total,
      ((currentCenterIndex - 1) % total + total) % total,
      ((currentCenterIndex + 1) % total + total) % total,
      ((currentCenterIndex + 2) % total + total) % total,
    ];
    toPreloadIndices.forEach((idx) => {
      const src = items[idx]?.image;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [currentCenterIndex, items, total]);

  // Handle responsive sizing calculations
  const isMobile = viewport.width <= 640;
  const isTablet = viewport.width > 640 && viewport.width < 1024;

  const carouselHeight = useMemo(() => {
    if (isMobile) return Math.min(viewport.height * 0.44, 340);
    if (isTablet) return Math.min(viewport.height * 0.52, 480);
    return Math.min(viewport.height * 0.62, 580);
  }, [isMobile, isTablet, viewport.height]);

  const maxItemWidth = useMemo(() => {
    if (isMobile) return Math.round(viewport.width * 0.72);
    if (isTablet) return Math.min(viewport.width * 0.65, 600);
    return Math.min(viewport.width * 0.60, 780);
  }, [isMobile, isTablet, viewport.width]);

  const gap = useMemo(() => {
    if (isMobile) return 14;
    if (isTablet) return 20;
    return 28;
  }, [isMobile, isTablet]);

  const sideScale = 0.78;

  const getItemSize = useCallback(
    (idx: number) => {
      const item = items[idx];
      if (!item) return { width: 300, height: carouselHeight };
      const ar = aspectRatios[item.image] ?? 0.75;
      if (carouselHeight * ar <= maxItemWidth) {
        return {
          width: Math.round(carouselHeight * ar),
          height: carouselHeight,
        };
      }
      return {
        width: maxItemWidth,
        height: Math.round(maxItemWidth / ar),
      };
    },
    [items, aspectRatios, carouselHeight, maxItemWidth]
  );

  // Fit a side artwork inside a box no larger than the center artwork's box, preserving aspect ratio (never cropping)
  const getFittedSideSize = useCallback(
    (idx: number, maxW: number, maxH: number) => {
      const item = items[idx];
      if (!item) return { width: 300, height: maxH };
      const ar = aspectRatios[item.image] ?? 0.75;
      if (maxH * ar <= maxW) {
        return {
          width: Math.round(maxH * ar),
          height: maxH,
        };
      }
      return {
        width: maxW,
        height: Math.round(maxW / ar),
      };
    },
    [items, aspectRatios]
  );

  // Smooth interruptible navigation to a target progress
  const animateTo = useCallback(
    (targetVal: number) => {
      if (total <= 1) return;
      targetProgressRef.current = targetVal;
      isAnimatingRef.current = true;

      if (prefersReducedMotion) {
        progressRef.current.value = targetVal;
        setProgress(targetVal);
        isAnimatingRef.current = false;
        return;
      }

      gsap.killTweensOf(progressRef.current);
      gsap.to(progressRef.current, {
        value: targetVal,
        duration: 0.65,
        ease: 'carouselEase',
        overwrite: 'auto',
        onUpdate: () => {
          setProgress(progressRef.current.value);
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          // Normalize modulo value smoothly to keep numbers bounded
          const normalized = ((progressRef.current.value % total) + total) % total;
          progressRef.current.value = normalized;
          targetProgressRef.current = normalized;
          setProgress(normalized);
        },
      });
    },
    [total, prefersReducedMotion]
  );

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    const nextTarget = Math.round(targetProgressRef.current) + 1;
    animateTo(nextTarget);
  }, [total, animateTo]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    const prevTarget = Math.round(targetProgressRef.current) - 1;
    animateTo(prevTarget);
  }, [total, animateTo]);

  const handleThumbnailClick = useCallback(
    (idx: number) => {
      if (total <= 1) return;
      const currentNorm = ((Math.round(progressRef.current.value) % total) + total) % total;
      let diff = ((idx - currentNorm) % total + total) % total;
      if (diff > total / 2) diff -= total;
      const target = progressRef.current.value + diff;
      animateTo(target);
    },
    [total, animateTo]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!hasItems) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          e.preventDefault();
          setIsFullscreen(false);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasItems, isFullscreen, handlePrev, handleNext]);

  // Lock body scroll when fullscreen modal is active
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Pointer / Touch drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (total <= 1) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartProgressRef.current = progressRef.current.value;
    hasMovedRef.current = false;
    isAnimatingRef.current = true;
    gsap.killTweensOf(progressRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || total <= 1) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 6) {
      hasMovedRef.current = true;
    }
    const centerSize = getItemSize(currentCenterIndex);
    const stepWidth = isMobile
      ? viewport.width * 0.72
      : centerSize.width / 2 + gap + (centerSize.width * sideScale) / 2;
    const progressDelta = -deltaX / Math.max(stepWidth, 200);
    const newProgress = dragStartProgressRef.current + progressDelta;
    progressRef.current.value = newProgress;
    setProgress(newProgress);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (hasMovedRef.current) {
      const deltaX = e.clientX - dragStartXRef.current;
      let snapTarget = Math.round(progressRef.current.value);
      if (Math.abs(deltaX) > 40) {
        snapTarget = deltaX < 0
          ? Math.ceil(dragStartProgressRef.current + 0.1)
          : Math.floor(dragStartProgressRef.current - 0.1);
      }
      animateTo(snapTarget);
    } else {
      isAnimatingRef.current = false;
    }
  };

  // Filmstrip: Animate the single sliding white ring
  useEffect(() => {
    if (!hasItems) return;
    const activeBtn = thumbRefs.current[currentCenterIndex];
    const ring = slidingRingRef.current;
    if (!activeBtn || !ring) return;

    // 2px gap outside scaled thumbnail (scale 1.12) + 2px border width => outer = scaled + 8px
    const btnW = activeBtn.offsetWidth;
    const btnH = activeBtn.offsetHeight;
    if (btnW === 0 || btnH === 0) return;

    const scale = 1.12;
    const targetW = Math.round(btnW * scale + 8);
    const targetH = Math.round(btnH * scale + 8);
    const centerX = activeBtn.offsetLeft + btnW / 2;
    const centerY = activeBtn.offsetTop + btnH / 2;
    const targetX = Math.round(centerX - targetW / 2);
    const targetY = Math.round(centerY - targetH / 2);

    if (isFirstRingRender.current || prefersReducedMotion) {
      gsap.set(ring, {
        x: targetX,
        y: targetY,
        width: targetW,
        height: targetH,
        opacity: 1,
      });
      isFirstRingRender.current = false;
    } else {
      gsap.to(ring, {
        x: targetX,
        y: targetY,
        width: targetW,
        height: targetH,
        opacity: 1,
        duration: 0.65,
        ease: 'carouselEase',
        overwrite: 'auto',
      });
    }
  }, [currentCenterIndex, hasItems, prefersReducedMotion, aspectRatios, viewport.width]);

  // Filmstrip: Center active thumbnail in the horizontal strip smoothly
  useEffect(() => {
    if (!hasItems || !thumbnailStripRef.current) return;
    const strip = thumbnailStripRef.current;
    const activeBtn = thumbRefs.current[currentCenterIndex];
    if (activeBtn) {
      const targetLeft =
        activeBtn.offsetLeft - strip.clientWidth / 2 + activeBtn.offsetWidth / 2;
      strip.scrollTo({
        left: targetLeft,
        behavior: prefersReducedMotion ? 'instant' : 'smooth',
      });
    }
  }, [currentCenterIndex, hasItems, prefersReducedMotion, viewport.width]);

  // Filmstrip: Staggered fade-up entry on initial page load (30ms stagger, 400ms duration)
  useEffect(() => {
    if (prefersReducedMotion || !thumbnailStripRef.current) return;
    const thumbEls = thumbnailStripRef.current.querySelectorAll('.filmstrip-thumb');
    if (thumbEls.length > 0) {
      gsap.from(thumbEls, {
        opacity: 0,
        y: 12,
        stagger: 0.03,
        duration: 0.4,
        ease: 'power2.out',
        clearProps: 'opacity,y', // allows hover translate-y and active opacity to function without conflict
      });
    }
  }, [hasItems, prefersReducedMotion]);

  // Only render the pieces needed for the current move (at most 5 in the DOM)
  const visibleSlots = useMemo(() => {
    if (!hasItems) return [];
    if (total === 1) return [0];
    if (total === 2) return [0, 1];
    if (total === 3) {
      return [
        ((currentCenterIndex - 1) % 3 + 3) % 3,
        currentCenterIndex,
        ((currentCenterIndex + 1) % 3 + 3) % 3,
      ];
    }
    const offsets = [-2, -1, 0, 1, 2];
    const uniqueMap = new Map<number, boolean>();
    const result: number[] = [];
    offsets.forEach((off) => {
      const idx = ((currentCenterIndex + off) % total + total) % total;
      if (!uniqueMap.has(idx)) {
        uniqueMap.set(idx, true);
        result.push(idx);
      }
    });
    return result;
  }, [hasItems, total, currentCenterIndex]);

  // Dimensions for current center and immediate neighbors to space with uniform gaps
  const centerSize = getItemSize(currentCenterIndex);
  const rightIdx = ((currentCenterIndex + 1) % total + total) % total;
  const leftIdx = ((currentCenterIndex - 1) % total + total) % total;
  // Side pieces fit inside a box no larger than center artwork's box, preserving aspect ratio (never cropping)
  const rightSize = getFittedSideSize(rightIdx, centerSize.width, centerSize.height);
  const leftSize = getFittedSideSize(leftIdx, centerSize.width, centerSize.height);

  const slotDistanceRight = centerSize.width / 2 + gap + (rightSize.width * sideScale) / 2;
  const slotDistanceLeft = centerSize.width / 2 + gap + (leftSize.width * sideScale) / 2;
  const slotDistanceFarRight = slotDistanceRight + (rightSize.width * sideScale) / 2 + gap + 150;
  const slotDistanceFarLeft = slotDistanceLeft + (leftSize.width * sideScale) / 2 + gap + 150;

  // Largest possible side-piece slot outer edge across all items in the collection
  const maxSlotOuterEdge = useMemo(() => {
    if (!hasItems) return 600;
    let maxEdge = 0;
    for (let i = 0; i < total; i++) {
      const cSize = getItemSize(i);
      const rIdx = (i + 1) % total;
      const lIdx = (i - 1 + total) % total;
      const rSize = getFittedSideSize(rIdx, cSize.width, cSize.height);
      const lSize = getFittedSideSize(lIdx, cSize.width, cSize.height);
      const rEdge = cSize.width / 2 + gap + rSize.width * sideScale;
      const lEdge = cSize.width / 2 + gap + lSize.width * sideScale;
      if (rEdge > maxEdge) maxEdge = rEdge;
      if (lEdge > maxEdge) maxEdge = lEdge;
    }
    return maxEdge;
  }, [hasItems, total, getItemSize, getFittedSideSize, gap, sideScale]);

  // On screens > 1024px: place arrows at a CONSTANT fixed distance from page center (about 32px outside largest possible slot)
  const isWideDesktop = viewport.width > 1024;
  const fixedDesktopPadding = useMemo(() => {
    if (!isWideDesktop) return 24;
    const maxArrowCenterFromCenter = Math.max(200, viewport.width / 2 - 24 - 22);
    const arrowCenterFromCenter = Math.min(
      maxSlotOuterEdge + 32 + 22,
      maxArrowCenterFromCenter
    );
    return Math.max(24, Math.round(viewport.width / 2 - arrowCenterFromCenter - 22));
  }, [isWideDesktop, viewport.width, maxSlotOuterEdge]);

  // Mask gradient to fade side pieces softly towards screen edges (transparent outer 6%, visible from 18%)
  const stageMask =
    'linear-gradient(to right, transparent 0%, transparent 6%, black 18%, black 82%, transparent 94%, transparent 100%)';

  const thumbHeight = isMobile ? 44 : 56;

  return (
    <div className="relative min-h-screen site-bg text-[#F5F5F7] flex flex-col justify-between select-none overflow-x-hidden w-full">
      {/* Avoid sound toggle caption overlapping top bar on narrow mobile viewports */}
      <style>{`
        @media (max-width: 640px) {
          [role="status"] {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Bar: "Back to portfolio" (left) and space for existing sound toggle (right)
          Uses exact same max-w-[1200px] and px-4 sm:px-6 md:px-8 padding as heading
          so "Back to portfolio" and "Art & craft" heading share the exact same left edge. */}
      <header className="sticky top-0 z-40 w-full pt-3 sm:pt-4 pb-2 sm:pb-3 bg-gradient-to-b from-[#0B0C11]/95 via-[#0B0C11]/80 to-transparent backdrop-blur-[2px]">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between min-h-[44px]">
          <Link
            to="/"
            data-sound="button"
            aria-label="Back to portfolio"
            className="apple-glass-chip apple-glass-chip-default apple-glass-chip-interactive h-9 px-3.5 sm:px-4 text-[#F5F5F7] hover:text-white flex items-center gap-1.5 sm:gap-2 rounded-pill shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-200 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-white/80" />
            <span className="text-[13px] font-medium">Back to portfolio</span>
          </Link>
          {/* Spacer reserving area for floating SoundToggle on top-right */}
          <div className="w-12 h-11 shrink-0" aria-hidden="true" />
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="relative z-10 w-full flex-1 flex flex-col justify-between overflow-x-hidden">
        {/* Section Heading & Subline: inside exact 1200px container */}
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pt-2 sm:pt-4 text-left">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] leading-tight text-white flex flex-wrap items-baseline gap-x-2">
            <span className="metallic-text-gradient font-semibold">Art &</span>
            <span className="font-light italic text-[#F5F5F7]">craft</span>
          </h1>
          <p className="mt-1 sm:mt-2 text-[14px] sm:text-[17px] text-[#9A9AA0] font-normal leading-relaxed">
            Paintings and handmade pieces.
          </p>

          {/* Empty State: exactly 48px below the subline, left-aligned with heading, not centered on screen */}
          {!hasItems && (
            <div className="w-full text-left mt-12">
              <p className="text-[17px] sm:text-[19px] text-[#8E8E93] font-normal tracking-[-0.01em]">
                Artwork coming soon.
              </p>
            </div>
          )}
        </div>

        {/* Center-Focused Exhibition Carousel */}
        {hasItems && currentPiece && (
          <div className="w-full flex-1 flex flex-col items-center justify-center my-auto">
            {/* Full-width Carousel Stage Wrapper (spans full viewport width so no hard vertical clipping line) */}
            <div className="relative w-full overflow-hidden flex items-center justify-center select-none py-2">
              {/* Masked Stage Track: fades softly toward left and right edges */}
              <div
                data-carousel-stage="true"
                className="relative w-full overflow-hidden flex items-center justify-center select-none touch-pan-y cursor-grab active:cursor-grabbing"
                style={{
                  height: `${carouselHeight}px`,
                  maskImage: stageMask,
                  WebkitMaskImage: stageMask,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* Visible Artwork Pieces (at most 5 in the DOM) */}
                {visibleSlots.map((itemIdx) => {
                  const item = items[itemIdx];
                  if (!item) return null;

                  const d = getDiff(itemIdx, progress, total);
                  const ad = Math.abs(d);

                  // Outside visible range
                  if (ad > 2.2) return null;

                  // Center natural size vs side fitted size (never larger than center artwork's box)
                  const centerNaturalSize = getItemSize(itemIdx);
                  const sideFittedSize = getFittedSideSize(itemIdx, centerSize.width, centerSize.height);
                  const t = Math.min(1, ad);
                  const itemWidth = Math.round((1 - t) * centerNaturalSize.width + t * sideFittedSize.width);
                  const itemHeight = Math.round((1 - t) * centerNaturalSize.height + t * sideFittedSize.height);

                  // Compute horizontal coordinate x relative to center
                  let x = 0;
                  if (d >= 0) {
                    if (d <= 1) {
                      x = d * slotDistanceRight;
                    } else {
                      x = slotDistanceRight + (d - 1) * (slotDistanceFarRight - slotDistanceRight);
                    }
                  } else {
                    if (d >= -1) {
                      x = d * slotDistanceLeft;
                    } else {
                      x = -slotDistanceLeft + (d + 1) * (slotDistanceFarLeft - slotDistanceLeft);
                    }
                  }

                  // Compute scale, opacity, filter, and zIndex based on continuous distance d
                  let scale: number;
                  let opacity: number;
                  let filter: string;
                  let zIndex: number;

                  if (prefersReducedMotion) {
                    if (ad < 0.5) {
                      scale = 1.0;
                      opacity = 1.0;
                      filter = 'blur(0px) brightness(1)';
                      zIndex = 20;
                    } else if (ad < 1.5) {
                      scale = sideScale;
                      opacity = 0.45;
                      filter = 'blur(6px) brightness(0.7)';
                      zIndex = 10;
                    } else {
                      scale = 0.65;
                      opacity = 0.0;
                      filter = 'blur(10px) brightness(0.55)';
                      zIndex = 5;
                    }
                  } else {
                    // Scale: 1.0 at center, 0.78 at sides, 0.65 when leaving
                    if (ad <= 1) {
                      scale = 1.0 - (1.0 - sideScale) * ad;
                    } else if (ad <= 2) {
                      scale = sideScale - (sideScale - 0.65) * (ad - 1);
                    } else {
                      scale = 0.65;
                    }

                    // Opacity: 1.0 at center, 0.45 at sides, 0.0 when leaving
                    if (ad <= 1) {
                      opacity = 1.0 - 0.55 * ad;
                    } else if (ad <= 2) {
                      opacity = 0.45 * (2.0 - ad);
                    } else {
                      opacity = 0.0;
                    }

                    // Filter blur & brightness: smooth continuous curve
                    let blurAmount: number;
                    let brightnessAmount: number;
                    if (ad <= 1) {
                      blurAmount = 6.0 * ad;
                      brightnessAmount = 1.0 - 0.3 * ad;
                    } else {
                      blurAmount = 6.0 + 4.0 * Math.min(1, ad - 1);
                      brightnessAmount = 0.7 - 0.15 * Math.min(1, ad - 1);
                    }
                    filter = `blur(${blurAmount.toFixed(1)}px) brightness(${brightnessAmount.toFixed(2)})`;

                    if (ad < 0.5) {
                      zIndex = 20;
                    } else if (ad < 1.5) {
                      zIndex = 10;
                    } else {
                      zIndex = 5;
                    }
                  }

                  const isCenter = ad < 0.2;
                  const isSideLeft = d >= -1.4 && d <= -0.5;
                  const isSideRight = d >= 0.5 && d <= 1.4;

                  const handleClick = (e: React.MouseEvent) => {
                    if (hasMovedRef.current) return;
                    e.stopPropagation();
                    if (isCenter) {
                      setIsFullscreen(true);
                    } else if (isSideLeft) {
                      handlePrev();
                    } else if (isSideRight) {
                      handleNext();
                    }
                  };

                  return (
                    <div
                      key={item.image}
                      data-artwork-index={itemIdx}
                      data-is-center={isCenter ? 'true' : 'false'}
                      onClick={handleClick}
                      className={`absolute left-1/2 top-1/2 select-none rounded-[12px] sm:rounded-[14px] ${
                        isCenter
                          ? 'cursor-zoom-in'
                          : isSideLeft || isSideRight
                          ? 'cursor-pointer'
                          : 'pointer-events-none'
                      }`}
                      style={{
                        width: `${itemWidth}px`,
                        height: `${itemHeight}px`,
                        transform: `translate3d(calc(-50% + ${x}px), -50%, 0) scale(${scale})`,
                        opacity,
                        filter,
                        zIndex,
                        willChange:
                          isAnimatingRef.current || isDraggingRef.current
                            ? 'transform, opacity, filter'
                            : 'auto',
                      }}
                    >
                      {/* Framed Artwork Display: 14px radius on desktop, 12px on phones. Frame and shadow follow curve. */}
                      <div
                        className={`relative w-full h-full p-1 rounded-[12px] sm:rounded-[14px] overflow-hidden bg-[#0C0C0E]/90 border transition-colors duration-200 flex items-center justify-center ${
                          isCenter
                            ? 'border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.65)] hover:border-white/35'
                            : 'border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:border-white/20'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          loading={isCenter ? 'eager' : 'lazy'}
                          draggable={false}
                          // @ts-expect-error React 18 fetchpriority support
                          fetchpriority={isCenter ? 'high' : 'auto'}
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            if (img.naturalWidth && img.naturalHeight) {
                              const r = img.naturalWidth / img.naturalHeight;
                              setAspectRatios((prev) => {
                                if (prev[item.image] === r) return prev;
                                return { ...prev, [item.image]: r };
                              });
                            }
                          }}
                          className="w-full h-full object-contain block pointer-events-none select-none rounded-[10px] sm:rounded-[12px]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Side Navigation Arrows: fixed position at constant distance from page center on screens > 1024px */}
              <div
                className="hidden sm:flex pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between z-30"
                style={{
                  paddingLeft: `${fixedDesktopPadding}px`,
                  paddingRight: `${fixedDesktopPadding}px`,
                }}
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  data-sound="button"
                  aria-label="Previous artwork"
                  className="pointer-events-auto w-11 h-11 rounded-full apple-glass-chip apple-glass-chip-interactive flex items-center justify-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-200 cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  data-sound="button"
                  aria-label="Next artwork"
                  className="pointer-events-auto w-11 h-11 rounded-full apple-glass-chip apple-glass-chip-interactive flex items-center justify-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-200 cursor-pointer shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Navigation Arrows (below artwork on phones) */}
            <div className="flex sm:hidden items-center justify-center gap-6 mt-3">
              <button
                type="button"
                onClick={handlePrev}
                data-sound="button"
                aria-label="Previous artwork"
                className="w-10 h-10 rounded-full apple-glass-chip apple-glass-chip-interactive flex items-center justify-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-mono text-[13px] text-[#9A9AA0] tabular-nums tracking-wider px-2">
                {String(currentCenterIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={handleNext}
                data-sound="button"
                aria-label="Next artwork"
                className="w-10 h-10 rounded-full apple-glass-chip apple-glass-chip-interactive flex items-center justify-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Caption & Animated Filmstrip Area (centered within 1200px container) */}
            <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center">
              {/* Artwork Caption with smooth crossfade: centered under center artwork */}
              <div className="w-full max-w-[800px] mt-4 sm:mt-5 px-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCenterIndex}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <h2 className="text-lg sm:text-xl font-medium text-[#F5F5F7] tracking-[-0.015em]">
                      {currentPiece.title}
                    </h2>
                    <p className="text-[14px] sm:text-[15px] text-[#9A9AA0] mt-0.5">
                      {currentPiece.medium} · {currentPiece.year}
                    </p>
                    <div className="hidden sm:block mt-1 font-mono text-[13px] sm:text-[14px] text-[#9A9AA0] tabular-nums tracking-wider">
                      {String(currentCenterIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                    </div>
                    {currentPiece.description && (
                      <p className="mt-2 text-[14px] text-[#8E8E93] leading-relaxed max-w-[600px]">
                        {currentPiece.description}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Animated Filmstrip: keeping aspect ratio, 8px radius, 8px gap, sliding white ring */}
              <div className="w-full max-w-[900px] mt-5 sm:mt-7 px-2">
                {/* Mask wrapper to fade both ends softly */}
                <div
                  className="relative w-full overflow-hidden py-3"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                  }}
                >
                  <div
                    ref={thumbnailStripRef}
                    role="tablist"
                    aria-label="Artwork filmstrip"
                    className="relative flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-3 px-8 scroll-smooth"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {/* The single separate white ring that slides and resizes smoothly */}
                    <div
                      ref={slidingRingRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute border-2 border-white rounded-[13px] shadow-[0_0_12px_rgba(255,255,255,0.4)] z-10 transition-none"
                      style={{
                        top: 0,
                        left: 0,
                        opacity: 0,
                      }}
                    />

                    {/* Filmstrip thumbnails */}
                    {items.map((item, idx) => {
                      const isSelected = idx === currentCenterIndex;
                      const ar = aspectRatios[item.image] ?? 0.75;
                      const tWidth = Math.round(thumbHeight * ar);

                      return (
                        <button
                          key={item.image + idx}
                          ref={(el) => {
                            thumbRefs.current[idx] = el;
                          }}
                          type="button"
                          role="tab"
                          data-sound="button"
                          aria-selected={isSelected}
                          aria-label={`View artwork ${idx + 1}: ${item.title}`}
                          onClick={() => handleThumbnailClick(idx)}
                          className={`filmstrip-thumb relative shrink-0 rounded-[8px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer ${
                            isSelected
                              ? 'opacity-100 saturate-100 scale-[1.12] z-20 transition-all duration-[650ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]'
                              : 'opacity-40 saturate-[0.7] hover:opacity-80 hover:-translate-y-[2px] transition-all duration-200'
                          }`}
                          style={{
                            width: `${tWidth}px`,
                            height: `${thumbHeight}px`,
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover block rounded-[8px] pointer-events-none select-none"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fullscreen Artwork Viewer Modal with 14px / 12px rounded corners */}
      {isFullscreen && currentPiece && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fullscreen view of ${currentPiece.title}`}
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 animate-in fade-in duration-200 select-none cursor-zoom-out"
        >
          {/* Top Control Bar in Fullscreen: Close Button */}
          <div className="w-full max-w-[1400px] flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              data-sound="button"
              aria-label="Close fullscreen view"
              className="apple-glass-chip apple-glass-chip-default apple-glass-chip-interactive h-9 px-3.5 text-[#F5F5F7] hover:text-white flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-pill cursor-pointer shadow-lg"
            >
              <span className="text-[13px] font-medium">Close</span>
              <span className="text-[11px] text-[#A8A8AF] font-sans px-1.5 py-0.5 rounded-pill bg-white/[0.08]">
                Esc
              </span>
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>

          {/* Centered Image with Navigation */}
          <div className="relative flex-1 w-full max-w-[1400px] flex items-center justify-between gap-4">
            {/* Left Nav Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              data-sound="button"
              aria-label="Previous artwork"
              className="shrink-0 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Artwork Container with 14px / 12px rounded corners, matching frame and soft shadow */}
            <div className="flex-1 flex items-center justify-center h-full px-2">
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative p-1 rounded-[12px] sm:rounded-[14px] overflow-hidden bg-[#0C0C0E]/90 border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.85)] max-h-[78vh] max-w-[88vw] flex items-center justify-center cursor-default"
              >
                <img
                  src={currentPiece.image}
                  alt={currentPiece.title}
                  loading="eager"
                  // @ts-expect-error React 18 fetchpriority support
                  fetchpriority="high"
                  className="max-h-[calc(78vh-10px)] max-w-[calc(88vw-10px)] w-auto h-auto object-contain select-none rounded-[10px] sm:rounded-[12px]"
                />
              </div>
            </div>

            {/* Right Nav Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              data-sound="button"
              aria-label="Next artwork"
              className="shrink-0 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Fullscreen Bottom Caption */}
          <div className="w-full max-w-[800px] text-center pt-3 pb-2">
            <h3 className="text-base sm:text-lg font-medium text-white tracking-tight">
              {currentPiece.title}
            </h3>
            <p className="text-[13px] sm:text-[14px] text-[#9A9AA0] mt-0.5">
              {currentPiece.medium} · {currentPiece.year}
              <span className="mx-2 text-white/30">•</span>
              <span className="font-mono">
                {String(currentCenterIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtCraftPage;
