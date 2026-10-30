import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { MONO_ACCENT_LABELS } from '../../config/design';

export interface SectionHeadingProps {
  index?: string;
  label?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  index,
  label,
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Format index line: e.g. "01 / About" followed by 40px hairline
  const indexText = index && label ? `${index} / ${label}` : index || eyebrow || '';

  // Parse title tokens: words wrapped in *word* render as Inter italic 300
  const words = title.split(' ');
  const alignClass = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';

  return (
    <div
      ref={containerRef}
      className={`relative w-full mb-12 md:mb-16 flex flex-col ${alignClass} ${className}`}
    >
      {/* Local pool of light behind each section heading (radial, 4% white) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-16 ${
          align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0 sm:-left-12'
        } w-[min(420px,100%)] max-w-full h-[260px] rounded-full bg-[radial-gradient(ellipse,rgba(232,72,79,0.07)_0%,transparent_70%)] blur-2xl z-0`}
      />

      {/* Small index line, 13px, sentence case, followed by 40px hairline */}
      {indexText && (
        <div className="relative z-10 flex items-center gap-3 mb-4 select-none">
          <span
            className={`text-[13px] tracking-normal ${
              MONO_ACCENT_LABELS
                ? 'font-mono text-[#9A9AA0] font-normal'
                : 'font-sans font-semibold uppercase tracking-[0.18em] text-[12px] text-accent'
            }`}
          >
            {indexText}
          </span>
          <span className="w-10 h-px bg-accent opacity-60 inline-block" />
        </div>
      )}

      {/* Title: clamp(32px, 6.5vw, 96px), weight 600, tracking -0.035em, line-height 1.15 */}
      <h2
        className="relative z-10 font-apple tracking-[-0.035em] leading-[1.15] overflow-visible"
        style={{ fontSize: 'clamp(32px, 6.5vw, 96px)' }}
        aria-label={title.replace(/\*/g, '')}
      >
        {words.map((rawWord, i) => {
          const isItalic = rawWord.startsWith('*') && rawWord.endsWith('*');
          const cleanWord = isItalic ? rawWord.slice(1, -1) : rawWord;

          return (
            <React.Fragment key={i}>
              {i > 0 && ' '}
              {/* align-top: an overflow-hidden inline-block takes its baseline from its bottom edge,
                  so baseline alignment would push the bold and italic words out of line */}
              <span
                className={`inline-block align-top py-1 ${isItalic ? 'overflow-visible' : 'overflow-hidden'}`}
              >
                <span
                  className={`inline-block align-baseline transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isItalic
                      ? 'font-light italic text-[#F5F5F7] tracking-normal pr-[0.2em]'
                      : 'metallic-text-gradient font-semibold'
                  }`}
                  style={{
                    transform: prefersReducedMotion || isInView ? 'translateY(0%)' : 'translateY(115%)',
                    transitionDelay: prefersReducedMotion ? '0ms' : `${i * 65}ms`,
                    ...(isItalic ? { display: 'inline-block', verticalAlign: 'baseline', paddingRight: '0.2em' } : {}),
                  }}
                >
                  {cleanWord}
                </span>
              </span>
            </React.Fragment>
          );
        })}
      </h2>

      {/* Optional subtitle 15px/18px, #B4B4BA, max 56ch */}
      {subtitle && (
        <p
          className="relative z-10 mt-3 sm:mt-5 text-[15px] sm:text-[18px] text-[#B4B4BA] font-normal leading-[1.6] max-w-[56ch] transition-opacity duration-700 ease-out"
          style={{
            opacity: prefersReducedMotion || isInView ? 1 : 0,
            transitionDelay: prefersReducedMotion ? '0ms' : `${words.length * 65 + 80}ms`,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
