import {
  PortfolioContent,
  ProjectItem,
  AchievementItem,
  CertificationItem,
  ActivityItem,
  RecommendationItem,
  SocialConfig,
} from './content.schema';
import { portfolioContent as rawContent } from './content';
import {
  demoProjectPlaceholders,
  demoThirdProject,
  demoAchievements,
  demoCertifications,
  demoActivities,
  demoRecommendations,
  demoSocialConfig,
  demoContact,
} from './demo';

/**
 * Global Flag: SHOW_DEMO_DATA
 * Controlled by VITE_SHOW_DEMO environment variable.
 * Default is true in dev, preview, and standard builds unless explicitly set to 'false'.
 */
export const SHOW_DEMO_DATA: boolean = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_SHOW_DEMO === 'false') return false;
    return true;
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_SHOW_DEMO === 'false') return false;
    return true;
  }
  return true;
})();

export interface ResolvedPortfolioContent extends PortfolioContent {
  isDemoMode: boolean;
  contactButtons: {
    email: { value: string; isDemo: boolean };
    linkedin: { value: string; isDemo: boolean };
    github: { value: string; isDemo: boolean };
  };
}

export interface DemoReportEntry {
  section: string;
  field: string;
  isDemo: boolean;
  value: string;
  remedy: string;
}

/**
 * Resolves real data against demo data based on exact specification:
 * - Arrays: If real array has at least 1 item, use ONLY the real array;
 *           otherwise use demo array (when SHOW_DEMO_DATA is true). Never mix real and demo items.
 * - Scalar fields: Real value if non-empty string; otherwise demo value.
 * - Third project: Shown only if real projects count is < 3.
 * - Every demo value or item is tagged isDemo: true.
 */
