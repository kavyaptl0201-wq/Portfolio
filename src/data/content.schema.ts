/**
 * TypeScript Schema Definitions for Portfolio Single Source of Truth
 * 
 * Every personal detail, project, case study, skill, highlight, social configuration,
 * and data resolution contract is strictly typed here.
 */

export interface AvailabilityConfig {
  /** Whether currently actively seeking positions */
  isOpen: boolean;
  /** Primary status badge text, e.g. "Open to Internships" */
  statusText: string;
  /** Supporting line, e.g. "Looking for internships and hands-on projects" */
  subtext: string;
  /** Target position or area, e.g. "Software Engineering / AI Intern" */
  targetRole: string;
  /** Availability period, e.g. "2025 - 2026" */
  season: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
}

export interface ProjectLink {
  label: string;
  url: string;
  isExternal: boolean;
}

export interface CaseStudyDecision {
  title: string;
  context: string;
  decision: string;
  rationale: string;
}

export interface CaseStudyStep {
  step: number;
  title: string;
  description: string;
}

export interface CaseStudy {
  slug: string;
  overview: string;
  whyHelpful: string;
  howItWorks?: CaseStudyStep[];
  builtSoFar?: string[];
  inProgress?: string[];
  problem?: string;
  targetAudience?: string;
  myRole?: string;
  team?: string;
  duration?: string;
  techStack?: string[];
  keyDecisions?: CaseStudyDecision[];
  screenshots?: {
    caption: string;
    alt: string;
    type: 'window' | 'mobile' | 'diagram';
  }[];
  measurableResults?: {
    metric: string;
    label: string;
    context: string;
  }[];
  whatIWouldImprove?: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
}

export interface ProjectItem {
  /** URL slug and unique identifier (e.g. "landsafe", "nammaroute", "demo-ml-project") */
  id: string;
  /** Title of the project */
  title: string;
  /** One-sentence summary shown on cards and headers */
  oneLiner: string;
  /** Current release status, e.g. "Live" | "In development" | "Completed" */
  status: string;
  /** Image URL or null for macOS-style dashed empty frame */
  image: string | null;
  /** Accessible alt text for project preview image */
  imageAlt?: string;
  /** Highlight chips rendered on cards */
  featureChips?: string[];
  /** Metric chips rendered on cards */
  statChips?: string[];
  /** Optional secondary highlight badge */
  extraChip?: string;
  /** Live deployment URL */
  liveSiteUrl?: string;

  // Upgraded Optional Fields (hidden when empty, shown in card & case study)
  /** Personal role in the project, e.g. "Solo developer" or "Team of 4, I built the ML model" */
  role?: string;
  /** Team size or composition description */
  team?: string;
  /** Specific technologies used (rendered as neutral chips) */
  techStack?: string[];
  /** Source code repository URL */
  githubUrl?: string;
  /** Interactive live demo or test environment URL */
  liveDemoUrl?: string;
  /** 2 to 3 measurable outcome bullets (e.g. accuracy, latency, dataset size) */
  results?: string[];
  /** One-line hackathon, competition, or academic context */
  context?: string;
  /** "A hard problem I solved" short paragraph */
  challenges?: string;

  /** Associated in-depth case study documentation */
  caseStudy?: CaseStudy;

  /** Tagged true when this item or field is a demo placeholder */
  isDemo?: boolean;
  /** Map of field names to boolean indicating which specific fields are using demo values */
  demoFields?: Record<string, boolean>;

  // Compatibility fields
  screenshots?: any[];
  category?: 'web' | 'systems' | 'ai' | 'mobile';
  featured?: boolean;
  thumbnailGradient?: string;
  tags?: string[];
  outcome?: string;
  tagline?: string;
  comingSoon?: boolean;
}

export interface AchievementItem {
  id: string;
  /** Title of the achievement or project */
  title: string;
  /** Event or organization, e.g. Hackathon or competition */
  eventOrOrg: string;
  /** Year of accomplishment */
  year: string;
  /** One-line outcome, e.g. "Finalist / Top 10" */
  result: string;
  /** Optional detailed outcome or description */
  detail?: string;
  description?: string;
  /** Tagged true if this is demo data */
  isDemo?: boolean;
}

export interface CertificationItem {
  id: string;
  /** Name of the course or certification */
  title: string;
  /** Issuing organization, e.g. NPTEL / Coursera / AWS */
  issuer: string;
  /** Month and Year, e.g. "Oct 2024" */
  date: string;
  /** Credential verification URL */
  credentialUrl?: string;
  /** Tagged true if this is demo data */
  isDemo?: boolean;
}

export interface ActivityItem {
  id: string;
  /** Name of the club, event, or responsibility */
  title: string;
  /** Active dates or duration (can be empty string) */
  dates?: string;
  /** Role held within the activity */
  role?: string;
  /** Brief description */
  description?: string;
  /** Tagged true if this is demo data */
  isDemo?: boolean;
}

