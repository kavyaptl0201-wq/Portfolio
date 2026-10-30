import React, { useRef, useState, useEffect } from 'react';
import { AboutSectionData, PortfolioContent, NowConfig } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Chip } from '../common/Chip';
import { TerminalTile } from './about/TerminalTile';
import { GraduationCap, Sparkles, Hammer, BookOpen } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface AboutSectionProps {
  about: AboutSectionData;
  personal?: PortfolioContent['personal'];
  availability?: PortfolioContent['availability'];
  now?: NowConfig;
  educationText?: string;
  currentlyLearning?: string[];
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  about,
  personal,
  availability,
  now,
  educationText = "",
  currentlyLearning = [],
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
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Fallbacks from personal if provided
  const fullName = personal?.fullName || "";
  const role = personal?.roleLine?.split(' at ')[0] || "";
  const from = personal?.hometown || "";
  const skills = personal?.primarySkills || [];
  const statusText = availability?.statusText || "open to internships";

  // Now tile data
  const buildingList = now?.building || [];
  const learningList = now?.learning || currentlyLearning;
  const hasNowContent = buildingList.length > 0 || learningList.length > 0;

  return (
    <section
      id="about"
      ref={containerRef}
      aria-label="About me"
      className={`w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 lg:py-24 scroll-mt-24 ${className}`}
    >
      {/* 01 "About *me*" */}
      <SectionHeading
        index="01"
        label="About"
        title="About *me*"
        align="left"
      />

      {/* 12-column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 1. Intro Tile (Cols 1-7, 2 rows): 3 About paragraphs */}
        <div
          className={`lg:col-span-7 ${hasNowContent ? 'lg:row-span-2' : ''} flex flex-col transition-all duration-700 ease-out`}
          style={{
            opacity: prefersReducedMotion || inView ? 1 : 0,
            transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
            transitionDelay: prefersReducedMotion ? '0ms' : '80ms',
          }}
        >
          <GlassCard
            variant="default"
            radius="large"
            className="flex-1 flex flex-col justify-between space-y-6 p-5 sm:p-8 md:p-10"
          >
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                <span>Biography</span>
                <span className="w-8 h-px bg-white/15" />
              </div>

              {about.storyParagraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-[16px] sm:text-[18px] text-[#B4B4BA] leading-[1.6] font-normal"
                >
                  {para}
                </p>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* 2. Education Tile (Cols 8-12, Row 1) */}
        <div
          className="lg:col-span-5 flex flex-col transition-all duration-700 ease-out"
          style={{
            opacity: prefersReducedMotion || inView ? 1 : 0,
            transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
            transitionDelay: prefersReducedMotion ? '0ms' : '160ms',
          }}
        >
          <GlassCard
            variant="default"
            radius="large"
            className="flex-1 flex flex-col justify-between p-5 sm:p-7 md:p-9 space-y-4"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                <GraduationCap className="w-4 h-4 text-white/80" />
                <span>Education</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-[22px] font-semibold text-[#F5F5F7] tracking-[-0.02em] leading-snug">
                  {personal?.college}
                </h3>
                <p className="text-[15px] sm:text-[16px] text-[#B4B4BA] font-normal leading-relaxed">
                  {educationText.replace(personal?.college || '', '').replace(/^,\s*/, '')}
                </p>
                {personal?.graduationYear && (
                  <div className="pt-1">
                    <span className="font-sans font-medium text-[13px] text-[#C9C9CF]">
                      Expected Graduation: {personal.graduationYear}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 3. "Now" Tile (Cols 8-12, Row 2) - Hidden if both empty */}
        {hasNowContent && (
          <div
            className="lg:col-span-5 flex flex-col transition-all duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion || inView ? 1 : 0,
              transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: prefersReducedMotion ? '0ms' : '240ms',
            }}
          >
            <GlassCard
              variant="default"
              radius="large"
              className="flex-1 flex flex-col justify-between p-5 sm:p-7 md:p-9 space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                  <Sparkles className="w-4 h-4 text-white/80" />
                  <span>Now</span>
                </div>

                {/* Building section */}
                {buildingList.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                      <Hammer className="w-3.5 h-3.5 text-white/70" />
                      <span>Building</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {buildingList.map((item, idx) => {
                        const name = typeof item === 'string' ? item : item.name;
                        const status = typeof item === 'object' ? item.status : 'In development';
                        return (
                          <div
                            key={idx}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <Chip variant="default">{name}</Chip>
                            {status && (
                              <Chip variant="status" status="in-development">
                                {status}
                              </Chip>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Learning section */}
                {learningList.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                      <BookOpen className="w-3.5 h-3.5 text-white/70" />
                      <span>Learning</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {learningList.map((item) => (
                        <Chip key={item} variant="default">
                          {item}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* 4. Terminal Tile (Cols 1-12, Row 3) */}
        <div
          className="lg:col-span-12 transition-all duration-700 ease-out pt-2"
          style={{
            opacity: prefersReducedMotion || inView ? 1 : 0,
            transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
            transitionDelay: prefersReducedMotion ? '0ms' : '320ms',
          }}
        >
          <TerminalTile
            fullName={fullName}
            role={role}
            from={from}
            skills={skills}
            statusText={statusText}
          />
        </div>
      </div>
    </section>
  );
};
