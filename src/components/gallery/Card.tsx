import React, { useRef } from 'react';
import { GalleryItem } from '../../data/photography';

export interface CardProps {
  item: GalleryItem;
  totalItems: number;
  slotIndex: number;
  inView: boolean;
  onSelect: (item: GalleryItem, rect: DOMRect) => void;
  onFocus: (index: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  cardRef?: (el: HTMLButtonElement | null) => void;
}

export const Card: React.FC<CardProps> = ({
  item,
  totalItems,
  slotIndex,
  inView,
  onSelect,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  cardRef,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    // Ignore the click that ends a drag of the ring
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (start && e.detail > 0 && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) {
      return;
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      onSelect(item, rect);
    }
  };

  const setRefs = (el: HTMLButtonElement | null) => {
    buttonRef.current = el;
    if (cardRef) cardRef(el);
  };

  return (
    <div
      className="w-full h-full"
      style={{
        visibility: inView ? 'visible' : 'hidden',
        pointerEvents: inView ? 'auto' : 'none',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <button
        ref={setRefs}
        type="button"
        role="button"
        aria-label={`Open photo ${item.index} of ${totalItems}`}
        data-sound="button"
        onPointerDown={(e) => {
          pointerStartRef.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={handleClick}
        onFocus={() => onFocus(slotIndex)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        className="gallery-card-inner group select-none relative w-full h-full rounded-[20px] overflow-hidden border border-white/10 bg-[#0d0d10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-300"
      >
        {/* Soft moving diagonal light sweep */}
        <span className="gallery-card-sweep" aria-hidden="true" />

        {/* Real image display with eager loading for first 4 frames */}
        {item.url && (
          <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
            <img
              src={item.url}
              alt={`Photograph by Kavya, ${item.index} of ${totalItems}`}
              loading={slotIndex < 4 ? 'eager' : 'lazy'}
              decoding={slotIndex < 4 ? 'sync' : 'async'}
              // lowercase attribute: React 18 warns on the camelCase prop
              {...{ fetchpriority: slotIndex < 4 ? 'high' : 'auto' }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
      </button>
    </div>
  );
};
