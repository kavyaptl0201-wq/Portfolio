import React, { useState, useEffect } from 'react';
import { resolvedPortfolioContent } from '../data/resolve';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useAnalytics } from '../hooks/useAnalytics';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { getHeroIntroPlayed, markHeroIntroPlayed } from '../utils/introState';
import { soundEngine } from '../audio/soundEngine';
import { scrollToSection } from '../utils/scroll';

// Navigation & Common
import { PillNav } from '../components/common/PillNav';
import { MobileNav } from '../components/common/MobileNav';
import { BackToTop } from '../components/common/BackToTop';
import { AmbientBackground } from '../components/common/AmbientBackground';

// Curated Sections
import { Hero } from '../components/sections/Hero';
import { AboutSection } from '../components/sections/AboutSection';
import { ProjectsGrid } from '../components/sections/ProjectsGrid';
import { SkillsSection } from '../components/sections/SkillsSection';
import { HighlightsSection } from '../components/sections/HighlightsSection';
import { BeyondCodeSection } from '../components/sections/BeyondCodeSection';
import { ContactSection } from '../components/sections/ContactSection';
import { Footer } from '../components/sections/Footer';

// Case Study Quick-Preview Modal
import { CaseStudyModal } from '../components/case-study/CaseStudyModal';
import { ProjectItem } from '../data/content.schema';

interface HomePageProps {
  theme?: string;
  resolvedTheme?: string;
  onToggleTheme?: () => void;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const {
    personal,
    projects,
    skills,
    achievements,
    certifications,
    activities,
    recommendations,
    about,
    now,
    creative,
    social,
    contact,
    contactButtons,
    availability,
    meta,
    seo,
  } = resolvedPortfolioContent;

  const hasHighlights =
    achievements.length > 0 ||
    certifications.length > 0 ||
    activities.length > 0 ||
    recommendations.length > 0;

  const sectionIds = React.useMemo(
    () => [
      'hero',
      'about',
      'projects',
      'skills',
      ...(hasHighlights ? ['highlights'] : []),
      'beyond-code',
      'contact',
    ],
    [hasHighlights]
  );

  // Initialize Lenis smooth scroll (respects reduced motion & flag)
  useSmoothScroll();

  const [activeSection, setActiveSection] = useScrollSpy(sectionIds, 150);
  const { trackResumeDownload, trackProjectClick } = useAnalytics(meta.analyticsId);

  // Active Project for Case Study Quick-Preview Modal
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Hash change detection (for #project-{id})
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#project-')) {
        const id = hash.replace('#project-', '');
        if (projects.some((p) => p.id === id)) {
          setSelectedProjectId(id);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [projects]);

  const selectedProject: ProjectItem | null =
    projects.find((p) => p.id === selectedProjectId) || null;

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    soundEngine.play('state');
    trackProjectClick(id, 'casestudy');
    window.history.pushState(null, '', `#project-${id}`);
  };

  const handleCloseProject = () => {
    setSelectedProjectId(null);
    if (window.location.hash.startsWith('#project-')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleNextProject = () => {
    if (!selectedProjectId) return;
    const activeProjects = projects.filter((p) => !p.comingSoon);
    const currentIndex = activeProjects.findIndex((p) => p.id === selectedProjectId);
    const nextIndex = (currentIndex + 1) % activeProjects.length;
    handleOpenProject(activeProjects[nextIndex].id);
  };

  const handlePrevProject = () => {
    if (!selectedProjectId) return;
    const activeProjects = projects.filter((p) => !p.comingSoon);
    const currentIndex = activeProjects.findIndex((p) => p.id === selectedProjectId);
    const prevIndex = (currentIndex - 1 + activeProjects.length) % activeProjects.length;
    handleOpenProject(activeProjects[prevIndex].id);
  };

  const resumeUrl = '/resume.pdf';

  // Extract enabled real social profiles for sameAs schema
  const sameAsLinks = Object.values(social)
    .filter((s) => s.enabled && s.url && s.url.startsWith('http') && !s.isDemo)
    .map((s) => s.url);

  // Dynamic Document Head Management
  useDocumentHead({
    title: seo?.siteTitle || `${personal.fullName} - Portfolio`,
    description: seo?.siteDescription || `Portfolio of ${personal.fullName}.`,
    canonicalUrl: seo?.canonicalUrl || `${window.location.origin}/`,
    ogImage: '/og-image.png',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: personal.fullName,
      jobTitle: personal.roleLine,
      description: seo?.siteDescription || `Portfolio of ${personal.fullName}.`,
      url: seo?.canonicalUrl || window.location.origin,
      sameAs: sameAsLinks.length > 0 ? sameAsLinks : undefined,
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: personal.college,
      },
      knowsAbout: skills.flatMap((cat) => cat.skills).map((s) => s.name),
    },
  });

