import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectItem } from '../../data/content.schema';
import { GlassButton } from '../common/GlassButton';
import { Chip } from '../common/Chip';
import {
  X,
  ExternalLink,
  Github,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface CaseStudyModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onNextProject: () => void;
  onPrevProject: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  project,
  onClose,
  onNextProject,
  onPrevProject,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNextProject();
      if (e.key === 'ArrowLeft') onPrevProject();
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, onNextProject, onPrevProject]);

  if (!project || project.comingSoon || !project.caseStudy) return null;

  const { caseStudy } = project;
  const liveUrl = project.liveSiteUrl || project.liveDemoUrl || caseStudy.liveDemoUrl;
  const githubUrl = project.githubUrl || caseStudy.githubUrl;

  const displayChips = project.featureChips
    ? project.featureChips
    : [
        ...(project.statChips || []),
        ...(project.extraChip ? [project.extraChip] : []),
      ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 md:p-10 selection:bg-white/20 selection:text-white">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xl transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-4xl rounded-[28px] bg-[#0C0D12]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0C0D12]/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Chip variant="badge">
                Case Study
              </Chip>
              <span className="text-[15px] font-semibold text-[#F5F5F7] truncate max-w-xs sm:max-w-md">
                {project.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onPrevProject}
                aria-label="Previous project"
                className="p-2 rounded-full hover:bg-white/10 text-[#9A9AA0] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onNextProject}
                aria-label="Next project"
                className="p-2 rounded-full hover:bg-white/10 text-[#9A9AA0] hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="h-4 w-px bg-white/15 mx-1" />
              <button
                onClick={onClose}
                aria-label="Close case study modal"
                className="p-2 rounded-full hover:bg-white/15 text-[#F5F5F7] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto px-6 py-8 md:px-10 md:py-10 space-y-8">
            {/* Header / Intro */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {displayChips.map((chip) => (
                  <Chip key={chip} variant="default">
                    {chip}
                  </Chip>
                ))}
              </div>

              <h2 id="case-study-title" className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7] leading-tight">
                {project.title}
              </h2>

              <p className="text-[17px] text-[#9A9AA0] leading-[1.6] max-w-2xl font-normal">
                {project.oneLiner || project.outcome}
              </p>

              {/* Action Links */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {liveUrl && liveUrl.trim().length > 0 && (
                  <GlassButton
                    variant="primary"
                    size="md"
                    href={liveUrl}
                    isExternal
                    icon={<ExternalLink className="w-4 h-4" />}
                  >
                    Live site
                  </GlassButton>
                )}
                {githubUrl && githubUrl.trim().length > 0 && (
                  <GlassButton
                    variant="secondary"
                    size="md"
                    href={githubUrl}
                    isExternal
                    icon={<Github className="w-4 h-4" />}
                  >
                    View source
                  </GlassButton>
                )}
                <Chip
                  variant="button"
                  as="a"
                  href={`/projects/${project.id}`}
                >
                  <span>Open dedicated page</span>
                  <ExternalLink className="w-4 h-4 text-white/70" />
                </Chip>
              </div>
            </div>

            {/* Overview */}
            {caseStudy.overview && (
              <div className="p-6 sm:p-8 rounded-[28px] glass-surface space-y-3">
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#F5F5F7]">
                  Overview
                </h3>
                <p className="text-[16px] text-[#D1D1D6] leading-[1.6]">
                  {caseStudy.overview}
                </p>
              </div>
            )}

            {/* How It Works (LandSafe) */}
            {caseStudy.howItWorks && caseStudy.howItWorks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#F5F5F7]">
                  How it works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {caseStudy.howItWorks.map((step) => (
                    <div
                      key={step.step}
                      className="p-5 rounded-[20px] glass-surface space-y-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[13px] font-sans font-semibold text-white">
                        0{step.step}
                      </div>
                      <h4 className="text-[15px] font-semibold text-[#F5F5F7]">
                        {step.title}
                      </h4>
                      <p className="text-[14px] text-[#9A9AA0] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Built so far & In progress (NammaRoute) */}
            {((caseStudy.builtSoFar && caseStudy.builtSoFar.length > 0) ||
              (caseStudy.inProgress && caseStudy.inProgress.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {caseStudy.builtSoFar && caseStudy.builtSoFar.length > 0 && (
                  <div className="p-6 rounded-[20px] glass-surface space-y-3">
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-[#F5F5F7]">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <h4>Built so far</h4>
                    </div>
                    <ul className="space-y-2 text-[14px] text-[#D1D1D6]">
                      {caseStudy.builtSoFar.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-white mt-0.5 select-none font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {caseStudy.inProgress && caseStudy.inProgress.length > 0 && (
                  <div className="p-6 rounded-[20px] glass-surface space-y-3">
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-[#F5F5F7]">
                      <Clock className="w-4 h-4 text-white/70" />
                      <h4>In progress</h4>
                    </div>
                    <ul className="space-y-2 text-[14px] text-[#D1D1D6]">
                      {caseStudy.inProgress.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/70 mt-2 shrink-0 animate-pulse" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Why it is helpful */}
            {caseStudy.whyHelpful && (
              <div className="p-6 sm:p-8 rounded-[28px] glass-surface space-y-3">
                <div className="flex items-center gap-2 text-[#F5F5F7]">
                  <HelpCircle className="w-4 h-4 text-white/70" />
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">
                    Why it is helpful
                  </h3>
                </div>
                <p className="text-[16px] text-[#D1D1D6] leading-[1.6]">
                  {caseStudy.whyHelpful}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
