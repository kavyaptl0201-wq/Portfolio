import { PortfolioContent } from './content.schema';

/**
 * SINGLE SOURCE OF TRUTH (content.ts)
 *
 * Portfolio content for Kavya.
 * Everything in [square brackets] is a placeholder: replace it with Kavya's real details.
 * This is the ONLY file you need to edit to personalize the portfolio.
 */
export const portfolioContent: PortfolioContent = {
  personal: {
    fullName: "Kavya",
    preferredName: "Kavya",
    avatarInitial: "K",
    photoUrl: "",
    roleLine: "[Your course and year, e.g. B.Tech CSE student]",
    oneLinePositioning: "[One line about what you build and what you're looking for.]",
    shortIntro: "[A short introduction: who you are, what you study and what you enjoy building.]",
    primarySkills: ["[Skill 1]", "[Skill 2]", "[Skill 3]"],
    education: "[College], [Degree], [Year]",
    currentlyLearning: ["[Topic you're learning]"],
    hometown: "[Hometown]",
    location: "[City]",
    college: "[College]",
    degreeMajor: "[Degree]",
    graduationYear: "[Year]",
    // Red tagline shown across the middle of the hero name
    headline: "[Your one-line tagline]",
    subheadline: "[One line about what you build and what you're looking for.]",
    bioShort: "[A one-sentence bio.]",
  },

  seo: {
    siteTitle: "Kavya - Portfolio",
    siteDescription: "Portfolio of Kavya.",
    canonicalUrl: "",
    keywords: ["Kavya", "Portfolio"],
  },

  availability: {
    isOpen: true,
    statusText: "Open to opportunities",
    subtext: "[What kind of opportunities you're looking for]",
    targetRole: "[Target role]",
    season: "[Year]",
  },

  skills: [
    {
      categoryName: "Languages",
      description: "[Short description]",
      skills: [{ name: "[Skill 1]" }, { name: "[Skill 2]" }, { name: "[Skill 3]" }],
    },
    {
      categoryName: "[Category 2]",
      description: "[Short description]",
      skills: [{ name: "[Skill 1]" }, { name: "[Skill 2]" }],
    },
    {
      categoryName: "[Category 3]",
      description: "[Short description]",
      skills: [{ name: "[Skill 1]" }, { name: "[Skill 2]" }],
    },
    {
      categoryName: "Tools",
      description: "[Short description]",
      skills: [{ name: "[Tool 1]" }, { name: "[Tool 2]" }],
    },
    {
      categoryName: "Learning now",
      description: "Topics currently exploring.",
      skills: [{ name: "[Topic you're learning]", isCurrentlyLearning: true }],
    },
  ],

  projects: [
    {
      id: "project-1",
      title: "[Project 1]",
      status: "Completed",
      oneLiner: "[One sentence: what the project does and who it helps.]",
      featureChips: ["[Feature 1]", "[Feature 2]"],
      image: null,
      imageAlt: "[Project 1 screenshot]",
      techStack: [],
      results: [],
      caseStudy: {
        slug: "project-1",
        overview: "[What the project is.]",
        whyHelpful: "[Why it is useful.]",
      },
      featured: true,
      category: "web",
      outcome: "[One sentence: what the project does and who it helps.]",
      tagline: "[Short tagline]",
      tags: ["[Feature 1]", "[Feature 2]"],
    },
    {
      id: "project-2",
      title: "[Project 2]",
      status: "In development",
      oneLiner: "[One sentence: what the project does and who it helps.]",
      featureChips: ["[Feature 1]", "[Feature 2]"],
      image: null,
      imageAlt: "[Project 2 screenshot]",
      techStack: [],
      results: [],
      caseStudy: {
        slug: "project-2",
        overview: "[What the project is.]",
        whyHelpful: "[Why it is useful.]",
      },
      featured: true,
      category: "web",
      outcome: "[One sentence: what the project does and who it helps.]",
      tagline: "[Short tagline]",
      tags: ["[Feature 1]", "[Feature 2]"],
    },
  ],

  // Highlights: entries left empty are hidden
  achievements: [],
  certifications: [],
  activities: [],
  recommendations: [],

  about: {
    headline: "About me",
    storyParagraphs: [
      "[Paragraph 1: who you are, where you study and what you're studying.]",
      "[Paragraph 2: what you build and the projects you're proud of.]",
      "[Paragraph 3: what you enjoy outside coding and what you're looking for.]",
    ],
  },

  now: {
    building: [{ name: "[Current project]", status: "In development" }],
    learning: ["[Topic you're learning]"],
  },

  // Beyond Code: ready: false shows a disabled "Coming soon" button
  creative: {
    heading: "Beyond code",
    introLine: "[One line about your hobbies.]",
    photography: {
      title: "Photography & videography",
      description: "[Describe your photo and video work.]",
      buttonText: "See my photo and video work",
      url: "/photography",
      ready: false,
      iconName: "camera",
    },
    artCraft: {
      title: "Art & craft",
      description: "[Describe your art and craft work.]",
      buttonText: "See my painting and craft",
      url: "/art-craft",
      ready: false,
      iconName: "palette",
      items: [],
    },
  },

  // Social links: set url and enabled: true for each real profile
  social: {
    github: { url: "", enabled: false },
    instagram: { url: "", enabled: false },
    linkedin: { url: "", enabled: false },
    facebook: { url: "", enabled: false },
    x: { url: "", enabled: false },
    youtube: { url: "", enabled: false },
    email: { url: "", enabled: false },
  },

  socialBar: {
    placement: "section",
  },

  contact: {
    headline: "Start a conversation",
    subtext: "Feel free to reach out for internship opportunities, project collaborations, or discussions.",
    emailAddress: "",
    responseTime: "",
    officeHoursNote: "",
  },

  socialLinks: [],
  stats: [],
  timeline: [],
  dockTools: [],
  highlights: [],
  writingConfig: {
    enabled: false,
    sectionTitle: "Articles",
    posts: [],
  },

  meta: {
    copyrightYear: 2026,
    defaultTheme: "dark",
  },
};