  // Section deep link on load (e.g. /#projects): skip the intro and jump to that section
  const [initialSection] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const id = window.location.hash.slice(1);
    return ['about', 'projects', 'skills', 'highlights', 'beyond-code', 'contact'].includes(id)
      ? id
      : null;
  });

  useEffect(() => {
    if (!initialSection) return;
    // Images and reveal animations above the section can still change the page height
    // for a few seconds after load, so keep it aligned until the visitor scrolls themselves.
    let userScrolled = false;
    const stopAligning = () => {
      userScrolled = true;
    };
    const align = () => {
      if (!userScrolled) scrollToSection(initialSection, { immediate: true });
    };
    const resizeObserver = new ResizeObserver(align);
    const stopTimer = window.setTimeout(() => resizeObserver.disconnect(), 4000);
    window.addEventListener('wheel', stopAligning, { passive: true });
    window.addEventListener('touchstart', stopAligning, { passive: true });
    window.addEventListener('keydown', stopAligning);

    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (document.getElementById(initialSection) && (window.__lenis || tries > 10)) {
        window.clearInterval(timer);
        setActiveSection(initialSection);
        align();
        resizeObserver.observe(document.body);
      } else if (tries > 40) {
        window.clearInterval(timer);
      }
    }, 100);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stopTimer);
      resizeObserver.disconnect();
      window.removeEventListener('wheel', stopAligning);
      window.removeEventListener('touchstart', stopAligning);
      window.removeEventListener('keydown', stopAligning);
    };
    // Runs once on mount; setActiveSection only uses stable state and refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSection]);

  const [isIntroAlreadyDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (initialSection) return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    return getHeroIntroPlayed();
  });

  const [navVisible, setNavVisible] = useState<boolean>(isIntroAlreadyDone);

  const handleNavFadeIn = React.useCallback(() => {
    setNavVisible(true);
  }, []);

  const handleIntroComplete = React.useCallback(() => {
    markHeroIntroPlayed();
    setNavVisible(true);
  }, []);

  // Shared 1px hairline divider between section bands
  const SectionDivider = () => (
    <div
      aria-hidden="true"
      className="w-full h-px max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto my-0 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none"
    />
  );

  return (
    <div className="relative min-h-screen text-[#F5F5F7] bg-transparent selection:bg-white/20 selection:text-white">
      {/* Ambient Background (Fixed, z-index 0, base color #0B0C11) */}
      <AmbientBackground />

      {/* Floating Centered Glass Pill Nav (Desktop) & Mobile Nav - z-50 */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500 ease-out transform ${
          navVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        <PillNav
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          preferredName={personal.preferredName}
          resumeUrl={resumeUrl}
          onDownloadResume={trackResumeDownload}
          hasHighlights={hasHighlights}
        />

        <MobileNav
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          preferredName={personal.preferredName}
          resumeUrl={resumeUrl}
          onDownloadResume={trackResumeDownload}
          hasHighlights={hasHighlights}
        />
      </div>

      {/* Main Semantic Landmark - z-1 */}
      <main id="main-content" className="relative z-[1]">
        {/* 1. Hero: normal-flow relative 100svh section with absolute canvas & z-index layering */}
        <div className="relative z-10">
          <Hero
            personal={personal}
            availability={availability}
            resumeUrl={resumeUrl}
            onDownloadResume={trackResumeDownload}
            isIntroAlreadyDone={isIntroAlreadyDone}
            onNavFadeIn={handleNavFadeIn}
            onIntroComplete={handleIntroComplete}
            onSelectSection={setActiveSection}
          />
        </div>

        {/* 2. Container for sections below hero */}
        <div className="relative z-[1]">
          {/* Hero Seam: 160px gradient transition at the bottom of hero so it blends with no visible edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none -mt-40 h-40 w-full bg-gradient-to-b from-transparent via-[#0B0C11]/40 to-transparent relative z-0"
          />

          {/* Section Band 1: About (transparent) */}
          <div className="w-full bg-transparent">
            <AboutSection
              about={about}
              personal={personal}
              availability={availability}
              now={now}
              educationText={personal.education}
              currentlyLearning={personal.currentlyLearning}
            />
          </div>

          <SectionDivider />

          {/* Section Band 2: Projects (transparent) */}
          <div className="w-full bg-transparent">
            <ProjectsGrid
              projects={projects}
              onSelectProject={handleOpenProject}
            />
          </div>

          <SectionDivider />

          {/* Section Band 3: Skills (transparent) */}
          <div className="w-full bg-transparent">
            <SkillsSection
              categories={skills}
            />
          </div>

          {hasHighlights && (
            <>
              <SectionDivider />
              {/* Section Band 4: Highlights (transparent) */}
              <div className="w-full bg-transparent">
                <HighlightsSection
                  achievements={achievements}
                  certifications={certifications}
                  activities={activities}
                  recommendations={recommendations}
                />
              </div>
            </>
          )}

          <SectionDivider />



          {/* Section Band 5: Beyond Code (transparent) */}
          <div className="w-full bg-transparent">
            <BeyondCodeSection
              creative={creative}
            />
          </div>

          <SectionDivider />

          {/* Section Band 6: Contact (transparent) */}
          <div className="w-full bg-transparent">
            <ContactSection
              contact={contact}
              social={social}
              contactButtons={contactButtons}
            />
          </div>
        </div>
      </main>

      {/* Apple Legal & Sitemap Footer with Giant Wordmark */}
      <Footer
        personal={personal}
        meta={meta}
        social={social}
        resumeUrl={resumeUrl}
        hasHighlights={hasHighlights}
      />

      {/* Back to Top Quick Action */}
      <BackToTop />

      {/* Spring Case Study Quick-Preview Modal */}
      {selectedProject && !selectedProject.comingSoon && (
        <CaseStudyModal
          project={selectedProject}
          onClose={handleCloseProject}
          onNextProject={handleNextProject}
          onPrevProject={handlePrevProject}
        />
      )}
    </div>
  );
};
