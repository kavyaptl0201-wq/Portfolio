import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AchievementItem,
  CertificationItem,
  ActivityItem,
  RecommendationItem,
} from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { DemoChip } from '../common/DemoChip';
import { DemoAction } from '../common/DemoAction';
import { Chip } from '../common/Chip';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import {
  Trophy,
  Award,
  Users,
  ExternalLink,
  Quote,
  Calendar,
  Building,
} from 'lucide-react';

interface HighlightsSectionProps {
  achievements: AchievementItem[];
  certifications: CertificationItem[];
  activities: ActivityItem[];
  recommendations: RecommendationItem[];
  className?: string;
}

type TabKey = 'achievements' | 'certifications' | 'activities';

export const HighlightsSection: React.FC<HighlightsSectionProps> = ({
  achievements,
  certifications,
  activities,
  recommendations,
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

  const allTabs: { key: TabKey; label: string; count: number; icon: React.ElementType }[] = [
    {
      key: 'achievements',
      label: 'Achievements',
      count: achievements.length,
      icon: Trophy,
    },
    {
      key: 'certifications',
      label: 'Certifications',
      count: certifications.length,
      icon: Award,
    },
    {
      key: 'activities',
      label: 'Activities',
      count: activities.length,
      icon: Users,
    },
  ];

  // If an entire Highlights tab has only placeholders (count === 0), hide the tab
  const tabs = allTabs.filter((t) => t.count > 0);

  const [activeTab, setActiveTab] = useState<TabKey>(tabs[0]?.key || 'achievements');

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((t) => t.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [tabs, activeTab]);

  const handleTabKeyDown = (e: React.KeyboardEvent, currentKey: TabKey) => {
    const currentIndex = tabs.findIndex((t) => t.key === currentKey);
    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }
    if (nextIndex !== -1) {
      const nextTab = tabs[nextIndex];
      setActiveTab(nextTab.key);
      const nextBtn = document.getElementById(`tab-${nextTab.key}`);
      nextBtn?.focus();
    }
  };

  const springConfig = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  };

  const getGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  // If the whole section has only placeholders, hide the section
  const hasContent = tabs.length > 0 || (recommendations && recommendations.length > 0);
  if (!hasContent) {
    return null;
  }

  return (
    <section
      id="highlights"
      ref={containerRef}
      aria-label="Highlights"
      className={`w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 lg:py-24 scroll-mt-24 ${className}`}
    >
      {/* 04 "Career *highlights*" */}
      <SectionHeading
        index="04"
        label="Highlights"
        title="Career *highlights*"
        subtitle="Recognition, credentials, and leadership experiences across university and community programs."
        align="left"
      />

      {/* Segmented Control Pill Bar */}
      <div className="mb-10 w-full max-w-full overflow-x-auto no-scrollbar py-1 flex items-center justify-start">
        <div
          role="tablist"
          aria-label="Highlights Categories"
          className="inline-flex p-1 sm:p-1.5 rounded-pill bg-[#0A0A0C]/90 border border-white/10 backdrop-blur-xl shadow-lg select-none max-w-full"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.key)}
                className={`relative px-3 sm:px-5 py-2 sm:py-2.5 rounded-pill text-[12px] sm:text-[14px] font-medium tracking-[-0.01em] transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0 ${
                  isActive ? 'text-white' : 'text-[#9A9AA0] hover:text-[#F5F5F7]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="highlightsTabBubble"
                    className="absolute inset-0 rounded-pill apple-glass-chip !bg-[rgba(255,255,255,0.14)]"
                    transition={springConfig}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10 shrink-0" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels with Cross-Fade Spring Animation */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-[220px]"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              id="tabpanel-achievements"
              role="tabpanel"
              aria-labelledby="tab-achievements"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={springConfig}
            >
              {achievements.length === 0 ? (
                <GlassCard variant="default" radius="large" className="p-8 text-center text-[#9A9AA0]">
                  No achievements listed yet.
                </GlassCard>
              ) : (
                <div className={`grid gap-6 ${getGridClass(achievements.length)}`}>
                  {achievements.map((item) => {
                    // With no organisation to show, the year moves down next to the result chip
                    // instead of sitting alone on its own row
                    const yearInFooter = Boolean(!item.eventOrOrg && !item.isDemo && item.result && item.year);
                    return (
                    <GlassCard
                      key={item.id}
                      variant="default"
                      radius="large"
                      hoverEffect={false}
                      className="p-7 sm:p-8 flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3.5">
                        {!yearInFooter && (
                        <div className="flex items-center justify-between gap-3">
                          {item.eventOrOrg ? (
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-sans font-medium text-[#C9C9CF]">
                              <Building className="w-3.5 h-3.5 text-white/60" />
                              <span>{item.eventOrOrg}</span>
                            </span>
                          ) : (
                            <span />
                          )}
                          <div className="flex items-center gap-2">
                            {item.isDemo && <DemoChip />}
                            {item.year && (
                              <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                                {item.year}
                              </span>
                            )}
                          </div>
                        </div>
                        )}

                        <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#F5F5F7] leading-tight">
                          {item.title}
                        </h3>

                        {(item.detail || item.description) && (
                          <p className="text-[14px] sm:text-[15px] text-[#B4B4BA] leading-relaxed font-normal pt-0.5">
                            {item.detail || item.description}
                          </p>
                        )}
                      </div>

                      {/* Result badge: status chip */}
                      {item.result && (
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <Chip variant="status" status="in-development">
                            {item.result}
                          </Chip>
                          {yearInFooter && (
                            <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                              {item.year}
                            </span>
                          )}
                        </div>
                      )}
                    </GlassCard>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'certifications' && (
            <motion.div
              key="certifications"
              id="tabpanel-certifications"
              role="tabpanel"
              aria-labelledby="tab-certifications"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={springConfig}
            >
              {certifications.length === 0 ? (
                <GlassCard variant="default" radius="large" className="p-8 text-center text-[#9A9AA0]">
                  No certifications listed yet.
                </GlassCard>
              ) : (
                <div className={`grid gap-6 ${getGridClass(certifications.length)}`}>
                  {certifications.map((cert) => (
                    <GlassCard
                      key={cert.id}
                      variant="default"
                      radius="large"
                      hoverEffect={false}
                      className="p-7 sm:p-8 flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                            {cert.issuer}
                          </span>
                          {cert.isDemo && <DemoChip />}
                        </div>

                        <h3 className="text-lg sm:text-xl font-semibold text-[#F5F5F7] tracking-[-0.01em] leading-snug">
                          {cert.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-[13px] font-sans font-medium text-[#C9C9CF]">
                          <Calendar className="w-3.5 h-3.5 text-white/60" />
                          <span>{cert.date}</span>
                        </div>
                      </div>

                      {cert.credentialUrl && (
                        <div className="pt-3 border-t border-white/10">
                          <Chip
                            variant="button"
                            as={DemoAction}
                            isDemo={cert.isDemo}
                            href={cert.credentialUrl}
                            ariaLabel={`View credential for ${cert.title}`}
                          >
                            <span>View credential</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </Chip>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'activities' && (
            <motion.div
              key="activities"
              id="tabpanel-activities"
              role="tabpanel"
              aria-labelledby="tab-activities"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={springConfig}
            >
              {activities.length === 0 ? (
                <GlassCard variant="default" radius="large" className="p-8 text-center text-[#9A9AA0]">
                  No activities listed yet.
                </GlassCard>
              ) : (
                <div className={`grid gap-6 ${getGridClass(activities.length)}`}>
                  {activities.map((act) => (
                    <GlassCard
                      key={act.id}
                      variant="default"
                      radius="large"
                      hoverEffect={false}
                      className="p-7 sm:p-8 flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-sans font-medium text-[#C9C9CF]">
                            <Users className="w-3.5 h-3.5 text-white/60" />
                            <span>Campus &amp; Community</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {act.isDemo && <DemoChip />}
                            {act.dates && (
                              <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                                {act.dates}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#F5F5F7] leading-snug">
                          {act.title}
                        </h3>

                        {act.description && (
                          <p className="text-[15px] text-[#B4B4BA] leading-relaxed font-normal">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recommendations Row under the tabs (up to 3 glass quote cards) */}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-14 sm:mt-16 pt-10 border-t border-white/10 space-y-6">
          <div className="space-y-1">
            <span className="text-[13px] font-sans font-medium text-[#C9C9CF]">
              Endorsements
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#F5F5F7]">
              Recommendations
            </h3>
          </div>

          <div className={`grid gap-6 ${getGridClass(recommendations.length)}`}>
            {recommendations.slice(0, 3).map((rec) => (
              <GlassCard
                key={rec.id}
                variant="default"
                radius="large"
                hoverEffect={false}
                className="p-7 sm:p-8 flex flex-col justify-between space-y-6 relative"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Quote className="w-7 h-7 text-white/20 shrink-0" />
                    {rec.isDemo && <DemoChip />}
                  </div>
                  <blockquote className="text-[15px] sm:text-[16px] text-[#D1D1D6] leading-[1.65] font-normal italic">
                    "{rec.quote}"
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-[13px] font-semibold">
                    {rec.avatarInitials || rec.authorName[0] || 'R'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[14px] font-semibold text-[#F5F5F7]">
                      {rec.authorName}
                    </div>
                    <div className="text-[13px] text-[#C9C9CF]">
                      {rec.authorRole}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
