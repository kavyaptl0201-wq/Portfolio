import { useEffect } from 'react';

/**
 * Privacy-preserving analytics utility.
 * Supports Plausible or Umami without cookies or personal data tracking.
 * Configured via environment variables:
 * - VITE_PLAUSIBLE_DOMAIN (e.g. your-site.vercel.app)
 * - VITE_PLAUSIBLE_API_HOST (optional custom host, defaults to https://plausible.io)
 * - VITE_UMAMI_WEBSITE_ID (UUID)
 * - VITE_UMAMI_SRC (defaults to https://analytics.umami.is/script.js)
 */

export function useAnalytics(analyticsId?: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Plausible Integration
    const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN || (analyticsId?.startsWith('plausible:') ? analyticsId.replace('plausible:', '') : undefined);
    const plausibleHost = import.meta.env.VITE_PLAUSIBLE_API_HOST || 'https://plausible.io';

    if (plausibleDomain && !document.querySelector('script[data-domain]')) {
      const script = document.createElement('script');
      script.defer = true;
      script.dataset.domain = plausibleDomain;
      script.src = `${plausibleHost.replace(/\/$/, '')}/js/script.js`;
      document.head.appendChild(script);
    }

    // Umami Integration
    const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID || (analyticsId?.startsWith('umami:') ? analyticsId.replace('umami:', '') : undefined);
    const umamiSrc = import.meta.env.VITE_UMAMI_SRC || 'https://analytics.umami.is/script.js';

    if (umamiWebsiteId && !document.querySelector('script[data-website-id]')) {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.dataset.websiteId = umamiWebsiteId;
      script.src = umamiSrc;
      document.head.appendChild(script);
    }
  }, [analyticsId]);

  const trackEvent = (eventName: string, props?: Record<string, string | number | boolean>) => {
    if (typeof window === 'undefined') return;

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`[Analytics Event: ${eventName}]`, { analyticsId, ...(props || {}) });
    }

    // Window Plausible hook
    if (typeof (window as unknown as { plausible?: (event: string, opts?: unknown) => void }).plausible === 'function') {
      (window as unknown as { plausible: (event: string, opts?: unknown) => void }).plausible(eventName, { props });
    }

    // Window Umami hook
    if (typeof (window as unknown as { umami?: { track: (event: string, data?: unknown) => void } }).umami?.track === 'function') {
      (window as unknown as { umami: { track: (event: string, data?: unknown) => void } }).umami.track(eventName, props);
    }
  };

  const trackResumeDownload = () => {
    trackEvent('resume_download', { timestamp: new Date().toISOString() });
  };

  const trackProjectClick = (projectId: string, destination: 'demo' | 'github' | 'casestudy') => {
    trackEvent('project_click', { projectId, destination });
  };

  return { trackEvent, trackResumeDownload, trackProjectClick };
}