export function resolvePortfolioContent(
  real: PortfolioContent = rawContent,
  showDemo: boolean = SHOW_DEMO_DATA
): ResolvedPortfolioContent {
  const hasBracketedPlaceholder = (str?: string): boolean => {
    if (!str) return false;
    return /\[.*?\]/.test(str);
  };

  // 1. Projects Resolution: Use real data only, hide any field without real data (no bracketed placeholders)
  const resolvedProjects: ProjectItem[] = real.projects.map((proj) => {
    let role = proj.role?.trim();
    if (!role || hasBracketedPlaceholder(role)) role = undefined;

    let techStack = proj.techStack && proj.techStack.length > 0
      ? proj.techStack.filter((t) => !hasBracketedPlaceholder(t))
      : undefined;

    let results = proj.results && proj.results.length > 0
      ? proj.results.filter((r) => !hasBracketedPlaceholder(r))
      : undefined;

    let context = proj.context?.trim();
    if (!context || hasBracketedPlaceholder(context)) context = undefined;

    let challenges = proj.challenges?.trim();
    if (!challenges || hasBracketedPlaceholder(challenges)) challenges = undefined;

    let githubUrl = proj.githubUrl?.trim();
    if (!githubUrl || hasBracketedPlaceholder(githubUrl)) githubUrl = undefined;

    let liveSiteUrl = proj.liveSiteUrl?.trim();
    if (!liveSiteUrl || hasBracketedPlaceholder(liveSiteUrl)) liveSiteUrl = undefined;

    let liveDemoUrl = proj.liveDemoUrl?.trim();
    if (!liveDemoUrl || hasBracketedPlaceholder(liveDemoUrl)) liveDemoUrl = undefined;

    return {
      ...proj,
      role: role || undefined,
      techStack: techStack || [],
      results: results || [],
      context: context || undefined,
      challenges: challenges || undefined,
      githubUrl: githubUrl || undefined,
      liveSiteUrl: liveSiteUrl || undefined,
      liveDemoUrl: liveDemoUrl || liveSiteUrl || undefined,
      isDemo: false,
      demoFields: undefined,
    };
  });

  // 1. Projects: Only include real projects (hide demo third project; preserved in demo.ts)
  // (resolvedProjects contains real projects only)

  // 2. Achievements Array Resolution: hide entries containing bracketed placeholders
  let resolvedAchievements: AchievementItem[] = [];
  const rawAchievements = real.achievements && real.achievements.length > 0
    ? real.achievements.map((item) => ({ ...item, isDemo: false }))
    : (showDemo ? demoAchievements.map((item) => ({ ...item, isDemo: true })) : []);
  resolvedAchievements = rawAchievements.filter(
    (item) => !hasBracketedPlaceholder(item.title) && !hasBracketedPlaceholder(item.eventOrOrg) && !hasBracketedPlaceholder(item.year)
  );

  // 3. Certifications Array Resolution: hide entries containing bracketed placeholders
  let resolvedCertifications: CertificationItem[] = [];
  const rawCertifications = real.certifications && real.certifications.length > 0
    ? real.certifications.map((item) => ({ ...item, isDemo: false }))
    : (showDemo ? demoCertifications.map((item) => ({ ...item, isDemo: true })) : []);
  resolvedCertifications = rawCertifications.filter(
    (item) => !hasBracketedPlaceholder(item.title) && !hasBracketedPlaceholder(item.issuer) && !hasBracketedPlaceholder(item.date)
  );

  // 4. Activities Array Resolution: hide entries containing bracketed placeholders
  let resolvedActivities: ActivityItem[] = [];
  const rawActivities = real.activities && real.activities.length > 0
    ? real.activities.map((item) => ({ ...item, isDemo: false }))
    : (showDemo ? demoActivities.map((item) => ({ ...item, isDemo: true })) : []);
  resolvedActivities = rawActivities.filter(
    (item) => !hasBracketedPlaceholder(item.title) && !hasBracketedPlaceholder(item.dates) && !hasBracketedPlaceholder(item.role)
  );

  // 5. Recommendations Array Resolution: keep real recommendations if present
  let resolvedRecommendations: RecommendationItem[] = [];
  if (real.recommendations && real.recommendations.length > 0) {
    resolvedRecommendations = real.recommendations.map((item) => ({ ...item, isDemo: false }));
  }

  // 6. Social Configuration Resolution
  const resolveSocialPlatform = (
    realPlatform?: { url: string; enabled: boolean },
    demoPlatform?: { url: string; enabled: boolean }
  ) => {
    const isRealActive = Boolean(
      realPlatform && realPlatform.enabled && realPlatform.url && realPlatform.url.trim().length > 0
    );

    if (isRealActive) {
      return {
        url: realPlatform!.url.trim(),
        enabled: true,
        isDemo: false,
      };
    }

    if (showDemo && demoPlatform) {
      return {
        url: demoPlatform.url,
        enabled: true,
        isDemo: true,
      };
    }

    return {
      url: '',
      enabled: false,
      isDemo: false,
    };
  };

  const resolvedSocial: SocialConfig = {
    github: resolveSocialPlatform(real.social?.github, demoSocialConfig.github),
    instagram: resolveSocialPlatform(real.social?.instagram, demoSocialConfig.instagram),
    linkedin: resolveSocialPlatform(real.social?.linkedin, demoSocialConfig.linkedin),
    facebook: resolveSocialPlatform(real.social?.facebook, demoSocialConfig.facebook),
    x: resolveSocialPlatform(real.social?.x, demoSocialConfig.x),
    youtube: resolveSocialPlatform(real.social?.youtube, demoSocialConfig.youtube),
    email: resolveSocialPlatform(real.social?.email, demoSocialConfig.email),
  };

  // 7. Contact Resolution
  const hasRealEmail = Boolean(real.contact?.emailAddress && real.contact.emailAddress.trim().length > 0);
  const resolvedEmail = hasRealEmail
    ? real.contact.emailAddress.trim()
    : showDemo
    ? demoContact.emailAddress
    : '';

  const resolvedResponseTime = real.contact?.responseTime?.trim() || '';

  const cleanHandle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

  const contactButtons = {
    email: {
      value: resolvedEmail || demoContact.emailAddress,
      isDemo: !hasRealEmail,
    },
    linkedin: {
      value:
        real.social?.linkedin?.enabled && real.social.linkedin.url?.trim()
          ? cleanHandle(real.social.linkedin.url)
          : demoContact.linkedinHandle,
      isDemo: !(real.social?.linkedin?.enabled && real.social.linkedin.url?.trim()),
    },
    github: {
      value:
        real.social?.github?.enabled && real.social.github.url?.trim()
          ? cleanHandle(real.social.github.url)
          : demoContact.githubHandle,
      isDemo: !(real.social?.github?.enabled && real.social.github.url?.trim()),
    },
  };

  return {
    ...real,
    isDemoMode: showDemo,
    projects: resolvedProjects,
    achievements: resolvedAchievements,
    certifications: resolvedCertifications,
    activities: resolvedActivities,
    recommendations: resolvedRecommendations,
    social: resolvedSocial,
    socialBar: real.socialBar || { placement: 'section' },
    contact: {
      ...real.contact,
      emailAddress: resolvedEmail,
      responseTime: resolvedResponseTime,
    },
    contactButtons,
  };
}

/**
 * Analyzes the content and generates an audit report of which fields
 * are using real data vs demo data.
 */
