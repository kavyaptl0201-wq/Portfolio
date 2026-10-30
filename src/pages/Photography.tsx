import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getGalleryItems, GalleryItem } from '../data/photography';
import { Ring } from '../components/gallery/Ring';
import { Loader } from '../components/gallery/Loader';
import { Lightbox } from '../components/gallery/Lightbox';
import { AmbientBackground } from '../components/common/AmbientBackground';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useReducedMotion } from '../hooks/useReducedMotion';

const GALLERY_ITEMS = getGalleryItems();

export const Photography: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const items = GALLERY_ITEMS;

  const [isSettled, setIsSettled] = useState(() => prefersReducedMotion);
  const [loaderProgress, setLoaderProgress] = useState(() => (prefersReducedMotion ? 100 : 0));
  const [showLoader, setShowLoader] = useState(() => !prefersReducedMotion);
  const [showAmbient, setShowAmbient] = useState(() => prefersReducedMotion);
  const [showFinalUI, setShowFinalUI] = useState(() => prefersReducedMotion);
  const [statusAnnouncement, setStatusAnnouncement] = useState('');

  // Selected item for Lightbox modal
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedOriginRect, setSelectedOriginRect] = useState<DOMRect | null>(null);

  // SEO & Head configuration
  useDocumentHead({
    title: 'Photography & videography — Kavya',
    description: 'Frames from my camera and everyday moments. Drag or scroll to explore.',
  });

  // Remove top-center home-page intro dot on the photography page
  useEffect(() => {
    const initialDot = document.getElementById('initial-intro-dot');
    if (initialDot) initialDot.remove();
    const initialVignette = document.getElementById('initial-intro-vignette');
    if (initialVignette) initialVignette.remove();
  }, []);

  // Real Image Loading Coordinator
  // Tracks real image loading progress with a minimum visible rolling time of ~0.8s
  // and completes under 2 seconds on a fast connection.
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsSettled(true);
      setShowLoader(false);
      setShowAmbient(true);
      setShowFinalUI(true);
      setStatusAnnouncement('Gallery ready');
      return;
    }

    let isMounted = true;
    const total = items.length;
    let loadedCount = 0;
    const startTime = performance.now();
    const MIN_DURATION = 800; // ms minimum counter time to prevent flash
    const MAX_DURATION = 1800; // ms ceiling ensuring total loader time stays under 2s
    let animFrame: number;
    let isFinished = false;

    // Track real image loading progress
    items.forEach((item) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (!isMounted) return;
        loadedCount++;
      };
      img.src = item.url;
    });

    const finishLoading = () => {
      if (isFinished || !isMounted) return;
      isFinished = true;
      setLoaderProgress(100);
      setTimeout(() => {
        if (!isMounted) return;
        setShowLoader(false);
        setShowAmbient(true);
        setShowFinalUI(true);
        setIsSettled(true);
        setStatusAnnouncement('Gallery ready');
      }, 150);
    };

    const updateProgress = () => {
      if (!isMounted || isFinished) return;
      const elapsed = performance.now() - startTime;
      const realRatio = total > 0 ? loadedCount / total : 1;
      const timeRatio = Math.min(1, elapsed / MIN_DURATION);

      // Current progress follows real image loading progress throttled by minimum duration
      const currentPct = Math.min(99, Math.floor(Math.min(realRatio, timeRatio) * 100));
      setLoaderProgress(currentPct);

      if ((loadedCount >= total && elapsed >= MIN_DURATION) || elapsed >= MAX_DURATION) {
        finishLoading();
      } else {
        animFrame = requestAnimationFrame(updateProgress);
      }
    };

    animFrame = requestAnimationFrame(updateProgress);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrame);
    };
  }, [items, prefersReducedMotion]);

  // Skip Intro Handler (jumps immediately to settled state)
  const handleSkipIntro = () => {
    setLoaderProgress(100);
    setShowLoader(false);
    setShowAmbient(true);
    setShowFinalUI(true);
    setIsSettled(true);
    setStatusAnnouncement('Gallery ready');
  };

  // Card Selection & Lightbox Handlers
  const handleSelectCard = (item: GalleryItem, rect: DOMRect) => {
    setSelectedItem(item);
    setSelectedOriginRect(rect);
  };

  const handleCloseLightbox = () => {
    setSelectedItem(null);
    setSelectedOriginRect(null);
  };

  const handlePrevItem = () => {
    if (!selectedItem) return;
    const currentIndex = items.findIndex((i) => i.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setSelectedItem(items[prevIndex]);
  };

  const handleNextItem = () => {
    if (!selectedItem) return;
    const currentIndex = items.findIndex((i) => i.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % items.length;
    setSelectedItem(items[nextIndex]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden site-bg text-[#F5F5F7] select-none">
      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite">
        {statusAnnouncement}
      </div>

      {/* Ambient Background */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out z-0 pointer-events-none"
        style={{ opacity: showAmbient ? 1 : 0 }}
      >
        <AmbientBackground />
      </div>

      {/* Intro Loader Stage */}
      <Loader
        progress={loaderProgress}
        isVisible={showLoader}
        onSkip={handleSkipIntro}
        brandText="Kavya."
      />

      {/* 3D Ring Gallery Canvas */}
      <main id="main-content" className="relative z-10 w-full h-full">
        <Ring
          items={items}
          isSettled={isSettled}
          introProgress={loaderProgress}
          onSelectCard={handleSelectCard}
          onGalleryReady={() => setStatusAnnouncement('Gallery ready')}
        />
      </main>

      {/* Top Header Bar: Back link on top-left above gallery with subtle dark gradient */}
      <div
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0B0C11]/95 via-[#0B0C11]/60 to-transparent transition-opacity duration-700 ease-out"
        style={{
          opacity: showFinalUI ? 1 : 0,
          pointerEvents: showFinalUI ? 'auto' : 'none',
        }}
      >
        <header className="final-ui-item flex items-center justify-between w-full pointer-events-auto pr-16">
          <Link
            to="/"
            data-sound-group="nav"
            aria-label="Back to portfolio"
            className="apple-glass-chip apple-glass-chip-default apple-glass-chip-interactive h-9 px-4 text-[#F5F5F7] hover:text-white flex items-center gap-2 rounded-pill shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-white/80" />
            <span className="text-[13px] font-medium">Back to portfolio</span>
          </Link>
        </header>
      </div>

      {/* Bottom Metadata: Title and tagline above gallery with subtle dark gradient */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-4 sm:p-6 md:p-8 bg-gradient-to-t from-[#0B0C11]/95 via-[#0B0C11]/60 to-transparent transition-opacity duration-700 ease-out"
        style={{
          opacity: showFinalUI ? 1 : 0,
          pointerEvents: showFinalUI ? 'auto' : 'none',
        }}
      >
        <footer className="final-ui-item flex flex-col justify-end w-full pointer-events-auto max-w-[640px]">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.025em] leading-tight text-white drop-shadow-md">
              Photography <span className="italic font-serif">and</span> videography
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#C9C9CF] font-sans font-normal leading-relaxed drop-shadow-sm">
              Drag or scroll to explore.
            </p>
          </div>
        </footer>
      </div>

      {/* Expanded Lightbox Modal */}
      <Lightbox
        item={selectedItem}
        totalItems={items.length}
        originRect={selectedOriginRect}
        onClose={handleCloseLightbox}
        onPrev={handlePrevItem}
        onNext={handleNextItem}
      />
    </div>
  );
};

export const PhotographyPage = Photography;
export default Photography;
