import React, { useRef, useState, useEffect } from 'react';
import { SkillCategory } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Chip } from '../common/Chip';
import { TECH_MARQUEE } from '../../config/design';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Code2, Layers, Cpu, Sparkles, Terminal } from 'lucide-react';

interface SkillsSectionProps {
  categories: SkillCategory[];
  className?: string;
}



// Mini chip icons (14x14)
const MINI_ICONS: Record<string, React.ReactNode> = {
  python: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M14.25 0v2.625h2.625V4.5H12c-3.314 0-6 2.686-6 6v1.875H3.375V9.75H1.5V15h2.625v-2.625H6V14.25c0 3.314 2.686 6 6 6h4.875v1.875H19.5V19.5h-2.625v-1.875H22.5V12h-2.625v2.25H12c-2.071 0-3.75-1.679-3.75-3.75V9h9c1.657 0 3-1.343 3-3V1.5h-3V3h-2.625V0h-4.5zM8.25 4.125a1.125 1.125 0 110 2.25 1.125 1.125 0 010-2.25zm7.5 13.5a1.125 1.125 0 110 2.25 1.125 1.125 0 010-2.25z" />
    </svg>
  ),
  java: (
    <svg role="img" viewBox="5 0 15 18" fill="currentColor" className="w-3 h-3.5">
      <path d="M9.06 14.39s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .5-.322-.504-.54-1.745-.378-3.324-.378-5.118.037zm-1.042-2.392s-1.08.798 1.056.983c2.72.235 4.996.113 7.828-.484 0 0 .614-.428-.506-.677-2.31-.513-5.32-.486-8.378.178zm10.741-3.791c.203.498.11 1.036-.34 1.488-1.08 1.087-2.81 1.626-4.992 1.944.382-.44.604-.962.604-1.528 0-.416-.123-.812-.348-1.168 1.922-.16 3.794-.74 5.076-.736zm-4.832 2.766c-.394.048-.802.083-1.223.106-2.67.147-5.467-.282-7.397-1.157 0 0-.616.48 1.05.814 2.153.432 4.908.412 7.57-.14 0 0 .53-.29-.0-.623zm-1.127-10.973c-.707 1.36-1.517 2.72-2.428 4.167-.64.99-1.187 2.015-1.187 3.12 0 1.614 1.189 2.68 2.842 2.68 1.478 0 2.494-.93 2.494-2.237 0-1.36-1.045-2.348-1.72-3.5-.707-1.204-.53-2.68-.53-4.23h.529zm2.384 5.306c-.497.835-1.009 1.664-1.009 2.592 0 1.123.832 1.902 1.993 1.902 1.058 0 1.785-.622 1.785-1.491 0-.908-.742-1.566-1.222-2.335-.503-.804-.375-1.788-.375-2.762h.375c-.24.728-.413 1.438-.047 2.094z" />
    </svg>
  ),
  html: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M1.5 0h21l-1.91 21.563L12.01 24l-8.58-2.437L1.5 0zm15.776 5.547H6.724l.235 2.656h10.082l-.275 3.094H9.69l.275 3.093h7.034l-.47 5.156-4.529 1.25-4.53-1.25-.314-3.532H5.04l.588 6.562L12 21.844l6.372-1.781.932-10.438-.035-.375H7.954l-.275-3.093h9.378l.275-3.094z" />
    </svg>
  ),
  css: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M1.5 0h21l-1.91 21.563L12.01 24l-8.58-2.437L1.5 0zm17.276 5.547H5.224l.235 2.656h13.082l-.275 3.094H7.94l.275 3.093h10.061l-.548 6.156-3.728 1.031-3.728-1.031-.255-2.844H6.38l.47 5.156L12 21.844l5.15-1.406.826-9.375H8.225l.275-3.093h10.552l.224-2.433z" />
    </svg>
  ),
  c: (
    <svg role="img" viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M15.2 8.2c-.85-.6-1.9-.95-3.05-.95-2.9 0-5.2 2.1-5.2 4.75s2.3 4.75 5.2 4.75c1.15 0 2.2-.35 3.05-.95l-.65-1.25c-.65.45-1.45.7-2.4.7-2.05 0-3.65-1.5-3.65-3.25s1.6-3.25 3.65-3.25c.95 0 1.75.25 2.4.7l.65-1.25z"
        fill="currentColor"
      />
    </svg>
  ),
  github: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  categories,
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

  // "Learning now" gets the dashed tile at the end; every other category gets a regular tile
  const isLearning = (name: string) => name.toLowerCase().includes('learning');
  const mainCategories = categories.filter((c) => !isLearning(c.categoryName));
  const learningCategory = categories.find((c) => isLearning(c.categoryName));
  const tileIcons = [Code2, Layers, Cpu, Terminal];

  // Marquee: every skill outside "Learning now"
  const marqueeItems = mainCategories.flatMap((c) => c.skills).map((sk) => ({ name: sk.name }));

  const renderSkillChip = (name: string) => {
    const key = name.toLowerCase();
    const icon =
      key === 'python' || key === 'advanced python'
        ? MINI_ICONS.python
        : key === 'java'
        ? MINI_ICONS.java
        : key === 'html'
        ? MINI_ICONS.html
        : key === 'css'
        ? MINI_ICONS.css
        : key === 'c'
        ? MINI_ICONS.c
        : key === 'github'
        ? MINI_ICONS.github
        : key.includes('prompt')
        ? <Terminal className="w-3.5 h-3.5 text-white/80 shrink-0" />
        : null;

    return (
      <Chip key={name} variant="default" icon={icon}>
        {name}
      </Chip>
    );
  };

  return (
    <section
      id="skills"
      ref={containerRef}
      aria-label="Skills"
      className={`w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 lg:py-24 scroll-mt-24 ${className}`}
    >
      {/* 03 "Core *skills*" */}
      <SectionHeading
        index="03"
        label="Skills"
        title="Core *skills*"
        align="left"
      />

      <div className="space-y-8">
        {/* TECH_MARQUEE: 60s loop scrolling row of monochrome logos / chips */}
        {TECH_MARQUEE && (
          <div
            className="group group-marquee relative w-full overflow-hidden py-5 sm:py-6 rounded-[28px] glass-card border border-white/10"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            }}
          >
            <div className="flex w-max items-center animate-marquee gap-10 sm:gap-14 select-none">
              {/* Track 1 */}
              <div className="flex items-center gap-10 sm:gap-14">
                {marqueeItems.concat(marqueeItems).map((item, idx) => (
                  <div
                    key={`track1-${idx}`}
                    className="flex items-center text-[#B4B4BA] opacity-90 hover:opacity-100 transition-opacity duration-180 shrink-0"
                  >
                    <span className="text-[14px] sm:text-[15px] font-sans font-medium text-[#B4B4BA] whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Track 2 (duplicated, aria-hidden for seamless loop) */}
              <div className="flex items-center gap-10 sm:gap-14" aria-hidden="true">
                {marqueeItems.concat(marqueeItems).map((item, idx) => (
                  <div
                    key={`track2-${idx}`}
                    className="flex items-center text-[#B4B4BA] opacity-90 hover:opacity-100 transition-opacity duration-180 shrink-0"
                  >
                    <span className="text-[14px] sm:text-[15px] font-sans font-medium text-[#B4B4BA] whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bento Grid: stack cleanly on phones (390px) into 1 col with zero overflow, 2-col on tablets, 12-col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
          {[...mainCategories, ...(learningCategory ? [learningCategory] : [])].map((cat, i) => {
            const learning = cat === learningCategory;
            const Icon = learning ? Sparkles : tileIcons[i % tileIcons.length];
            return (
              <div
                key={cat.categoryName}
                className={`${learning ? 'md:col-span-2 lg:col-span-6' : i < 3 ? 'lg:col-span-4' : 'lg:col-span-6'} transition-all duration-700 ease-out`}
                style={{
                  opacity: prefersReducedMotion || inView ? 1 : 0,
                  transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
                  transitionDelay: prefersReducedMotion ? '0ms' : `${(i + 1) * 80}ms`,
                }}
              >
                <GlassCard
                  variant="default"
                  radius="small"
                  className={`flex flex-col h-full !p-5 sm:!p-6 space-y-3.5 ${learning ? 'glass-card-dashed' : ''}`}
                >
                  <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                    <Icon className="w-3.5 h-3.5 text-[#C9C9CF] shrink-0" />
                    <span>{cat.categoryName}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {cat.skills.map((sk) => renderSkillChip(sk.name))}
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
