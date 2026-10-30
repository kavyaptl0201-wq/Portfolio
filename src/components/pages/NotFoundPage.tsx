import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlassButton } from '../common/GlassButton';
import { WindowFrame } from '../common/WindowFrame';
import { Chip } from '../common/Chip';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { Home, Compass, Briefcase, Mail } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  useDocumentHead({
    title: '404 — Page Not Found | Kavya Portfolio',
    description: "The page or case study you were looking for doesn't exist or has moved.",
    noindex: true,
  });

  // Remove top-center home-page intro dot on the 404 page
  useEffect(() => {
    const initialDot = document.getElementById('initial-intro-dot');
    if (initialDot) initialDot.remove();
    const initialVignette = document.getElementById('initial-intro-vignette');
    if (initialVignette) initialVignette.remove();
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0B0C11] text-[#F5F5F7] transition-colors">
      <div className="ambient-lighting" aria-hidden="true">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
      </div>

      <main id="main-content" className="relative z-10 max-w-md w-full">
        <WindowFrame title="Terminal — 404 Not Found">
          <div className="p-6 sm:p-10 text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto shadow-inner border border-white/15">
              <Compass className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-center">
                <Chip variant="badge">
                  HTTP Status: 404
                </Chip>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F7] tracking-[-0.03em]">
                Page not found
              </h1>
              <p className="text-[14px] text-[#A1A1A6] leading-relaxed">
                The requested URL or case study route does not exist.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link to="/">
                <GlassButton
                  variant="primary"
                  size="md"
                  icon={<Home className="w-4 h-4 text-[#0A0A0C]" />}
                  className="w-full justify-center !text-[#0A0A0C] font-semibold"
                >
                  Return to home
                </GlassButton>
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/#projects">
                  <GlassButton
                    variant="secondary"
                    size="md"
                    icon={<Briefcase className="w-4 h-4" />}
                    className="w-full justify-center text-[14px]"
                  >
                    Projects
                  </GlassButton>
                </Link>
                <Link to="/#contact">
                  <GlassButton
                    variant="secondary"
                    size="md"
                    icon={<Mail className="w-4 h-4" />}
                    className="w-full justify-center text-[14px]"
                  >
                    Contact
                  </GlassButton>
                </Link>
              </div>
            </div>
          </div>
        </WindowFrame>
      </main>
    </div>
  );
};