export function getDemoDataReport(real: PortfolioContent = rawContent): DemoReportEntry[] {
  const entries: DemoReportEntry[] = [];

  // 1. Projects
  const hasThirdProject = real.projects.length >= 3;
  entries.push({
    section: 'Projects',
    field: 'Third Project',
    isDemo: !hasThirdProject,
    value: hasThirdProject ? real.projects[2].title : demoThirdProject.title,
    remedy: 'Add a 3rd project to projects array in src/data/content.ts',
  });

  const landSafe = real.projects.find((p) => p.id === 'landsafe');
  const landSafeFields = ['role', 'techStack', 'results', 'context', 'challenges', 'githubUrl'] as const;
  landSafeFields.forEach((f) => {
    const val = landSafe ? (landSafe as any)[f] : undefined;
    const isProvided = Array.isArray(val) ? val.length > 0 : Boolean(val && val.trim().length > 0);
    entries.push({
      section: 'Projects (LandSafe)',
      field: f,
      isDemo: !isProvided,
      value: isProvided ? String(val) : String(demoProjectPlaceholders.landsafe[f]),
      remedy: `Provide ${f} in projects['landsafe'] in src/data/content.ts`,
    });
  });

  const nammaRoute = real.projects.find((p) => p.id === 'nammaroute');
  const nammaRouteFields = ['role', 'techStack', 'results', 'context', 'challenges', 'githubUrl'] as const;
  nammaRouteFields.forEach((f) => {
    const val = nammaRoute ? (nammaRoute as any)[f] : undefined;
    const isProvided = Array.isArray(val) ? val.length > 0 : Boolean(val && val.trim().length > 0);
    entries.push({
      section: 'Projects (NammaRoute)',
      field: f,
      isDemo: !isProvided,
      value: isProvided ? String(val) : String(demoProjectPlaceholders.nammaroute[f]),
      remedy: `Provide ${f} in projects['nammaroute'] in src/data/content.ts`,
    });
  });

  // 2. Highlights - Achievements
  const hasAchievements = Boolean(real.achievements && real.achievements.length > 0);
  entries.push({
    section: 'Highlights',
    field: 'Achievements tab',
    isDemo: !hasAchievements,
    value: hasAchievements ? `${real.achievements.length} items` : demoAchievements[0].title,
    remedy: 'Add at least 1 achievement to achievements in src/data/content.ts',
  });

  // 3. Highlights - Certifications
  const hasCertifications = Boolean(real.certifications && real.certifications.length > 0);
  entries.push({
    section: 'Highlights',
    field: 'Certifications tab',
    isDemo: !hasCertifications,
    value: hasCertifications ? `${real.certifications.length} items` : demoCertifications[0].title,
    remedy: 'Add at least 1 certification to certifications in src/data/content.ts',
  });

  // 4. Highlights - Activities
  const hasActivities = Boolean(real.activities && real.activities.length > 0);
  entries.push({
    section: 'Highlights',
    field: 'Activities tab',
    isDemo: !hasActivities,
    value: hasActivities ? real.activities[0].title : demoActivities[0].title,
    remedy: 'Add at least 1 activity to activities in src/data/content.ts',
  });

  // 5. Highlights - Recommendations
  const hasRecommendations = Boolean(real.recommendations && real.recommendations.length > 0);
  entries.push({
    section: 'Highlights',
    field: 'Recommendations',
    isDemo: !hasRecommendations,
    value: hasRecommendations ? `${real.recommendations.length} items` : demoRecommendations[0].quote,
    remedy: 'Add recommendation items in src/data/content.ts or disable when demo mode is off',
  });

  // 6. Social Dock
  const socialPlatforms = ['github', 'instagram', 'linkedin', 'facebook'] as const;
  socialPlatforms.forEach((p) => {
    const isConfigured = Boolean(
      real.social?.[p]?.enabled && real.social[p].url && real.social[p].url.trim().length > 0
    );
    entries.push({
      section: 'Social Dock',
      field: p.toUpperCase(),
      isDemo: !isConfigured,
      value: isConfigured ? real.social[p].url : demoSocialConfig[p].url,
      remedy: `Set social.${p}.url and enabled: true in src/data/content.ts`,
    });
  });

  // 7. Contact
  const hasEmail = Boolean(real.contact?.emailAddress && real.contact.emailAddress.trim().length > 0);
  entries.push({
    section: 'Contact',
    field: 'Email Address',
    isDemo: !hasEmail,
    value: hasEmail ? real.contact.emailAddress : demoContact.emailAddress,
    remedy: 'Set contact.emailAddress in src/data/content.ts',
  });

  // 8. Beyond Code
  const photoReady = Boolean(real.creative?.photography?.ready);
  entries.push({
    section: 'Beyond Code',
    field: 'Photography ready flag',
    isDemo: !photoReady,
    value: photoReady ? 'ready: true' : 'ready: false (Coming soon state)',
    remedy: 'Set creative.photography.ready: true when photos are uploaded',
  });

  const artCraftReady = Boolean(real.creative?.artCraft?.ready);
  entries.push({
    section: 'Beyond Code',
    field: 'Art & Craft ready flag',
    isDemo: !artCraftReady,
    value: artCraftReady ? 'ready: true' : 'ready: false (Coming soon state)',
    remedy: 'Set creative.artCraft.ready: true when art work is ready',
  });

  return entries;
}

/** Pre-resolved singleton for direct app consumption */
export const resolvedPortfolioContent = resolvePortfolioContent();
