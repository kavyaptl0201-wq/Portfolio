import {
  ProjectItem,
  AchievementItem,
  CertificationItem,
  ActivityItem,
  RecommendationItem,
  SocialConfig,
} from './content.schema';

/**
 * DEMO DATA REPOSITORY
 * 
 * Every piece of demo placeholder content is declared here with bracketed
 * placeholders and isDemo: true.
 * 
 * When real data is provided in src/data/content.ts, it automatically
 * replaces the demo data according to the rules in src/data/resolve.ts.
 */

/** Demo placeholders for projects whose optional fields were left empty */
export const demoProjectPlaceholders: Record<string, Partial<ProjectItem>> = {
  landsafe: {
    role: "[Your role, e.g. Solo developer / ML Lead]",
    techStack: ["[Python]", "[GIS Mapping]", "[Scikit-learn]"],
    results: [
      "[Add measurable result, e.g. 87% warning accuracy]",
      "[Add measurable result, e.g. 8 Northeastern states mapped]",
    ],
    context: "[Hackathon / Competition, e.g. Smart India Hackathon 2024]",
    challenges: "[A hard problem I solved: e.g. handling sparse geospatial rainfall telemetry during heavy monsoon seasons]",
    githubUrl: "https://github.com/your-username/landsafe",
  },
  nammaroute: {
    role: "[Your role, e.g. Full-Stack / Mobile Lead]",
    techStack: ["[React Native]", "[OpenStreetMap]", "[Graph Routing]"],
    results: [
      "[Add measurable result, e.g. 77,000 indexed transit points]",
      "[Add measurable result, e.g. <120ms path computation]",
    ],
    context: "[Independent transit infrastructure initiative for Bengaluru]",
    challenges: "[A hard problem I solved: e.g. graph traversal algorithms across 3 disparate metro lines with inter-modal walking transfers]",
    githubUrl: "https://github.com/your-username/nammaroute",
    liveDemoUrl: "https://nammaroute-demo.example.com",
  },
};

/**
 * Third Demo Project
 * Shown only when content.ts contains fewer than 3 projects.
 * Replaced automatically as soon as a 3rd real project is added.
 */
export const demoThirdProject: ProjectItem = {
  id: "demo-ml-project",
  title: "[Demo project] ML model with a live demo",
  status: "Completed",
  oneLiner: "[One sentence: what it predicts and how well it works.]",
  featureChips: ["[Python]", "[scikit-learn]", "[Streamlit]"],
  statChips: ["[94% accuracy]", "[<50ms latency]"],
  extraChip: "[Live interactive demo]",
  image: null, // triggers clean dashed placeholder state
  imageAlt: "[Demo project placeholder]",
  liveSiteUrl: "https://demo-ml-project.streamlit.app",
  role: "[Solo developer / ML Engineer]",
  techStack: ["[Python]", "[scikit-learn]", "[Streamlit]", "[Pandas]"],
  githubUrl: "https://github.com/your-username/demo-ml-project",
  liveDemoUrl: "https://demo-ml-project.streamlit.app",
  results: [
    "[94% classification accuracy on held-out validation set]",
    "[Sub-50ms inference latency for real-time predictions]",
    "[Benchmarked against 10,000 synthetic test samples]",
  ],
  context: "[Academic / Personal ML engineering showcase]",
  challenges: "[A hard problem I solved: resolved dataset class imbalance using SMOTE and calibrated probability thresholds to prevent false positives.]",
  caseStudy: {
    slug: "demo-ml-project",
    overview: "[This is a demo case study for a machine learning model project with real-time inference and evaluation metrics. It demonstrates practical model deployment and clean UI integration.]",
    whyHelpful: "[Provides automated predictions with measurable confidence intervals and a streamlined, accessible web interface for end users.]",
    howItWorks: [
      {
        step: 1,
        title: "[Data Pipeline]",
        description: "[Cleaned, imputed missing values, and normalized numerical feature columns.]",
      },
      {
        step: 2,
        title: "[Model Training]",
        description: "[Trained and validated gradient boosted trees with 5-fold cross validation.]",
      },
      {
        step: 3,
        title: "[Interactive UI]",
        description: "[Deployed on Streamlit Cloud for instant client-side parameter adjustments.]",
      },
    ],
    builtSoFar: [
      "[Data preprocessing and scaling pipeline]",
      "[Scikit-learn model inference and evaluation pipeline]",
      "[Interactive Streamlit web application dashboard]",
    ],
    inProgress: [
      "[FastAPI REST endpoint packaging]",
      "[Automated regression tests and Docker container]",
    ],
    liveDemoUrl: "https://demo-ml-project.streamlit.app",
    githubUrl: "https://github.com/your-username/demo-ml-project",
  },
  isDemo: true,
  category: "ai",
  featured: true,
  outcome: "[One sentence: what it predicts and how well it works.]",
  tags: ["[Python]", "[scikit-learn]", "[Streamlit]"],
};

/** Demo Achievements */
export const demoAchievements: AchievementItem[] = [
  {
    id: "demo-ach-1",
    title: "[Hackathon or competition name]",
    eventOrOrg: "[Event]",
    year: "[Year]",
    result: "[Result, e.g. Finalist / Top 10]",
    isDemo: true,
  },
];

/** Demo Certifications (2 rows) */
export const demoCertifications: CertificationItem[] = [
  {
    id: "demo-cert-1",
    title: "[Course name]",
    issuer: "[Issuer, e.g. NPTEL / Coursera]",
    date: "[Month Year]",
    credentialUrl: "https://example.com/credential-1",
    isDemo: true,
  },
  {
    id: "demo-cert-2",
    title: "[Course name 2]",
    issuer: "[Issuer, e.g. Coursera / edX]",
    date: "[Month Year]",
    credentialUrl: "https://example.com/credential-2",
    isDemo: true,
  },
];

/** Demo Activities */
export const demoActivities: ActivityItem[] = [
  {
    id: "demo-act-1",
    title: "[Club, event or role]",
    dates: "[Year]",
    role: "[Role / Contributor]",
    description: "[Brief description of your role or contribution]",
    isDemo: true,
  },
];

/** Demo Recommendations */
export const demoRecommendations: RecommendationItem[] = [
  {
    id: "demo-rec-1",
    quote: "[A short, specific recommendation from a professor or mentor.]",
    authorName: "[Name]",
    authorRole: "[Role, Institution]",
    organization: "[Institution]",
    avatarInitials: "PR",
    relationship: "Professor / Mentor",
    isDemo: true,
  },
];

/** Demo Social URLs */
export const demoSocialConfig: SocialConfig = {
  github: {
    url: "https://github.com/your-username",
    enabled: true,
    isDemo: true,
  },
  instagram: {
    url: "https://instagram.com/your-handle",
    enabled: true,
    isDemo: true,
  },
  linkedin: {
    url: "https://linkedin.com/in/your-name",
    enabled: true,
    isDemo: true,
  },
  facebook: {
    url: "https://facebook.com/your-profile",
    enabled: true,
    isDemo: true,
  },
  x: {
    url: "https://x.com/your-handle",
    enabled: false,
    isDemo: true,
  },
  youtube: {
    url: "https://youtube.com/@your-channel",
    enabled: false,
    isDemo: true,
  },
  email: {
    url: "mailto:your.email@example.com",
    enabled: false,
    isDemo: true,
  },
};

/** Demo Contact Fallback Values */
export const demoContact = {
  emailAddress: "your.email@example.com",
  linkedinHandle: "linkedin.com/in/your-name",
  githubHandle: "github.com/your-username",
};
