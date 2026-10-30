import { useEffect } from 'react';

export interface DocumentHeadOptions {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

export function useDocumentHead({
  title,
  description,
  canonicalUrl,
  ogImage = '/og-image.png',
  ogType = 'website',
  jsonLd,
  noindex = false,
}: DocumentHeadOptions) {
  useEffect(() => {
    // Update Title
    document.title = title;

    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let meta = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard Description
    setMetaTag('name', 'description', description);

    // Robots meta tag
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    if (canonicalUrl) {
      setMetaTag('property', 'og:url', canonicalUrl);
    }
    if (ogImage) {
      const fullOgImage = ogImage.startsWith('http')
        ? ogImage
        : `${window.location.origin}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
      setMetaTag('property', 'og:image', fullOgImage);
      setMetaTag('name', 'twitter:image', fullOgImage);
    }

    // Twitter Card
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);

    // Canonical link
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonicalUrl;
    }

    // JSON-LD Structured Data
    if (jsonLd) {
      const scriptId = 'dynamic-jsonld';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonLd);
    }

    return () => {
      // Cleanup dynamic JSON-LD when unmounting
      const script = document.getElementById('dynamic-jsonld');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, canonicalUrl, ogImage, ogType, jsonLd, noindex]);
}
