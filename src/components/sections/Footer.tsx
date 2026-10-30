import React from 'react';
import { useLocation } from 'react-router-dom';
import { PortfolioContent, SocialConfig } from '../../data/content.schema';
import { FOOTER_WORDMARK } from '../../config/design';

interface FooterProps {
  personal: PortfolioContent['personal'];
  meta: PortfolioContent['meta'];
  social?: SocialConfig;
  resumeUrl: string;
  hasHighlights?: boolean;
}

const BRAND_SVGS = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  linkedin:
    'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.72a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
};

export const Footer: React.FC<FooterProps> = ({ personal, meta, social, resumeUrl, hasHighlights = false }) => {
  // On other pages (e.g. a case study) section links must go back to the home page
  const { pathname } = useLocation();
  const base = pathname === '/' ? '' : '/';

  const baseNavLinks = [
    { label: 'About', href: `${base}#about` },
    { label: 'Projects', href: `${base}#projects` },
    { label: 'Skills', href: `${base}#skills` },
    { label: 'Highlights', href: `${base}#highlights` },
    { label: 'Beyond Code', href: `${base}#beyond-code` },
    { label: 'Contact', href: `${base}#contact` },
    { label: 'Resume', href: resumeUrl, isExternal: true },
  ];

  const navLinks = hasHighlights
    ? baseNavLinks
    : baseNavLinks.filter((link) => link.label !== 'Highlights');

  const socialItems = [
    { id: 'github', label: 'GitHub', url: social?.github?.url || '', enabled: Boolean(social?.github?.enabled), isDemo: Boolean(social?.github?.isDemo), path: BRAND_SVGS.github },
    { id: 'instagram', label: 'Instagram', url: social?.instagram?.url || '', enabled: Boolean(social?.instagram?.enabled), isDemo: Boolean(social?.instagram?.isDemo), path: BRAND_SVGS.instagram },
    { id: 'linkedin', label: 'LinkedIn', url: social?.linkedin?.url || '', enabled: Boolean(social?.linkedin?.enabled), isDemo: Boolean(social?.linkedin?.isDemo), path: BRAND_SVGS.linkedin },
    { id: 'facebook', label: 'Facebook', url: social?.facebook?.url || '', enabled: Boolean(social?.facebook?.enabled), isDemo: Boolean(social?.facebook?.isDemo), path: BRAND_SVGS.facebook },
  ].filter((item) => item.enabled || item.isDemo);

  return (
    <footer className="relative border-t border-white/10 bg-transparent pt-16 pb-12 overflow-hidden">
      {/* Top Controls & Navigation: max-w-[1200px] & 1360px on >=1600px */}
      <div className="relative z-10 w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-4 sm:px-6 md:px-8 mb-12 sm:mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Side: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
          <div className="flex items-center gap-2.5 text-[15px] font-medium tracking-[-0.01em] text-[#F5F5F7]">
            <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-[11px] font-semibold">
              {personal.avatarInitial || personal.preferredName[0]}
            </div>
            <span>{personal.fullName}</span>
          </div>
          <div className="text-[13px] font-sans text-[#C9C9CF]">
            © {meta.copyrightYear} {personal.fullName}.
          </div>

          {/* Accessible Social Icons: min 44x44px tap target, never overlap */}
          {socialItems.length > 0 && (
            <div data-sound-group="social" className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              {socialItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${item.label} profile`}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.04] hover:bg-white/12 border border-white/10 flex items-center justify-center text-[#9A9AA0] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d={item.path} />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Center: Sitemap Links with touch-friendly spacing */}
        <nav
          aria-label="Footer Sitemap"
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[14px] sm:text-[15px] font-medium tracking-[-0.01em] text-[#9A9AA0]"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              className="hover:text-white transition-colors py-1.5 sm:py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-pill"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* FOOTER_WORDMARK: full name in metallic gradient (#FFFFFF to #8A8F99) at 75% brightness, fading over bottom 35%, never wider than viewport */}
      {FOOTER_WORDMARK && (
        <div
          aria-hidden="true"
          className="relative w-full max-w-[100vw] overflow-hidden flex justify-center items-center pointer-events-none select-none -mb-4 sm:-mb-6 md:-mb-8 px-2"
        >
          <div
            className="metallic-text-gradient font-apple font-bold tracking-[-0.04em] whitespace-nowrap text-center uppercase leading-none max-w-full"
            style={{
              fontSize: 'clamp(32px, 11.5vw, 220px)',
              filter: 'brightness(0.75)',
              maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
            }}
          >
            {personal.fullName}
          </div>
        </div>
      )}
    </footer>
  );
};
