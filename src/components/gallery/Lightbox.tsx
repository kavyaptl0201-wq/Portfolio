import React, { useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, Camera } from 'lucide-react';
import { GalleryItem } from '../../data/photography';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import gsap from 'gsap';

export interface LightboxProps {
  item: GalleryItem | null;
  totalItems: number;
  originRect: DOMRect | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  item,
  totalItems,
  originRect,
  onClose,
  onPrev,
  onNext,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Keyboard navigation & Esc listener
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose, onPrev, onNext]);

  // FLIP entrance animation from originRect to centered card
  useEffect(() => {
    if (!item || !cardRef.current || !overlayRef.current) return;

    // Fade in background overlay
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: 'power2.out' }
    );

    if (prefersReducedMotion || !originRect) {
      // Reduced motion: simple fade and scale
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      // 0.5s FLIP animation from clicked card position to center
      const targetRect = cardRef.current.getBoundingClientRect();
      const deltaX = originRect.left + originRect.width / 2 - (targetRect.left + targetRect.width / 2);
      const deltaY = originRect.top + originRect.height / 2 - (targetRect.top + targetRect.height / 2);
      const scaleX = originRect.width / targetRect.width;
      const scaleY = originRect.height / targetRect.height;

      gsap.fromTo(
        cardRef.current,
        {
          x: deltaX,
          y: deltaY,
          scaleX,
          scaleY,
          opacity: 0.8,
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
        }
      );
    }
  }, [item?.id]); // Re-animate on item switch

  if (!item) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo viewer, ${item.index} of ${totalItems}`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0B0C11]/85 backdrop-blur-2xl select-none"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      {/* Top Header Bar */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-2 text-[#C9C9CF] text-[13px] font-sans font-medium">
          <Camera className="w-4 h-4 text-white/70" />
          <span>{item.index} / {totalItems}</span>
        </div>

        {/* Close Button Capsule */}
        <button
          type="button"
          onClick={onClose}
          data-sound="button"
          aria-label="Close photo viewer"
          className="apple-glass-chip apple-glass-chip-default apple-glass-chip-interactive h-9 px-3.5 text-[#F5F5F7] hover:text-white flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-pill"
        >
          <span>Close</span>
          <span className="text-[11px] text-[#A8A8AF] font-sans px-1.5 py-0.5 rounded-pill bg-white/[0.08]">
            Esc
          </span>
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* Flanking Navigation Pill: Previous */}
      <button
        type="button"
        onClick={onPrev}
        data-sound="button"
        aria-label="Previous photo"
        className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 apple-glass-chip apple-glass-chip-interactive w-11 h-11 p-0 items-center justify-center rounded-pill text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-xl"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Flanking Navigation Pill: Next */}
      <button
        type="button"
        onClick={onNext}
        data-sound="button"
        aria-label="Next photo"
        className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 apple-glass-chip apple-glass-chip-interactive w-11 h-11 p-0 items-center justify-center rounded-pill text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-xl"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Main Expanded 9:16 Portrait Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-[360px] sm:max-w-[420px] max-h-[76vh] sm:max-h-[82vh] aspect-[9/16] rounded-[28px] overflow-hidden glass-card glass-card-border p-5 flex flex-col justify-between shadow-2xl"
      >
        {/* Soft moving diagonal sweep */}
        <span className="gallery-card-sweep" aria-hidden="true" />

        {/* Real media if available */}
        {item.type === 'video' && item.url ? (
          <div className="absolute inset-0 rounded-[28px] overflow-hidden">
            <video
              src={item.url}
              autoPlay
              controls
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        ) : item.type === 'image' && item.url ? (
          <div className="absolute inset-0 rounded-[28px] overflow-hidden">
            <img
              src={item.url}
              alt={`Photograph by Kavya, ${item.index} of ${totalItems}`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          /* Placeholder representation */
          <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full border border-dashed border-white/30 flex items-center justify-center text-white/60">
              <Camera className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-[280px]">
              <div className="text-[16px] font-medium text-[#F5F5F7]">
                {item.title}
              </div>
              <p className="text-[13px] text-[#C9C9CF] leading-relaxed">
                Add your photos in <code className="text-white/80 bg-white/[0.06] px-1.5 py-0.5 rounded-pill">src/assets/photography/</code>
              </p>
            </div>
          </div>
        )}

        {/* Bottom Metadata Bar (only when a photo has a location or year) */}
        {(item.location || item.year) && (
          <div className="relative z-10 pt-4 mt-auto border-t border-white/10 flex items-center justify-between text-[13px] text-[#C9C9CF]">
            <span className="text-[11px] text-white/50">{item.location}</span>
            {item.year && <span className="text-[12px] text-white/60 font-sans">{item.year}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
