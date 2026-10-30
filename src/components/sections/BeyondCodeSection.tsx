import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreativeSectionData } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Camera, Palette, ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface BeyondCodeSectionProps {
  creative?: CreativeSectionData;
  className?: string;
}

export const BeyondCodeSection: React.FC<BeyondCodeSectionProps> = ({
  creative,
  className = '',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
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

  if (!creative) return null;

  const { introLine, photography, artCraft } = creative;

  const cards = [
    {
      ...photography,
      icon: Camera,
      buttonText: 'View photo & video',
      url: '/photography',
    },
    {
      ...artCraft,
      icon: Palette,
      buttonText: 'View painting & craft',
      url: '/art-craft',
    },
  ];

  return (
    <section
      id="beyond-code"
      ref={containerRef}
      aria-label="Beyond Code"
      className={`w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 lg:py-24 scroll-mt-24 ${className}`}
    >
      {/* 05 "Beyond *code*" */}
      <SectionHeading
        index="05"
        label="Creative"
        title="Beyond *code*"
        subtitle={introLine || "When I'm not coding, I'm usually behind a camera or with a paintbrush."}
        align="left"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {cards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="flex flex-col h-full transition-all duration-700 ease-out"
              style={{
                opacity: prefersReducedMotion || inView ? 1 : 0,
                transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: prefersReducedMotion ? '0ms' : `${80 + idx * 80}ms`,
              }}
            >
              <GlassCard
                variant="default"
                radius="large"
                hoverEffect={false}
                className="flex-1 p-6 sm:p-8 md:p-10 relative overflow-hidden h-full flex flex-col"
              >
                {/* Soft blurred monochrome texture inside tile */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)] blur-2xl"
                />

                <div className="flex flex-col justify-between h-full w-full flex-1">
                  <div className="space-y-4 sm:space-y-5 relative z-10 flex-1">
                    {/* Neutral Line Icon */}
                    <div className="w-12 h-12 rounded-[16px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#F5F5F7] leading-tight">
                      {card.title}
                    </h3>

                    {/* Short description in AA contrast */}
                    <p className="text-[15px] sm:text-[17px] text-[#B4B4BA] font-normal leading-[1.6]">
                      {card.description}
                    </p>
                  </div>

                  {/* Action Button: White pill with dark text, bottom aligned at equal height */}
                  <div className="mt-8 pt-2 relative z-10 flex items-center">
                    <Link
                      to={card.url}
                      data-sound="button"
                      className="apple-button-white-3d group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[#0A0A0C] text-[14px] sm:text-[15px] font-semibold py-[12px] px-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      aria-label={card.buttonText}
                    >
                      <span className="whitespace-nowrap">{card.buttonText}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#0A0A0C] shrink-0 transition-transform duration-250 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </section>
  );
};
