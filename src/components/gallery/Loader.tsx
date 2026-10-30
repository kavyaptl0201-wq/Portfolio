import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export interface LoaderProps {
  progress: number; // 0 to 100
  isVisible: boolean;
  onSkip?: () => void;
  brandText?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  progress,
  isVisible,
  onSkip,
  brandText = 'Kavya.',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordmarkRef = useRef<HTMLDivElement | null>(null);
  const skipBtnRef = useRef<HTMLButtonElement | null>(null);

  const [displayDigits, setDisplayDigits] = useState({ h: ' ', t: ' ', u: '0' });
  const [showSkip, setShowSkip] = useState(false);

  // Update rolling digits
  useEffect(() => {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    if (clamped >= 100) {
      setDisplayDigits({ h: '1', t: '0', u: '0' });
    } else if (clamped >= 10) {
      const str = String(clamped);
      setDisplayDigits({ h: ' ', t: str[0], u: str[1] });
    } else {
      setDisplayDigits({ h: ' ', t: ' ', u: String(clamped) });
    }
  }, [progress]);

  // Wordmark letter reveal and skip button timer (0.4s)
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 400);

    // Letter-by-letter reveal
    if (wordmarkRef.current) {
      const letters = wordmarkRef.current.querySelectorAll('.wordmark-letter');
      gsap.fromTo(
        letters,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out' }
      );
    }

    return () => clearTimeout(skipTimer);
  }, []);

  // Fade out loader when isVisible becomes false (2.3s -> 2.7s in master timeline)
  useEffect(() => {
    if (!isVisible && containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        filter: 'blur(6px)',
        duration: 0.4,
        ease: 'power2.inOut',
        pointerEvents: 'none',
      });
    }
  }, [isVisible]);

  // Digits array for slot reel
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Helper to get index for digit
  const getDigitIndex = (char: string) => {
    const num = parseInt(char, 10);
    return isNaN(num) ? 0 : num;
  };

  const isRollingFast = progress > 5 && progress < 99;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-6 md:p-12 transition-colors duration-500 bg-[#0B0C11]"
    >
      {/* Top-Left Brand Wordmark typing in at 0.0s - 0.45s */}
      <div className="flex items-center">
        <div ref={wordmarkRef} className="text-[20px] md:text-[24px] font-semibold tracking-[-0.02em] text-[#F5F5F7] select-none">
          {brandText.split('').map((char, index) => (
            <span key={index} className="wordmark-letter inline-block">
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Skip Intro Capsule Button (appears at 0.4s) */}
      {showSkip && isVisible && onSkip && (
        <button
          ref={skipBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          data-sound="button"
          aria-label="Skip introductory animation"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-12 md:left-12 md:translate-x-0 z-[60] pointer-events-auto apple-glass-chip apple-glass-chip-button apple-glass-chip-interactive min-h-[44px] px-5 text-[#F5F5F7] hover:text-white text-[14px] font-medium tracking-[-0.01em] shadow-2xl flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white select-none"
        >
          <span>Skip intro</span>
          <ArrowRight className="w-4 h-4 text-white/80" />
        </button>
      )}

      {/* Bottom-Right Large Rolling Counter (~100px) */}
      <div
        className="self-end text-right select-none"
        aria-hidden="true"
        style={{
          filter: isRollingFast ? 'blur(0.8px)' : 'none',
          transition: 'filter 0.2s ease',
        }}
      >
        {/* Tiny sentence-case label positioned directly above the "%" sign */}
        <div className="flex justify-end mb-1">
          <span className="text-[13px] text-[#C9C9CF] font-sans font-medium tracking-[-0.01em]">
            Loading frames
          </span>
        </div>

        {/* Counter & Percentage sign in metallic gradient */}
        <div className="inline-flex items-baseline font-bold tracking-tight text-[72px] sm:text-[96px] md:text-[112px] leading-none metallic-counter-text">
          {/* Hundreds Column (only visible at 100) */}
          {displayDigits.h === '1' && (
            <div className="slot-reel w-[0.6em]">
              <div
                className="slot-reel-strip"
                style={{ transform: 'translateY(-100%)' }}
              >
                <div className="slot-digit">&nbsp;</div>
                <div className="slot-digit">1</div>
              </div>
            </div>
          )}

          {/* Tens Column */}
          {displayDigits.t !== ' ' && (
            <div className="slot-reel w-[0.6em]">
              <div
                className="slot-reel-strip"
                style={{
                  transform: `translateY(-${getDigitIndex(displayDigits.t) * 10}%)`,
                }}
              >
                {digits.map((d) => (
                  <div key={d} className="slot-digit">
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units Column */}
          <div className="slot-reel w-[0.6em]">
            <div
              className="slot-reel-strip"
              style={{
                transform: `translateY(-${getDigitIndex(displayDigits.u) * 10}%)`,
              }}
            >
              {digits.map((d) => (
                <div key={d} className="slot-digit">
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Percent Sign */}
          <span className="ml-1 text-[0.6em] font-normal text-[#A1A1AA]">%</span>
        </div>
      </div>
    </div>
  );
};
