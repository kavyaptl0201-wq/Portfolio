import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GalleryItem } from '../../data/photography';
import { Card } from './Card';
import {
  CARD_ASPECT,
  AUTO_ROTATE,
  GALLERY_CONFIG,
} from '../../config/gallery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import gsap from 'gsap';

export interface RingProps {
  items: GalleryItem[];
  isSettled: boolean;
  introProgress?: number; // 0 to 100 real image progress
  onSelectCard: (item: GalleryItem, rect: DOMRect) => void;
  onGalleryReady?: () => void;
}

export const Ring: React.FC<RingProps> = ({
  items,
  isSettled,
  introProgress = 0,
  onSelectCard,
  onGalleryReady,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  // Responsive dimensions
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = dimensions.width < 768;

  // Sizing math:
  // Card height should never exceed 52% of viewport height (guaranteeing <= 60% with perspective).
  // Natural image resolution is 1200px, so max 520px height ensures no image is upscaled.
  const cardHeight = useMemo(() => {
    if (isMobile) {
      const w = Math.min(220, Math.max(140, dimensions.width * 0.52));
      return w / CARD_ASPECT;
    }
    const maxH = Math.min(520, dimensions.height * 0.52);
    return Math.max(260, maxH);
  }, [dimensions.width, dimensions.height, isMobile]);

  const cardWidth = cardHeight * CARD_ASPECT;
  const cardGap = cardWidth * 0.14;

  const N = items.length || 16;
  const angularStep = 360 / N;

  // Radius calculation using chord formula
  const radius = useMemo(() => {
    const stepRad = Math.PI / N;
    return (cardWidth + cardGap) / (2 * Math.sin(stepRad));
  }, [cardWidth, cardGap, N]);

  // Motion, physics, and camera state in refs (NO React state per frame)
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const lastDragXRef = useRef(0);
  const autoRotateFactorRef = useRef(1);
  const hoverResumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Cursor follow targets with 0.08 lerp damping
  const targetMouseXRef = useRef(0);
  const targetMouseYRef = useRef(0);
  const curMouseXRef = useRef(0);
  const curMouseYRef = useRef(0);

  // Camera animated properties
  const cameraPitchRef = useRef(
    isSettled || prefersReducedMotion ? GALLERY_CONFIG.CAMERA.PITCH_SETTLED : GALLERY_CONFIG.CAMERA.PITCH_INTRO
  );
  const cameraDollyRef = useRef(
    (isSettled || prefersReducedMotion ? GALLERY_CONFIG.CAMERA.DOLLY_SETTLED : GALLERY_CONFIG.CAMERA.DOLLY_INTRO) * radius
  );

  // Cards flight element refs for intro assembly
  const cardFlightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const assembledCountRef = useRef(0);

  // Trigger card assembly as real image progress advances
  useEffect(() => {
    if (prefersReducedMotion || isSettled) {
      cardFlightRefs.current.forEach((el) => {
        if (el) {
          gsap.set(el, { x: 0, y: 0, z: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 });
        }
      });
      return;
    }

    // Number of cards to assemble proportional to progress (0 to 100)
    const targetCount = Math.floor((introProgress / 100) * N);
    for (let i = assembledCountRef.current; i < targetCount && i < N; i++) {
      const el = cardFlightRefs.current[i];
      if (el) {
        gsap.to(el, {
          x: 0,
          y: 0,
          z: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: 1,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
        });
      }
    }
    assembledCountRef.current = targetCount;
  }, [introProgress, N, prefersReducedMotion, isSettled]);

  // When becoming settled: glide camera smoothly into gallery
  useEffect(() => {
    if (isSettled) {
      gsap.to(cameraPitchRef, {
        current: GALLERY_CONFIG.CAMERA.PITCH_SETTLED,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.to(cameraDollyRef, {
        current: GALLERY_CONFIG.CAMERA.DOLLY_SETTLED * radius,
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => {
          if (onGalleryReady) onGalleryReady();
        },
      });
      cardFlightRefs.current.forEach((el) => {
        if (el) {
          gsap.to(el, {
            x: 0,
            y: 0,
            z: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        }
      });
    }
  }, [isSettled, radius, onGalleryReady]);

  // Setup initial card positions for intro (center origin, subtle offset, zero opacity)
  useEffect(() => {
    if (!isSettled && !prefersReducedMotion) {
      cardFlightRefs.current.forEach((el, idx) => {
        if (el) {
          const spreadX = (idx % 2 === 0 ? 1 : -1) * 40;
          const spreadY = ((idx % 3) - 1) * 30;
          gsap.set(el, {
            x: spreadX,
            y: spreadY,
            z: -50,
            rotateY: spreadX * 0.2,
            scale: 0.85,
            opacity: 0,
          });
        }
      });
    }
  }, [isSettled, prefersReducedMotion]);

  // Main 60fps / 120fps requestAnimationFrame Loop
  useEffect(() => {
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      const dt = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = now;

      // Update rotation with auto-rotate and inertia damping
      if (isSettled || prefersReducedMotion) {
        if (!isDraggingRef.current) {
          const baseVelocity = prefersReducedMotion ? 0 : AUTO_ROTATE * autoRotateFactorRef.current;
          velocityRef.current *= Math.pow(GALLERY_CONFIG.INERTIA.DAMPING, dt / (1 / 60));

          if (Math.abs(velocityRef.current) < 0.01) {
            velocityRef.current = 0;
          }

          rotationRef.current += (baseVelocity + velocityRef.current) * dt;
        }
      }

      // Smooth cursor follow with 0.08 lerp damping
      if (!prefersReducedMotion) {
        curMouseXRef.current += (targetMouseXRef.current - curMouseXRef.current) * 0.08;
        curMouseYRef.current += (targetMouseYRef.current - curMouseYRef.current) * 0.08;
      } else {
        curMouseXRef.current = 0;
        curMouseYRef.current = 0;
      }

      // Clamp cursor offsets strictly to [-1, 1]
      const clampedMouseX = Math.max(-1, Math.min(1, curMouseXRef.current));
      const clampedMouseY = Math.max(-1, Math.min(1, curMouseYRef.current));

      // Compute camera transform with smooth, clamped values
      const camYaw = Math.max(-8, Math.min(8, clampedMouseX * -7));
      const camPitch = Math.max(-6, Math.min(6, cameraPitchRef.current + clampedMouseY * -4));
      const camPanX = Math.max(-20, Math.min(20, clampedMouseX * 18));
      const camPanY = Math.max(-12, Math.min(12, clampedMouseY * 10));
      const camDolly = Math.max(-radius * 0.4, Math.min(0, cameraDollyRef.current));

      // Apply transforms directly to DOM elements (zero React re-renders)
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(${camPanX.toFixed(1)}px, ${camPanY.toFixed(1)}px, 0) rotateX(${camPitch.toFixed(2)}deg) rotateY(${camYaw.toFixed(2)}deg) translateZ(${camDolly.toFixed(1)}px)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${rotationRef.current.toFixed(2)}deg)`;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    lastFrameTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(tick);

    // Pause animation when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      } else {
        lastFrameTimeRef.current = performance.now();
        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(tick);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSettled, prefersReducedMotion]);

  // Track cursor movement on window for smooth camera parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetMouseXRef.current = Math.max(-1, Math.min(1, x));
      targetMouseYRef.current = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Pointer drag listeners (works for mouse and touch)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();
    lastDragXRef.current = e.clientX;
    velocityRef.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(0.001, (now - lastDragTimeRef.current) / 1000);
    const deltaX = e.clientX - lastDragXRef.current;

    const degPerPixel = 140 / (dimensions.width || 1000);
    rotationRef.current += deltaX * degPerPixel;
    const rawVelocity = (deltaX * degPerPixel) / dt;
    velocityRef.current = Math.max(-100, Math.min(100, rawVelocity));

    lastDragTimeRef.current = now;
    lastDragXRef.current = e.clientX;
  }, [dimensions.width]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  }, []);

  // Passive wheel interaction
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (e: WheelEvent) => {
      const impulse = (e.deltaX || e.deltaY) * 0.05;
      velocityRef.current = Math.max(-80, Math.min(80, velocityRef.current + impulse));
    };

    stage.addEventListener('wheel', onWheel, { passive: true });
    return () => stage.removeEventListener('wheel', onWheel);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        velocityRef.current -= 18;
      } else if (e.key === 'ArrowRight') {
        velocityRef.current += 18;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Card hover handling: pause auto-rotate on hover, resume after exit
  const handleCardMouseEnter = useCallback(() => {
    if (hoverResumeTimerRef.current) {
      clearTimeout(hoverResumeTimerRef.current);
      hoverResumeTimerRef.current = null;
    }
    gsap.to(autoRotateFactorRef, {
      current: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    if (hoverResumeTimerRef.current) clearTimeout(hoverResumeTimerRef.current);
    hoverResumeTimerRef.current = setTimeout(() => {
      gsap.to(autoRotateFactorRef, {
        current: 1,
        duration: 0.4,
        ease: 'power2.in',
      });
    }, 600);
  }, []);

  // Focus a card via keyboard: rotate ring to center it
  const handleCardFocus = useCallback((slotIndex: number) => {
    const targetSlotAngle = slotIndex * angularStep;
    const currentAngle = rotationRef.current;
    const targetAngle = -targetSlotAngle;
    const diff = ((((targetAngle - currentAngle) % 360) + 540) % 360) - 180;

    gsap.to(rotationRef, {
      current: currentAngle + diff,
      duration: 0.6,
      ease: 'power3.out',
    });
    velocityRef.current = 0;
  }, [angularStep]);

  // Slots map
  const slots = useMemo(() => {
    return items.map((item, i) => {
      const phi = i * angularStep;
      return {
        slotIndex: i,
        phi,
        item,
      };
    });
  }, [items, angularStep]);

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label="Photo and video gallery"
      className="photography-stage cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 3D Camera Element */}
      <div ref={cameraRef} className="photography-camera">
        {/* 3D Cylindrical Ring Element */}
        <div ref={ringRef} className="photography-ring">
          {slots.map(({ slotIndex, phi, item }) => (
            <div
              key={item.id}
              className="gallery-card-slot"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                left: `${-cardWidth / 2}px`,
                top: `${-cardHeight / 2}px`,
                transform: `rotateY(${phi}deg) translateZ(${-radius}px)`,
              }}
            >
              {/* Wrapper for arrival flight animation */}
              <div
                ref={(el) => {
                  cardFlightRefs.current[slotIndex] = el;
                }}
                className="w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card
                  item={item}
                  totalItems={N}
                  slotIndex={slotIndex}
                  inView={true}
                  onSelect={onSelectCard}
                  onFocus={handleCardFocus}
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