export interface RecommendationItem {
  id: string;
  /** Quote text */
  quote: string;
  /** Name of the referee */
  authorName: string;
  /** Role and institution of the referee */
  authorRole: string;
  /** Institution or organization name */
  organization?: string;
  /** Initials for avatar circle */
  avatarInitials?: string;
  /** Professional relationship */
  relationship?: string;
  /** Optional referee LinkedIn profile */
  linkedInUrl?: string;
  /** Tagged true if this is demo data */
  isDemo?: boolean;
}

export interface SocialPlatformConfig {
  /** Target profile URL */
  url: string;
  /** Whether this social link is visible / active */
  enabled: boolean;
  /** Whether this link is currently a demo placeholder */
  isDemo?: boolean;
}

export interface SocialConfig {
  github: SocialPlatformConfig;
  instagram: SocialPlatformConfig;
  linkedin: SocialPlatformConfig;
  facebook: SocialPlatformConfig;
  x?: SocialPlatformConfig;
  youtube?: SocialPlatformConfig;
  email?: SocialPlatformConfig;
}

export interface SocialBarConfig {
  /** Placement mode: centered in page section or fixed side rail */
  placement: 'section' | 'side-rail';
}

export interface TimelineMilestone {
  id: string;
  period: string;
  title: string;
  organization: string;
  location: string;
  type: 'internship' | 'education' | 'research' | 'leadership' | 'award';
  description: string;
  achievements: string[];
  skillsUsed: string[];
  link?: string;
}

export interface SkillItem {
  name: string;
  level?: string;
  isCurrentlyLearning?: boolean;
  iconName?: string;
  levelDescription?: string;
  associatedProjectIds?: string[];
}

export interface SkillCategory {
  categoryName: string;
  description: string;
  skills: SkillItem[];
}

export interface DockTool {
  name: string;
  iconName: string;
  category: string;
}

export interface HighlightTier {
  id: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  points: string[];
  accentColor: string;
}

export interface AboutSectionData {
  headline?: string;
  storyParagraphs: string[];
  principles?: {
    title: string;
    description: string;
  }[];
  collaborationStyle?: string;
  interestsAndFunFacts?: string[];
}

export interface WritingPost {
  id: string;
  title: string;
  publishedDate: string;
  readingTime: string;
  summary: string;
  tags: string[];
  link: string;
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'email' | 'x' | 'resume' | 'calendly' | 'youtube' | 'medium' | 'instagram' | 'facebook';
  label: string;
  url: string;
  enabled: boolean;
  handleOrNote?: string;
  isDemo?: boolean;
}

export interface ContactConfig {
  headline: string;
  subtext: string;
  emailAddress: string;
  /** Expected reply window, e.g. "Typically replies within 1-2 days" (hidden when empty) */
  responseTime?: string;
  formspreeEndpoint?: string;
  calendlyUrl?: string;
  officeHoursNote?: string;
}

export interface ArtCraftItem {
  image: string;
  title: string;
  medium: string;
  year: string | number;
  description?: string;
}

export interface CreativeCardConfig {
  title: string;
  description: string;
  buttonText: string;
  url: string;
  /**
   * Ready flag (default false):
   * When false, renders as a disabled "Coming soon" button with no link to prevent dead ends.
   * When true, navigates to the showcase page.
   */
  ready?: boolean;
  iconName?: string;
  items?: ArtCraftItem[];
}

export interface CreativeSectionData {
  heading: string;
  introLine: string;
  photography: CreativeCardConfig;
  artCraft: CreativeCardConfig;
}

export interface NowBuildingItem {
  name: string;
  status?: string;
  url?: string;
}

export interface NowConfig {
  building?: (string | NowBuildingItem)[];
  learning?: string[];
}

export interface PortfolioContent {
  personal: {
    fullName: string;
    preferredName: string;
    avatarInitial?: string;
    photoUrl?: string;
    roleLine: string;
    oneLinePositioning: string;
    shortIntro: string;
    primarySkills?: string[];
    education: string;
    currentlyLearning?: string[];
    hometown: string;
    headline: string;
    subheadline: string;
    bioShort: string;
    location: string;
    college: string;
    graduationYear: string;
    degreeMajor: string;
    gpa?: string;
    githubUsername?: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    canonicalUrl: string;
    keywords: string[];
  };
  availability: AvailabilityConfig;
  recruiterQuickView?: {
    name: string;
    roleSought: string;
    location: string;
    topSkills: string[];
    flagshipProjectId: string;
    workAuthorization: string;
  };
  stats?: StatItem[];
  projects: ProjectItem[];
  timeline?: TimelineMilestone[];
  skills: SkillCategory[];
  dockTools?: DockTool[];
  highlights?: HighlightTier[];
  
  // Highlights Tabs Data
  achievements: AchievementItem[];
  certifications: CertificationItem[];
  activities: ActivityItem[];
  recommendations: RecommendationItem[];

  about: AboutSectionData;
  now?: NowConfig;
  creative: CreativeSectionData;
  writingConfig?: {
    enabled: boolean;
    sectionTitle: string;
    posts: WritingPost[];
  };

  // Social & Online Presence
  social: SocialConfig;
  socialBar: SocialBarConfig;
  socialLinks?: SocialLink[];

  contact: ContactConfig;
  meta: {
    copyrightYear: number;
    defaultTheme: 'light' | 'dark' | 'system';
    analyticsId?: string;
  };
}
