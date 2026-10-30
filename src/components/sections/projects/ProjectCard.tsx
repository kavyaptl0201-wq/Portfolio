import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ProjectItem } from '../../../data/content.schema';
import { WindowFrame } from '../../common/WindowFrame';
import { ProjectMockup } from '../ProjectMockup';
import { GlassCard } from '../../common/GlassCard';
import { Chip } from '../../common/Chip';
import { TILT, STICKY_PROJECTS } from '../../../config/design';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { ArrowRight, ExternalLink, Github, Check } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  totalProjects: number;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  totalProjects,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [isPointerFine, setIsPointerFine] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });
  const [parallaxY, setParallaxY] = useState(0);
  const [scale, setScale] = useState(1);
  const [contentOpacity, setContentOpacity] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateMedia = () => {
      setIsPointerFine(window.matchMedia('(pointer: fine)').matches);
      setIsMobile(window.innerWidth < 1024);
    };
    updateMedia();
    window.addEventListener('resize', updateMedia, { passive: true });
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  // Parallax and Sticky Stacking Scale/Dimming calculations
  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;

    // 1. Scroll Parallax (+-20px) for screenshot inside window
    if (TILT && !prefersReducedMotion) {
      const cardCenter = rect.top + rect.height / 2;
      const progress = (cardCenter - viewportH / 2) / (viewportH / 2);
      const clampedP = Math.max(-1, Math.min(1, progress));
      setParallaxY(clampedP * 20);
    }

    // 2. Sticky stacking: When a card is covered by the next, collapse it to a clean 20px peek strip,
    // fade its content to opacity 0 and clip it (overflow hidden), scale 0.96.
    if (STICKY_PROJECTS && !isMobile && !prefersReducedMotion && index < totalProjects - 1) {
      const myStickyTop = 96 + index * 20;
      const nextCard = cardRef.current.parentElement?.children[index + 1] as HTMLElement | null;
      if (nextCard) {
        const nextRect = nextCard.getBoundingClientRect();
        const cardHeight = cardRef.current.offsetHeight || rect.height;
        const cardBottom = myStickyTop + cardHeight;
        const totalCoverDistance = cardHeight - 20;
        const coveredDistance = cardBottom - nextRect.top;
        const coverProgress = Math.max(0, Math.min(1, coveredDistance / totalCoverDistance));

        // Sticky stacking: keep card content visible (only slightly dimmed to ~0.8 and scaled to 0.96)
        const newOpacity = 1 - coverProgress * 0.2;
        setContentOpacity(newOpacity);

        // Smooth scale down to 0.96 as card gets covered
        setScale(1 - coverProgress * 0.04);
      }
    }
  }, [STICKY_PROJECTS, TILT, index, isMobile, prefersReducedMotion, totalProjects]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    const lenis = (window as unknown as { __lenis?: { on: (event: string, fn: () => void) => void; off: (event: string, fn: () => void) => void } }).__lenis;
    if (lenis) {
      lenis.on('scroll', onScroll);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (lenis) {
        lenis.off('scroll', onScroll);
      }
    };
  }, [handleScroll]);

  // Pointer Tilt (up to 4 degrees toward pointer)
  const handleWindowPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!TILT || !isPointerFine || prefersReducedMotion || !windowRef.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 4;
    const rotY = ((x - centerX) / centerX) * 4;
    setTiltStyle({ rotateX: rotX, rotateY: rotY });
  };

  const handleWindowPointerLeave = () => {
    setTiltStyle({ rotateX: 0, rotateY: 0 });
  };

  const isEven = index % 2 === 0;
  const isStickyActive = STICKY_PROJECTS && !isMobile && !prefersReducedMotion;

  const hasRealCaseStudy = Boolean(
    project.caseStudy ||
      project.role?.trim() ||
      project.context?.trim() ||
      project.challenges?.trim()
  );
  const liveUrl = project.liveSiteUrl || project.liveDemoUrl;
  const githubUrl = project.githubUrl;

  const displayChips = project.featureChips
    ? project.featureChips
    : [...(project.statChips || []), ...(project.extraChip ? [project.extraChip] : [])];

  return (
    <div
      ref={cardRef}
      className={`w-full transition-all duration-300 ease-out ${
        isStickyActive
          ? index === totalProjects - 1
            ? 'sticky mb-16'
            : 'sticky mb-32 lg:mb-48'
          : 'mb-12 md:mb-16'
      }`}
      style={{
        zIndex: index + 10,
        top: isStickyActive ? `${96 + index * 20}px` : undefined,
        transform: isStickyActive ? `scale(${scale})` : undefined,
        transformOrigin: 'center top',
        willChange: isStickyActive ? 'transform' : undefined,
      }}
    >
      <GlassCard
        variant="default"
        radius="large"
        hoverEffect={false}
        className="p-5 sm:p-8 md:p-12 glass-card-opaque overflow-hidden"
      >
        <div
          className="transition-opacity duration-200 ease-out"
          style={{ opacity: contentOpacity }}
        >
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center`}
          >
          {/* macOS Window Frame Image Area (~60% / 7 cols) */}
          <div
            className={`w-full lg:col-span-7 ${
              isEven ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            <div
              ref={windowRef}
              onPointerMove={handleWindowPointerMove}
              onPointerLeave={handleWindowPointerLeave}
              className="w-full transition-transform duration-300 ease-out"
              style={{
                perspective: '1000px',
                transform:
                  TILT && isPointerFine && !prefersReducedMotion
                    ? `rotateX(${tiltStyle.rotateX}deg) rotateY(${tiltStyle.rotateY}deg)`
                    : undefined,
              }}
            >
              <WindowFrame
                title={project.id === 'landsafe' ? 'si-h-2026.vercel.app' : `${project.id}.app`}
                className="w-full"
              >
                <ProjectMockup project={project} parallaxY={parallaxY} />
              </WindowFrame>
            </div>
          </div>

          {/* Project Metadata & Actions (~40% / 5 cols) */}
          <div
            className={`flex flex-col justify-center space-y-6 lg:col-span-5 ${
              isEven ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            {/* Status Chip */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Chip variant="status">
                {project.status}
              </Chip>
            </div>

            {/* Title & One-liner in AA Contrast */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-[#F5F5F7] leading-tight">
                {project.title}
              </h3>
              <p className="text-[15px] sm:text-[17px] text-[#B4B4BA] font-normal leading-[1.6]">
                {project.oneLiner || project.outcome}
              </p>
            </div>

            {/* Tech Stack Chips (monochrome neutral chips) */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                    Tech stack
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Chip key={tech} variant="default">
                      {tech}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Feature / Stat Chips */}
            {displayChips.length > 0 && !project.techStack?.length && (
              <div className="flex flex-wrap gap-2 pt-1">
                {displayChips.map((chip) => (
                  <Chip key={chip} variant="default">
                    {chip}
                  </Chip>
                ))}
              </div>
            )}

            {/* Measurable Results Bullets */}
            {project.results && project.results.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                    Key results
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {project.results.slice(0, 3).map((res, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#B4B4BA] leading-snug">
                      <Check className="w-3.5 h-3.5 text-white/80 mt-0.5 shrink-0" />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons: Capsule, no transform, only 180ms hover */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* Primary: View live site (only shown when deployed) */}
              {liveUrl && liveUrl.trim().length > 0 && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View live site for ${project.title}`}
                  className="apple-button-white-3d inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-[14px] font-medium tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>View live site</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              )}

              {/* Secondary: Read case study (only if the project has case study content) */}
              {hasRealCaseStudy && (
                <Link
                  to={`/projects/${project.id}`}
                  aria-label={`Read case study for ${project.title}`}
                  className="apple-glass-chip apple-glass-chip-button apple-glass-chip-interactive inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[#F2F2F4] text-[14px] font-medium tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Read case study</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              )}

              {/* Code link: Matches View live site size and layout, GitHub icon and Code on one line */}
              {githubUrl && githubUrl.trim().length > 0 && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View source code for ${project.title}`}
                  className="apple-glass-chip apple-glass-chip-button apple-glass-chip-interactive inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[#F2F2F4] text-[14px] font-medium tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Github className="w-3.5 h-3.5 shrink-0" />
                  <span>Code</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  </div>
  );
};
