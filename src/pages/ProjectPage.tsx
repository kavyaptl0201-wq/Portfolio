import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resolvedPortfolioContent } from '../data/resolve';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useAnalytics } from '../hooks/useAnalytics';
import { soundEngine } from '../audio/soundEngine';
import { WindowFrame } from '../components/common/WindowFrame';
import { ProjectMockup } from '../components/sections/ProjectMockup';
import { NotFoundPage } from '../components/pages/NotFoundPage';
import { Footer } from '../components/sections/Footer';
import { DemoChip } from '../components/common/DemoChip';
import { DemoAction } from '../components/common/DemoAction';
import { Chip } from '../components/common/Chip';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lightbulb,
  Award,
} from 'lucide-react';

export const ProjectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { projects, personal, meta, achievements, certifications, activities, recommendations } =
    resolvedPortfolioContent;
  const { trackProjectClick } = useAnalytics(meta.analyticsId);

  // Scroll to top on route change & play state sound
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    soundEngine.play('state');
  }, [slug]);

  const activeProjects = projects.filter((p) => !p.comingSoon);
  const hasHighlights =
    achievements.length > 0 ||
    certifications.length > 0 ||
    activities.length > 0 ||
    recommendations.length > 0;
  const currentIndex = activeProjects.findIndex((p) => p.id === slug);
  const project = currentIndex !== -1 ? activeProjects[currentIndex] : null;

  const prevProject =
    currentIndex !== -1
      ? activeProjects[(currentIndex - 1 + activeProjects.length) % activeProjects.length]
      : null;
  const nextProject =
    currentIndex !== -1
      ? activeProjects[(currentIndex + 1) % activeProjects.length]
      : null;

  // SEO tags
  useDocumentHead({
    title: project
      ? `${project.title} — ${personal.fullName}`
      : 'Project Not Found',
    description: project
      ? project.oneLiner || project.outcome || ''
      : 'The requested engineering case study does not exist.',
    canonicalUrl: project ? `${window.location.origin}/projects/${project.id}` : undefined,
    ogType: 'article',
    ogImage: project?.image || '/og-image.png',
  });

  if (!project || !project.caseStudy) {
    return <NotFoundPage />;
  }

  const { caseStudy } = project;
  const isLive = project.status?.toLowerCase() === 'live';
  const isDemo = Boolean(project.isDemo);
  const demoFields = project.demoFields || {};

  const liveUrl = project.liveSiteUrl || project.liveDemoUrl || caseStudy.liveDemoUrl;
  const isLiveDemo = isDemo || Boolean(demoFields.liveDemoUrl);
  const githubUrl = project.githubUrl || caseStudy.githubUrl;
  const isGithubDemo = isDemo || Boolean(demoFields.githubUrl);

  const displayChips = project.featureChips
    ? project.featureChips
    : [
        ...(project.statChips || []),
        ...(project.extraChip ? [project.extraChip] : []),
      ];

  return (
    <div className="relative min-h-screen site-bg text-[#F5F5F7] flex flex-col justify-between selection:bg-white/20 selection:text-white">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-4 z-40 max-w-[1120px] mx-auto px-4 sm:px-6 w-full pt-2">
        <nav
          aria-label="Case Study Navigation"
          className="flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-pill glass-nav shadow-lg"
        >
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-[15px] font-medium tracking-[-0.01em] text-[#F5F5F7] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-pill"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All projects</span>
          </Link>

          <div className="flex items-center gap-2">
            <Chip variant="status" status={isLive ? 'live' : 'in-development'}>
              {project.status}
            </Chip>
            {isDemo && <DemoChip />}
          </div>

          <div className="flex items-center gap-3">
            {liveUrl && liveUrl.trim().length > 0 && (
              <DemoAction
                isDemo={isLiveDemo}
                href={liveUrl}
                onClick={() => trackProjectClick(project.id, 'demo')}
                className="apple-button-white-3d inline-flex items-center gap-1.5 px-4 py-1.5 rounded-pill text-white text-[14px] font-medium tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                ariaLabel={`View live site for ${project.title}`}
              >
                <span>Live demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </DemoAction>
            )}
          </div>
        </nav>
      </header>

      {/* Main Case Study Content */}
      <main id="main-content" className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 pt-10 sm:pt-14 pb-20 w-full space-y-12 sm:space-y-16">
        {/* Header Block */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip variant="status" status={isLive ? 'live' : 'in-development'}>
              {project.status}
            </Chip>

            {isDemo && <DemoChip />}

            {displayChips.map((chip) => (
              <Chip key={chip} variant="default">
                {chip}
              </Chip>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-[#F5F5F7] leading-tight">
            {project.title}
          </h1>

          <p className="text-[18px] sm:text-[19px] text-[#9A9AA0] font-normal leading-[1.6] max-w-[62ch]">
            {project.oneLiner || project.outcome}
          </p>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {liveUrl && liveUrl.trim().length > 0 && (
              <DemoAction
                isDemo={isLiveDemo}
                href={liveUrl}
                onClick={() => trackProjectClick(project.id, 'demo')}
                className="apple-button-white-3d inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-white text-[14px] font-medium tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                ariaLabel={`View live demo for ${project.title}`}
              >
                <span>View live demo</span>
                <ExternalLink className="w-4 h-4" />
              </DemoAction>
            )}

            {githubUrl && githubUrl.trim().length > 0 && (
              <DemoAction
                isDemo={isGithubDemo}
                href={githubUrl}
                onClick={() => trackProjectClick(project.id, 'github')}
                className="apple-glass-chip apple-glass-chip-button apple-glass-chip-interactive inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill text-[#F2F2F4] text-[14px] font-medium tracking-[-0.01em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                ariaLabel={`View source code for ${project.title}`}
              >
                <Github className="w-4 h-4 shrink-0" />
                <span>View source</span>
              </DemoAction>
            )}
          </div>
        </div>

        {/* Hero Visual inside macOS Window Frame */}
        <div className="w-full">
          <WindowFrame title={project.id === 'landsafe' ? 'si-h-2026.vercel.app' : `${project.id}.app`} className="w-full shadow-2xl">
            <ProjectMockup project={project} />
          </WindowFrame>
        </div>

        {/* Project Context & Role Highlights Box */}
        {(project.role || project.context || (project.techStack && project.techStack.length > 0)) && (
          <div className="p-6 sm:p-8 rounded-[28px] glass-surface grid grid-cols-1 sm:grid-cols-3 gap-6">
            {project.role && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[13px] font-sans font-medium text-[#C9C9CF]">
                  <span>Role</span>
                  {demoFields.role && <DemoChip />}
                </div>
                <div className="text-[15px] font-medium text-white">{project.role}</div>
              </div>
            )}
            {project.context && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[13px] font-sans font-medium text-[#C9C9CF]">
                  <span>Context</span>
                  {demoFields.context && <DemoChip />}
                </div>
                <div className="text-[15px] text-[#D1D1D6]">{project.context}</div>
              </div>
            )}
            {project.techStack && project.techStack.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[13px] font-sans font-medium text-[#C9C9CF]">
                  <span>Technologies</span>
                  {demoFields.techStack && <DemoChip />}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <Chip key={tech} variant="default">
                      {tech}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Measurable Results */}
        {project.results && project.results.length > 0 && (
          <section aria-labelledby="results-heading" className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-white" />
              <h2 id="results-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                Measurable results
              </h2>
              {demoFields.results && <DemoChip />}
            </div>
            <div className="p-6 sm:p-8 rounded-[28px] glass-surface">
              <ul className="space-y-3">
                {project.results.map((res, i) => (
                  <li key={i} className="flex items-start gap-3 text-[16px] text-[#D1D1D6] leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Challenges: A Hard Problem I Solved */}
        {project.challenges && (
          <section aria-labelledby="challenges-heading" className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-white/70" />
              <h2 id="challenges-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                A hard problem I solved
              </h2>
              {demoFields.challenges && <DemoChip />}
            </div>
            <div className="p-8 sm:p-10 rounded-[28px] glass-surface">
              <p className="text-[17px] sm:text-[18px] text-[#D1D1D6] leading-[1.7] font-normal">
                {project.challenges}
              </p>
            </div>
          </section>
        )}

        {/* 1. Overview */}
        {caseStudy.overview && (
          <section aria-labelledby="overview-heading" className="space-y-4">
            <h2 id="overview-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
              Overview
            </h2>
            <div className="p-8 sm:p-10 rounded-[28px] glass-surface">
              <p className="text-[17px] sm:text-[18px] text-[#D1D1D6] leading-[1.7] max-w-[62ch] font-normal">
                {caseStudy.overview}
              </p>
            </div>
          </section>
        )}

        {/* 2. How it works (LandSafe & Demo project 3-step glass cards) */}
        {caseStudy.howItWorks && caseStudy.howItWorks.length > 0 && (
          <section aria-labelledby="how-it-works-heading" className="space-y-6">
            <div className="space-y-1">
              <h2 id="how-it-works-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                How it works
              </h2>
              <p className="text-[15px] text-[#9A9AA0]">
                Core architectural stages and execution flow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {caseStudy.howItWorks.map((step) => (
                <div
                  key={step.step}
                  className="p-6 sm:p-8 rounded-[28px] glass-surface flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center text-white font-sans text-[14px] font-semibold">
                      0{step.step}
                    </div>
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#F5F5F7]">
                      {step.title}
                    </h3>
                    <p className="text-[15px] text-[#9A9AA0] leading-[1.6]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Built so far & In progress (NammaRoute & Demo project lists) */}
        {((caseStudy.builtSoFar && caseStudy.builtSoFar.length > 0) ||
          (caseStudy.inProgress && caseStudy.inProgress.length > 0)) && (
          <section aria-labelledby="progress-heading" className="space-y-6">
            <h2 id="progress-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
              Current status &amp; roadmap
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Built So Far Checklist */}
              {caseStudy.builtSoFar && caseStudy.builtSoFar.length > 0 && (
                <div className="p-8 rounded-[28px] glass-surface space-y-4">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-[#F5F5F7]">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <h3>Built so far</h3>
                  </div>
                  <ul className="space-y-3 pt-2">
                    {caseStudy.builtSoFar.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[15px] text-[#D1D1D6] leading-relaxed">
                        <span className="text-white select-none mt-1 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* In Progress List */}
              {caseStudy.inProgress && caseStudy.inProgress.length > 0 && (
                <div className="p-8 rounded-[28px] glass-surface space-y-4">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-[#F5F5F7]">
                    <Clock className="w-5 h-5 text-white/70" />
                    <h3>In progress</h3>
                  </div>
                  <ul className="space-y-3 pt-2">
                    {caseStudy.inProgress.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[15px] text-[#D1D1D6] leading-relaxed">
                        <span className="w-2 h-2 rounded-full bg-white/70 inline-block mt-2 shrink-0 animate-pulse" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. Why it is helpful */}
        {caseStudy.whyHelpful && (
          <section aria-labelledby="why-helpful-heading" className="space-y-4">
            <div className="flex items-center gap-2 text-[#F5F5F7]">
              <HelpCircle className="w-5 h-5 text-white/70" />
              <h2 id="why-helpful-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em]">
                Why it is helpful
              </h2>
            </div>
            <div className="p-8 sm:p-10 rounded-[28px] glass-surface">
              <p className="text-[17px] sm:text-[18px] text-[#D1D1D6] leading-[1.7] max-w-[62ch] font-normal">
                {caseStudy.whyHelpful}
              </p>
            </div>
          </section>
        )}

        {/* Next / Previous Project Navigation */}
        {prevProject && nextProject && activeProjects.length > 1 && (
          <nav
            aria-label="Next or Previous Case Study"
            className="pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            {activeProjects.length > 2 && (
            <Link
              to={`/projects/${prevProject.id}`}
              className="w-full sm:w-auto p-5 rounded-[20px] glass-surface hover:border-white/25 flex items-center gap-3 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
              <div className="text-left">
                <span className="text-[13px] text-[#C9C9CF] block font-sans font-medium">
                  Previous Project
                </span>
                <span className="text-[15px] font-semibold text-[#F5F5F7]">
                  {prevProject.title}
                </span>
              </div>
            </Link>
            )}

            <Link
              to={`/projects/${nextProject.id}`}
              className="w-full sm:w-auto sm:ml-auto p-5 rounded-[20px] glass-surface hover:border-white/25 flex items-center justify-between sm:justify-end gap-3 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <div className="text-right">
                <span className="text-[13px] text-[#C9C9CF] block font-sans font-medium">
                  Next Project
                </span>
                <span className="text-[15px] font-semibold text-[#F5F5F7]">
                  {nextProject.title}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/70" />
            </Link>
          </nav>
        )}
      </main>

      {/* Footer */}
      <Footer
        personal={personal}
        meta={meta}
        resumeUrl="/resume.pdf"
        hasHighlights={hasHighlights}
      />
    </div>
  );
};
